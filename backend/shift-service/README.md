# Shift Service

## Overview
The Shift Service is a core microservice in our on-demand workforce platform that handles the complete lifecycle of work shifts. It manages shift creation, worker assignments, shift tracking, and completion processes.

## Features
- Complete shift lifecycle management (create, assign, start, complete, cancel)
- Geospatial search for nearby shifts
- Real-time shift status tracking
- Worker assignment and check-in/out management
- Automated notifications for shift events
- Earnings calculation and tracking

## Technical Stack
- Ruby 3.2.2
- Rails (API Mode)
- MongoDB Atlas
- Redis for background jobs
- Sidekiq for job processing
- RSpec for testing

## Prerequisites
- Ruby 3.2.2
- MongoDB Atlas account
- Redis server
- Access to Auth, Worker, and Business services

## Environment Variables
```bash
# Application
RAILS_ENV=development
PORT=3004

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Redis
REDIS_URL=redis://localhost:6379/3

# Service Discovery
SERVICE_NAME=shift-service
SERVICE_HOST=localhost
SERVICE_PORT=3004

# Other Services
AUTH_SERVICE_URL=http://localhost:3001
WORKER_SERVICE_URL=http://localhost:3002
BUSINESS_SERVICE_URL=http://localhost:3003

# Monitoring
SENTRY_DSN=your_sentry_dsn
NEW_RELIC_LICENSE_KEY=your_new_relic_key
NEW_RELIC_APP_NAME=odc-shift-service
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
bundle install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Start the server:
```bash
rails server -p 3004
```

5. Start Sidekiq:
```bash
bundle exec sidekiq
```

## Database Indexes
The service uses MongoDB with the following indexes for optimization:
- Single field indexes:
  - status
  - business_profile_id
  - worker_profile_id
  - start_time
  - end_time
  - created_at
- Compound indexes:
  - status + start_time
  - business_profile_id + status
  - worker_profile_id + status
- Geospatial index:
  - location_coordinates (2dsphere)

## API Endpoints

### Shifts
- `GET /api/v1/shifts` - List shifts (filterable)
- `POST /api/v1/shifts` - Create a shift
- `GET /api/v1/shifts/:id` - Get shift details
- `PUT /api/v1/shifts/:id` - Update shift
- `DELETE /api/v1/shifts/:id` - Cancel shift

### Shift Actions
- `POST /api/v1/shifts/:id/apply` - Apply for a shift
- `POST /api/v1/shifts/:id/start` - Start a shift
- `POST /api/v1/shifts/:id/complete` - Complete a shift
- `POST /api/v1/shifts/:id/cancel` - Cancel a shift

### Business Routes
- `GET /api/v1/businesses/:business_id/shifts` - List business shifts
- `POST /api/v1/businesses/:business_id/shifts` - Create shift for business

### Worker Routes
- `GET /api/v1/workers/:worker_id/shifts` - List worker shifts
- `GET /api/v1/workers/:worker_id/shifts/history` - View completed shifts
- `GET /api/v1/workers/:worker_id/shifts/upcoming` - View upcoming shifts

## Testing
The service uses RSpec for testing. Run the test suite:
```bash
bundle exec rspec
```

### Test Coverage
SimpleCov is configured to generate coverage reports. View the report at `coverage/index.html` after running tests.

### Available Factories
- `shift` - Base shift factory
- `shift :assigned` - Assigned shift
- `shift :in_progress` - Ongoing shift
- `shift :completed` - Completed shift
- `shift :cancelled` - Cancelled shift
- `shift :past` - Past shift
- `shift :future` - Future shift

## Background Jobs
Sidekiq workers handle:
- Shift notifications
- Upcoming shift reminders
- Status change notifications
- Completion notifications

## Monitoring
- Sentry for error tracking
- New Relic for performance monitoring
- Health check endpoint at `/api/v1/health`

## Development
1. Follow Rails API best practices
2. Write tests for new features
3. Update documentation when adding endpoints
4. Use provided factories for testing
5. Follow the established error handling patterns

## Contributing
1. Create a feature branch
2. Write tests
3. Implement changes
4. Submit a pull request

## License
Proprietary - All rights reserved 