module ShiftService
  class Shift
    include Mongoid::Document
    include Mongoid::Timestamps
    include Mongoid::Geospatial

    # Fields
    field :title, type: String
    field :description, type: String
    field :start_time, type: Time
    field :end_time, type: Time
    field :hourly_rate, type: Float
    field :status, type: String, default: 'open'
    field :requirements, type: Array, default: []
    field :dress_code, type: String
    field :break_time, type: Integer # in minutes
    field :notes, type: String
    field :location_coordinates, type: Point, spatial: true
    
    # Business fields
    field :business_profile_id, type: String
    field :business_name, type: String
    field :location_id, type: String
    field :location_name, type: String
    field :location_address, type: String

    # Worker fields
    field :worker_profile_id, type: String
    field :worker_name, type: String
    field :check_in_time, type: Time
    field :check_out_time, type: Time
    field :actual_hours_worked, type: Float
    field :total_earnings, type: Float

    # Indexes
    index({ status: 1 })
    index({ business_profile_id: 1 })
    index({ worker_profile_id: 1 })
    index({ start_time: 1 })
    index({ end_time: 1 })
    index({ location_coordinates: '2dsphere' })
    index({ created_at: -1 })

    # Compound indexes for common queries
    index({ status: 1, start_time: 1 })
    index({ business_profile_id: 1, status: 1 })
    index({ worker_profile_id: 1, status: 1 })

    # Validations
    validates :title, presence: true
    validates :start_time, presence: true
    validates :end_time, presence: true
    validates :hourly_rate, presence: true, numericality: { greater_than: 0 }
    validates :business_profile_id, presence: true
    validates :business_name, presence: true
    validates :location_id, presence: true
    validates :location_name, presence: true
    validates :location_address, presence: true
    validates :status, inclusion: { in: %w[open assigned in_progress completed cancelled] }

    # Scopes
    scope :active, -> { where(:status.in => %w[open assigned in_progress]) }
    scope :open, -> { where(status: 'open') }
    scope :assigned, -> { where(status: 'assigned') }
    scope :in_progress, -> { where(status: 'in_progress') }
    scope :completed, -> { where(status: 'completed') }
    scope :cancelled, -> { where(status: 'cancelled') }
    scope :by_business, ->(business_id) { where(business_profile_id: business_id) }
    scope :by_worker, ->(worker_id) { where(worker_profile_id: worker_id) }
    scope :upcoming, -> { where(:start_time.gt => Time.current) }
    scope :past, -> { where(:end_time.lt => Time.current) }
    scope :for_date_range, ->(start_date, end_date) {
      where(:start_time.gte => start_date, :end_time.lte => end_date)
    }

    # Instance Methods
    def duration_hours
      return 0 unless start_time && end_time
      ((end_time - start_time) / 1.hour).round(2)
    end

    def calculate_earnings
      return 0 unless actual_hours_worked
      (actual_hours_worked * hourly_rate).round(2)
    end

    def can_apply?
      status == 'open' && start_time > Time.current
    end

    def can_start?
      status == 'assigned' && Time.current.between?(start_time - 15.minutes, end_time)
    end

    def can_complete?
      status == 'in_progress' && Time.current >= end_time
    end

    def assign_worker(worker_id, worker_name)
      update(
        status: 'assigned',
        worker_profile_id: worker_id,
        worker_name: worker_name
      )
    end

    def start_shift
      return false unless can_start?
      update(
        status: 'in_progress',
        check_in_time: Time.current
      )
    end

    def complete_shift
      return false unless can_complete?
      check_out = Time.current
      hours = ((check_out - check_in_time) / 1.hour).round(2)
      earnings = (hours * hourly_rate).round(2)
      
      update(
        status: 'completed',
        check_out_time: check_out,
        actual_hours_worked: hours,
        total_earnings: earnings
      )
    end

    def cancel_shift(reason = nil)
      return false if %w[completed cancelled].include?(status)
      update(
        status: 'cancelled',
        notes: [notes, "Cancelled: #{reason}"].compact.join("\n")
      )
    end

    private

    def ensure_valid_times
      if start_time && end_time && start_time >= end_time
        errors.add(:end_time, "must be after start time")
      end
    end
  end
end 