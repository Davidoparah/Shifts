module Api
  module V1
    class WorkerDocumentsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_worker_profile, except: [:show_for_business]
      before_action :authenticate_worker!, except: [:show_for_business]
      before_action :authenticate_business_owner!, only: [:show_for_business]

      def index
        documents = @worker_profile.documents
        render json: documents
      end

      def show_for_business
        worker_profile = WorkerProfile.find(params[:worker_profile_id])
        documents = worker_profile.documents
        
        # Only return uploaded and non-expired documents
        visible_documents = documents.select { |doc| doc.status == 'uploaded' && (doc.expiry_date.nil? || doc.expiry_date > Date.current) }
        
        render json: {
          documents: visible_documents,
          photo_url: worker_profile.photo_url
        }
      end

      def create
        # Upload file to Cloudinary first
        if params[:document][:file].present?
          begin
            result = Cloudinary::Uploader.upload(
              params[:document][:file],
              resource_type: 'auto',
              folder: "worker_documents/#{@worker_profile.id}",
              public_id: "doc_#{Time.current.to_i}"
            )
            
            # Create document after successful upload
            document = @worker_profile.documents.create!(
              type: document_params[:type],
              file_url: result['secure_url'],
              expiry_date: document_params[:expiry_date],
              status: 'uploaded'
            )
            
            render json: document, status: :created
          rescue => e
            Rails.logger.error "Document creation error: #{e.message}"
            render json: { error: 'Failed to upload document' }, status: :unprocessable_entity
          end
        else
          render json: { error: 'File is required' }, status: :unprocessable_entity
        end
      end

      def destroy
        document = @worker_profile.documents.where(type: params[:id]).first
        
        if document
          if document.destroy
            # Delete file from Cloudinary if it exists
            if document.file_url.present?
              begin
                public_id = document.file_url.split('/').last.split('.').first
                Cloudinary::Uploader.destroy(public_id)
              rescue => e
                Rails.logger.error "Cloudinary delete error: #{e.message}"
              end
            end
            
            head :no_content
          else
            render json: { errors: document.errors.full_messages }, status: :unprocessable_entity
          end
        else
          head :no_content # Return success even if document doesn't exist
        end
      end

      private

      def set_worker_profile
        @worker_profile = current_user.worker_profile
        unless @worker_profile
          render json: { error: 'Worker profile not found' }, status: :not_found
        end
      end

      def authenticate_business_owner!
        unless current_user.business_owner?
          render json: { error: 'Unauthorized access' }, status: :forbidden
        end
      end

      def document_params
        params.require(:document).permit(:type, :file, :expiry_date)
      end
    end
  end
end 