class Document
  include Mongoid::Document
  include Mongoid::Timestamps

  field :type, type: String
  field :file_url, type: String
  field :expiry_date, type: Date
  field :status, type: String, default: 'pending'

  belongs_to :worker_profile

  validates :type, presence: true
  validates :file_url, presence: true, on: :update
  validates :status, inclusion: { in: ['pending', 'uploaded', 'expired'] }

  index({ worker_profile_id: 1 })
  index({ type: 1 })
  index({ status: 1 })
  index({ expiry_date: 1 })

  before_save :check_expiry_status

  private

  def check_expiry_status
    if expiry_date.present? && expiry_date < Date.current
      self.status = 'expired'
    end
  end
end 