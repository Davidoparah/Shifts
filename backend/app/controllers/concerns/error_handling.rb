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
  end

  private

  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end
end 