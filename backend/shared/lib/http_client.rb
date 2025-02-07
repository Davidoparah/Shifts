require 'httparty'

module Shared
  class HttpClient
    include HTTParty

    class ServiceError < StandardError; end

    def initialize(service_name, token = nil)
      @base_url = ServiceDiscovery.service_url(service_name)
      @token = token
    end

    def get(path, params = {})
      make_request(:get, path, query: params)
    end

    def post(path, body = {})
      make_request(:post, path, body: body.to_json)
    end

    def put(path, body = {})
      make_request(:put, path, body: body.to_json)
    end

    def patch(path, body = {})
      make_request(:patch, path, body: body.to_json)
    end

    def delete(path)
      make_request(:delete, path)
    end

    private

    def make_request(method, path, options = {})
      url = "#{@base_url}#{path}"
      options[:headers] = default_headers
      options[:timeout] = 30

      begin
        response = self.class.send(method, url, options)
        handle_response(response)
      rescue Timeout::Error
        raise ServiceError, 'Service timeout'
      rescue => e
        Rails.logger.error "Service request failed: #{e.message}"
        raise ServiceError, 'Service unavailable'
      end
    end

    def handle_response(response)
      case response.code
      when 200..299
        response.parsed_response
      when 401
        raise ServiceError, 'Unauthorized'
      when 403
        raise ServiceError, 'Forbidden'
      when 404
        raise ServiceError, 'Resource not found'
      when 422
        raise ServiceError, response.parsed_response['error'] || 'Validation failed'
      else
        raise ServiceError, 'Service error'
      end
    end

    def default_headers
      headers = {
        'Content-Type' => 'application/json',
        'Accept' => 'application/json'
      }
      headers['Authorization'] = "Bearer #{@token}" if @token
      headers
    end
  end
end 