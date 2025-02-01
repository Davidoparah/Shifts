require 'jwt'

module JwtAuthentication
  extend ActiveSupport::Concern

  class AuthError < StandardError; end
  class TokenExpiredError < AuthError; end
  class InvalidTokenError < AuthError; end
  class RefreshTokenError < AuthError; end

  def jwt_encode(payload, exp = JWT.expiration_time.from_now)
    payload = payload.dup
    payload[:exp] = exp.to_i
    payload[:iat] = Time.current.to_i
    token = JWT.encode(payload, JWT.secret_key, JWT.algorithm)
    JWT.log(:info, "Token generated", { user_id: payload[:user_id], exp: payload[:exp] })
    token
  end

  def generate_refresh_token(user_id)
    payload = {
      user_id: user_id,
      exp: JWT.refresh_expiration_time.from_now.to_i,
      iat: Time.current.to_i,
      type: 'refresh'
    }
    token = JWT.encode(payload, JWT.secret_key, JWT.algorithm)
    JWT.log(:info, "Refresh token generated", { user_id: user_id })
    token
  end

  def jwt_decode(token)
    begin
      decoded = JWT.decode(token, JWT.secret_key, true, { 
        algorithm: JWT.algorithm,
        verify_iat: true
      })[0]
      JWT.log(:info, "Token decoded successfully", { user_id: decoded['user_id'] })
      HashWithIndifferentAccess.new(decoded)
    rescue JWT::ExpiredSignature
      JWT.log(:warn, "Token expired", { token: token[0..10] })
      raise TokenExpiredError, 'Token has expired'
    rescue JWT::DecodeError => e
      JWT.log(:error, "Token decode error", { error: e.message })
      raise InvalidTokenError, 'Invalid token'
    end
  end

  def refresh_access_token(refresh_token)
    begin
      decoded = jwt_decode(refresh_token)
      raise RefreshTokenError, 'Invalid refresh token' unless decoded[:type] == 'refresh'
      
      user = User.find(decoded[:user_id])
      new_token = jwt_encode(user_id: user.id)
      JWT.log(:info, "Token refreshed", { user_id: user.id })
      { token: new_token, user: user }
    rescue AuthError => e
      JWT.log(:error, "Token refresh failed", { error: e.message })
      raise
    end
  end

  def authenticate_request
    puts "Authenticating request"
    return if request.headers['Authorization'].blank?

    begin
      token = request.headers['Authorization'].split(' ').last
      decoded = jwt_decode(token)
      @current_user = User.find(decoded[:user_id])
      JWT.log(:info, "Request authenticated", { user_id: @current_user.id })
    rescue TokenExpiredError
      JWT.log(:warn, "Token expired during request")
      render json: { 
        error: 'Token expired',
        code: 'token_expired'
      }, status: :unauthorized
    rescue InvalidTokenError, Mongoid::Errors::DocumentNotFound => e
      JWT.log(:error, "Authentication failed", { error: e.message })
      render json: { 
        error: 'Invalid token',
        code: 'invalid_token'
      }, status: :unauthorized
    rescue StandardError => e
      JWT.log(:error, "Unexpected authentication error", { error: e.message })
      render json: { 
        error: 'Authentication failed',
        code: 'auth_error'
      }, status: :unauthorized
    end
  end
end 