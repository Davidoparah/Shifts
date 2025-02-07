module ErrorHandling
  extend ActiveSupport::Concern

  included do
    rescue_from StandardError do |e|
      Rails.logger.error "#{e.class}: #{e.message}\n#{e.backtrace.join("\n")}"
      render_error('An unexpected error occurred', :internal_server_error)
    end

    rescue_from Mongoid::Errors::DocumentNotFound do |e|
      render_error('Resource not found', :not_found)
    end

    rescue_from Mongoid::Errors::Validations do |e|
      render_error(e.document.errors.full_messages.join(', '))
    end

    rescue_from ActionController::ParameterMissing do |e|
      render_error("Missing parameter: #{e.param}")
    end

    rescue_from JWT::DecodeError do |e|
      render_error('Invalid token', :unauthorized)
    end

    rescue_from JWT::ExpiredSignature do |e|
      render_error('Token has expired', :unauthorized)
    end
  end

  private

  def render_error(message, status = :unprocessable_entity)
    error_response = {
      error: message,
      status: status,
      timestamp: Time.current.iso8601
    }

    # Add request details in development
    if Rails.env.development?
      error_response[:debug] = {
        path: request.path,
        params: request.params.to_unsafe_h,
        method: request.method
      }
    end

    render json: error_response, status: status
  end
end 