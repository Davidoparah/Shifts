module WorkerService
  class WorkerProfileSerializer
    def initialize(worker_profile)
      @worker_profile = worker_profile
    end

    def as_json
      {
        id: @worker_profile.id.to_s,
        user_id: @worker_profile.user_id,
        phone: @worker_profile.phone,
        address: @worker_profile.address,
        bio: @worker_profile.bio,
        hourly_rate: @worker_profile.hourly_rate,
        availability: @worker_profile.availability,
        skills: @worker_profile.skills,
        photo_urls: @worker_profile.photo_urls,
        rating: @worker_profile.rating,
        total_shifts: @worker_profile.total_shifts,
        total_hours: @worker_profile.total_hours,
        total_earnings: @worker_profile.total_earnings,
        status: @worker_profile.status,
        created_at: @worker_profile.created_at.iso8601,
        updated_at: @worker_profile.updated_at.iso8601
      }
    end
  end
end 