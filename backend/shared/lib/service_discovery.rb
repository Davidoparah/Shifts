module Shared
  class ServiceDiscovery
    class ServiceNotFoundError < StandardError; end

    class << self
      def service_url(service_name)
        case service_name.to_sym
        when :auth
          ENV['AUTH_SERVICE_URL'] || 'http://localhost:3001'
        when :worker
          ENV['WORKER_SERVICE_URL'] || 'http://localhost:3002'
        when :business
          ENV['BUSINESS_SERVICE_URL'] || 'http://localhost:3003'
        when :shift
          ENV['SHIFT_SERVICE_URL'] || 'http://localhost:3004'
        else
          raise ServiceNotFoundError, "Unknown service: #{service_name}"
        end
      end

      def register_service
        # In a production environment, this would register the service with
        # a service registry like Consul or Eureka
        Rails.logger.info "Registering service: #{ENV['SERVICE_NAME']} at #{ENV['SERVICE_HOST']}:#{ENV['SERVICE_PORT']}"
      end

      def deregister_service
        # In a production environment, this would deregister the service
        Rails.logger.info "Deregistering service: #{ENV['SERVICE_NAME']}"
      end

      def healthy?
        # Basic health check
        true
      end

      def service_health_check(service_name)
        url = "#{service_url(service_name)}/health"
        begin
          response = HTTParty.get(url, timeout: 5)
          response.success?
        rescue => e
          Rails.logger.error "Health check failed for #{service_name}: #{e.message}"
          false
        end
      end
    end
  end
end 