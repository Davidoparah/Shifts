module Api
  module V1
    class ShiftsController < BaseController
      before_action :authenticate_user!
      before_action :set_shift, only: [:show, :update, :apply, :start, :complete, :cancel, :destroy]
      before_action :ensure_can_manage!, only: [:update, :cancel, :destroy]
      before_action :ensure_can_work!, only: [:apply, :start, :complete]
      before_action :set_business, only: [:create]

      def index
        scope = Shift.all
        scope = apply_filters(scope)
        shifts = scope.order_by(created_at: :desc).page(params[:page]).per(params[:per_page] || 20)
        
        render json: ShiftSerializer.new(shifts, pagination: shifts).as_json
      end

      def show
        render json: ShiftSerializer.new(@shift).as_json
      end

      def create
        shift = Shift.new(shift_params)
        shift.business = @business
        
        if shift.save
          render json: ShiftSerializer.new(shift).as_json, status: :created
        else
          render json: { errors: shift.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @shift.update(shift_params)
          render json: ShiftSerializer.new(@shift).as_json
        else
          render json: { errors: @shift.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def available
        shifts = Shift.available
                     .upcoming
                     .order_by(start_time: :asc)
                     .page(params[:page])
                     .per(params[:per_page] || 20)
        
        render json: ShiftSerializer.new(shifts, pagination: shifts).as_json
      end

      def apply
        if @shift.can_apply?(current_user.worker_profile.id)
          @shift.update(
            status: 'assigned',
            worker_profile_id: current_user.worker_profile.id,
            worker_name: current_user.full_name,
            worker: current_user
          )
          render json: ShiftSerializer.new(@shift).as_json
        else
          render json: { error: 'Cannot apply for this shift' }, status: :unprocessable_entity
        end
      end

      def start
        if @shift.can_start?(current_user.worker_profile.id)
          @shift.update(
            status: 'in_progress',
            check_in_time: Time.current
          )
          render json: ShiftSerializer.new(@shift).as_json
        else
          render json: { error: 'Cannot start this shift' }, status: :unprocessable_entity
        end
      end

      def complete
        if @shift.can_complete?(current_user.worker_profile.id)
          @shift.update(
            status: 'completed',
            check_out_time: Time.current,
            actual_hours_worked: ((Time.current - @shift.check_in_time) / 1.hour).round(2)
          )
          @shift.update(total_earnings: @shift.calculate_earnings)
          render json: ShiftSerializer.new(@shift).as_json
        else
          render json: { error: 'Cannot complete this shift' }, status: :unprocessable_entity
        end
      end

      def cancel
        if @shift.update(status: 'cancelled')
          render json: ShiftSerializer.new(@shift).as_json
        else
          render json: { error: 'Cannot cancel this shift' }, status: :unprocessable_entity
        end
      end

      def destroy
        if @shift.destroy
          head :no_content
        else
          render json: { error: 'Failed to delete shift' }, status: :unprocessable_entity
        end
      end

      private

      def set_shift
        @shift = Shift.find(params[:id])
      rescue Mongoid::Errors::DocumentNotFound
        render json: { error: 'Shift not found' }, status: :not_found
      end

      def set_business
        @business = current_user.business
        unless @business&.status == 'active'
          render json: { error: 'Business must be active to create shifts' }, status: :unprocessable_entity
        end
      end

      def shift_params
        params.require(:shift).permit(
          :title,
          :description,
          :start_time,
          :end_time,
          :hourly_rate,
          :dress_code,
          :break_time,
          :notes,
          :location_name,
          :location_address,
          :status, 
          requirements: [],
          location_coordinates: []
        ).tap do |whitelisted|
          whitelisted[:business_profile_id] = current_user.business.id
          whitelisted[:business_name] = current_user.business.name
        end
      end

      def ensure_can_manage!
        unless current_user.admin? || @shift.business_profile_id == current_user.business_profile&.id
          render json: { error: 'Not authorized to manage this shift' }, status: :forbidden
        end
      end

      def ensure_can_work!
        unless current_user.worker_profile
          render json: { error: 'Must have a worker profile to perform this action' }, status: :forbidden
        end
      end

      def apply_filters(scope)
        scope = scope.where(status: params[:status]) if params[:status].present?
        scope = scope.where(business_profile_id: params[:business_id]) if params[:business_id].present?
        
        if current_user.worker?
          case params[:filter]
          when 'upcoming'
            scope = scope.where(
              worker_profile_id: current_user.worker_profile.id,
              status: 'assigned',
              start_time: { :$gt => Time.current }
            )
          when 'completed'
            scope = scope.where(
              worker_profile_id: current_user.worker_profile.id,
              status: 'completed'
            )
          when 'in_progress'
            scope = scope.where(
              worker_profile_id: current_user.worker_profile.id,
              status: 'in_progress'
            )
          when 'available'
            scope = scope.where(
              status: 'available',
              start_time: { :$gt => Time.current }
            )
          else
            scope = scope.where(worker_profile_id: current_user.worker_profile.id) unless params[:status] == 'available'
          end
        end

        if params[:start_date].present?
          scope = scope.where(:start_time.gte => params[:start_date].to_datetime.beginning_of_day)
        end
        
        if params[:end_date].present?
          scope = scope.where(:end_time.lte => params[:end_date].to_datetime.end_of_day)
        end

        scope
      end
    end
  end
end 