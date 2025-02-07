module AuthService
  module JwtAuthentication
    extend ActiveSupport::Concern

    ALGORITHM = 'HS256'
    REFRESH_EXPIRATION = 7.days
    ACCESS_TOKEN_EXPIRATION = 1.hour

    included do
      attr_reader :current_user
    end

    def jwt_encode(payload)
      payload[:exp] = ACCESS_TOKEN_EXPIRATION.from_now.to_i
      JWT.encode(payload, secret_key, ALGORITHM)
    end

    def jwt_decode(token)
      JWT.decode(token, secret_key, true, algorithm: ALGORITHM).first.symbolize_keys
    rescue JWT::ExpiredSignature
      raise JWT::DecodeError, 'Token has expired'
    rescue JWT::DecodeError
      raise JWT::DecodeError, 'Invalid token'
    end

    def generate_refresh_token(user_id)
      payload = {
        user_id: user_id,
        exp: REFRESH_EXPIRATION.from_now.to_i,
        refresh_token: true
      }
      JWT.encode(payload, refresh_secret_key, ALGORITHM)
    end

    def refresh_access_token(refresh_token)
      begin
        decoded = JWT.decode(refresh_token, refresh_secret_key, true, algorithm: ALGORITHM).first
        
        raise RefreshTokenError, 'Invalid refresh token' unless decoded['refresh_token']
        raise RefreshTokenError, 'Refresh token expired' if Time.at(decoded['exp']) < Time.current
        
        user = User.find(decoded['user_id'])
        raise RefreshTokenError, 'User not found' unless user&.active?
        
        new_token = jwt_encode(user_id: user.id.to_s)
        { token: new_token, user: user }
      rescue JWT::DecodeError
        raise RefreshTokenError, 'Invalid refresh token'
      end
    end

    def invalidate_refresh_token(user_id)
      # In a production environment, you would want to maintain a blacklist of invalidated tokens
      # or use Redis to track token invalidation
      true
    end

    private

    def secret_key
      Rails.application.credentials.jwt_secret_key || ENV['JWT_SECRET_KEY']
    end

    def refresh_secret_key
      Rails.application.credentials.jwt_refresh_secret_key || ENV['JWT_REFRESH_SECRET_KEY']
    end
  end

  class RefreshTokenError < StandardError; end
end 