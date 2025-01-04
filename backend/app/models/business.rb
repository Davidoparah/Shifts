class Business
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :email, type: String
  field :status, type: String, default: 'active'
  field :description, type: String
  field :address, type: String
  field :phone, type: String

  # Relationships
  has_many :users

  # Validations
  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :status, inclusion: { in: %w[active inactive suspended] }

  # Callbacks
  before_validation :normalize_fields

  private

  def normalize_fields
    self.email = email.downcase.strip if email.present?
    self.name = name.strip if name.present?
  end
end 