class IncidentReport < ApplicationRecord
  belongs_to :shift
  belongs_to :reporter, class_name: 'User'
  has_many_attached :photos

  validates :title, presence: true
  validates :description, presence: true
  validates :severity, presence: true, inclusion: { in: %w[low medium high critical] }
  validates :status, presence: true, inclusion: { in: %w[pending investigating resolved] }

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
end 