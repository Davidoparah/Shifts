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
    
    begin
      # Start a session for the transaction
      Mongoid.client(:default).with_session do |session|
        session.start_transaction(
          write_concern: { w: 'majority' },
          read_concern: { level: :majority }
        )

        begin
          # Update application status
          self.with_session(session).update!(status: 'approved')
          
          # Assign worker to shift
          shift.with_session(session).assign_worker!(worker)
          
          # Reject other applications
          shift.applications
              .where(:id.ne => id)
              .with_session(session)
              .update_all(status: 'rejected')

          session.commit_transaction
          true
        rescue StandardError => e
          session.abort_transaction
          Rails.logger.error("Transaction error in approve!: #{e.message}")
          Rails.logger.error(e.backtrace.join("\n"))
          raise e
        end
      end
      true
    rescue StandardError => e
      Rails.logger.error("Error in approve!: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      false
    end
  end

  def reject!
    return false unless pending?
    
    begin
      Mongoid.client(:default).with_session do |session|
        session.start_transaction
        
        begin
          self.with_session(session).update!(status: 'rejected')
          session.commit_transaction
          true
        rescue StandardError => e
          session.abort_transaction
          Rails.logger.error("Transaction error in reject!: #{e.message}")
          raise e
        end
      end
      true
    rescue StandardError => e
      Rails.logger.error("Error in reject!: #{e.message}")
      false
    end
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