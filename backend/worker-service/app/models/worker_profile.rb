module WorkerService
  class WorkerProfile
    include Mongoid::Document
    include Mongoid::Timestamps

    # Fields
    field :user_id, type: String
    field :phone, type: String
    field :address, type: String
    field :bio, type: String
    field :hourly_rate, type: Float
    field :availability, type: Hash, default: {}
    field :skills, type: Array, default: []
    field :photo_urls, type: Array, default: []
    field :rating, type: Float, default: 0.0
    field :total_shifts, type: Integer, default: 0
    field :total_hours, type: Float, default: 0.0
    field :total_earnings, type: Float, default: 0.0
    field :status, type: String, default: 'available'

    # Validations
    validates :user_id, presence: true, uniqueness: true
    validates :phone, presence: true
    validates :address, presence: true
    validates :hourly_rate, numericality: { greater_than: 0 }, allow_nil: true
    validates :status, inclusion: { in: %w[available unavailable suspended] }

    # Indexes
    index({ user_id: 1 }, { unique: true })
    index({ skills: 1 })
    index({ hourly_rate: 1 })
    index({ rating: -1 })
    index({ status: 1 })

    # Callbacks
    after_initialize :set_default_availability, if: :new_record?

    # Instance Methods
    def update_rating(new_rating)
      return if new_rating < 1 || new_rating > 5
      
      new_total = total_shifts * rating + new_rating
      increment(total_shifts: 1)
      update(rating: new_total / (total_shifts + 1))
    end

    def record_shift_completion(hours:, earnings:)
      inc(
        total_hours: hours,
        total_earnings: earnings,
        total_shifts: 1
      )
    end

    def available_at?(datetime)
      return false unless status == 'available'
      
      day_name = datetime.strftime('%A').downcase
      day_schedule = availability[day_name]
      
      return false unless day_schedule&.dig('enabled')
      
      time = datetime.strftime('%H:%M')
      start_time = day_schedule['start_time']
      end_time = day_schedule['end_time']
      
      time.between?(start_time, end_time)
    end

    def update_availability(new_availability)
      update(availability: new_availability)
    end

    def add_skill(skill)
      add_to_set(skills: skill.downcase)
    end

    def remove_skill(skill)
      pull(skills: skill.downcase)
    end

    def add_photo(url)
      add_to_set(photo_urls: url)
    end

    def remove_photo(url)
      pull(photo_urls: url)
    end

    private

    def set_default_availability
      self.availability = {
        'monday' => { 'enabled' => false, 'start_time' => '09:00', 'end_time' => '17:00' },
        'tuesday' => { 'enabled' => false, 'start_time' => '09:00', 'end_time' => '17:00' },
        'wednesday' => { 'enabled' => false, 'start_time' => '09:00', 'end_time' => '17:00' },
        'thursday' => { 'enabled' => false, 'start_time' => '09:00', 'end_time' => '17:00' },
        'friday' => { 'enabled' => false, 'start_time' => '09:00', 'end_time' => '17:00' },
        'saturday' => { 'enabled' => false, 'start_time' => '09:00', 'end_time' => '17:00' },
        'sunday' => { 'enabled' => false, 'start_time' => '09:00', 'end_time' => '17:00' }
      }
    end
  end
end 