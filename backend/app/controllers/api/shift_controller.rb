module Api
  class ShiftController < ApplicationController
    before_action :authenticate_user!
    before_action :set_shift, only: [:show, :update, :destroy, :apply, :complete, :cancel]

    def index
      shifts = current_user.business? ? current_user.business_shifts : current_user.worker_shifts
      render json: shifts
    end

    def show
      render json: @shift
    end

    def create
      shift = current_user.business_shifts.build(shift_params)
      if shift.save
        render json: shift, status: :created
      else
        render json: { errors: shift.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @shift.update(shift_params)
        render json: @shift
      else
        render json: { errors: @shift.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @shift.destroy
      head :no_content
    end

    def available
      page = params[:page] || 1
      per_page = 20

      shifts = Shift.available
      
      if params[:lat].present? && params[:lng].present?
        worker_location = [params[:lat].to_f, params[:lng].to_f]
        shifts = shifts.near(worker_location, 50) # 50km radius
      end

      shifts = shifts.page(page).per(per_page)
      render json: shifts
    end

    def my_shifts
      shifts = current_user.worker_shifts.upcoming
      render json: shifts
    end

    def history
      shifts = current_user.worker_shifts.completed
      render json: shifts
    end

    def apply
      if @shift.open?
        application = @shift.applications.build(worker: current_user)
        if application.save
          render json: @shift
        else
          render json: { errors: application.errors.full_messages }, status: :unprocessable_entity
        end
      else
        render json: { error: 'Shift is not available' }, status: :unprocessable_entity
      end
    end

    def complete
      if @shift.can_complete?(current_user)
        @shift.complete!
        render json: @shift
      else
        render json: { error: 'Cannot complete this shift' }, status: :unprocessable_entity
      end
    end

    def cancel
      if @shift.can_cancel?(current_user)
        @shift.cancel!
        render json: @shift
      else
        render json: { error: 'Cannot cancel this shift' }, status: :unprocessable_entity
      end
    end

    def update_location
      current_user.update_location(
        params[:latitude].to_f,
        params[:longitude].to_f
      )
      head :ok
    end

    private

    def set_shift
      @shift = Shift.find(params[:id])
    rescue Mongoid::Errors::DocumentNotFound
      render json: { error: 'Shift not found' }, status: :not_found
    end

    def shift_params
      params.require(:shift).permit(
        :date,
        :start_time,
        :end_time,
        :rate,
        :dress_code,
        :requirements,
        :notes,
        location: [:latitude, :longitude, :formatted_address]
      )
    end
  end
end 