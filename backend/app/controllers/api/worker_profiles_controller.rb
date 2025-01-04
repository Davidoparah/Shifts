class Api::WorkerProfilesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_profile, only: [:show, :update, :update_availability, :add_photo]

  def show
    render json: @profile.as_json(include: :photos)
  end

  def create
    profile = current_user.build_worker_profile(profile_params)
    if profile.save
      render json: profile, status: :created
    else
      render json: { errors: profile.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @profile.update(profile_params)
      render json: @profile
    else
      render json: { errors: @profile.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update_availability
    if @profile.update_availability(availability_params)
      render json: @profile
    else
      render json: { errors: @profile.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def add_photo
    if params[:photo].present?
      @profile.photos.attach(params[:photo])
      render json: { message: 'Photo added successfully' }
    else
      render json: { error: 'No photo provided' }, status: :unprocessable_entity
    end
  end

  private

  def set_profile
    @profile = if params[:id]
                WorkerProfile.find(params[:id])
              else
                current_user.worker_profile
              end
  end

  def profile_params
    params.require(:worker_profile).permit(
      :phone, :address, :bio, :hourly_rate, skills: []
    )
  end

  def availability_params
    params.require(:availability)
  end
end 