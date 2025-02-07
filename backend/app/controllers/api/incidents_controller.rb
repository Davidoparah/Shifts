module Api
  class IncidentsController < ApplicationController
    before_action :authenticate_worker!
    before_action :set_incident, only: [:show, :update, :destroy]

    def index
      incidents = current_worker.worker_profile.incidents.recent
      incidents = incidents.by_status(params[:status]) if params[:status].present?
      
      render json: incidents
    end

    def show
      render json: @incident
    end

    def create
      incident = current_worker.worker_profile.incidents.build(incident_params)

      if incident.save
        render json: incident, status: :created
      else
        render json: { errors: incident.errors }, status: :unprocessable_entity
      end
    end

    def update
      if @incident.update(incident_params)
        render json: @incident
      else
        render json: { errors: @incident.errors }, status: :unprocessable_entity
      end
    end

    def destroy
      @incident.destroy
      head :no_content
    end

    def upload_photo
      begin
        if params[:photo].present?
          # Initialize Cloudinary uploader
          uploader = PhotoUploader.new

          # Upload the photo
          result = uploader.upload(params[:photo].tempfile)

          # Return the Cloudinary URL
          render json: { url: result['secure_url'] }, status: :ok
        else
          render json: { error: 'No photo provided' }, status: :unprocessable_entity
        end
      rescue => e
        Rails.logger.error "Photo upload error: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        render json: { error: 'Failed to upload photo' }, status: :internal_server_error
      end
    end

    private

    def set_incident
      @incident = current_worker.worker_profile.incidents.find(params[:id])
    rescue Mongoid::Errors::DocumentNotFound
      render json: { error: 'Incident not found' }, status: :not_found
    end

    def incident_params
      params.require(:incident).permit(:title, :description, :location, :severity, photos: [])
    end
  end
end 