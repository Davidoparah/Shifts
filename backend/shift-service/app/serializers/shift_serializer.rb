module ShiftService
  class ShiftSerializer < Shared::BaseSerializer
    private

    def serialize_resource(shift = @resource)
      {
        id: shift.id.to_s,
        title: shift.title,
        description: shift.description,
        start_time: shift.start_time.iso8601,
        end_time: shift.end_time.iso8601,
        duration_hours: shift.duration_hours,
        hourly_rate: shift.hourly_rate,
        status: shift.status,
        requirements: shift.requirements,
        dress_code: shift.dress_code,
        break_time: shift.break_time,
        notes: shift.notes,
        
        # Business details
        business: {
          id: shift.business_profile_id,
          name: shift.business_name
        },
        
        # Location details
        location: {
          id: shift.location_id,
          name: shift.location_name,
          address: shift.location_address,
          coordinates: shift.location_coordinates
        },
        
        # Worker details (if assigned)
        worker: worker_details(shift),
        
        # Shift progress details (if started/completed)
        progress: progress_details(shift),
        
        # Timestamps
        **include_timestamps(shift)
      }.compact
    end

    private

    def worker_details(shift)
      return nil unless shift.worker_profile_id

      {
        id: shift.worker_profile_id,
        name: shift.worker_name
      }
    end

    def progress_details(shift)
      return nil unless shift.check_in_time || shift.check_out_time

      {
        check_in_time: shift.check_in_time&.iso8601,
        check_out_time: shift.check_out_time&.iso8601,
        actual_hours_worked: shift.actual_hours_worked,
        total_earnings: shift.total_earnings
      }.compact
    end
  end
end 