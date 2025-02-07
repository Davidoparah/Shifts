module Api
  module V1
    class ShiftsController < ApplicationController
      include Shared::Authenticatable
      include Shared::ErrorHandler
      
      before_action :set_shift, except: [:index, :create, :available]
      before_action :ensure_business_owner!, only: [:create, :update, :cancel]
      before_action :ensure_worker!, only: [:apply, :start, :complete]
      before_action :ensure_can_manage!, only: [:update, :cancel]
      before_action :ensure_can_work!, only: [:apply, :start, :complete]

      def index
        shifts = if params[:business_id]
          Shift.by_business(params[:business_id])
        elsif params[:worker_id]
          Shift.by_worker(params[:worker_id])
        else
          current_user.admin? ? Shift.all : []
        end

        shifts = apply_filters(shifts)
        shifts = shifts.page(pagination_params[:page]).per(pagination_params[:per_page])

        render json: ShiftSerializer.new(shifts, pagination: shifts).as_json
      end

      def show
        render json: ShiftSerializer.new(@shift).as_json
      end

      def create
        shift = Shift.new(shift_params)
        shift.business_profile_id = current_user.business_profile_id
        shift.business_name = current_user.business_name

        if shift.save
          render json: ShiftSerializer.new(shift).as_json, status: :created
        else
          render_error(shift.errors.full_messages.join(', '))
        end
      end

      def update
        if @shift.update(shift_params)
          render json: ShiftSerializer.new(@shift).as_json
        else
          render_error(@shift.errors.full_messages.join(', '))
        end
      end

      def available
        shifts = Shift.open.upcoming
        shifts = apply_filters(shifts)
        shifts = shifts.page(pagination_params[:page]).per(pagination_params[:per_page])

        render json: ShiftSerializer.new(shifts, pagination: shifts).as_json
      end

      def apply
        if @shift.can_apply?
          if @shift.assign_worker(current_user.worker_profile_id, current_user.name)
            render json: ShiftSerializer.new(@shift).as_json
          else
            render_error('Failed to apply for shift')
          end
        else
          render_error('Shift is not available for application')
        end
      end

      def start
        if @shift.can_start?
          if @shift.start_shift
            render json: ShiftSerializer.new(@shift).as_json
          else
            render_error('Failed to start shift')
          end
        else
          render_error('Cannot start shift at this time')
        end
      end

      def complete
        if @shift.can_complete?
          if @shift.complete_shift
            render json: ShiftSerializer.new(@shift).as_json
          else
            render_error('Failed to complete shift')
          end
        else
          render_error('Cannot complete shift at this time')
        end
      end

      def cancel
        reason = params[:reason]
        if @shift.cancel_shift(reason)
          render json: ShiftSerializer.new(@shift).as_json
        else
          render_error('Cannot cancel this shift')
        end
      end

      private

      def set_shift
        @shift = Shift.find(params[:id])
      rescue Mongoid::Errors::DocumentNotFound
        render_not_found('Shift')
      end

      def shift_params
        params.require(:shift).permit(
          :title, :description, :start_time, :end_time,
          :hourly_rate, :dress_code, :break_time, :notes,
          :location_id, :location_name, :location_address,
          location_coordinates: [], requirements: []
        )
      end

      def ensure_can_manage!
        unless current_user.admin? || @shift.business_profile_id == current_user.business_profile_id
          render_forbidden('You are not authorized to manage this shift')
        end
      end

      def ensure_can_work!
        if @shift.worker_profile_id && @shift.worker_profile_id != current_user.worker_profile_id
          render_forbidden('This shift is assigned to another worker')
        end
      end

      def apply_filters(scope)
        scope = scope.where(status: params[:status]) if params[:status].present?
        scope = scope.where(:start_time.gte => params[:start_date]) if params[:start_date].present?
        scope = scope.where(:end_time.lte => params[:end_date]) if params[:end_date].present?
        
        if params[:location_coordinates].present? && params[:distance].present?
          coordinates = params[:location_coordinates].map(&:to_f)
          distance = params[:distance].to_i
          scope = scope.geo_near(coordinates).max_distance(distance * 1609.34) # Convert miles to meters
        end

        scope
      end
    end
  end
end 