module Api
  module V1
    class WorkerProfilesController < ApplicationController
      before_action :authenticate_user!
      before_action :authenticate_worker!
      before_action :set_profile, only: [:show, :update, :update_availability]

      def show
        render json: @profile
      end

      def create
        @profile = current_user.build_worker_profile(profile_params)
        
        if @profile.save
          render json: {
            user: current_user.as_json(include: :worker_profile),
            worker_profile: @profile
          }, status: :created
        else
          render json: { errors: @profile.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @profile.update(profile_params)
          # Reload the user to get the updated worker_profile
          current_user.reload
          render json: {
            user: current_user.as_json(include: :worker_profile),
            worker_profile: @profile
          }
        else
          render json: { errors: @profile.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update_availability
        if @profile.update_availability(availability_params)
          # Reload the user to get the updated worker_profile
          current_user.reload
          render json: {
            user: current_user.as_json(include: :worker_profile),
            worker_profile: @profile
          }
        else
          render json: { errors: @profile.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_profile
        @profile = current_user.worker_profile
        unless @profile
          render json: { error: 'Worker profile not found' }, status: :not_found
        end
      end

      def profile_params
        # Try to get nested parameters first
        params_hash = if params[:worker_profile].present?
          params.require(:worker_profile)
        else
          # Fall back to root-level parameters
          params
        end

        params_hash.permit(
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
  end
end 