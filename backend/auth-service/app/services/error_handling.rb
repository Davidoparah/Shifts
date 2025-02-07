module AuthService
  module ErrorHandling
    extend ActiveSupport::Concern

    included do
      rescue_from StandardError do |e|
        handle_error(e)
      end
    end

    def render_error(message, status = :unprocessable_entity)
      render json: {
        error: message,
        status: status
      }, status: status
    end

    def render_validation_error(model)
      render json: {
        error: 'Validation failed',
        details: model.errors.full_messages,
        status: :unprocessable_entity
      }, status: :unprocessable_entity
    end

    private

    def handle_error(error)
      case error
      when JWT::DecodeError, JWT::ExpiredSignature
        render_error('Unauthorized access', :unauthorized)
      when Mongoid::Errors::DocumentNotFound
        render_error('Resource not found', :not_found)
      when ActionController::ParameterMissing
        render_error("Missing parameter: #{error.param}", :bad_request)
      when RefreshTokenError
        render_error(error.message, :unauthorized)
      else
        Rails.logger.error("Unexpected error: #{error.class} - #{error.message}")
        Rails.logger.error(error.backtrace.join("\n"))
        render_error('An unexpected error occurred', :internal_server_error)
      end
    end
  end
end 