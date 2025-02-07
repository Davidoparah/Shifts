module BusinessService
  class Location
    include Mongoid::Document
    include Mongoid::Timestamps
    include Mongoid::Geospatial

    # Fields
    field :name, type: String
    field :address, type: String
    field :city, type: String
    field :state, type: String
    field :zip, type: String
    field :country, type: String, default: 'US'
    field :coordinates, type: Point, spatial: true
    field :status, type: String, default: 'active'
    field :location_type, type: String
    field :contact_name, type: String
    field :contact_phone, type: String
    field :contact_email, type: String
    field :notes, type: String
    field :operating_hours, type: Hash, default: {}
    field :amenities, type: Array, default: []
    field :parking_info, type: String
    field :access_instructions, type: String
    field :security_requirements, type: Array, default: []

    # Relationships
    belongs_to :business_profile
    has_many :shifts, dependent: :restrict

    # Validations
    validates :name, presence: true
    validates :address, presence: true
    validates :city, presence: true
    validates :state, presence: true
    validates :zip, presence: true
    validates :country, presence: true
    validates :location_type, presence: true
    validates :status, inclusion: { in: %w[active inactive] }
    validates :contact_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true

    # Indexes
    index({ business_profile_id: 1 })
    index({ coordinates: '2dsphere' })
    index({ status: 1 })
    index({ location_type: 1 })
    index({ city: 1, state: 1 })

    # Scopes
    scope :active, -> { where(status: 'active') }
    scope :by_business, ->(business_id) { where(business_profile_id: business_id) }
    scope :by_type, ->(type) { where(location_type: type) }

    # Callbacks
    before_validation :geocode_address, if: :address_changed?
    before_validation :set_default_operating_hours, if: :new_record?

    # Instance Methods
    def full_address
      [address, city, state, zip, country].compact.join(', ')
    end

    def nearby_locations(distance_in_miles = 5)
      return [] unless coordinates.present?
      
      Location.where(:id.ne => id)
             .geo_near(coordinates)
             .max_distance(distance_in_miles.to_f * 1609.34) # Convert miles to meters
             .spherical
    end

    def format_operating_hours
      operating_hours.transform_values do |hours|
        "#{hours['open']} - #{hours['close']}"
      end
    end

    def active?
      status == 'active'
    end

    def address_changed?
      changed_attributes.keys.any? { |attr| %w[address city state zip country].include?(attr) }
    end

    private

    def geocode_address
      return unless address_changed?
      
      begin
        result = Geocoder.search(full_address).first
        if result
          self.coordinates = [result.longitude, result.latitude]
        else
          errors.add(:address, 'could not be geocoded')
        end
      rescue => e
        Rails.logger.error "Geocoding error for address #{full_address}: #{e.message}"
        errors.add(:address, 'geocoding service unavailable')
      end
    end

    def set_default_operating_hours
      return if operating_hours.present?

      self.operating_hours = {
        'monday' => { 'open' => '09:00', 'close' => '17:00' },
        'tuesday' => { 'open' => '09:00', 'close' => '17:00' },
        'wednesday' => { 'open' => '09:00', 'close' => '17:00' },
        'thursday' => { 'open' => '09:00', 'close' => '17:00' },
        'friday' => { 'open' => '09:00', 'close' => '17:00' },
        'saturday' => { 'open' => 'closed', 'close' => 'closed' },
        'sunday' => { 'open' => 'closed', 'close' => 'closed' }
      }
    end
  end
end 