module BusinessService
  class BusinessProfileSerializer < BaseSerializer
    private

    def serialize_resource(profile = @resource)
      {
        id: profile.id.to_s,
        user_id: profile.user_id,
        business_name: profile.business_name,
        business_type: profile.business_type,
        registration_number: profile.registration_number,
        tax_number: profile.tax_number,
        contact_email: profile.contact_email,
        contact_phone: profile.contact_phone,
        website: profile.website,
        description: profile.description,
        logo_url: profile.logo_url,
        status: profile.status,
        verification_status: profile.verification_status,
        rating: profile.rating,
        total_reviews: profile.total_reviews,
        total_shifts_posted: profile.total_shifts_posted,
        total_shifts_completed: profile.total_shifts_completed,
        subscription: {
          plan: profile.subscription_plan,
          status: profile.subscription_status,
          expires_at: profile.subscription_expires_at&.iso8601
        },
        can_post_shifts: profile.can_post_shifts?,
        locations_count: profile.locations.count,
        **include_timestamps(profile)
      }
    end
  end
end 