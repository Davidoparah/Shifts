module BusinessService
  class BusinessProfile
    include Mongoid::Document
    include Mongoid::Timestamps

    # Fields
    field :user_id, type: String
    field :business_name, type: String
    field :business_type, type: String
    field :registration_number, type: String
    field :tax_number, type: String
    field :contact_email, type: String
    field :contact_phone, type: String
    field :website, type: String
    field :description, type: String
    field :logo_url, type: String
    field :status, type: String, default: 'active'
    field :verification_status, type: String, default: 'pending'
    field :rating, type: Float, default: 0.0
    field :total_reviews, type: Integer, default: 0
    field :total_shifts_posted, type: Integer, default: 0
    field :total_shifts_completed, type: Integer, default: 0
    field :subscription_plan, type: String, default: 'basic'
    field :subscription_status, type: String, default: 'active'
    field :subscription_expires_at, type: Time

    # Relationships
    has_many :locations, dependent: :destroy
    has_many :shifts, class_name: 'BusinessService::Shift'

    # Validations
    validates :user_id, presence: true, uniqueness: true
    validates :business_name, presence: true
    validates :business_type, presence: true
    validates :contact_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
    validates :contact_phone, presence: true
    validates :status, inclusion: { in: %w[active inactive suspended] }
    validates :verification_status, inclusion: { in: %w[pending verified rejected] }
    validates :subscription_plan, inclusion: { in: %w[basic premium enterprise] }
    validates :subscription_status, inclusion: { in: %w[active expired suspended] }

    # Indexes
    index({ user_id: 1 }, { unique: true })
    index({ business_name: 1 })
    index({ status: 1 })
    index({ verification_status: 1 })
    index({ subscription_status: 1 })
    index({ rating: -1 })

    # Callbacks
    before_validation :normalize_fields
    after_create :set_default_subscription_expiry

    # Instance Methods
    def can_post_shifts?
      status == 'active' && 
      verification_status == 'verified' && 
      subscription_status == 'active' &&
      subscription_expires_at&.future?
    end

    def update_rating(new_rating)
      return if new_rating < 1 || new_rating > 5
      
      new_total = total_reviews * rating + new_rating
      increment(total_reviews: 1)
      update(rating: new_total / (total_reviews + 1))
    end

    def record_shift_completion
      inc(total_shifts_completed: 1)
    end

    def record_shift_posting
      inc(total_shifts_posted: 1)
    end

    def active_locations
      locations.where(status: 'active')
    end

    private

    def normalize_fields
      self.contact_email = contact_email.downcase if contact_email.present?
      self.business_name = business_name.strip if business_name.present?
      self.business_type = business_type.downcase if business_type.present?
    end

    def set_default_subscription_expiry
      return if subscription_expires_at.present?
      
      self.subscription_expires_at = case subscription_plan
        when 'basic'
          1.month.from_now
        when 'premium'
          1.year.from_now
        when 'enterprise'
          2.years.from_now
        end
      save
    end
  end
end 