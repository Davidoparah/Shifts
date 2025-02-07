module AuthService
  class User
    include Mongoid::Document
    include Mongoid::Timestamps
    include ActiveModel::SecurePassword

    # Fields
    field :email, type: String
    field :first_name, type: String
    field :last_name, type: String
    field :password_digest, type: String
    field :role, type: String
    field :status, type: String, default: 'inactive'
    field :last_login_at, type: Time
    field :reset_password_token, type: String
    field :reset_password_sent_at, type: Time
    field :verification_token, type: String
    field :verified_at, type: Time

    # Validations
    validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
    validates :first_name, :last_name, presence: true
    validates :role, presence: true, inclusion: { in: %w[admin worker business_owner] }
    validates :status, inclusion: { in: %w[active inactive suspended] }

    # Callbacks
    before_validation :downcase_email
    before_create :generate_verification_token

    # Secure Password
    has_secure_password

    # Instance Methods
    def active?
      status == 'active'
    end

    def name
      "#{first_name} #{last_name}".strip
    end

    def record_login
      update(last_login_at: Time.current)
    end

    def generate_password_reset_token
      update(
        reset_password_token: SecureRandom.urlsafe_base64,
        reset_password_sent_at: Time.current
      )
    end

    def password_reset_expired?
      reset_password_sent_at.nil? || reset_password_sent_at < 6.hours.ago
    end

    def clear_password_reset_token
      update(reset_password_token: nil, reset_password_sent_at: nil)
    end

    private

    def downcase_email
      self.email = email.to_s.downcase
    end

    def generate_verification_token
      self.verification_token = SecureRandom.urlsafe_base64
    end
  end
end 