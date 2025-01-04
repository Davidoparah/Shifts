class User
  include Mongoid::Document
  include Mongoid::Timestamps
  include Mongoid::Geospatial
  include ActiveModel::SecurePassword

  field :email, type: String
  field :password_digest, type: String
  field :name, type: String
  field :role, type: String
  field :status, type: String, default: 'active'
  field :business_name, type: String
  field :business_type, type: String
  field :business_address, type: String
  field :business_phone, type: String
  field :business_website, type: String
  field :business_description, type: String
  field :current_location, type: Hash
  field :last_location_update, type: Time
  field :reset_password_token, type: String
  field :reset_password_sent_at, type: Time
  field :last_login_at, type: Time

  has_secure_password

  # Relationships
  has_many :business_shifts, class_name: 'Shift', inverse_of: :business
  has_many :worker_shifts, class_name: 'Shift', inverse_of: :worker
  has_many :shift_applications, class_name: 'ShiftApplication', inverse_of: :worker

  # Validations
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true
  validates :role, presence: true, inclusion: { in: ['admin', 'business', 'worker'] }
  validates :status, inclusion: { in: ['active', 'inactive'] }
  validates :business_name, presence: true, if: :business?
  validates :business_type, presence: true, if: :business?
  validates :business_address, presence: true, if: :business?
  validates :business_phone, presence: true, if: :business?

  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :inactive, -> { where(status: 'inactive') }
  scope :admins, -> { where(role: 'admin') }
  scope :businesses, -> { where(role: 'business') }
  scope :workers, -> { where(role: 'worker') }

  spatial_scope :current_location

  def admin?
    role == 'admin'
  end

  def business?
    role == 'business'
  end

  def worker?
    role == 'worker'
  end

  def active?
    status == 'active'
  end

  def inactive?
    status == 'inactive'
  end

  def toggle_status!
    update(status: active? ? 'inactive' : 'active')
  end

  def update_location(latitude, longitude)
    update(
      current_location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      last_location_update: Time.current
    )
  end

  def generate_reset_password_token!
    update(
      reset_password_token: SecureRandom.urlsafe_base64,
      reset_password_sent_at: Time.current
    )
  end

  def reset_password_token_valid?
    reset_password_sent_at.present? && 
    reset_password_sent_at > 2.hours.ago
  end

  def clear_reset_password_token!
    update(
      reset_password_token: nil,
      reset_password_sent_at: nil
    )
  end

  def record_login
    update(last_login_at: Time.current)
  end

  def as_json(options = {})
    super(
      options.merge(
        except: [:password_digest, :reset_password_token, :reset_password_sent_at],
        methods: [:distance]
      )
    )
  end
end 