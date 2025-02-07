module Api
  module Platform
    class BusinessesController < ApplicationController
      before_action :authenticate_user!
      before_action :ensure_platform_admin!
      before_action :set_business, only: [:show, :update, :destroy, :update_status]

      # GET /api/platform/businesses
      def index
        @businesses = Business.all
        render json: @businesses
      end

      # GET /api/platform/businesses/:id
      def show
        render json: @business
      end

      # POST /api/platform/businesses
      def create
        @business = Business.new(business_params)
        
        if @business.save
          # Create default admin user for the business
          create_business_admin
          render json: @business, status: :created
        else
          render json: { errors: @business.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/platform/businesses/:id
      def update
        if @business.update(business_params)
          render json: @business
        else
          render json: { errors: @business.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/platform/businesses/:id
      def destroy
        begin
          Rails.logger.info("Starting deletion of business #{@business.id}")
          
          # Delete associated records
          if @business.users.any?
            Rails.logger.info("Deleting #{@business.users.count} users")
            @business.users.destroy_all
          end
          
          if @business.shifts.any?
            Rails.logger.info("Deleting #{@business.shifts.count} shifts")
            @business.shifts.destroy_all
          end
          
          if @business.locations.any?
            Rails.logger.info("Deleting #{@business.locations.count} locations")
            @business.locations.destroy_all
          end
          
          # Delete the business itself
          Rails.logger.info("Deleting business")
          @business.destroy
          
          Rails.logger.info("Business deletion completed successfully")
          head :no_content
        rescue StandardError => e
          Rails.logger.error("Error deleting business: #{e.class} - #{e.message}")
          Rails.logger.error(e.backtrace.join("\n"))
          render json: { error: "Failed to delete business: #{e.message}" }, status: :unprocessable_entity
        end
      end

      # PATCH /api/platform/businesses/:id/status
      def update_status
        if @business.update(status: params[:status])
          render json: @business
        else
          render json: { errors: @business.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_business
        @business = Business.find(params[:id])
      rescue Mongoid::Errors::DocumentNotFound
        render json: { error: 'Business not found' }, status: :not_found
      end

      def business_params
        params.require(:business).permit(:name, :email, :phone, :address, :status)
      end

      def create_business_admin
        password = SecureRandom.hex(8)
        user = User.create!(
          email: @business.email,
          password: password,
          password_confirmation: password,
          role: 'business_owner',
          business_id: @business.id
        )

        # TODO: Send email with credentials to business owner
        # BusinessMailer.welcome_email(user, password).deliver_later
      end

      def ensure_platform_admin!
        unless current_user.platform_owner?
          render json: { error: 'Access denied' }, status: :forbidden
        end
      end
    end
  end
end 