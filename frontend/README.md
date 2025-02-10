# Codehance Mobile App Frontend

## Overview
A mobile application built with Ionic/Angular for managing shifts between workers and businesses. The app provides functionality for workers to find and apply for shifts, and for businesses to post and manage shifts.

## Technology Stack
- Ionic Framework
- Angular 16+
- TypeScript
- SCSS
- Capacitor for native functionality

## Features
- **Authentication**
  - Login/Register with email
  - Role-based access (Worker, Business Owner, Admin)
  - JWT token-based authentication

- **Worker Features**
  - View available shifts
  - Apply for shifts
  - Manage assigned shifts (start, complete)
  - View shift history
  - Track earnings
  - Report incidents
  - Real-time chat

- **Business Owner Features**
  - Post new shifts
  - Manage posted shifts
  - View worker applications
  - Track shift completion
  - Business analytics

## Project Structure
```
src/
├── app/
│   ├── core/           # Core functionality (services, guards, interceptors)
│   ├── models/         # TypeScript interfaces and types
│   ├── pages/          # Feature modules and components
│   │   ├── auth/       # Authentication pages
│   │   ├── worker/     # Worker-specific pages
│   │   └── business/   # Business-specific pages
│   └── services/       # API services
├── assets/            # Static assets
└── environments/      # Environment configurations
```

## Setup and Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `src/environments/environment.example.ts` to `environment.ts`
   - Update API endpoints and other configurations

3. Run development server:
   ```bash
   ionic serve
   ```

4. Build for production:
   ```bash
   ionic build --prod
   ```

## Mobile Development
- iOS Setup:
  ```bash
  ionic capacitor add ios
  ionic capacitor build ios
  ```

- Android Setup:
  ```bash
  ionic capacitor add android
  ionic capacitor build android
  ```

## Testing
- Run unit tests:
  ```bash
  ng test
  ```

- Run e2e tests:
  ```bash
  ng e2e
  ```

## API Integration
The frontend communicates with multiple microservices:
- Auth Service: User authentication and management
- Shift Service: Shift creation and management
- Worker Service: Worker profile and availability
- Business Service: Business profile and management
- Notification Service: Real-time notifications
- Chat Service: Real-time messaging

## Recent Updates
- Added shift filtering functionality for worker shifts
- Implemented real-time shift status updates
- Enhanced shift application process
- Added shift completion workflow
- Improved error handling and loading states
- Updated shift listing and filtering logic

## Planned Features & Improvements

### Shift Application Management
- [ ] **Enhanced Application Tracking**
  - Add detailed application status tracking
  - Display application history
  - Show worker qualifications alongside applications

### Shift Details Enhancement
- [ ] **Improved Shift Information Display**
  - Create dedicated shift details page
  - Add comprehensive shift information view before application
  - Enhance location and rate display formatting

### Shift Management Improvements
- [ ] **Advanced Shift Assignment Features**
  - Implement shift reassignment functionality
  - Add worker replacement workflow
  - Include shift decline option for accepted shifts
  - Add reason tracking for declined shifts

### UI/UX Improvements
- [ ] **Enhanced User Experience**
  - Improve shift details visibility
  - Add confirmation dialogs for important actions
  - Enhance error message displays
  - Implement loading states for all actions

### Data Management
- [ ] **Real-time Updates**
  - Implement WebSocket connections for real-time shift updates
  - Add notification system for shift changes
  - Enhance data refresh mechanisms

### Testing & Quality
- [ ] **Comprehensive Testing**
  - Add E2E tests for shift workflows
  - Implement unit tests for new features
  - Add integration tests for API interactions

Note: Some features like pull-to-refresh and logout functionality are already implemented but may be enhanced further. 