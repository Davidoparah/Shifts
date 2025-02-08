class ShiftSerializer
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
    {
      data: @resource.map { |shift| serialize_resource(shift) },
      meta: include_pagination
    }
  end

  def serialize_resource(shift = @resource)
    {
      id: shift.id.to_s,
      title: shift.title,
      description: shift.description,
      start_time: shift.start_time.iso8601,
      end_time: shift.end_time.iso8601,
      hourly_rate: shift.hourly_rate,
      status: shift.status,
      requirements: shift.requirements,
      dress_code: shift.dress_code,
      break_time: shift.break_time,
      notes: shift.notes,
      location_coordinates: shift.location_coordinates,
      
      # Business details
      business_profile_id: shift.business_profile_id,
      business_name: shift.business_name,
      location_id: shift.location_id,
      location_name: shift.location_name,
      location_address: shift.location_address,
      
      # Worker details
      worker_profile_id: shift.worker_profile_id,
      worker_name: shift.worker_name,
      
      # Progress details
      check_in_time: shift.check_in_time&.iso8601,
      check_out_time: shift.check_out_time&.iso8601,
      actual_hours_worked: shift.actual_hours_worked,
      total_earnings: shift.total_earnings,
      
      # Timestamps
      created_at: shift.created_at.iso8601,
      updated_at: shift.updated_at.iso8601
    }
  end

  def include_pagination
    return unless @options[:pagination]

    {
      current_page: @options[:pagination].current_page,
      total_pages: @options[:pagination].total_pages,
      total_count: @options[:pagination].total_count,
      per_page: @options[:pagination].limit_value
    }
  end
end 