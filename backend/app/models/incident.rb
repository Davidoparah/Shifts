class Incident
  include Mongoid::Document
  include Mongoid::Timestamps

  field :title, type: String
  field :description, type: String
  field :location, type: String
  field :severity, type: String
  field :status, type: String, default: 'pending'
  field :photos, type: Array, default: []
  
  belongs_to :worker_profile

  validates :title, presence: true
  validates :description, presence: true
  validates :location, presence: true
  validates :severity, presence: true, inclusion: { in: %w[low medium high] }
  validates :status, presence: true, inclusion: { in: %w[pending reviewing resolved] }

  index({ worker_profile_id: 1 })
  index({ status: 1 })
  index({ created_at: -1 })

  scope :by_worker, ->(worker_profile_id) { where(worker_profile_id: worker_profile_id) }
  scope :by_status, ->(status) { where(status: status) }
  scope :recent, -> { order(created_at: :desc) }
end 