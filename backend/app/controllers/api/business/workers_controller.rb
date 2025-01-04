module Api
  module Business
    class WorkersController < ApplicationController
      before_action :authenticate_user!
      before_action :ensure_business_owner!
      before_action :set_worker, only: [:shifts, :profile, :update_profile]

      def index
        begin
          business = current_user.business
          # Find all workers who have shifts with this business
          workers = User.where(role: 'WORKER').to_a
          
          worker_data = workers.map do |worker|
            worker_shifts = worker.all_shifts.where(business: business.id.to_s)
            {
              id: worker.id.to_s,
              name: worker.name,
              email: worker.email,
              role: worker.role,
              avatar: worker.avatar_url,
              shifts_completed: worker_shifts.where(status: 'completed').count,
              status: worker_status(worker),
              rating: calculate_worker_rating(worker, business),
              current_shift: current_shift_data(worker, business),
              upcoming_shifts: upcoming_shifts_data(worker, business)
            }
          end

          render json: worker_data
        rescue => e
          Rails.logger.error "Error in workers#index: #{e.message}\n#{e.backtrace.join("\n")}"
          render json: { error: 'An error occurred while fetching workers' }, status: :internal_server_error
        end
      end

      def profile
        begin
          business = current_user.business
          worker_profile = {
            id: @worker.id.to_s,
            name: @worker.name,
            email: @worker.email,
            role: @worker.role,
            avatar: @worker.avatar_url,
            phone: @worker.phone,
            preferred_hours: @worker.preferred_hours || [],
            preferred_locations: @worker.preferred_locations || [],
            skills: @worker.skills || [],
            max_weekly_hours: @worker.max_weekly_hours || 40,
            availability: @worker.availability || initialize_availability,
            notes: @worker.notes,
            status: worker_status(@worker),
            rating: calculate_worker_rating(@worker, business),
            current_shift: current_shift_data(@worker, business),
            upcoming_shifts: upcoming_shifts_data(@worker, business)
          }

          render json: worker_profile
        rescue => e
          Rails.logger.error "Error in workers#profile: #{e.message}\n#{e.backtrace.join("\n")}"
          render json: { error: 'An error occurred while fetching worker profile' }, status: :internal_server_error
        end
      end

      def update_profile
        begin
          profile_params = params.require(:worker).permit(
            :name,
            :email,
            :phone,
            :max_weekly_hours,
            :notes,
            preferred_hours: [],
            preferred_locations: [],
            skills: [],
            availability: {}
          )

          if @worker.update(profile_params)
            render json: { message: 'Profile updated successfully' }, status: :ok
          else
            render json: { error: @worker.errors.full_messages.join(', ') }, status: :unprocessable_entity
          end
        rescue => e
          Rails.logger.error "Error in workers#update_profile: #{e.message}\n#{e.backtrace.join("\n")}"
          render json: { error: 'An error occurred while updating worker profile' }, status: :internal_server_error
        end
      end

      def shifts
        begin
          business = current_user.business
          page = (params[:page] || 1).to_i
          per_page = (params[:per_page] || 20).to_i
          status_array = params[:status]&.split(',') || ['completed', 'cancelled']

          shifts = @worker.all_shifts
                         .where(business: business.id.to_s)
                         .in(status: status_array)
                         .order_by(start_time: :desc)
                         .skip((page - 1) * per_page)
                         .limit(per_page)

          shift_data = shifts.map do |shift|
            {
              id: shift.id.to_s,
              start_time: shift.start_time,
              end_time: shift.end_time,
              location: shift.location,
              status: shift.status,
              rating: shift.rating
            }
          end

          render json: shift_data
        rescue => e
          Rails.logger.error "Error in workers#shifts: #{e.message}\n#{e.backtrace.join("\n")}"
          render json: { error: 'An error occurred while fetching worker shifts' }, status: :internal_server_error
        end
      end

      private

      def set_worker
        @worker = User.find(params[:id])
      rescue Mongoid::Errors::DocumentNotFound
        render json: { error: 'Worker not found' }, status: :not_found
      end

      def ensure_business_owner!
        unless current_user.business_owner?
          render json: { error: 'Unauthorized' }, status: :unauthorized
        end
      end

      def initialize_availability
        %w[monday tuesday wednesday thursday friday saturday sunday].each_with_object({}) do |day, acc|
          acc[day] = false
        end
      end

      def worker_status(worker)
        current_time = Time.current
        current_shift = worker.all_shifts
                             .where(business: current_user.business.id.to_s)
                             .and({ :start_time.lte => current_time })
                             .and({ :end_time.gte => current_time })
                             .in(status: ['confirmed', 'active'])
                             .first
        current_shift ? 'active' : 'inactive'
      rescue => e
        Rails.logger.error "Error in worker_status: #{e.message}"
        'inactive'
      end

      def calculate_worker_rating(worker, business)
        completed_shifts = worker.all_shifts.where(business: business.id.to_s, status: 'completed')
        return nil if completed_shifts.empty?

        rated_shifts = completed_shifts.where(:rating.ne => nil)
        return nil if rated_shifts.empty?

        (rated_shifts.sum(:rating) / rated_shifts.count.to_f).round(1)
      rescue => e
        Rails.logger.error "Error in calculate_worker_rating: #{e.message}"
        nil
      end

      def current_shift_data(worker, business)
        current_time = Time.current
        current_shift = worker.all_shifts
                             .where(business: business.id.to_s)
                             .and({ :start_time.lte => current_time })
                             .and({ :end_time.gte => current_time })
                             .in(status: ['confirmed', 'active'])
                             .first

        return nil unless current_shift

        {
          id: current_shift.id.to_s,
          start_time: current_shift.start_time,
          end_time: current_shift.end_time,
          location: current_shift.location,
          status: current_shift.status
        }
      rescue => e
        Rails.logger.error "Error in current_shift_data: #{e.message}"
        nil
      end

      def upcoming_shifts_data(worker, business)
        current_time = Time.current
        worker.all_shifts
              .where(business: business.id.to_s)
              .and({ :start_time.gt => current_time })
              .in(status: ['confirmed', 'active'])
              .order_by(start_time: :asc)
              .limit(5)
              .map do |shift|
          {
            id: shift.id.to_s,
            start_time: shift.start_time,
            end_time: shift.end_time,
            location: shift.location,
            status: shift.status
          }
        end
      rescue => e
        Rails.logger.error "Error in upcoming_shifts_data: #{e.message}"
        []
      end
    end
  end
end 