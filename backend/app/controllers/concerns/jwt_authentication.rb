require 'jwt'

module JwtAuthentication
  extend ActiveSupport::Concern

  class AuthError < StandardError; end
  class TokenExpiredError < AuthError; end
  class InvalidTokenError < AuthError; end
  class RefreshTokenError < AuthError; end
  class UnauthorizedError < StandardError; end

  ALGORITHM = 'HS256'
  REFRESH_EXPIRATION = 7.days

  def jwt_encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, secret_key, ALGORITHM)
  end

  def generate_refresh_token(user_id)
    payload = {
      user_id: user_id,
      exp: REFRESH_EXPIRATION.from_now.to_i,
      iat: Time.current.to_i,
      type: 'refresh'
    }
    token = JWT.encode(payload, secret_key, ALGORITHM)
    Rails.logger.info "Refresh token generated for user_id: #{user_id}, expires: #{Time.at(payload[:exp])}"
    token
  end

  def jwt_decode(token)
    begin
      decoded = JWT.decode(token, secret_key, true, { algorithm: ALGORITHM })[0]
      HashWithIndifferentAccess.new(decoded)
    rescue JWT::ExpiredSignature
      raise TokenExpiredError, 'Token has expired'
    rescue JWT::DecodeError
      raise InvalidTokenError, 'Invalid token'
    end
  end

  def refresh_access_token(refresh_token)
    begin
      Rails.logger.debug "Attempting to refresh token: #{refresh_token[0..10]}..."
      decoded = jwt_decode(refresh_token)
      raise RefreshTokenError, 'Invalid refresh token' unless decoded[:type] == 'refresh'
      
      user = User.find(decoded[:user_id])
      new_token = jwt_encode(user_id: user.id)
      Rails.logger.info "Token refreshed for user_id: #{user.id}"
      { token: new_token, user: user }
    rescue AuthError => e
      Rails.logger.error "Token refresh failed: #{e.message}"
      raise
    end
  end

  def authenticate_request
    Rails.logger.debug "Authenticating request with headers: #{request.headers['Authorization']&.split(' ')&.first}"
    return if request.headers['Authorization'].blank?

    begin
      token = request.headers['Authorization'].split(' ').last
      Rails.logger.debug "Processing token: #{token[0..10]}..."
      decoded = jwt_decode(token)
      @current_user = User.find(decoded[:user_id])
      
      raise UnauthorizedError unless @current_user&.active?
      Rails.logger.info "Request authenticated for user_id: #{@current_user.id}, role: #{@current_user.role}"
    rescue TokenExpiredError
      Rails.logger.warn "Token expired during request"
      render json: { 
        error: 'Token expired',
        code: 'token_expired'
      }, status: :unauthorized
    rescue InvalidTokenError, Mongoid::Errors::DocumentNotFound => e
      Rails.logger.error "Authentication failed: #{e.message}"
      render json: { 
        error: 'Invalid token',
        code: 'invalid_token'
      }, status: :unauthorized
    rescue UnauthorizedError
      Rails.logger.error "User is not active"
      render json: { 
        error: 'Account is not active',
        code: 'account_inactive'
      }, status: :unauthorized
    rescue StandardError => e
      Rails.logger.error "Unexpected authentication error: #{e.message}\n#{e.backtrace.join("\n")}"
      render json: { 
        error: 'Authentication failed',
        code: 'auth_error'
      }, status: :unauthorized
    end
  end

  private

  def secret_key
    Rails.application.credentials.secret_key_base || ENV['JWT_SECRET']
  end
end 