# Business Service

The Business Service is a core microservice in our on-demand workforce platform that manages business profiles and their locations. It provides APIs for creating and managing business accounts, locations, and related business operations.

## Features

- Business Profile Management
- Location Management
- Subscription Handling
- Business Verification
- Geolocation Services
- Operating Hours Management

## Tech Stack

- Ruby 3.2.2
- Rails (API Mode)
- MongoDB with Mongoid
- Redis for Caching
- JWT Authentication
- Geocoding Services

## Prerequisites

- Ruby 3.2.2
- MongoDB 4.4+
- Redis 6+
- Google Maps API Key (for geocoding)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bundle install
   ```
3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration
5. Start the server:
   ```bash
   rails server -p 3003
   ```

## Environment Variables

```
RAILS_ENV=development
PORT=3003
MONGODB_URI=mongodb://localhost:27017/odc_business_development
REDIS_URL=redis://localhost:6379/2
SERVICE_NAME=business-service
SERVICE_HOST=localhost
SERVICE_PORT=3003
AUTH_SERVICE_URL=http://localhost:3001
WORKER_SERVICE_URL=http://localhost:3002
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
SENTRY_DSN=your_sentry_dsn_here
NEW_RELIC_LICENSE_KEY=your_new_relic_license_key_here
NEW_RELIC_APP_NAME=odc-business-service
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:8100
LOG_LEVEL=debug
```

## API Endpoints

### Business Profiles

#### GET /api/v1/business_profiles
- List all business profiles
- Supports pagination and filtering
- Query Parameters:
  - page
  - per_page
  - status
  - verification_status
  - subscription_plan
  - min_rating

#### POST /api/v1/business_profiles
- Create a new business profile
- Required fields:
  - business_name
  - business_type
  - contact_email
  - contact_phone

#### GET /api/v1/business_profiles/:id
- Get a specific business profile

#### PUT /api/v1/business_profiles/:id
- Update a business profile

#### DELETE /api/v1/business_profiles/:id
- Deactivate a business profile

#### PUT /api/v1/business_profiles/:id/verify
- Update verification status (Admin only)

#### PUT /api/v1/business_profiles/:id/update_subscription
- Update subscription details (Admin only)

#### GET /api/v1/business_profiles/:id/statistics
- Get business statistics

### Locations

#### GET /api/v1/business_profiles/:business_profile_id/locations
- List all locations for a business
- Supports pagination and filtering
- Query Parameters:
  - page
  - per_page
  - status
  - location_type
  - lat/lng (for proximity search)
  - distance

#### POST /api/v1/business_profiles/:business_profile_id/locations
- Create a new location
- Required fields:
  - name
  - address
  - city
  - state
  - zip
  - location_type

#### GET /api/v1/business_profiles/:business_profile_id/locations/:id
- Get a specific location

#### PUT /api/v1/business_profiles/:business_profile_id/locations/:id
- Update a location

#### DELETE /api/v1/business_profiles/:business_profile_id/locations/:id
- Deactivate a location

#### GET /api/v1/business_profiles/:business_profile_id/locations/:id/nearby
- Get nearby locations within specified distance

#### PUT /api/v1/business_profiles/:business_profile_id/locations/:id/update_operating_hours
- Update location operating hours

## Models

### BusinessProfile
- Core business information
- Subscription management
- Verification status
- Rating system
- Shift tracking

### Location
- Physical location management
- Geocoding support
- Operating hours
- Amenities and access information

## Authentication

The service uses JWT authentication. All requests must include a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

The service uses standard HTTP status codes and returns error messages in the following format:

```json
{
  "error": "Error message",
  "status": "status_code",
  "timestamp": "2024-03-21T10:00:00Z"
}
```

## Development

### Running Tests
```bash
bundle exec rspec
```

### Code Style
```bash
bundle exec rubocop
```

### Database Management
```bash
# Create indexes
rails db:mongoid:create_indexes

# Remove indexes
rails db:mongoid:remove_indexes
```

## Monitoring

The service integrates with:
- New Relic for performance monitoring
- Sentry for error tracking
- Custom logging for debugging

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

This project is proprietary and confidential. 