class User
  include Mongoid::Document
  include Mongoid::Timestamps
  include ActiveModel::SecurePassword

  # Fields
  field :email, type: String
  field :password_digest, type: String
  field :first_name, type: String
  field :last_name, type: String
  field :role, type: String
  field :phone, type: String
  field :address, type: String
  field :status, type: String, default: 'active'
  field :last_login_at, type: Time
  field :verification_token, type: String
  field :verification_sent_at, type: Time
  field :verified_at, type: Time
  field :reset_password_token, type: String
  field :reset_password_sent_at, type: Time

  # Relationships
  has_one :worker_profile, dependent: :destroy
  has_one :business, foreign_key: :owner_id, dependent: :destroy
  has_many :shifts, inverse_of: :worker
  has_many :chat_messages, inverse_of: :sender
  has_many :incident_reports, inverse_of: :reporter

  # Validations
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: :password_required?
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :role, presence: true, inclusion: { in: %w[admin business_owner worker] }
  validates :status, inclusion: { in: %w[active inactive suspended] }
  validate :business_owner_must_have_business

  # Indexes
  index({ email: 1 }, { unique: true })
  index({ role: 1 })
  index({ status: 1 })
  index({ verification_token: 1 }, { sparse: true })
  index({ reset_password_token: 1 }, { sparse: true })

  # Callbacks
  before_create :generate_verification_token
  before_save :downcase_email
  
  # Enable password encryption
  has_secure_password

  # Scopes
  scope :admins, -> { where(role: 'admin') }
  scope :business_owners, -> { where(role: 'business_owner') }
  scope :workers, -> { where(role: 'worker') }
  scope :active, -> { where(status: 'active') }
  scope :inactive, -> { where(status: 'inactive') }
  scope :suspended, -> { where(status: 'suspended') }

  # Methods
  def full_name
    "#{first_name} #{last_name}".strip
  end

  def admin?
    role == 'admin'
  end

  def business_owner?
    role == 'business_owner'
  end

  def worker?
    role == 'worker'
  end

  def active?
    status == 'active'
  end

  def record_login
    update(last_login_at: Time.current)
  end

  def verify!
    update(
      verified_at: Time.current,
      status: 'active',
      verification_token: nil
    )
  end

  def generate_password_reset_token!
    update(
      reset_password_token: SecureRandom.urlsafe_base64,
      reset_password_sent_at: Time.current
    )
  end

  def clear_password_reset_token
    update(
      reset_password_token: nil,
      reset_password_sent_at: nil
    )
  end

  def password_reset_expired?
    reset_password_sent_at.present? && reset_password_sent_at < 2.hours.ago
  end

  def create_worker_profile!(attributes = {})
    return unless worker?
    build_worker_profile(attributes)
    worker_profile.save!
    worker_profile
  end

  private

  def generate_verification_token
    self.verification_token = SecureRandom.urlsafe_base64
    self.verification_sent_at = Time.current
  end

  def business_owner_must_have_business
    if business_owner? && business.nil?
      errors.add(:business, "must be associated with a business owner")
    end
  end

  def password_required?
    password_digest.blank? || password.present?
  end

  def downcase_email
    self.email = email.downcase if email.present?
  end
end 