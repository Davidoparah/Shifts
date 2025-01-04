class Location
  include Mongoid::Document
  include Mongoid::Timestamps

  # Fields
  field :name, type: String
  field :address, type: String
  field :city, type: String
  field :state, type: String
  field :zip, type: String
  field :status, type: String, default: 'active'
  
  # Geolocation fields
  field :coordinates, type: Array  # [longitude, latitude]
  field :country, type: String
  field :formatted_address, type: String
  field :place_id, type: String
  field :location_type, type: String, default: 'business'
  field :timezone, type: String
  field :radius, type: Float, default: 0.5  # Service radius in kilometers

  # Relationships
  belongs_to :business
  has_many :shifts, dependent: :destroy

  # Validations
  validates :name, presence: true
  validates :address, presence: true
  validates :status, inclusion: { in: ['active', 'inactive'] }
  validates :location_type, inclusion: { in: ['business', 'warehouse', 'office', 'other'] }
  validates :coordinates, presence: true, if: :active?
  validate :coordinates_format, if: :coordinates_present?

  # Indexes
  index({ business_id: 1 })
  index({ status: 1 })
  index({ coordinates: '2dsphere' })
  index({ place_id: 1 }, { unique: true, sparse: true })

  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :by_business, ->(business_id) { where(business_id: business_id) }
  scope :near_coordinates, ->(coords, max_distance = 10) {
    where(:coordinates.near => {
      '$geometry' => {
        'type' => 'Point',
        'coordinates' => coords
      },
      '$maxDistance' => max_distance * 1000 # Convert km to meters
    })
  }

  # Instance methods
  def coordinates=(coords)
    if coords.is_a?(String)
      coords = coords.split(',').map(&:to_f)
    end
    self[:coordinates] = coords
  end

  def latitude
    coordinates&.last
  end

  def longitude
    coordinates&.first
  end

  def active?
    status == 'active'
  end

  def as_json(options = {})
    super(options.merge(
      methods: [:latitude, :longitude],
      except: [:coordinates]
    ))
  end

  private

  def coordinates_present?
    coordinates.present?
  end

  def coordinates_format
    return unless coordinates.present?
    
    unless coordinates.is_a?(Array) && coordinates.length == 2 &&
           coordinates.all? { |coord| coord.is_a?(Numeric) } &&
           coordinates[0].between?(-180, 180) && coordinates[1].between?(-90, 90)
      errors.add(:coordinates, 'must be valid [longitude, latitude] coordinates')
    end
  end
end 