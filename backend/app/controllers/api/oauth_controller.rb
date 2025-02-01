module Api
  class OauthController < ApplicationController
    skip_before_action :authenticate_request

    def callback
      auth = request.env['omniauth.auth']
      user = User.from_omniauth(auth)
      token = jwt_encode(user_id: user.id)
      
      # Redirect to frontend with token
      redirect_to "#{ENV['FRONTEND_URL']}/auth/callback?token=#{token}&provider=#{auth.provider}"
    rescue => e
      Rails.logger.error("OAuth Error: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      redirect_to "#{ENV['FRONTEND_URL']}/auth/callback?error=authentication_failed"
    end

    def failure
      error_message = params[:message] || 'Authentication failed'
      Rails.logger.error("OAuth Failure: #{error_message}")
      redirect_to "#{ENV['FRONTEND_URL']}/auth/callback?error=#{error_message}"
    end

    def passthru
      render status: 404, json: { error: 'Not found. OAuth handling is done by OmniAuth.' }
    end

    private

    def auth_params
      params.permit(:provider, :code, :error, :state)
    end
  end
end 