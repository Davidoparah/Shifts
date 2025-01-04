module Api
  module Business
    class ShiftsController < ApplicationController
      before_action :authenticate_user!
      before_action :ensure_business_owner!
      before_action :set_shift, only: [:show, :update, :destroy]

      def index
        @shifts = Shift.where(owner_id: current_user.business_id)
        render json: @shifts.map { |shift| shift_json(shift) }
      rescue StandardError => e
        Rails.logger.error("Error fetching shifts: #{e.class} - #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: "Error fetching shifts: #{e.message}" }, status: :internal_server_error
      end

      def create
        @shift = Shift.new(shift_params)
        @shift.owner_id = current_user.business_id
        @shift.owner_type = 'Business'
        @shift.business = current_user.business.name
        @shift.status = 'available'

        if @shift.save
          render json: shift_json(@shift), status: :created
        else
          Rails.logger.error("Error creating shift: #{@shift.errors.full_messages}")
          render json: { error: @shift.errors.full_messages }, status: :unprocessable_entity
        end
      rescue StandardError => e
        Rails.logger.error("Error creating shift: #{e.class} - #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: "Error creating shift: #{e.message}" }, status: :internal_server_error
      end

      def show
        render json: shift_json(@shift)
      rescue StandardError => e
        render json: { error: "Error fetching shift: #{e.message}" }, status: :internal_server_error
      end

      def update
        if @shift.update(shift_params)
          render json: shift_json(@shift)
        else
          render json: { error: @shift.errors.full_messages }, status: :unprocessable_entity
        end
      rescue StandardError => e
        render json: { error: "Error updating shift: #{e.message}" }, status: :internal_server_error
      end

      def destroy
        if @shift.destroy
          head :no_content
        else
          render json: { error: 'Unable to delete shift' }, status: :unprocessable_entity
        end
      rescue StandardError => e
        render json: { error: "Error deleting shift: #{e.message}" }, status: :internal_server_error
      end

      private

      def set_shift
        @shift = Shift.find(params[:id])
      rescue Mongoid::Errors::DocumentNotFound
        render json: { error: 'Shift not found' }, status: :not_found
      end

      def ensure_business_owner!
        unless current_user&.business_owner?
          Rails.logger.error("Access denied for non-business user: #{current_user&.inspect}")
          render json: { error: 'Access denied. User must be a business owner.' }, status: :forbidden
        end
      end

      def shift_params
        params.require(:shift).permit(
          :start_time,
          :end_time,
          :duration,
          :rate,
          :location
        )
      end

      def shift_json(shift)
        {
          id: shift.id.to_s,
          business: shift.business,
          location: shift.location,
          start_time: shift.start_time,
          end_time: shift.end_time,
          duration: shift.duration,
          rate: shift.rate,
          status: shift.status,
          owner: {
            id: shift.owner_id.to_s,
            type: shift.owner_type
          },
          assignee: shift.assignee_id ? {
            id: shift.assignee_id.to_s,
            type: shift.assignee_type
          } : nil,
          created_at: shift.created_at,
          updated_at: shift.updated_at
        }
      end
    end
  end
end 