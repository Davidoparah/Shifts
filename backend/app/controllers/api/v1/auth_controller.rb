module Api
  module V1
    class AuthController < BaseController
      include ErrorHandling
      include JwtAuthentication
      
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
            user: UserSerializer.new(result[:user]).as_json
          }
        rescue RefreshTokenError => e
          render_error(e.message, :unauthorized, 'invalid_refresh_token')
        rescue => e
          log_error('Token refresh error', e)
          render_error('Failed to refresh token', :internal_server_error, 'refresh_error')
        end
      end

      def logout
        # In a real app, you might want to blacklist the token here
        head :no_content
      end

      def register
        # Extract user data from nested params if present
        user_data = params[:auth] || params
        
        begin
          # Create business first if user is a business owner
          business = create_business_for_owner(user_data) if business_owner?(user_data)
          
          # Create user with processed parameters
          user = create_user(user_data, business)
          
          if user.persisted?
            token = jwt_encode(user_id: user.id.to_s)
            UserMailer.welcome_email(user).deliver_later if defined?(UserMailer)
            
            render json: { 
              token: token, 
              user: UserSerializer.new(user).as_json
            }, status: :created
          else
            cleanup_failed_registration(business)
            render_error('Registration failed', :unprocessable_entity, 'registration_failed', user.errors)
          end
        rescue => e
          cleanup_failed_registration(business)
          log_error('Registration error', e)
          render_error('An error occurred during registration', :internal_server_error, 'registration_error')
        end
      end

      def forgot_password
        user = User.where(email: params[:email].downcase).first
        if user
          user.generate_password_reset_token
          UserMailer.reset_password_email(user).deliver_later if defined?(UserMailer)
          
          render json: { message: 'Password reset instructions have been sent to your email' }
        else
          render_error('Email not found', :not_found, 'email_not_found')
        end
      rescue => e
        log_error('Forgot password error', e)
        render_error('An error occurred while processing your request', :internal_server_error, 'forgot_password_error')
      end

      def reset_password
        user = User.where(reset_password_token: params[:token]).first
        if user
          if user.password_reset_expired?
            render_error('Password reset link has expired', :unprocessable_entity, 'token_expired')
          else
            if user.update(password_params)
              user.clear_password_reset_token
              render json: { message: 'Password has been reset successfully' }
            else
              render_error('Password reset failed', :unprocessable_entity, 'reset_failed', user.errors)
            end
          end
        else
          render_error('Invalid password reset token', :not_found, 'invalid_token')
        end
      rescue => e
        log_error('Reset password error', e)
        render_error('An error occurred while resetting your password', :internal_server_error, 'reset_password_error')
      end

      def me
        render json: { user: UserSerializer.new(current_user).as_json }
      end

      private

      def password_params
        params.permit(:password, :password_confirmation)
      end

      def business_owner?(user_data)
        user_data[:role]&.downcase == 'business_owner'
      end

      def create_business_for_owner(user_data)
        business = Business.new(
          name: user_data[:business],
          email: user_data[:email],
          status: 'active'
        )
        
        unless business.save
          raise BusinessCreationError.new(business.errors.full_messages)
        end
        
        business
      end

      def create_user(user_data, business = nil)
        user = User.new(user_params(user_data))
        user.business_id = business.id.to_s if business
        user.status = 'active'
        user.save
        user
      end

      def cleanup_failed_registration(business)
        business&.destroy if business
      end

      def user_params(params)
        parameters = params.is_a?(ActionController::Parameters) ? params : ActionController::Parameters.new(params)
        
        processed_params = parameters.permit(
          :email,
          :password,
          :password_confirmation,
          :first_name,
          :last_name,
          :role,
          :business,
          :business_id,
          :phone,
          :address,
          :status
        )
        
        processed_params.transform_values { |v| v.respond_to?(:strip) ? v.strip : v }
      end

      def log_error(message, error)
        Rails.logger.error "#{message}: #{error.message}"
        Rails.logger.error error.backtrace.join("\n")
        Rails.logger.error "Parameters: #{params.inspect}"
      end
    end
  end
end 