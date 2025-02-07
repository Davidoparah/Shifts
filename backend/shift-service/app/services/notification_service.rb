module ShiftService
  class NotificationService < Shared::BaseService
    def notify_worker(worker_id, title, message, data = {})
      worker_client.post(
        '/api/v1/notifications',
        {
          notification: {
            recipient_id: worker_id,
            recipient_type: 'worker',
            title: title,
            message: message,
            data: data
          }
        }
      )
    rescue => e
      log_error(e, { worker_id: worker_id, title: title })
      false
    end

    def notify_business(business_id, title, message, data = {})
      business_client.post(
        '/api/v1/notifications',
        {
          notification: {
            recipient_id: business_id,
            recipient_type: 'business',
            title: title,
            message: message,
            data: data
          }
        }
      )
    rescue => e
      log_error(e, { business_id: business_id, title: title })
      false
    end

    def notify_admin(title, message, data = {})
      auth_client.post(
        '/api/v1/admin/notifications',
        {
          notification: {
            recipient_type: 'admin',
            title: title,
            message: message,
            data: data
          }
        }
      )
    rescue => e
      log_error(e, { title: title })
      false
    end

    def send_shift_reminder(shift)
      return unless shift.worker_profile_id

      notify_worker(
        shift.worker_profile_id,
        'Upcoming Shift Reminder',
        "You have a shift at #{shift.location_name} starting #{format_time(shift.start_time)}",
        {
          type: 'shift_reminder',
          shift_id: shift.id.to_s,
          start_time: shift.start_time.iso8601,
          location: {
            name: shift.location_name,
            address: shift.location_address
          }
        }
      )
    end

    def send_shift_status_update(shift, status)
      case status
      when 'started'
        notify_business(
          shift.business_profile_id,
          'Shift Started',
          "#{shift.worker_name} has started their shift at #{shift.location_name}",
          {
            type: 'shift_started',
            shift_id: shift.id.to_s,
            worker_id: shift.worker_profile_id,
            start_time: shift.check_in_time.iso8601
          }
        )
      when 'completed'
        notify_shift_completion(shift)
      when 'cancelled'
        notify_shift_cancellation(shift)
      end
    end

    private

    def notify_shift_completion(shift)
      # Notify business
      notify_business(
        shift.business_profile_id,
        'Shift Completed',
        "#{shift.worker_name} has completed their shift at #{shift.location_name}",
        {
          type: 'shift_completed',
          shift_id: shift.id.to_s,
          worker_id: shift.worker_profile_id,
          hours_worked: shift.actual_hours_worked,
          end_time: shift.check_out_time.iso8601
        }
      )

      # Notify worker
      notify_worker(
        shift.worker_profile_id,
        'Shift Completed',
        "You've earned $#{shift.total_earnings} for #{shift.actual_hours_worked} hours",
        {
          type: 'shift_completed',
          shift_id: shift.id.to_s,
          earnings: shift.total_earnings,
          hours_worked: shift.actual_hours_worked
        }
      )
    end

    def notify_shift_cancellation(shift)
      # Notify worker if assigned
      if shift.worker_profile_id
        notify_worker(
          shift.worker_profile_id,
          'Shift Cancelled',
          "Your shift at #{shift.location_name} has been cancelled",
          {
            type: 'shift_cancelled',
            shift_id: shift.id.to_s,
            business_name: shift.business_name
          }
        )
      end

      # Notify business
      notify_business(
        shift.business_profile_id,
        'Shift Cancelled',
        "Shift at #{shift.location_name} has been cancelled",
        {
          type: 'shift_cancelled',
          shift_id: shift.id.to_s,
          worker_id: shift.worker_profile_id
        }
      )
    end

    def format_time(time)
      time.strftime('%B %d at %I:%M %p')
    end
  end
end 