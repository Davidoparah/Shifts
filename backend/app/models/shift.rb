class Shift
  include Mongoid::Document
  include Mongoid::Timestamps
  include Mongoid::Geospatial

  field :title, type: String
  field :description, type: String
  field :start_time, type: Time
  field :end_time, type: Time
  field :hourly_rate, type: Float
  field :status, type: String, default: 'available'
  field :requirements, type: Array, default: []
  field :dress_code, type: String
  field :break_time, type: Integer # in minutes
  field :notes, type: String
  field :location_coordinates, type: Point, sphere: true
  
  field :business_profile_id, type: String
  field :business_name, type: String
  field :location_id, type: String
  field :location_name, type: String
  field :location_address, type: String

  field :worker_profile_id, type: String
  field :worker_name, type: String
  field :check_in_time, type: Time
  field :check_out_time, type: Time
  field :actual_hours_worked, type: Float
  field :total_earnings, type: Float

  belongs_to :business
  belongs_to :worker, optional: true, class_name: 'User'
  has_many :chat_messages
  has_many :incident_reports

  validates :title, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :hourly_rate, presence: true, numericality: { greater_than: 0 }
  validates :business_profile_id, presence: true
  validates :location_name, presence: true
  validates :location_address, presence: true
  validates :status, inclusion: { in: %w[available assigned in_progress completed cancelled] }
  validates :business, presence: true
  validate :business_must_be_active
  validate :end_time_after_start_time
  validate :start_time_in_future, on: :create

  index({ status: 1 })
  index({ business_profile_id: 1 })
  index({ worker_profile_id: 1 })
  index({ start_time: 1 })
  index({ end_time: 1 })
  index({ location_coordinates: '2dsphere' })
  index({ created_at: -1 })

  index({ status: 1, start_time: 1 })
  index({ business_profile_id: 1, status: 1 })
  index({ worker_profile_id: 1, status: 1 })

  scope :available, -> { where(status: 'available') }
  scope :assigned, -> { where(status: 'assigned') }
  scope :in_progress, -> { where(status: 'in_progress') }
  scope :completed, -> { where(status: 'completed') }
  scope :cancelled, -> { where(status: 'cancelled') }
  scope :by_business, ->(business_id) { where(business_profile_id: business_id) }
  scope :by_worker, ->(worker_id) { where(worker_profile_id: worker_id) }
  scope :upcoming, -> { where(:start_time.gt => Time.current) }
  scope :past, -> { where(:end_time.lt => Time.current) }
  scope :current, -> { where(:start_time.lte => Time.current, :end_time.gte => Time.current) }
  scope :for_business, ->(business_profile_id) { where(business_profile_id: business_profile_id) }
  scope :for_worker, ->(worker_profile_id) { where(worker_profile_id: worker_profile_id) }

  def duration
    ((end_time - start_time) / 1.hour).round(2)
  end

  def calculate_earnings
    return 0 unless actual_hours_worked
    (actual_hours_worked * hourly_rate).round(2)
  end

  def can_apply?(worker_profile_id)
    status == 'available' && start_time > Time.current
  end

  def can_start?(worker_profile_id)
    status == 'assigned' && 
    self.worker_profile_id == worker_profile_id && 
    Time.current.between?(start_time - 15.minutes, end_time)
  end

  def can_complete?(worker_profile_id)
    status == 'in_progress' && 
    self.worker_profile_id == worker_profile_id && 
    Time.current >= start_time
  end

  def assign_worker(worker_id, worker_name)
    update(
      worker_profile_id: worker_id,
      worker_name: worker_name,
      status: 'assigned'
    )
  end

  def start_shift
    return false unless can_start?(worker_profile_id)
    update(
      status: 'in_progress',
      check_in_time: Time.current
    )
  end

  def complete_shift
    return false unless can_complete?(worker_profile_id)
    
    worked_hours = ((Time.current - check_in_time) / 1.hour).round(2)
    total = (worked_hours * hourly_rate).round(2)
    
    update(
      status: 'completed',
      check_out_time: Time.current,
      actual_hours_worked: worked_hours,
      total_earnings: total
    )
  end

  def cancel_shift(reason = nil)
    return false if %w[completed cancelled].include?(status)
    
    update(
      status: 'cancelled',
      notes: [notes, "Cancelled: #{reason}"].compact.join("\n").strip
    )
  end

  private

  def business_must_be_active
    if business.present? && business.status != 'active'
      errors.add(:business, 'must be active to create shifts')
    end
  end

  def end_time_after_start_time
    return unless start_time && end_time
    if end_time <= start_time
      errors.add(:end_time, "must be after start time")
    end
  end

  def start_time_in_future
    return unless start_time
    if start_time <= Time.current
      errors.add(:start_time, "must be in the future")
    end
  end
end 