require 'cloudinary'

module WorkerService
  class PhotoUploadService
    def initialize
      configure_cloudinary
    end

    def upload(file)
      # Generate a unique public ID for the image
      public_id = "workers/#{SecureRandom.uuid}"

      begin
        # Upload the file to Cloudinary
        result = Cloudinary::Uploader.upload(file, 
          public_id: public_id,
          folder: 'codehance/workers',
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 800, crop: :limit },
            { quality: 'auto:good' }
          ]
        )

        Rails.logger.info "Photo uploaded successfully: #{result['secure_url']}"
        result
      rescue => e
        Rails.logger.error "Cloudinary upload error: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        raise e
      end
    end

    def delete(public_id)
      begin
        Cloudinary::Uploader.destroy(public_id)
      rescue => e
        Rails.logger.error "Cloudinary delete error: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        raise e
      end
    end

    private

    def configure_cloudinary
      Cloudinary.config do |config|
        config.cloud_name = ENV['CLOUDINARY_CLOUD_NAME']
        config.api_key = ENV['CLOUDINARY_API_KEY']
        config.api_secret = ENV['CLOUDINARY_API_SECRET']
        config.secure = true
      end
    end
  end
end 