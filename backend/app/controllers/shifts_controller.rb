class ShiftsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_shift, only: [:show, :update, :destroy, :apply, :cancel]

  # GET /api/shifts
  def index
    if current_user.business_owner?
      @shifts = current_user.business.shifts
    else
      @shifts = current_user.shifts
    end
    render json: @shifts
  end

  # GET /api/shifts/available
  def available
    authorize! :read, Shift
    page = params[:page]&.to_i || 1
    per_page = 10

    @shifts = Shift
      .available
      .where(:start_time.gt => Time.current)
      .order(start_time: :asc)
      .page(page)
      .per(per_page)

    render json: @shifts
  end

  # GET /api/shifts/worker
  def worker_shifts
    authorize! :read, Shift
    @shifts = current_user.shifts.upcoming
    render json: @shifts
  end

  # GET /api/shifts/worker/history
  def worker_history
    authorize! :read, Shift
    page = params[:page]&.to_i || 1
    per_page = 10

    @shifts = current_user.shifts
      .completed
      .order(start_time: :desc)
      .page(page)
      .per(per_page)

    render json: @shifts
  end

  # POST /api/shifts/worker/apply/:id
  def apply
    authorize! :apply, @shift
    
    if @shift.available? && !@shift.past?
      @shift.assign_to(current_user)
      render json: @shift
    else
      render json: { error: 'Shift is not available' }, status: :unprocessable_entity
    end
  end

  # POST /api/shifts/worker/cancel/:id
  def cancel
    authorize! :cancel, @shift
    
    if @shift.can_cancel?
      @shift.cancel!
      render json: @shift
    else
      render json: { error: 'Cannot cancel this shift' }, status: :unprocessable_entity
    end
  end

  # GET /api/shifts/date/:date
  def by_date
    authorize! :read, Shift
    date = Date.parse(params[:date])
    @shifts = current_user.business.shifts.where(
      :start_time.gte => date.beginning_of_day,
      :start_time.lte => date.end_of_day
    )
    render json: @shifts
  end

  # POST /api/shifts
  def create
    authorize! :create, Shift
    @shift = current_user.business.shifts.build(shift_params)

    if @shift.save
      render json: @shift, status: :created
    else
      render json: { errors: @shift.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PUT /api/shifts/:id
  def update
    authorize! :update, @shift
    
    if @shift.update(shift_params)
      render json: @shift
    else
      render json: { errors: @shift.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/shifts/:id
  def destroy
    authorize! :destroy, @shift
    @shift.destroy
    head :no_content
  end

  private

  def set_shift
    @shift = Shift.find(params[:id])
  end

  def shift_params
    params.require(:shift).permit(
      :start_time,
      :end_time,
      :rate,
      :location,
      :notes,
      requirements: []
    )
  end
end 