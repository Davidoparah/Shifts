# Configure Mongoid to use the configuration in mongoid.yml
Mongoid.load!(Rails.root.join("config/mongoid.yml"))

# Configure Mongoid specific options
Mongoid.configure do |config|
  # Log queries in development
  if Rails.env.development?
    config.logger = Logger.new($stdout, :debug)
  end

  # Configure Mongoid specific options
  config.preload_models = true
end

# Create indexes in development and production
if defined?(Rails::Server) || Rails.env.development? || Rails.env.production?
  Rails.application.config.after_initialize do
    Rails.logger.info 'Creating MongoDB indexes...'
    
    # Get all Mongoid models
    Rails.application.eager_load!
    Mongoid.models.each do |model|
      begin
        model.create_indexes
        Rails.logger.info "Created indexes for #{model}"
      rescue => e
        Rails.logger.error "Error creating indexes for #{model}: #{e.message}"
      end
    end
    
    Rails.logger.info 'Finished creating MongoDB indexes'
  end
end
