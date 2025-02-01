class Api::WorkerProfilesController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_worker!
  before_action :set_profile, only: [:show, :update, :update_availability]

  def show
    render json: @profile.as_json(include: {
      user: { only: [:id, :first_name, :last_name, :email] }
    })
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
      render json: @profile.as_json(include: {
        user: { only: [:id, :first_name, :last_name, :email] }
      })
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

  private

  def set_profile
    @profile = current_user.worker_profile || current_user.create_worker_profile!
  rescue => e
    Rails.logger.error("Error setting worker profile: #{e.message}")
    render json: { error: 'Error retrieving worker profile' }, status: :internal_server_error
  end

  def ensure_worker!
    unless current_user.worker?
      render json: { error: 'Only workers can access profiles' }, status: :forbidden
    end
  end

  def profile_params
    params.permit(
      :phone,
      :address,
      :bio,
      :hourly_rate,
      skills: []
    )
  end

  def availability_params
    params.require(:availability).permit!
  end
end 