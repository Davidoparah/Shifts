class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include JwtAuthentication
  include ErrorHandling
  
  before_action :authenticate_request
  attr_reader :current_user

  private

  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_not_found(resource = 'Resource')
    render_error("#{resource} not found", :not_found)
  end

  def render_unauthorized(message = 'Unauthorized access')
    render_error(message, :unauthorized)
  end

  def render_forbidden(message = 'Access forbidden')
    render_error(message, :forbidden)
  end

  def pagination_params
    {
      page: params[:page]&.to_i || 1,
      per_page: [params[:per_page]&.to_i || 20, 100].min
    }
  end
end 