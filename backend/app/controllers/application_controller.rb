class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include JwtAuthentication
  
  before_action :authenticate_request
  attr_reader :current_user

  private

  def authenticate_user!
    unless current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
    end
  end

  def require_authentication!
    unless @current_user
      render json: { error: 'Authentication required' }, status: :unauthorized
    end
  end
end
