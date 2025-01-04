class ShiftApplication
  include Mongoid::Document
  include Mongoid::Timestamps

  field :status, type: String, default: 'pending'
  field :notes, type: String

  # Relationships
  belongs_to :shift
  belongs_to :worker, class_name: 'User'

  # Validations
  validates :status, inclusion: { in: ['pending', 'approved', 'rejected'] }
  validates :worker, presence: true
  validates :shift, presence: true
  validate :worker_can_apply
  validate :shift_is_open
  validate :no_duplicate_applications

  # Scopes
  scope :pending, -> { where(status: 'pending') }
  scope :approved, -> { where(status: 'approved') }
  scope :rejected, -> { where(status: 'rejected') }

  # Instance methods
  def approve!
    return false unless pending?
    
    ShiftApplication.transaction do
      update!(status: 'approved')
      shift.assign_worker!(worker)
      shift.applications.where.not(id: id).update_all(status: 'rejected')
    end
    true
  rescue StandardError => e
    Rails.logger.error("Error approving application: #{e.message}")
    false
  end

  def reject!
    return false unless pending?
    update(status: 'rejected')
  end

  def pending?
    status == 'pending'
  end

  def approved?
    status == 'approved'
  end

  def rejected?
    status == 'rejected'
  end

  private

  def worker_can_apply
    return unless worker
    errors.add(:worker, 'must be a worker') unless worker.worker?
  end

  def shift_is_open
    return unless shift
    errors.add(:shift, 'must be open') unless shift.open?
  end

  def no_duplicate_applications
    return unless worker && shift
    if ShiftApplication.where(worker: worker, shift: shift).where.not(id: id).exists?
      errors.add(:base, 'You have already applied for this shift')
    end
  end
end 