class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include JwtAuthentication
  
  before_action :authenticate_request
  attr_reader :current_user

  private

  def authenticate_user!
    Rails.logger.debug "Authenticating user: #{current_user&.id}"
    unless current_user
      Rails.logger.warn "User authentication failed: no current_user"
      render json: { error: 'Authentication required' }, status: :unauthorized
    end
  end

  def authenticate_worker!
    Rails.logger.debug "Authenticating worker: #{current_user&.id}"
    Rails.logger.debug "User role: #{current_user&.role}"
    Rails.logger.debug "Is worker?: #{current_user&.worker?}"
    
    unless current_user&.worker?
      Rails.logger.warn "Worker authentication failed: user is not a worker"
      render json: { error: 'Worker authentication required' }, status: :unauthorized
    end
  end

  def current_worker
    Rails.logger.debug "Getting current worker profile for user: #{current_user&.id}"
    if current_user&.worker?
      @current_worker ||= current_user.worker_profile
      Rails.logger.debug "Worker profile found: #{@current_worker&.id}"
    else
      Rails.logger.warn "No worker profile: user is not a worker"
      nil
    end
  end

  def require_authentication!
    Rails.logger.debug "Requiring authentication: #{@current_user&.id}"
    unless @current_user
      Rails.logger.warn "Authentication required: no current_user"
      render json: { error: 'Authentication required' }, status: :unauthorized
    end
  end
end
