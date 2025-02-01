module JWT
  class << self
    def secret_key
      @secret_key ||= ENV['JWT_SECRET'] || Rails.application.secret_key_base || 'development_key'
    end

    def algorithm
      ENV['JWT_ALGORITHM'] || 'HS256'
    end

    def expiration_time
      (ENV['JWT_EXPIRATION_HOURS']&.to_i || 24).hours
    end

    def refresh_expiration_time
      (ENV['JWT_REFRESH_EXPIRATION_DAYS']&.to_i || 7).days
    end

    def logger
      @logger ||= Logger.new(Rails.root.join('log', 'jwt.log'))
    end

    def log(level, message, data = {})
      logger.send(level, "JWT: #{message} | #{data.to_json}")
    end
  end
end 