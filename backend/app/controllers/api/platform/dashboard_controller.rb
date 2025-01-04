module Api
  module Platform
    class DashboardController < ApplicationController
      before_action :authenticate_user!
      before_action :ensure_platform_admin!

      # GET /api/platform/dashboard/stats
      def stats
        render json: {
          totalBusinesses: Business.count,
          totalWorkers: User.where(role: 'WORKER').count,
          totalShifts: Shift.count,
          activeShifts: Shift.where(status: 'confirmed').count,
          completedShifts: Shift.where(status: 'completed').count,
          revenue: calculate_total_revenue
        }
      end

      private

      def calculate_total_revenue
        # Sum up the total revenue from completed shifts
        Shift.where(status: 'completed').sum { |shift| shift.rate * shift.duration }
      end

      def ensure_platform_admin!
        unless current_user.platform_owner?
          render json: { error: 'Access denied' }, status: :forbidden
        end
      end
    end
  end
end 