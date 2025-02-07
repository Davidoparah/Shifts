module Shared
  class BaseService
    class << self
      def call(*args)
        new(*args).call
      end
    end

    protected

    def success(data = nil)
      OpenStruct.new(success?: true, data: data, error: nil)
    end

    def failure(error)
      OpenStruct.new(success?: false, data: nil, error: error)
    end

    def auth_client(token = nil)
      @auth_client ||= HttpClient.new(:auth, token)
    end

    def worker_client(token = nil)
      @worker_client ||= HttpClient.new(:worker, token)
    end

    def business_client(token = nil)
      @business_client ||= HttpClient.new(:business, token)
    end

    def shift_client(token = nil)
      @shift_client ||= HttpClient.new(:shift, token)
    end

    def log_error(error, context = {})
      Rails.logger.error(
        error: error.class.name,
        message: error.message,
        service: self.class.name,
        context: context,
        backtrace: error.backtrace&.first(5)
      )
    end

    def validate_presence!(*attributes)
      attributes.each do |attr|
        raise ArgumentError, "#{attr} is required" if instance_variable_get("@#{attr}").nil?
      end
    end
  end
end 