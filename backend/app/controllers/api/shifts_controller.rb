module Api
  class ShiftsController < ApplicationController
    before_action :authenticate_user!
    before_action :set_shift, except: [:index, :create, :available]

    # GET /api/shifts
    def index
      begin
        page = params[:page]&.to_i || 1
        per_page = params[:per_page]&.to_i || 20

        Rails.logger.info("Current user role: #{current_user.role}")
        Rails.logger.info("Current user business: #{current_user.business.inspect}")
        Rails.logger.info("Current user ID: #{current_user.id}")
        Rails.logger.info("Request params: #{params.inspect}")

        shifts = case current_user.role
        when 'business_owner'
          Rails.logger.info("Fetching shifts for business owner")
          if current_user.business.nil?
            raise "Business not found for user #{current_user.id}"
          end
          current_user.business.shifts
        when 'worker'
          Rails.logger.info("Fetching shifts for worker")
          current_user.shifts
        when 'admin'
          Rails.logger.info("Fetching all shifts")
          Shift.all
        else
          raise "Invalid user role: #{current_user.role}"
        end

        Rails.logger.info("Total shifts before filtering: #{shifts&.count}")
        shifts = apply_filters(shifts)
        Rails.logger.info("Total shifts after filtering: #{shifts&.count}")

        total_count = shifts.count
        paginated_shifts = shifts.page(page).per(per_page)
        Rails.logger.info("Paginated shifts count: #{paginated_shifts&.count}")

        render json: {
          data: paginated_shifts.as_json(include: { business: { only: [:id, :name] } }),
          meta: {
            current_page: page,
            total_pages: (total_count.to_f / per_page).ceil,
            total_count: total_count
          }
        }
      rescue StandardError => e
        Rails.logger.error("Error in index: #{e.message}")
        Rails.logger.error("Backtrace: #{e.backtrace.join("\n")}")
        Rails.logger.error("Current user: #{current_user.inspect}")
        render json: { error: "Error loading shifts: #{e.message}" }, status: :internal_server_error
      end
    end

    # GET /api/shifts/available
    def available
      authorize! :read, Shift
      page = params[:page]&.to_i || 1
      per_page = params[:per_page]&.to_i || 10

      shifts = Shift.available
                   .where(:start_time.gt => Time.current)
                   .where(:business.ne => nil)
                   .includes(:business)
                   .order(start_time: :asc)
                   .page(page)
                   .per(per_page)

      if params[:lat].present? && params[:lng].present?
        shifts = shifts.near([params[:lat].to_f, params[:lng].to_f], 50)
      end

      render json: shifts.as_json(include: { business: { only: [:id, :name] } })
    rescue StandardError => e
      Rails.logger.error("Error in available: #{e.message}\n#{e.backtrace.join("\n")}")
      render json: { error: 'Error loading available shifts' }, status: :internal_server_error
    end

    # POST /api/shifts
    def create
      begin
        Rails.logger.info("Current user: #{current_user.inspect}")
        Rails.logger.info("Business owner?: #{current_user.business_owner?}")
        Rails.logger.info("Business: #{current_user.business.inspect}")
        Rails.logger.info("User role: #{current_user.role}")
        Rails.logger.info("User status: #{current_user.status}")

        if !current_user.business_owner?
          render json: { error: 'Only business owners can create shifts' }, status: :forbidden
          return
        end

        if current_user.business.nil?
          render json: { error: 'No business associated with this account' }, status: :unprocessable_entity
          return
        end

        if current_user.business.status != 'active'
          render json: { error: 'Business must be active to create shifts' }, status: :unprocessable_entity
          return
        end

        shift = current_user.business.shifts.build(shift_params)
        shift.status = 'available' # Set initial status to available
        
        if shift.save
          Rails.logger.info("Shift created successfully: #{shift.inspect}")
          render json: shift.as_json(include: { business: { only: [:id, :name] } }), status: :created
        else
          Rails.logger.error("Shift validation errors: #{shift.errors.full_messages}")
          render json: { errors: shift.errors.full_messages }, status: :unprocessable_entity
        end
      rescue StandardError => e
        Rails.logger.error("Error in create: #{e.message}\n#{e.backtrace.join("\n")}")
        render json: { error: e.message }, status: :internal_server_error
      end
    end

    # GET /api/shifts/:id
    def show
      authorize! :read, @shift
      render json: @shift.as_json(include: { business: { only: [:id, :name] } })
    rescue StandardError => e
      Rails.logger.error("Error in show: #{e.message}")
      render json: { error: 'Error fetching shift' }, status: :internal_server_error
    end

    # PUT /api/shifts/:id
    def update
      authorize! :update, @shift
      
      if @shift.update(shift_params)
        render json: @shift.as_json(include: { business: { only: [:id, :name] } })
      else
        render json: { errors: @shift.errors.full_messages }, status: :unprocessable_entity
      end
    rescue StandardError => e
      Rails.logger.error("Error in update: #{e.message}")
      render json: { error: 'Error updating shift' }, status: :internal_server_error
    end

    # DELETE /api/shifts/:id
    def destroy
      authorize! :destroy, @shift
      @shift.destroy
      head :no_content
    rescue StandardError => e
      Rails.logger.error("Error in destroy: #{e.message}")
      render json: { error: 'Error deleting shift' }, status: :internal_server_error
    end

    # POST /api/shifts/:id/apply
    def apply
      authorize! :apply, @shift
      
      if @shift.available? && !@shift.past?
        application = @shift.applications.build(worker: current_user)
        if application.save
          render json: @shift.as_json(include: { business: { only: [:id, :name] } })
        else
          render json: { errors: application.errors.full_messages }, status: :unprocessable_entity
        end
      else
        render json: { error: 'Shift is not available' }, status: :unprocessable_entity
      end
    rescue StandardError => e
      Rails.logger.error("Error in apply: #{e.message}")
      render json: { error: 'Error applying for shift' }, status: :internal_server_error
    end

    # POST /api/shifts/:id/start
    def start
      authorize! :start, @shift
      
      if @shift.can_start? && @shift.start_shift
        render json: @shift.as_json(include: { business: { only: [:id, :name] } })
      else
        render json: { error: 'Cannot start shift' }, status: :unprocessable_entity
      end
    rescue StandardError => e
      Rails.logger.error("Error in start: #{e.message}")
      render json: { error: 'Error starting shift' }, status: :internal_server_error
    end

    # POST /api/shifts/:id/complete
    def complete
      authorize! :complete, @shift
      
      if @shift.complete_shift(params[:rating])
        render json: @shift.as_json(include: { business: { only: [:id, :name] } })
      else
        render json: { error: 'Cannot complete shift' }, status: :unprocessable_entity
      end
    rescue StandardError => e
      Rails.logger.error("Error in complete: #{e.message}")
      render json: { error: 'Error completing shift' }, status: :internal_server_error
    end

    # POST /api/shifts/:id/cancel
    def cancel
      authorize! :cancel, @shift
      
      if @shift.can_cancel? && @shift.cancel_shift
        render json: @shift.as_json(include: { business: { only: [:id, :name] } })
      else
        render json: { error: 'Cannot cancel shift' }, status: :unprocessable_entity
      end
    rescue StandardError => e
      Rails.logger.error("Error in cancel: #{e.message}")
      render json: { error: 'Error cancelling shift' }, status: :internal_server_error
    end

    private

    def set_shift
      @shift = Shift.find(params[:id])
    rescue Mongoid::Errors::DocumentNotFound
      render json: { error: 'Shift not found' }, status: :not_found
    end

    def shift_params
      # Convert requirements to array if it's a string
      if params[:shift][:requirements].is_a?(String)
        params[:shift][:requirements] = params[:shift][:requirements].split(',').map(&:strip)
      end

      params.require(:shift).permit(
        :title,
        :start_time,
        :end_time,
        :rate,
        :location,
        :dress_code,
        :notes,
        requirements: []
      )
    end

    def apply_filters(shifts)
      shifts = case params[:filter]
      when 'available'
        shifts.available
      when 'upcoming'
        shifts.upcoming
      when 'in_progress'
        shifts.in_progress
      when 'completed'
        shifts.completed
      when 'cancelled'
        shifts.cancelled
      else
        shifts
      end

      shifts = shifts.where(:start_time.gte => params[:start_date]) if params[:start_date]
      shifts = shifts.where(:end_time.lte => params[:end_date]) if params[:end_date]
      shifts = shifts.where(rate: params[:rate]) if params[:rate]
      
      shifts.order(created_at: :desc)
    end
  end
end 