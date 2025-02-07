module Shared
  module ErrorHandler
    extend ActiveSupport::Concern

    included do
      rescue_from StandardError do |e|
        log_error(e)
        render_error(:internal_server_error, "An unexpected error occurred")
      end

      rescue_from ActiveRecord::RecordNotFound do |e|
        render_error(:not_found, e.message)
      end

      rescue_from ActiveRecord::RecordInvalid do |e|
        render_error(:unprocessable_entity, e.record.errors.full_messages)
      end

      rescue_from ActionController::ParameterMissing do |e|
        render_error(:bad_request, e.message)
      end

      rescue_from JWT::DecodeError do |e|
        render_error(:unauthorized, "Invalid authentication token")
      end

      rescue_from Mongoid::Errors::DocumentNotFound do |e|
        render_error(:not_found, e.message)
      end

      rescue_from Mongoid::Errors::Validations do |e|
        render_error(:unprocessable_entity, e.document.errors.full_messages)
      end

      rescue_from ServiceError do |e|
        render_error(:service_unavailable, e.message)
      end
    end

    private

    def render_error(status, message, errors = nil)
      error_response = {
        success: false,
        error: {
          code: status,
          message: message
        }
      }
      error_response[:error][:errors] = errors if errors.present?
      
      render json: error_response, status: status
    end

    def log_error(error, context = {})
      Rails.logger.error(
        error: error.class.name,
        message: error.message,
        controller: self.class.name,
        action: action_name,
        params: params.to_unsafe_h,
        context: context,
        backtrace: error.backtrace&.first(5)
      )
    end
  end
end 