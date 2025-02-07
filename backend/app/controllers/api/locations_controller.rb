module Api
  class LocationsController < ApplicationController
    before_action :authenticate_user!
    before_action :set_location, only: [:show, :update, :destroy, :directions]
    before_action :authorize_business_owner!, only: [:create, :update, :destroy]

    def index
      locations = if params[:near]
        coords = params[:near].split(',').map(&:to_f)
        LocationService.find_nearby_locations(
          coords,
          params[:distance]&.to_f || 10,
          {
            active_only: true,
            business_id: params[:business_id],
            limit: params[:limit]&.to_i
          }
        )
      else
        Location.by_business(params[:business_id])
               .active
               .limit(params[:limit]&.to_i || 20)
      end

      render json: locations
    end

    def show
      render json: @location
    end

    def create
      @location = Location.new(location_params)
      
      # Geocode the address
      if geocoded_data = LocationService.geocode_address(full_address)
        @location.assign_attributes(geocoded_data)
      end

      if @location.save
        render json: @location, status: :created
      else
        render json: { errors: @location.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      # Only geocode if address-related fields have changed
      if address_changed? && (geocoded_data = LocationService.geocode_address(full_address))
        location_params_with_geocoding = location_params.merge(geocoded_data)
      else
        location_params_with_geocoding = location_params
      end

      if @location.update(location_params_with_geocoding)
        render json: @location
      else
        render json: { errors: @location.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @location.update(status: 'inactive')
      head :no_content
    end

    def directions
      # Validate origin coordinates
      unless params[:origin_lat] && params[:origin_lng]
        return render json: { error: 'Origin coordinates are required' }, status: :bad_request
      end

      # Get travel mode (default to driving if not specified)
      mode = params[:mode]&.downcase
      unless ['driving', 'walking', 'bicycling', 'transit'].include?(mode)
        mode = 'driving'
      end

      # Get departure time (default to now if not specified)
      departure_time = params[:departure_time] ? Time.parse(params[:departure_time]) : Time.now

      # Get directions
      origin_coords = [params[:origin_lng].to_f, params[:origin_lat].to_f]
      routes = LocationService.get_transit_directions(
        origin_coords,
        @location.coordinates,
        mode,
        departure_time
      )

      if routes
        render json: {
          origin: {
            coordinates: origin_coords,
            formatted_address: Geocoder.search([params[:origin_lat], params[:origin_lng]]).first&.address
          },
          destination: {
            coordinates: @location.coordinates,
            formatted_address: @location.formatted_address,
            name: @location.name
          },
          routes: routes
        }
      else
        render json: { error: 'Unable to find directions' }, status: :not_found
      end
    end

    private

    def set_location
      @location = Location.find(params[:id])
    end

    def location_params
      params.require(:location).permit(
        :name, :address, :city, :state, :zip, :country,
        :business_id, :location_type, :radius
      )
    end

    def full_address
      [
        location_params[:address],
        location_params[:city],
        location_params[:state],
        location_params[:zip],
        location_params[:country]
      ].compact.join(', ')
    end

    def address_changed?
      address_fields = [:address, :city, :state, :zip, :country]
      address_fields.any? { |field| @location.send("#{field}_changed?") }
    end

    def authorize_business_owner!
      unless current_user.business_owner?
        render json: { error: 'Unauthorized. Business owner access required.' }, status: :unauthorized
      end
    end
  end
end 