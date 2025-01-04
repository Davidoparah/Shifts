class WorkerProfile < ApplicationRecord
  belongs_to :user
  has_many_attached :photos

  # Store availability as JSON
  serialize :availability, JSON
  # Store skills as array
  serialize :skills, Array

  validates :phone, presence: true
  validates :address, presence: true
  validates :bio, presence: true
  validates :hourly_rate, numericality: { greater_than: 0 }, allow_nil: true

  # Default availability structure
  after_initialize :set_default_availability, if: :new_record?

  def total_earnings
    user.shifts.completed.sum(&:calculate_earnings)
  end

  def update_availability(new_availability)
    update(availability: new_availability)
  end

  def available_at?(datetime)
    return false unless availability
    day_name = datetime.strftime('%A').downcase
    day_schedule = availability[day_name]
    return false unless day_schedule&.dig('enabled')
    
    time = datetime.strftime('%H:%M')
    day_schedule['time_slots'].any? do |slot|
      time >= slot['start_time'] && time <= slot['end_time']
    end
  end

  private

  def set_default_availability
    self.availability ||= {
      'monday' => { 'enabled' => false, 'time_slots' => [] },
      'tuesday' => { 'enabled' => false, 'time_slots' => [] },
      'wednesday' => { 'enabled' => false, 'time_slots' => [] },
      'thursday' => { 'enabled' => false, 'time_slots' => [] },
      'friday' => { 'enabled' => false, 'time_slots' => [] },
      'saturday' => { 'enabled' => false, 'time_slots' => [] },
      'sunday' => { 'enabled' => false, 'time_slots' => [] }
    }
  end
end 