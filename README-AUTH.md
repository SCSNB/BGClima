# BGClima Authentication Setup

This document describes the authentication system implemented for the BGClima application.

## Overview

The authentication system uses:
- **Entity Framework Identity** for user management
- **JWT (JSON Web Tokens)** for authentication
- **Angular** frontend with authentication guards and interceptors

## Backend API Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout

### Request/Response Models

#### Login Request
```json
{
  "username": "string",
  "password": "string"
}
```

#### Login Response
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "roles": ["string"],
  "token": "string"
}
```

#### Register Request
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

## Configuration

### JWT Settings (appsettings.json)
```json
{
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-with-at-least-32-characters-for-jwt-signing",
    "Issuer": "BGClima",
    "Audience": "BGClimaUsers",
    "ExpirationHours": "24"
  }
}
```

### Database Connection
The system uses PostgreSQL with Entity Framework Identity tables.

## Default Users

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `ADMIN`
- **Email**: `admin@bgclima.com`

This user is automatically created when the application starts in development mode.

## Frontend Authentication

### Angular Components
- `LoginComponent` - Login form
- `AuthGuard` - Route protection
- `AuthService` - Authentication service
- `JwtInterceptor` - Adds JWT token to requests
- `ErrorInterceptor` - Handles authentication errors

### Protected Routes
- `/admin/*` - Requires ADMIN role
- All admin routes are protected by `AuthGuard`

### Usage

1. **Login**: Navigate to `/login` and enter credentials
2. **Access Admin**: After login, navigate to `/admin`
3. **Logout**: Use the logout button in the admin dashboard

## Testing

Use the provided HTTP test file (`BGClima.API.http`) to test the API endpoints:

1. Test login with admin credentials
2. Test registration with new user
3. Test protected endpoints with JWT token

## Security Features

- JWT token-based authentication
- Role-based authorization
- Secure cookie storage
- Automatic token refresh handling
- CSRF protection with SameSite cookies
- HTTPS enforcement in production

## Development Notes

- The system automatically creates Identity tables on first run
- Admin user is seeded in development mode
- JWT tokens expire after 24 hours by default
- All API calls include JWT token in Authorization header 