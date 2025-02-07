require 'sidekiq'

Sidekiq.configure_server do |config|
  config.redis = { url: ENV['REDIS_URL'] || 'redis://localhost:6379/3' }

  config.server_middleware do |chain|
    chain.add Sidekiq::Middleware::Server::RetryJobs, max_retries: 3
  end
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV['REDIS_URL'] || 'redis://localhost:6379/3' }
end

# Set Sidekiq queue weights
Sidekiq.options[:queues] = [
  ['shift_notifications', 3],
  ['default', 2],
  ['low', 1]
]

# Configure Sidekiq process limits
Sidekiq.configure_server do |config|
  config.options[:concurrency] = ENV.fetch('SIDEKIQ_CONCURRENCY', 5).to_i
end 