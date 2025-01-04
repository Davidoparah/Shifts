module Api
  class AuthController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :authenticate_user!, except: [:login, :register, :forgot_password, :reset_password]

    def login
      # Log the incoming parameters
      Rails.logger.info "Login params: #{params.inspect}"
      
      credentials = params[:auth] || params
      Rails.logger.info "Processed credentials: #{credentials.inspect}"
      
      user = User.where(email: credentials[:email].downcase).first
      Rails.logger.info "Found user: #{user.inspect}"
      
      if user&.authenticate(credentials[:password])
        if user.active?
          Rails.logger.info "Password authentication successful"
          token = JsonWebToken.encode(user_id: user.id.to_s)
          Rails.logger.info "Generated token: #{token}"
          
          # Record login timestamp
          user.record_login
          
          response_data = { 
            token: token, 
            user: user.as_json(except: :password_digest)
          }
          Rails.logger.info "Response data: #{response_data}"
          
          render json: response_data
        else
          Rails.logger.error "Account not active for email: #{credentials[:email]}"
          render json: { error: 'Account is not active' }, status: :unauthorized
        end
      else
        Rails.logger.error "Authentication failed for email: #{credentials[:email]}"
        render json: { error: 'Invalid email or password' }, status: :unauthorized
      end
    rescue => e
      Rails.logger.error "Login error: #{e.message}\n#{e.backtrace.join("\n")}"
      render json: { error: 'An error occurred during login' }, status: :internal_server_error
    end

    def register
      # Log the incoming parameters
      Rails.logger.info "Registration params: #{params.inspect}"
      
      # Extract user data from nested params if present
      user_data = params[:auth] || params
      Rails.logger.info "Processed user data: #{user_data.inspect}"
      
      begin
        # Create business first if user is a business owner
        business = nil
        if user_data[:role]&.downcase == 'business_owner'
          Rails.logger.info "Creating business for business owner"
          business = ::Business.new(
            name: user_data[:business],
            email: user_data[:email],
            status: 'active'
          )
          
          unless business.save
            Rails.logger.error "Business validation errors: #{business.errors.full_messages}"
            return render json: { 
              error: 'Business creation failed',
              errors: business.errors.full_messages
            }, status: :unprocessable_entity
          end
          Rails.logger.info "Created business: #{business.inspect}"
        end
        
        # Create user with processed parameters
        processed_params = user_params(user_data)
        Rails.logger.info "Creating user with params: #{processed_params.inspect}"
        
        user = ::User.new(processed_params)
        user.business_id = business.id.to_s if business
        user.status = 'active'
        
        Rails.logger.info "Validating user..."
        if user.valid?
          Rails.logger.info "User validation passed"
        else
          Rails.logger.error "User validation failed: #{user.errors.full_messages}"
        end
        
        if user.save
          begin
            token = JsonWebToken.encode(user_id: user.id.to_s)
            Rails.logger.info "User saved successfully. Generated token: #{token}"
            
            # Send welcome email
            UserMailer.welcome_email(user).deliver_later if defined?(UserMailer)
            
            render json: { 
              token: token, 
              user: user.as_json(except: :password_digest)
            }, status: :created
          rescue => e
            Rails.logger.error "Token generation error: #{e.message}\n#{e.backtrace.join("\n")}"
            # Clean up if token generation fails
            business&.destroy
            user.destroy
            render json: { error: 'Registration failed due to token generation error' }, status: :internal_server_error
          end
        else
          # Clean up business if user creation fails
          business&.destroy if business
          # Log validation errors
          Rails.logger.error "User validation errors: #{user.errors.full_messages}"
          Rails.logger.error "User validation details: #{user.errors.details}"
          render json: { 
            error: 'Registration failed',
            errors: user.errors.full_messages,
            details: user.errors.details
          }, status: :unprocessable_entity
        end
      rescue => e
        # Clean up any created records in case of error
        business&.destroy if business
        Rails.logger.error "Registration error: #{e.message}"
        Rails.logger.error "Error backtrace:\n#{e.backtrace.join("\n")}"
        Rails.logger.error "Registration params: #{user_data.inspect}"
        render json: { 
          error: 'An error occurred during registration',
          message: e.message
        }, status: :internal_server_error
      end
    end

    def forgot_password
      Rails.logger.info "Forgot password request for email: #{params[:email]}"
      
      user = User.where(email: params[:email].downcase).first
      if user
        user.generate_password_reset_token
        # Send password reset email
        UserMailer.reset_password_email(user).deliver_later if defined?(UserMailer)
        
        render json: { message: 'Password reset instructions have been sent to your email' }
      else
        Rails.logger.error "User not found for email: #{params[:email]}"
        render json: { error: 'Email not found' }, status: :not_found
      end
    rescue => e
      Rails.logger.error "Forgot password error: #{e.message}\n#{e.backtrace.join("\n")}"
      render json: { error: 'An error occurred while processing your request' }, status: :internal_server_error
    end

    def reset_password
      Rails.logger.info "Password reset request for token: #{params[:token]}"
      
      user = User.where(reset_password_token: params[:token]).first
      if user
        if user.password_reset_expired?
          Rails.logger.error "Password reset token expired for user: #{user.email}"
          render json: { error: 'Password reset link has expired' }, status: :unprocessable_entity
        else
          if user.update(password: params[:password], password_confirmation: params[:password_confirmation])
            user.clear_password_reset_token
            render json: { message: 'Password has been reset successfully' }
          else
            Rails.logger.error "Password reset failed: #{user.errors.full_messages}"
            render json: { error: user.errors.full_messages }, status: :unprocessable_entity
          end
        end
      else
        Rails.logger.error "Invalid password reset token: #{params[:token]}"
        render json: { error: 'Invalid password reset token' }, status: :not_found
      end
    rescue => e
      Rails.logger.error "Reset password error: #{e.message}\n#{e.backtrace.join("\n")}"
      render json: { error: 'An error occurred while resetting your password' }, status: :internal_server_error
    end

    def me
      render json: { user: current_user.as_json(except: :password_digest) }
    end

    def logout
      head :no_content
    end

    private

    def user_params(params)
      # Log the parameters before processing
      Rails.logger.info "Processing user params: #{params.inspect}"
      
      # If params is already an ActionController::Parameters object, use it directly
      # Otherwise, wrap it in one
      parameters = params.is_a?(ActionController::Parameters) ? params : ActionController::Parameters.new(params)
      
      # Permit the specific parameters we want to allow
      processed_params = parameters.permit(
        :email,
        :password,
        :password_confirmation,
        :name,
        :role,
        :business,
        :business_id,
        :status
      )
      
      # Ensure all string values are stripped of whitespace
      processed_params.each do |key, value|
        processed_params[key] = value.strip if value.respond_to?(:strip)
      end
      
      # Log the processed parameters
      Rails.logger.info "Processed params: #{processed_params.inspect}"
      processed_params
    rescue => e
      Rails.logger.error "Error processing user params: #{e.message}\n#{e.backtrace.join("\n")}"
      raise e
    end
  end
end 