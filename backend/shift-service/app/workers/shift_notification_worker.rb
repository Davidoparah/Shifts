module ShiftService
  class ShiftNotificationWorker
    include Sidekiq::Worker
    sidekiq_options queue: 'shift_notifications', retry: 3

    def perform(shift_id, notification_type)
      shift = Shift.find(shift_id)
      
      case notification_type.to_sym
      when :upcoming
        notify_upcoming_shift(shift)
      when :started
        notify_shift_started(shift)
      when :completed
        notify_shift_completed(shift)
      when :cancelled
        notify_shift_cancelled(shift)
      end
    rescue Mongoid::Errors::DocumentNotFound => e
      Rails.logger.error "Shift not found for notification: #{shift_id}"
    rescue => e
      Rails.logger.error "Error sending shift notification: #{e.message}"
      raise e
    end

    private

    def notify_upcoming_shift(shift)
      # Notify worker about upcoming shift (e.g., 24h and 1h before)
      return unless shift.worker_profile_id

      notification_service.notify_worker(
        shift.worker_profile_id,
        "Upcoming Shift Reminder",
        "Your shift at #{shift.location_name} starts in #{time_until_start(shift)}",
        {
          type: 'shift_reminder',
          shift_id: shift.id.to_s,
          start_time: shift.start_time.iso8601
        }
      )
    end

    def notify_shift_started(shift)
      # Notify business owner that worker has started the shift
      notification_service.notify_business(
        shift.business_profile_id,
        "Shift Started",
        "#{shift.worker_name} has started their shift at #{shift.location_name}",
        {
          type: 'shift_started',
          shift_id: shift.id.to_s,
          worker_id: shift.worker_profile_id
        }
      )
    end

    def notify_shift_completed(shift)
      # Notify business owner that shift is completed and notify worker about earnings
      notification_service.notify_business(
        shift.business_profile_id,
        "Shift Completed",
        "#{shift.worker_name} has completed their shift at #{shift.location_name}",
        {
          type: 'shift_completed',
          shift_id: shift.id.to_s,
          worker_id: shift.worker_profile_id,
          hours_worked: shift.actual_hours_worked
        }
      )

      notification_service.notify_worker(
        shift.worker_profile_id,
        "Shift Completed",
        "You've earned $#{shift.total_earnings} for #{shift.actual_hours_worked} hours",
        {
          type: 'shift_completed',
          shift_id: shift.id.to_s,
          earnings: shift.total_earnings
        }
      )
    end

    def notify_shift_cancelled(shift)
      # Notify relevant parties about cancellation
      if shift.worker_profile_id
        notification_service.notify_worker(
          shift.worker_profile_id,
          "Shift Cancelled",
          "Your shift at #{shift.location_name} has been cancelled",
          {
            type: 'shift_cancelled',
            shift_id: shift.id.to_s
          }
        )
      end

      notification_service.notify_business(
        shift.business_profile_id,
        "Shift Cancelled",
        "Shift at #{shift.location_name} has been cancelled",
        {
          type: 'shift_cancelled',
          shift_id: shift.id.to_s
        }
      )
    end

    def notification_service
      @notification_service ||= NotificationService.new
    end

    def time_until_start(shift)
      hours = ((shift.start_time - Time.current) / 1.hour).round
      if hours > 24
        "#{(hours / 24).round} days"
      elsif hours > 1
        "#{hours} hours"
      else
        "#{(hours * 60).round} minutes"
      end
    end
  end
end 