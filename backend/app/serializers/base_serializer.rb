class BaseSerializer
  def initialize(resource, options = {})
    @resource = resource
    @options = options
  end

  def as_json
    if @resource.respond_to?(:each)
      serialize_collection
    else
      serialize_resource
    end
  end

  private

  def serialize_collection
    @resource.map { |item| serialize_resource(item) }
  end

  def serialize_resource(item = @resource)
    raise NotImplementedError, "#{self.class} must implement #serialize_resource"
  end

  def include_timestamps(item)
    {
      created_at: item.created_at.iso8601,
      updated_at: item.updated_at.iso8601
    }
  end

  def include_pagination
    return unless @options[:pagination]

    {
      pagination: {
        current_page: @options[:pagination].current_page,
        total_pages: @options[:pagination].total_pages,
        total_count: @options[:pagination].total_count,
        per_page: @options[:pagination].limit_value
      }
    }
  end
end 