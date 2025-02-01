class IncidentReport
  include Mongoid::Document
  include Mongoid::Timestamps

  field :title, type: String
  field :description, type: String
  field :severity, type: String
  field :status, type: String, default: 'pending'
  field :photo_urls, type: Array, default: []

  belongs_to :shift
  belongs_to :reporter, class_name: 'User'

  validates :title, presence: true
  validates :description, presence: true
  validates :severity, presence: true, inclusion: { in: %w[low medium high critical] }
  validates :status, presence: true, inclusion: { in: %w[pending investigating resolved] }

  index({ shift_id: 1 })
  index({ reporter_id: 1 })
  index({ status: 1 })
  index({ severity: 1 })
  index({ created_at: -1 })

  scope :pending, -> { where(status: 'pending') }
  scope :investigating, -> { where(status: 'investigating') }
  scope :resolved, -> { where(status: 'resolved') }
  scope :by_severity, ->(severity) { where(severity: severity) }
  scope :for_shift, ->(shift_id) { where(shift_id: shift_id) }
  scope :ordered, -> { order(created_at: :desc) }

  def mark_as_investigating
    update(status: 'investigating')
  end

  def resolve
    update(status: 'resolved')
  end

  def add_photo(url)
    push(photo_urls: url)
  end

  def remove_photo(url)
    pull(photo_urls: url)
  end
end 