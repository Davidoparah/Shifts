module BusinessService
  class LocationsController < ApplicationController
    before_action :authenticate_request
    before_action :set_business_profile
    before_action :set_location, except: [:index, :create]
    before_action :ensure_owner_or_admin!

    def index
      locations = @business_profile.locations
      
      # Apply filters
      locations = apply_filters(locations)
      
      # Apply pagination
      locations = locations.page(params[:page]).per(params[:per_page] || 20)
      
      render json: LocationSerializer.new(locations, pagination: locations).as_json
    end

    def show
      render json: LocationSerializer.new(@location).as_json
    end

    def create
      location = @business_profile.locations.build(location_params)

      if location.save
        render json: LocationSerializer.new(location).as_json, status: :created
      else
        render_error(location.errors.full_messages.join(', '))
      end
    end

    def update
      if @location.update(location_params)
        render json: LocationSerializer.new(@location).as_json
      else
        render_error(@location.errors.full_messages.join(', '))
      end
    end

    def destroy
      if @location.update(status: 'inactive')
        head :no_content
      else
        render_error('Failed to deactivate location')
      end
    end

    def nearby
      distance = params[:distance].to_i || 5
      nearby_locations = @location.nearby_locations(distance)
      
      render json: LocationSerializer.new(nearby_locations).as_json
    end

    def update_operating_hours
      if @location.update(operating_hours: operating_hours_params)
        render json: LocationSerializer.new(@location).as_json
      else
        render_error(@location.errors.full_messages.join(', '))
      end
    end

    private

    def set_business_profile
      @business_profile = BusinessProfile.find(params[:business_profile_id])
    rescue Mongoid::Errors::DocumentNotFound
      render_error('Business profile not found', :not_found)
    end

    def set_location
      @location = @business_profile.locations.find(params[:id])
    rescue Mongoid::Errors::DocumentNotFound
      render_error('Location not found', :not_found)
    end

    def location_params
      params.require(:location).permit(
        :name, :address, :city, :state, :zip, :country,
        :location_type, :contact_name, :contact_phone,
        :contact_email, :notes, :parking_info,
        :access_instructions, amenities: [],
        security_requirements: []
      )
    end

    def operating_hours_params
      params.require(:operating_hours).permit!
    end

    def ensure_owner_or_admin!
      unless current_user.admin? || @business_profile.user_id == current_user.id
        render_error('Unauthorized', :forbidden)
      end
    end

    def apply_filters(scope)
      scope = scope.where(status: params[:status]) if params[:status].present?
      scope = scope.where(location_type: params[:location_type]) if params[:location_type].present?
      
      if params[:lat].present? && params[:lng].present?
        coordinates = [params[:lng].to_f, params[:lat].to_f]
        distance = params[:distance].to_i || 5
        scope = scope.geo_near(coordinates).max_distance(distance * 1609.34) # Convert miles to meters
      end
      
      scope
    end
  end
end 