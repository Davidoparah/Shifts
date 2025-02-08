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
        begin
          user = nil
          User.transaction do
            user = User.new(user_params(params[:auth]))
            if user.save
              # Create worker profile automatically for worker accounts
              if user.worker?
                user.create_worker_profile!(
                  status: 'available',
                  hourly_rate: params[:auth][:hourly_rate] || 0
                )
              end
              
              token = jwt_encode({ user_id: user.id })
              render json: {
                token: token,
                user: UserSerializer.new(user).as_json
              }, status: :created
            else
              render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
            end
          end
        rescue StandardError => e
          log_error("User registration failed", e)
          render json: { error: 'Registration failed' }, status: :internal_server_error
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

      def ensure_worker_profile
        begin
          if current_user&.worker? && !current_user.worker_profile
            profile = current_user.create_worker_profile!(
              status: 'available',
              hourly_rate: 0
            )
            render json: { message: 'Worker profile created successfully', profile: profile }, status: :created
          else
            render json: { message: 'Worker profile already exists or user is not a worker' }, status: :ok
          end
        rescue StandardError => e
          log_error("Worker profile creation failed", e)
          render json: { error: 'Failed to create worker profile' }, status: :internal_server_error
        end
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
        # Convert params to hash if it's ActionController::Parameters
        data = params.respond_to?(:to_unsafe_h) ? params.to_unsafe_h : params.to_h
        
        # Permit only the allowed parameters
        ActionController::Parameters.new(data).permit(
          :email,
          :password,
          :password_confirmation,
          :first_name,
          :last_name,
          :role,
          :phone,
          :address
        ).tap do |permitted_params|
          permitted_params.transform_values! { |v| v.respond_to?(:strip) ? v.strip : v }
        end
      end

      def log_error(message, error)
        Rails.logger.error "#{message}: #{error.message}"
        Rails.logger.error error.backtrace.join("\n")
        Rails.logger.error "Parameters: #{params.inspect}"
      end

      def user_registration_params
        params.require(:auth).permit(
          :email, 
          :password, 
          :password_confirmation, 
          :name, 
          :role, 
          :phone, 
          :address,
          :business_name,
          :business_address,
          :business_phone,
          :business_email
        )
      end
    end
  end
end 