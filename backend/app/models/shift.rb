class Shift < ApplicationRecord
  belongs_to :business
  belongs_to :worker, optional: true
  has_many :chat_messages
  has_many :incident_reports

  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :rate, presence: true, numericality: { greater_than: 0 }
  validates :location, presence: true
  validates :status, presence: true, inclusion: { in: %w[available assigned in_progress completed cancelled] }

  # Store coordinates as JSON
  serialize :coordinates, JSON

  # Required skills stored as array
  serialize :required_skills, Array

  # Scopes for filtering shifts
  scope :available, -> { where(status: 'available') }
  scope :upcoming, -> { where(status: 'assigned').where('start_time > ?', Time.current) }
  scope :in_progress, -> { where(status: 'in_progress') }
  scope :completed, -> { where(status: 'completed') }
  scope :for_worker, ->(worker_id) { where(worker_id: worker_id) }

  # Methods for shift management
  def can_start?
    assigned? && Time.current >= (start_time - 15.minutes)
  end

  def assign_to(worker)
    update(worker: worker, status: 'assigned')
  end

  def start
    update(status: 'in_progress')
  end

  def complete
    update(status: 'completed')
  end

  def cancel
    update(status: 'cancelled')
  end

  def calculate_earnings
    return 0 unless completed?
    duration_in_hours = (end_time - start_time) / 1.hour
    (duration_in_hours * rate).round(2)
  end

  private

  def assigned?
    status == 'assigned'
  end

  def completed?
    status == 'completed'
  end
end 