module AuthService
  class AuthController < ApplicationController
    include JwtAuthentication
    include ErrorHandling
    
    skip_before_action :authenticate_request, only: [:login, :register, :refresh_token, :forgot_password, :reset_password]

    def login
      credentials = params[:auth] || params
      Rails.logger.info "Login attempt for email: #{credentials[:email]}"
      
      user = User.where(email: credentials[:email].to_s.downcase).first
      
      unless user
        Rails.logger.warn "User not found for email: #{credentials[:email]}"
        return render_error('Invalid email or password', :unauthorized)
      end
      
      unless user.authenticate(credentials[:password].to_s)
        Rails.logger.warn "Invalid password for user: #{user.id}"
        return render_error('Invalid email or password', :unauthorized)
      end
      
      unless user.active?
        Rails.logger.warn "Inactive account login attempt for user: #{user.id}"
        return render_error('Account is not active', :unauthorized)
      end

      token = jwt_encode(user_id: user.id.to_s)
      refresh_token = generate_refresh_token(user.id.to_s)
      user.record_login
      
      Rails.logger.info "Successful login for user: #{user.id}"
      render json: { 
        token: token,
        refresh_token: refresh_token,
        user: user.as_json(only: [:id, :email, :first_name, :last_name, :role, :status])
      }
    rescue => e
      log_error('Login error', e)
      render_error('An error occurred during login', :internal_server_error)
    end

    def refresh_token
      begin
        result = refresh_access_token(params[:refresh_token])
        render json: {
          token: result[:token],
          user: result[:user].as_json(only: [:id, :email, :first_name, :last_name, :role, :status])
        }
      rescue RefreshTokenError => e
        render_error(e.message, :unauthorized)
      rescue => e
        log_error('Token refresh error', e)
        render_error('Failed to refresh token', :internal_server_error)
      end
    end

    def logout
      # Invalidate the refresh token
      invalidate_refresh_token(current_user.id.to_s) if current_user
      head :no_content
    end

    private

    def log_error(message, error)
      Rails.logger.error "#{message}: #{error.message}"
      Rails.logger.error error.backtrace.join("\n")
      Rails.logger.error "Parameters: #{params.inspect}"
    end
  end
end 