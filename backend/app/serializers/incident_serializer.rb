class IncidentSerializer < BaseSerializer
  private

  def serialize_resource(incident = @resource)
    {
      id: incident.id.to_s,
      title: incident.title,
      description: incident.description,
      location: incident.location,
      severity: incident.severity,
      status: incident.status,
      photos: incident.photos,
      worker: serialize_worker(incident.worker_profile),
      **include_timestamps(incident),
      **include_pagination
    }.compact
  end

  def serialize_worker(worker_profile)
    return unless worker_profile

    {
      id: worker_profile.id.to_s,
      name: worker_profile.user.name,
      phone: worker_profile.phone,
      photo_url: worker_profile.photo_urls&.first
    }
  end
end 