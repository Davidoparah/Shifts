module WorkerService
  class WorkerProfilesController < ApplicationController
    before_action :authenticate_request
    before_action :set_worker_profile, except: [:index, :create]

    def index
      worker_profiles = WorkerProfile.all
      
      # Apply filters
      worker_profiles = apply_filters(worker_profiles)
      
      # Apply pagination
      worker_profiles = worker_profiles.page(params[:page]).per(params[:per_page] || 20)
      
      render json: {
        worker_profiles: worker_profiles.map { |wp| WorkerProfileSerializer.new(wp).as_json },
        meta: {
          total_count: worker_profiles.total_count,
          total_pages: worker_profiles.total_pages,
          current_page: worker_profiles.current_page
        }
      }
    end

    def show
      render json: WorkerProfileSerializer.new(@worker_profile).as_json
    end

    def create
      worker_profile = WorkerProfile.new(worker_profile_params)
      worker_profile.user_id = current_user.id

      if worker_profile.save
        render json: WorkerProfileSerializer.new(worker_profile).as_json, status: :created
      else
        render_error(worker_profile.errors.full_messages.join(', '), :unprocessable_entity)
      end
    end

    def update
      if @worker_profile.update(worker_profile_params)
        render json: WorkerProfileSerializer.new(@worker_profile).as_json
      else
        render_error(@worker_profile.errors.full_messages.join(', '), :unprocessable_entity)
      end
    end

    def update_availability
      if @worker_profile.update_availability(availability_params)
        render json: WorkerProfileSerializer.new(@worker_profile).as_json
      else
        render_error(@worker_profile.errors.full_messages.join(', '), :unprocessable_entity)
      end
    end

    def add_skill
      skill = params[:skill].to_s.strip.downcase
      
      if skill.present? && @worker_profile.add_skill(skill)
        render json: WorkerProfileSerializer.new(@worker_profile).as_json
      else
        render_error('Invalid skill', :unprocessable_entity)
      end
    end

    def remove_skill
      skill = params[:skill].to_s.strip.downcase
      
      if skill.present? && @worker_profile.remove_skill(skill)
        render json: WorkerProfileSerializer.new(@worker_profile).as_json
      else
        render_error('Invalid skill', :unprocessable_entity)
      end
    end

    def upload_photo
      if params[:photo].present?
        result = PhotoUploadService.new.upload(params[:photo])
        @worker_profile.add_photo(result['secure_url'])
        render json: WorkerProfileSerializer.new(@worker_profile).as_json
      else
        render_error('No photo provided', :unprocessable_entity)
      end
    end

    def remove_photo
      url = params[:url].to_s
      
      if url.present? && @worker_profile.remove_photo(url)
        PhotoUploadService.new.delete(url)
        render json: WorkerProfileSerializer.new(@worker_profile).as_json
      else
        render_error('Invalid photo URL', :unprocessable_entity)
      end
    end

    def stats
      render json: {
        total_shifts: @worker_profile.total_shifts,
        total_hours: @worker_profile.total_hours,
        total_earnings: @worker_profile.total_earnings,
        average_rating: @worker_profile.rating,
        completed_shifts_this_month: @worker_profile.shifts.completed.this_month.count,
        earnings_this_month: @worker_profile.shifts.completed.this_month.sum(:earnings)
      }
    end

    private

    def set_worker_profile
      @worker_profile = WorkerProfile.find_by(user_id: params[:id] || current_user.id)
      render_error('Worker profile not found', :not_found) unless @worker_profile
    end

    def worker_profile_params
      params.require(:worker_profile).permit(
        :phone, :address, :bio, :hourly_rate, :status,
        skills: [], photo_urls: []
      )
    end

    def availability_params
      params.require(:availability).permit!
    end

    def apply_filters(scope)
      scope = scope.where(status: params[:status]) if params[:status].present?
      scope = scope.where(:hourly_rate.gte => params[:min_rate].to_f) if params[:min_rate].present?
      scope = scope.where(:hourly_rate.lte => params[:max_rate].to_f) if params[:max_rate].present?
      scope = scope.where(:rating.gte => params[:min_rating].to_f) if params[:min_rating].present?
      scope = scope.where(:skills.in => [params[:skill]]) if params[:skill].present?
      scope
    end
  end
end 