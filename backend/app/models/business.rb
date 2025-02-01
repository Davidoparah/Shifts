class Business
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :business_type, type: String
  field :email, type: String
  field :phone, type: String
  field :address, type: String
  field :website, type: String
  field :description, type: String
  field :status, type: String, default: 'active'
  field :rating, type: Float, default: 0.0
  field :total_shifts, type: Integer, default: 0

  # Relationships
  belongs_to :owner, class_name: 'User'
  has_many :shifts
  has_many :incident_reports
  has_many :chat_messages

  # Validations
  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true
  validates :address, presence: true
  validates :status, inclusion: { in: %w[active inactive suspended] }

  # Indexes
  index({ owner_id: 1 })
  index({ name: 1 })
  index({ business_type: 1 })
  index({ status: 1 })
  index({ rating: -1 })

  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :inactive, -> { where(status: 'inactive') }
  scope :suspended, -> { where(status: 'suspended') }
  scope :by_rating, -> { order(rating: :desc) }
  scope :by_total_shifts, -> { order(total_shifts: :desc) }

  # Callbacks
  before_validation :normalize_fields

  def update_rating!
    completed_shifts = shifts.completed
    if completed_shifts.any?
      update(
        rating: completed_shifts.average(:rating).to_f,
        total_shifts: completed_shifts.count
      )
    end
  end

  private

  def normalize_fields
    self.email = email.downcase.strip if email.present?
    self.name = name.strip if name.present?
    self.website = website.strip if website.present?
  end
end 