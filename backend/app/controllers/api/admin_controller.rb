module Api
  class AdminController < ApplicationController
    before_action :authenticate_user!
    before_action :ensure_platform_owner

    def users
      users = User.all.map do |user|
        user.as_json(except: :password_digest)
      end
      render json: { users: users }
    end

    def businesses
      businesses = Business.all
      render json: { businesses: businesses }
    end

    def analytics
      analytics = {
        total_users: User.count,
        total_businesses: Business.count,
        total_shifts: Shift.count,
        completed_shifts: Shift.where(status: 'completed').count,
        active_users: User.where(status: 'active').count,
        active_businesses: Business.where(status: 'active').count
      }
      render json: { analytics: analytics }
    end

    def toggle_user_status
      user = User.find(params[:id])
      new_status = user.status == 'active' ? 'inactive' : 'active'
      
      if user.update(status: new_status)
        render json: { user: user.as_json(except: :password_digest) }
      else
        render json: { error: user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def toggle_business_status
      business = Business.find(params[:id])
      new_status = business.status == 'active' ? 'inactive' : 'active'
      
      if business.update(status: new_status)
        render json: { business: business }
      else
        render json: { error: business.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def ensure_platform_owner
      unless current_user&.platform_owner?
        render json: { error: 'Unauthorized' }, status: :unauthorized
      end
    end
  end
end 