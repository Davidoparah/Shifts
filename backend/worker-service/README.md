# Worker Service

This microservice handles worker profiles, availability management, and worker-related operations for the ODC platform.

## Features

- Worker profile management
- Availability scheduling
- Skills management
- Photo upload and management
- Worker statistics and earnings tracking
- Rating system

## Setup

1. Install dependencies:
```bash
bundle install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string (for Sidekiq)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

3. Start the service:
```bash
rails server -p 3002
```

4. Start Sidekiq (for background jobs):
```bash
bundle exec sidekiq
```

## API Endpoints

### Worker Profiles

#### List Worker Profiles
```
GET /api/v1/worker_profiles
```
Query parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20)
- `status`: Filter by status
- `min_rate`: Minimum hourly rate
- `max_rate`: Maximum hourly rate
- `min_rating`: Minimum rating
- `skill`: Filter by skill

#### Get Worker Profile
```
GET /api/v1/worker_profiles/:id
```

#### Create Worker Profile
```
POST /api/v1/worker_profiles
```
Request body:
```json
{
  "worker_profile": {
    "phone": "+1234567890",
    "address": "123 Main St",
    "bio": "Experienced security guard",
    "hourly_rate": 25.0,
    "skills": ["security", "first-aid"]
  }
}
```

#### Update Worker Profile
```
PATCH /api/v1/worker_profiles/:id
```

#### Update Availability
```
PUT /api/v1/worker_profiles/:id/availability
```
Request body:
```json
{
  "availability": {
    "monday": {
      "enabled": true,
      "start_time": "09:00",
      "end_time": "17:00"
    }
  }
}
```

#### Add Skill
```
POST /api/v1/worker_profiles/:id/skills
```
Request body:
```json
{
  "skill": "first-aid"
}
```

#### Upload Photo
```
POST /api/v1/worker_profiles/:id/photos
```
Form data:
- `photo`: Image file

#### Get Worker Stats
```
GET /api/v1/worker_profiles/:id/stats
```

## Error Handling

All errors follow this format:
```json
{
  "error": "Error message here",
  "status": "error_status_code"
}
```

Common error status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity
- 500: Internal Server Error

## Testing

Run the test suite:
```bash
bundle exec rspec
```

Run security checks:
```bash
bundle exec brakeman
bundle exec bundle-audit
```

## Contributing

1. Create a feature branch
2. Write tests
3. Implement changes
4. Submit a pull request

## License

Copyright (c) 2024 ODC. All rights reserved. 