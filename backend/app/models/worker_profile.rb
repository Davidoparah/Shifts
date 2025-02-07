class WorkerProfile
  include Mongoid::Document
  include Mongoid::Timestamps

  field :phone, type: String
  field :address, type: String
  field :bio, type: String
  field :hourly_rate, type: Float
  field :availability, type: Hash, default: {}
  field :skills, type: Array, default: []
  field :photo_urls, type: Array, default: []
  field :rating, type: Float, default: 0.0
  field :total_shifts, type: Integer, default: 0

  belongs_to :user
  has_many :incidents, dependent: :destroy

  validates :phone, presence: true
  validates :address, presence: true
  validates :bio, presence: true
  validates :hourly_rate, numericality: { greater_than: 0 }, allow_nil: true

  index({ user_id: 1 })
  index({ skills: 1 })
  index({ hourly_rate: 1 })
  index({ rating: -1 })

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
    start_time = day_schedule['start_time']
    end_time = day_schedule['end_time']
    
    time.between?(start_time, end_time)
  end

  def add_photo(url)
    push(photo_urls: url)
  end

  def remove_photo(url)
    pull(photo_urls: url)
  end

  def update_rating(new_rating)
    new_total = total_shifts * rating + new_rating
    increment(total_shifts: 1)
    update(rating: new_total / (total_shifts + 1))
  end

  private

  def set_default_availability
    self.availability ||= {
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