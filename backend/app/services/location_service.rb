class LocationService
  class << self
    def geocode_address(address)
      result = Geocoder.search(address).first
      return nil unless result

      {
        coordinates: [result.longitude, result.latitude],
        formatted_address: result.address,
        city: result.city,
        state: result.state,
        country: result.country,
        zip: result.postal_code,
        place_id: result.place_id,
        timezone: get_timezone(result.latitude, result.longitude)
      }
    end

    def find_nearby_locations(coords, distance = 10, options = {})
      query = Location.near_coordinates(coords, distance)
      
      query = query.active if options[:active_only]
      query = query.by_business(options[:business_id]) if options[:business_id]
      
      query.limit(options[:limit] || 20)
    end

    def calculate_distance(coords1, coords2)
      return nil unless coords1 && coords2
      
      # Use Geocoder's distance calculation (returns distance in km)
      Geocoder::Calculations.distance_between(
        [coords1[1], coords1[0]], # [lat, lng]
        [coords2[1], coords2[0]]  # [lat, lng]
      )
    end

    def get_transit_directions(origin_coords, destination_coords, mode = 'driving', departure_time = Time.now)
      return nil unless origin_coords && destination_coords

      gmaps = GoogleMapsService::Client.new(
        key: Rails.application.credentials.google_maps_api_key,
        retry_timeout: 20,
        queries_per_second: 10
      )

      origin = "#{origin_coords[1]},#{origin_coords[0]}"      # lat,lng
      destination = "#{destination_coords[1]},#{destination_coords[0]}" # lat,lng

      # Get directions with specified travel mode
      routes = gmaps.directions(
        origin,
        destination,
        mode: mode,
        departure_time: departure_time,
        alternatives: true,
        transit_routing_preference: 'less_walking'
      )

      return nil if routes.empty?

      # Process and format the routes
      routes.map do |route|
        {
          distance: route[:legs][0][:distance][:text],
          duration: route[:duration][:text],
          fare: route[:fare]&.dig(:text),
          steps: process_route_steps(route[:legs][0][:steps]),
          polyline: route[:overview_polyline][:points],
          warnings: route[:warnings],
          arrival_time: route[:legs][0][:arrival_time]&.dig(:text),
          departure_time: route[:legs][0][:departure_time]&.dig(:text)
        }
      end
    end

    private

    def get_timezone(latitude, longitude)
      return nil unless latitude && longitude
      
      begin
        timezone = Geocoder.search([latitude, longitude]).first&.timezone
        timezone || 'UTC'
      rescue => e
        Rails.logger.error("Error getting timezone: #{e.message}")
        'UTC'
      end
    end

    def process_route_steps(steps)
      steps.map do |step|
        {
          travel_mode: step[:travel_mode],
          instruction: step[:html_instructions],
          distance: step[:distance][:text],
          duration: step[:duration][:text],
          transit_details: process_transit_details(step[:transit_details])
        }
      end
    end

    def process_transit_details(transit_details)
      return nil unless transit_details

      {
        departure_stop: transit_details[:departure_stop][:name],
        arrival_stop: transit_details[:arrival_stop][:name],
        line: {
          name: transit_details[:line][:name],
          vehicle: transit_details[:line][:vehicle][:type],
          color: transit_details[:line][:color],
          text_color: transit_details[:line][:text_color]
        },
        num_stops: transit_details[:num_stops]
      }
    end
  end
end 