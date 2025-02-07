# Shift Allocation Mobile Application

A mobile application for managing and allocating work shifts on an ad-hoc basis, initially focused on security shifts. Built with Ionic Capacitor (frontend), Ruby on Rails (backend), and MongoDB.

## Platforms

### Super Admin Platform
- Manage and overview all registered users and companies
- Monitor system-wide analytics and usage
- Handle user/company verification and approvals

### Business Owner Platform  
- Post and manage available shifts
- Set shift requirements (dress code, location, hourly rates)
- Review and approve worker applications
- Manage worker schedules and timesheets
- Access business-specific analytics

### Worker Platform
- View and apply for available shifts 
- GPS-enabled shift location viewing
- Access shift details (dress code, hourly rates, requirements)
- Upload incident reports and photos
- Chat with other workers
- Track earnings and schedule

## Technical Stack

- Frontend: Ionic Capacitor
- Backend: Ruby on Rails API
- Database: MongoDB
- Authentication: JWT tokens
- Real-time Features: WebSockets
- Maps Integration: Google Maps API

## Setup Requirements

### Frontend Setup
1. Node.js 16+
2. Ionic CLI
3. Capacitor
4. Android Studio / Xcode for mobile builds

### Backend Setup
1. Ruby 3.3.6
2. Rails 8.0.1
3. MongoDB
4. Redis (for background jobs)

## Implementation Phases

### Phase 1: Database Migration & Configuration
- MongoDB Atlas Setup and Configuration
- Model Migration from ApplicationRecord to Mongoid
- Database Optimization and Indexing

### Phase 2: Authentication & User Management
- User System Enhancement
- Business Profile Improvements
- Role-based Access Control

### Phase 3: Core Features Integration
- Shift Management Consolidation
- Worker System Enhancement
- Incident Reporting System

### Phase 4: Communication & Real-time Features
- Chat System Implementation
- Notification System Development

### Phase 5: Admin & Analytics
- Admin Panel Development
- Analytics & Reporting System

### Environment Variables
Create a `.env` file with:

```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Current Implementation Status
- Phase 1: In Progress
- Phase 2-5: Pending# Shiftapp
# Shifts
