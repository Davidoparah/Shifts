module BusinessService
  class BusinessProfilesController < ApplicationController
    before_action :authenticate_request
    before_action :set_business_profile, except: [:index, :create]
    before_action :ensure_owner_or_admin!, only: [:update, :destroy]
    before_action :ensure_admin!, only: [:verify, :update_subscription]

    def index
      business_profiles = BusinessProfile.all
      
      # Apply filters
      business_profiles = apply_filters(business_profiles)
      
      # Apply pagination
      business_profiles = business_profiles.page(params[:page]).per(params[:per_page] || 20)
      
      render json: BusinessProfileSerializer.new(business_profiles, pagination: business_profiles).as_json
    end

    def show
      render json: BusinessProfileSerializer.new(@business_profile).as_json
    end

    def create
      business_profile = BusinessProfile.new(business_profile_params)
      business_profile.user_id = current_user.id

      if business_profile.save
        render json: BusinessProfileSerializer.new(business_profile).as_json, status: :created
      else
        render_error(business_profile.errors.full_messages.join(', '))
      end
    end

    def update
      if @business_profile.update(business_profile_params)
        render json: BusinessProfileSerializer.new(@business_profile).as_json
      else
        render_error(@business_profile.errors.full_messages.join(', '))
      end
    end

    def destroy
      if @business_profile.update(status: 'inactive')
        head :no_content
      else
        render_error('Failed to deactivate business profile')
      end
    end

    def verify
      if @business_profile.update(verification_params)
        # Send notification to business owner about verification status change
        NotificationService.verification_status_changed(@business_profile)
        render json: BusinessProfileSerializer.new(@business_profile).as_json
      else
        render_error(@business_profile.errors.full_messages.join(', '))
      end
    end

    def update_subscription
      if @business_profile.update(subscription_params)
        # Send notification about subscription update
        NotificationService.subscription_updated(@business_profile)
        render json: BusinessProfileSerializer.new(@business_profile).as_json
      else
        render_error(@business_profile.errors.full_messages.join(', '))
      end
    end

    def statistics
      stats = {
        total_shifts: @business_profile.total_shifts_posted,
        completed_shifts: @business_profile.total_shifts_completed,
        completion_rate: calculate_completion_rate,
        active_locations: @business_profile.active_locations.count,
        rating: @business_profile.rating,
        total_reviews: @business_profile.total_reviews,
        subscription: {
          plan: @business_profile.subscription_plan,
          status: @business_profile.subscription_status,
          expires_at: @business_profile.subscription_expires_at&.iso8601
        }
      }

      render json: stats
    end

    private

    def set_business_profile
      @business_profile = BusinessProfile.find(params[:id])
    rescue Mongoid::Errors::DocumentNotFound
      render_error('Business profile not found', :not_found)
    end

    def business_profile_params
      params.require(:business_profile).permit(
        :business_name,
        :business_type,
        :registration_number,
        :tax_number,
        :contact_email,
        :contact_phone,
        :website,
        :description,
        :logo_url
      )
    end

    def verification_params
      params.require(:verification).permit(:verification_status)
    end

    def subscription_params
      params.require(:subscription).permit(
        :subscription_plan,
        :subscription_status,
        :subscription_expires_at
      )
    end

    def ensure_owner_or_admin!
      unless current_user.admin? || @business_profile.user_id == current_user.id
        render_error('Unauthorized', :forbidden)
      end
    end

    def ensure_admin!
      unless current_user.admin?
        render_error('Admin access required', :forbidden)
      end
    end

    def apply_filters(scope)
      scope = scope.where(status: params[:status]) if params[:status].present?
      scope = scope.where(verification_status: params[:verification_status]) if params[:verification_status].present?
      scope = scope.where(subscription_plan: params[:subscription_plan]) if params[:subscription_plan].present?
      scope = scope.where(:rating.gte => params[:min_rating].to_f) if params[:min_rating].present?
      
      if params[:search].present?
        scope = scope.or(
          { business_name: /#{params[:search]}/i },
          { business_type: /#{params[:search]}/i }
        )
      end
      
      scope
    end

    def calculate_completion_rate
      return 0 if @business_profile.total_shifts_posted.zero?
      
      (@business_profile.total_shifts_completed.to_f / @business_profile.total_shifts_posted * 100).round(2)
    end
  end
end 