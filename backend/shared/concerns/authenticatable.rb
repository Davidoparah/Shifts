module Shared
  module Authenticatable
    extend ActiveSupport::Concern

    included do
      before_action :authenticate_request!
      attr_reader :current_user
    end

    private

    def authenticate_request!
      token = extract_token
      raise JWT::DecodeError, 'No token provided' unless token

      auth_response = auth_client.get('/api/v1/auth/verify', headers: { 'Authorization' => "Bearer #{token}" })
      raise JWT::DecodeError, 'Invalid token' unless auth_response.success?

      @current_user = OpenStruct.new(auth_response.data)
    rescue StandardError => e
      log_error(e)
      render_error(:unauthorized, 'Authentication failed')
    end

    def extract_token
      header = request.headers['Authorization']
      header&.split(' ')&.last
    end

    def require_admin!
      unless current_user&.admin?
        render_error(:forbidden, 'Admin access required')
      end
    end

    def require_business_owner!
      unless current_user&.business_owner?
        render_error(:forbidden, 'Business owner access required')
      end
    end

    def require_worker!
      unless current_user&.worker?
        render_error(:forbidden, 'Worker access required')
      end
    end

    def auth_client
      @auth_client ||= HttpClient.new(:auth)
    end
  end
end 