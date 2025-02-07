Sentry.init do |config|
  config.dsn = ENV['SENTRY_DSN']
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]

  # Set traces_sample_rate to 1.0 to capture 100% of transactions for performance monitoring.
  # We recommend adjusting this value in production.
  config.traces_sample_rate = ENV.fetch('SENTRY_TRACES_SAMPLE_RATE', 0.5).to_f

  # Only send errors in production
  config.enabled_environments = %w[production staging]

  # Capture user information
  config.send_default_pii = true

  # Add additional context
  config.before_send = lambda do |event, hint|
    # Ignore certain errors
    return nil if event.exception&.message&.include?('ActiveRecord::RecordNotFound')
    
    # Add custom context
    event.extra[:service] = 'shift-service'
    event
  end
end 