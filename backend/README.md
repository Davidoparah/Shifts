# Codehance Mobile App Backend

## Overview
A microservices-based backend system built with Ruby on Rails, providing APIs for the Codehance mobile application. The system is designed to handle shift management, user authentication, and business operations.

## Architecture
The backend is composed of several microservices:

- **Auth Service** (`auth-service/`)
  - User authentication and authorization
  - JWT token management
  - User registration and profile management

- **Shift Service** (`shift-service/`)
  - Shift creation and management
  - Shift application handling
  - Shift status updates and filtering
  - Worker-shift assignment

- **Worker Service** (`worker-service/`)
  - Worker profile management
  - Availability tracking
  - Skills and certifications
  - Earnings calculation

- **Business Service** (`business-service/`)
  - Business profile management
  - Location management
  - Business verification
  - Analytics and reporting

- **Notification Service** (`notification-service/`)
  - Real-time notifications
  - Email notifications
  - Push notifications

- **Incident Service** (`incident-service/`)
  - Incident reporting
  - Issue tracking
  - Resolution management

## Technology Stack
- Ruby 3.2.2
- Rails 7.1
- MongoDB (via Mongoid)
- Redis for caching and background jobs
- Sidekiq for background processing
- JWT for authentication
- RSpec for testing

## Setup and Installation
1. Install dependencies:
   ```bash
   bundle install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update necessary configurations

3. Start the services:
   ```bash
   foreman start
   ```

## Database Setup
- MongoDB setup:
  ```bash
  # Configure MongoDB connection in config/mongoid.yml
  rails db:create
  rails db:seed
  ```

## API Documentation
Each service exposes its own set of RESTful endpoints:

### Shift Service Endpoints
- `GET /api/v1/shifts` - List shifts with filtering
- `POST /api/v1/shifts` - Create new shift
- `GET /api/v1/shifts/:id` - Get shift details
- `PUT /api/v1/shifts/:id` - Update shift
- `POST /api/v1/shifts/:id/apply` - Apply for shift
- `POST /api/v1/shifts/:id/start` - Start shift
- `POST /api/v1/shifts/:id/complete` - Complete shift

### Recent Updates
- Enhanced shift filtering and search capabilities
- Improved worker profile management
- Added shift application handling
- Implemented shift status transitions
- Enhanced error handling and validation
- Added comprehensive logging

## Planned Features & Improvements

### Shift Application System
- [ ] **Enhanced Application Management**
  - Add detailed application tracking model
  - Implement application status workflow
  - Store worker qualifications with applications
  - Add application history endpoints

### Shift Assignment System
- [ ] **Advanced Assignment Features**
  - Implement shift reassignment endpoints
  - Add worker replacement logic
  - Create shift decline workflow
  - Track shift decline reasons
  - Handle worker notifications for assignment changes

### Data Models Enhancement
- [ ] **Extended Shift Information**
  - Enhance location data structure
  - Add detailed rate calculations
  - Implement shift requirements validation
  - Add shift feedback system

### API Improvements
- [ ] **Enhanced Endpoints**
  - Add detailed shift view endpoints
  - Implement batch operations for shifts
  - Add advanced filtering options
  - Create comprehensive reporting endpoints

### Real-time Features
- [ ] **WebSocket Integration**
  - Implement WebSocket server
  - Add real-time shift updates
  - Create notification system
  - Handle live status changes

### Security & Performance
- [ ] **System Enhancements**
  - Implement rate limiting
  - Add request caching
  - Enhance authentication system
  - Implement job queues for long operations

### Testing & Documentation
- [ ] **Quality Assurance**
  - Add integration tests for new features
  - Enhance API documentation
  - Add performance benchmarks
  - Implement automated testing pipeline

Note: Some features like basic shift management and worker authentication are already implemented but may be enhanced further.

## Testing
Run tests for all services:
```bash
rspec
```

## Deployment
The application is containerized using Docker:
```bash
docker-compose up --build
```

## Monitoring and Logging
- NewRelic for performance monitoring
- Sentry for error tracking
- Structured logging with lograge

## Security
- JWT-based authentication
- Role-based access control
- Request rate limiting
- CORS configuration
- Secure headers

## Contributing
1. Create a feature branch
2. Make changes
3. Write tests
4. Submit pull request
