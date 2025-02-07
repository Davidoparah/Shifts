# Authentication Service

This microservice handles user authentication, registration, and authorization for the ODC platform.

## Features

- User authentication (login/logout)
- JWT-based token management with refresh tokens
- User registration
- Password reset functionality
- Role-based access control
- Session management

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
- `JWT_SECRET_KEY`: Secret key for JWT token signing
- `JWT_REFRESH_SECRET_KEY`: Secret key for refresh token signing
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string (for Sidekiq)

3. Start the service:
```bash
rails server -p 3001
```

4. Start Sidekiq (for background jobs):
```bash
bundle exec sidekiq
```

## API Endpoints

### Authentication

#### Login
```
POST /api/v1/auth/login
```
Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
Response:
```json
{
  "token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "worker",
    "status": "active"
  }
}
```

#### Refresh Token
```
POST /api/v1/auth/refresh_token
```
Request body:
```json
{
  "refresh_token": "refresh_token_here"
}
```
Response:
```json
{
  "token": "new_jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "worker",
    "status": "active"
  }
}
```

#### Logout
```
DELETE /api/v1/auth/logout
```
Headers:
```
Authorization: Bearer jwt_token_here
```
Response: 204 No Content

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