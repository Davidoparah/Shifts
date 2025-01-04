class Api::IncidentReportsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_shift
  before_action :set_report, only: [:show, :update, :add_photo]

  def index
    reports = @shift.incident_reports.ordered
    render json: reports.as_json(include: :photos)
  end

  def show
    render json: @report.as_json(include: :photos)
  end

  def create
    report = @shift.incident_reports.build(
      incident_report_params.merge(reporter: current_user)
    )

    if report.save
      render json: report, status: :created
    else
      render json: { errors: report.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @report.update(incident_report_params)
      render json: @report
    else
      render json: { errors: @report.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def add_photo
    if params[:photo].present?
      @report.photos.attach(params[:photo])
      render json: { message: 'Photo added successfully' }
    else
      render json: { error: 'No photo provided' }, status: :unprocessable_entity
    end
  end

  private

  def set_shift
    @shift = Shift.find(params[:shift_id])
  end

  def set_report
    @report = @shift.incident_reports.find(params[:id])
  end

  def incident_report_params
    params.require(:incident_report).permit(:title, :description, :severity, :status)
  end
end 