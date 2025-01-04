module Api
  module Worker
    class ShiftsController < ApplicationController
      before_action :authenticate_user!
      before_action :ensure_worker!
      before_action :set_shift, only: [:signup, :cancel]

      # GET /api/worker/shifts
      def index
        Rails.logger.info("Getting shifts for worker: #{current_user.id}")
        
        @shifts = current_user.shifts.upcoming
        Rails.logger.info("Found #{@shifts.count} upcoming shifts")
        
        render json: @shifts.as_json(include: { business: { only: [:id, :name] } })
      rescue StandardError => e
        Rails.logger.error("Error in index: #{e.class} - #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: 'Error loading shifts' }, status: :internal_server_error
      end

      # GET /api/worker/shifts/available
      def available
        Rails.logger.info("Getting available shifts, page: #{params[:page]}")
        
        page = params[:page]&.to_i || 1
        per_page = 10

        @shifts = Shift
          .available
          .where(:start_time.gt => Time.current)
          .order(start_time: :asc)
          .page(page)
          .per(per_page)

        Rails.logger.info("Found #{@shifts.count} available shifts")
        
        render json: @shifts.as_json(include: { business: { only: [:id, :name] } })
      rescue StandardError => e
        Rails.logger.error("Error in available: #{e.class} - #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: 'Error loading available shifts' }, status: :internal_server_error
      end

      # GET /api/worker/shifts/schedule
      def schedule
        Rails.logger.info("Getting schedule for worker: #{current_user.id}")
        
        @shifts = current_user.shifts
          .where(:start_time.gt => Time.current)
          .not.in(status: ['cancelled', 'completed'])
          .order(start_time: :asc)

        Rails.logger.info("Found #{@shifts.count} scheduled shifts")
        
        render json: @shifts.as_json(include: { business: { only: [:id, :name] } })
      rescue StandardError => e
        Rails.logger.error("Error in schedule: #{e.class} - #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: 'Error loading schedule' }, status: :internal_server_error
      end

      # POST /api/worker/shifts/:id/signup
      def signup
        Rails.logger.info("Worker #{current_user.id} attempting to sign up for shift #{@shift.id}")
        
        if @shift.available? && !@shift.past?
          if @shift.assign_to(current_user)
            Rails.logger.info("Successfully signed up for shift #{@shift.id}")
            render json: @shift.as_json(include: { business: { only: [:id, :name] } })
          else
            Rails.logger.error("Failed to sign up for shift: #{@shift.errors.full_messages}")
            render json: { error: 'Failed to sign up for shift' }, status: :unprocessable_entity
          end
        else
          Rails.logger.error("Shift #{@shift.id} is not available")
          render json: { error: 'Shift is not available' }, status: :unprocessable_entity
        end
      rescue StandardError => e
        Rails.logger.error("Error in signup: #{e.class} - #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: 'Error signing up for shift' }, status: :internal_server_error
      end

      # POST /api/worker/shifts/:id/cancel
      def cancel
        Rails.logger.info("Worker #{current_user.id} attempting to cancel shift #{@shift.id}")
        
        if @shift.can_cancel?
          if @shift.cancel!
            Rails.logger.info("Successfully cancelled shift #{@shift.id}")
            render json: @shift.as_json(include: { business: { only: [:id, :name] } })
          else
            Rails.logger.error("Failed to cancel shift: #{@shift.errors.full_messages}")
            render json: { error: 'Failed to cancel shift' }, status: :unprocessable_entity
          end
        else
          Rails.logger.error("Shift #{@shift.id} cannot be cancelled")
          render json: { error: 'Cannot cancel this shift' }, status: :unprocessable_entity
        end
      rescue StandardError => e
        Rails.logger.error("Error in cancel: #{e.class} - #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: 'Error cancelling shift' }, status: :internal_server_error
      end

      private

      def set_shift
        @shift = Shift.find(params[:id])
      rescue Mongoid::Errors::DocumentNotFound => e
        Rails.logger.error("Shift not found: #{params[:id]}")
        render json: { error: 'Shift not found' }, status: :not_found
      end

      def ensure_worker!
        unless current_user&.worker?
          Rails.logger.error("Access denied for non-worker user: #{current_user&.inspect}")
          render json: { error: 'Access denied. Worker only.' }, status: :forbidden
        end
      end
    end
  end
end 