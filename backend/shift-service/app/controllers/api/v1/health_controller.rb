module Api
  module V1
    class HealthController < ApplicationController
      skip_before_action :authenticate_request

      def show
        health_status = {
          service: 'shift-service',
          status: 'ok',
          version: ENV['VERSION'] || '1.0.0',
          timestamp: Time.current.iso8601,
          dependencies: check_dependencies
        }

        render json: health_status
      end

      private

      def check_dependencies
        {
          database: check_database,
          redis: check_redis,
          auth_service: check_auth_service,
          worker_service: check_worker_service,
          business_service: check_business_service
        }
      end

      def check_database
        Shift.count
        { status: 'ok' }
      rescue => e
        { status: 'error', message: e.message }
      end

      def check_redis
        Sidekiq.redis { |redis| redis.ping }
        { status: 'ok' }
      rescue => e
        { status: 'error', message: e.message }
      end

      def check_auth_service
        response = HTTParty.get("#{ENV['AUTH_SERVICE_URL']}/api/v1/health")
        { status: 'ok' }
      rescue => e
        { status: 'error', message: e.message }
      end

      def check_worker_service
        response = HTTParty.get("#{ENV['WORKER_SERVICE_URL']}/api/v1/health")
        { status: 'ok' }
      rescue => e
        { status: 'error', message: e.message }
      end

      def check_business_service
        response = HTTParty.get("#{ENV['BUSINESS_SERVICE_URL']}/api/v1/health")
        { status: 'ok' }
      rescue => e
        { status: 'error', message: e.message }
      end
    end
  end
end 