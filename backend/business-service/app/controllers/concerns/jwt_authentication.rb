require 'jwt'

module JwtAuthentication
  extend ActiveSupport::Concern

  ALGORITHM = 'HS256'

  included do
    attr_reader :current_user
  end

  def authenticate_request
    if request.headers['Authorization'].present?
      begin
        token = request.headers['Authorization'].split(' ').last
        decoded = jwt_decode(token)
        
        # Fetch user from auth service
        response = HTTParty.get(
          "#{ENV['AUTH_SERVICE_URL']}/api/v1/users/#{decoded[:user_id]}",
          headers: { 'Authorization' => "Bearer #{token}" }
        )

        if response.success?
          @current_user = OpenStruct.new(response.parsed_response['user'])
        else
          render_error('Invalid user', :unauthorized)
        end
      rescue JWT::DecodeError => e
        Rails.logger.error "JWT decode error: #{e.message}"
        render_error('Invalid token', :unauthorized)
      rescue JWT::ExpiredSignature
        Rails.logger.error "Token expired"
        render_error('Token has expired', :unauthorized)
      rescue => e
        Rails.logger.error "Authentication error: #{e.message}"
        render_error('Authentication failed', :unauthorized)
      end
    else
      render_error('Missing token', :unauthorized)
    end
  end

  private

  def jwt_decode(token)
    JWT.decode(token, jwt_secret_key, true, { algorithm: ALGORITHM }).first.symbolize_keys
  end

  def jwt_secret_key
    ENV['JWT_SECRET_KEY']
  end
end 