module BusinessService
  class LocationSerializer < BaseSerializer
    private

    def serialize_resource(location = @resource)
      {
        id: location.id.to_s,
        business_profile_id: location.business_profile_id.to_s,
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        zip: location.zip,
        country: location.country,
        coordinates: location.coordinates,
        full_address: location.full_address,
        status: location.status,
        location_type: location.location_type,
        contact_name: location.contact_name,
        contact_phone: location.contact_phone,
        contact_email: location.contact_email,
        notes: location.notes,
        operating_hours: location.format_operating_hours,
        amenities: location.amenities,
        parking_info: location.parking_info,
        access_instructions: location.access_instructions,
        security_requirements: location.security_requirements,
        active: location.active?,
        **include_timestamps(location)
      }
    end
  end
end 