class Shift
  include Mongoid::Document
  include Mongoid::Timestamps

  field :title, type: String
  field :start_time, type: Time
  field :end_time, type: Time
  field :rate, type: Float
  field :location, type: String
  field :status, type: String, default: 'available'
  field :requirements, type: Array, default: []
  field :dress_code, type: String
  field :notes, type: String
  field :completed_at, type: Time
  field :rating, type: Float

  belongs_to :business
  belongs_to :worker, optional: true, class_name: 'User'
  has_many :chat_messages
  has_many :incident_reports

  validates :title, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :rate, presence: true, numericality: { greater_than: 0 }
  validates :location, presence: true
  validates :status, inclusion: { in: %w[available assigned in_progress completed cancelled] }
  validates :business, presence: true
  validate :business_must_be_active
  validate :end_time_after_start_time
  validate :start_time_not_in_past, on: :create

  index({ business_id: 1 })
  index({ worker_id: 1 })
  index({ status: 1 })
  index({ start_time: 1 })
  index({ location: 1 })
  index({ rate: 1 })

  scope :available, -> { where(status: 'available') }
  scope :assigned, -> { where(status: 'assigned') }
  scope :in_progress, -> { where(status: 'in_progress') }
  scope :completed, -> { where(status: 'completed') }
  scope :cancelled, -> { where(status: 'cancelled') }
  scope :upcoming, -> { where(:start_time.gt => Time.current) }
  scope :past, -> { where(:end_time.lt => Time.current) }
  scope :for_business, ->(business_id) { where(business_id: business_id) }
  scope :for_worker, ->(worker_id) { where(worker_id: worker_id) }
  scope :by_rate, -> { order(rate: :desc) }
  scope :by_start_time, -> { order(start_time: :asc) }

  def duration_in_hours
    ((end_time - start_time) / 1.hour).round(2)
  end

  def calculate_earnings
    duration_in_hours * rate
  end

  def mark_as_assigned(worker)
    update(worker: worker, status: 'assigned')
  end

  def start_shift
    update(status: 'in_progress')
  end

  def complete_shift(rating = nil)
    update(
      status: 'completed',
      completed_at: Time.current,
      rating: rating
    )
  end

  def cancel_shift
    update(status: 'cancelled')
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
      errors.add(:end_time, 'must be after start time')
    end
  end

  def start_time_not_in_past
    return unless start_time
    if start_time < Time.current
      errors.add(:start_time, 'cannot be in the past')
    end
  end
end 