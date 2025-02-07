module Api
  module V1
    class IncidentsController < BaseController
      before_action :authenticate_worker!
      before_action :set_incident, only: [:show, :update, :destroy]

      def index
        incidents = current_worker.worker_profile.incidents.recent
        incidents = incidents.by_status(params[:status]) if params[:status].present?
        incidents = incidents.page(pagination_params[:page]).per(pagination_params[:per_page])
        
        render json: IncidentSerializer.new(incidents, pagination: incidents).as_json
      end

      def show
        render json: IncidentSerializer.new(@incident).as_json
      end

      def create
        incident = current_worker.worker_profile.incidents.build(incident_params)

        if incident.save
          render json: IncidentSerializer.new(incident).as_json, status: :created
        else
          render_error(incident.errors.full_messages.join(', '))
        end
      end

      def update
        if @incident.update(incident_params)
          render json: IncidentSerializer.new(@incident).as_json
        else
          render_error(@incident.errors.full_messages.join(', '))
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
            render_error('No photo provided')
          end
        rescue => e
          Rails.logger.error "Photo upload error: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          render_error('Failed to upload photo')
        end
      end

      private

      def set_incident
        @incident = current_worker.worker_profile.incidents.find(params[:id])
      rescue Mongoid::Errors::DocumentNotFound
        render_not_found('Incident')
      end

      def incident_params
        params.require(:incident).permit(:title, :description, :location, :severity, photos: [])
      end
    end
  end
end 