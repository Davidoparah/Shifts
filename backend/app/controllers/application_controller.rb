class ApplicationController < ActionController::Base
  protect_from_forgery with: :null_session
  
  private

  def authenticate_user!
    header = request.headers['Authorization']
    header = header.split(' ').last if header
    
    begin
      decoded = JsonWebToken.decode(header)
      @current_user = User.find(decoded[:user_id]) if decoded
    rescue Mongoid::Errors::DocumentNotFound => e
      render json: { errors: 'User not found' }, status: :unauthorized
    rescue JWT::DecodeError => e
      render json: { errors: 'Invalid token' }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end
