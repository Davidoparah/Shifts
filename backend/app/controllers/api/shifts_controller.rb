module Api
  class ShiftsController < ApplicationController
    before_action :authenticate_user!
    before_action :set_shift, except: [:index, :create]

    def index
      shifts = case params[:filter]
               when 'available'
                 Shift.available
               when 'upcoming'
                 current_user.shifts.upcoming
               when 'in_progress'
                 current_user.shifts.in_progress
               when 'completed'
                 current_user.shifts.completed
               else
                 Shift.all
               end

      render json: shifts
    end

    def show
      render json: @shift
    end

    def create
      shift = current_user.business.shifts.build(shift_params)
      if shift.save
        render json: shift, status: :created
      else
        render json: { errors: shift.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def apply
      if @shift.assign_to(current_user)
        render json: @shift
      else
        render json: { error: 'Could not apply for shift' }, status: :unprocessable_entity
      end
    end

    def start
      if @shift.can_start? && @shift.start
        render json: @shift
      else
        render json: { error: 'Cannot start shift' }, status: :unprocessable_entity
      end
    end

    def complete
      if @shift.complete
        render json: @shift
      else
        render json: { error: 'Cannot complete shift' }, status: :unprocessable_entity
      end
    end

    def cancel
      if @shift.cancel
        render json: @shift
      else
        render json: { error: 'Cannot cancel shift' }, status: :unprocessable_entity
      end
    end

    private

    def set_shift
      @shift = Shift.find(params[:id])
    end

    def shift_params
      params.require(:shift).permit(
        :start_time, :end_time, :rate, :location,
        :coordinates, required_skills: []
      )
    end
  end
end 