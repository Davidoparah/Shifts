module Shared
  class BaseSerializer
    attr_reader :resource, :options

    def initialize(resource, options = {})
      @resource = resource
      @options = options
    end

    def serialize
      return serialize_collection if resource.is_a?(Enumerable)
      serialize_resource
    end

    private

    def serialize_collection
      resource.map { |item| serialize_single(item) }
    end

    def serialize_single(item)
      @resource = item
      serialize_resource
    end

    def serialize_resource
      raise NotImplementedError, "#{self.class} must implement #serialize_resource"
    end

    def include_timestamps(resource)
      {
        created_at: resource.created_at.iso8601,
        updated_at: resource.updated_at.iso8601
      }
    end

    def include_id(resource)
      { id: resource.id.to_s }
    end

    def include_base(resource)
      include_id(resource).merge(include_timestamps(resource))
    end

    def serialize_association(association, serializer_class)
      return nil if association.nil?
      
      if association.is_a?(Enumerable)
        association.map { |item| serializer_class.new(item, options).serialize }
      else
        serializer_class.new(association, options).serialize
      end
    end
  end
end 