# Location-Based Service Search API

A RESTful API for searching location-based services with user authentication and favorites management.

## Technology Stack

- **Backend**: Express.js + TypeScript
- **Database**: MySQL with TypeORM
- **Authentication**: JWT tokens
- **Documentation**: Swagger UI
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, bcrypt

## Code Structure

```
src/
├── config/          # Database and app configuration
├── controllers/     # Request handlers
├── entities/        # TypeORM database entities
├── middleware/      # Auth, validation, error handling
├── routes/          # API route definitions
├── services/        # Business logic layer
└── database/        # Migrations and seeding
```

## Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env` file:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<your_password> # Replace with your database password
DB_NAME=location_search_db
JWT_SECRET=<your-secret-key> # Replace with your secret key
```

### 3. Database Setup
```bash
# Run migrations
npm run migration:run

# Seed sample data (generates services around Hanoi, Vietnam)
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

API runs at: `http://localhost:3000/api/v1`
Documentation: `http://localhost:3000/api-docs`

## Default Test Location

**Hanoi, Vietnam** is used as the default anchor point for seed data:
- **Latitude**: `21.0285`
- **Longitude**: `105.8542`
- **Radius**: Services generated within 10km of Hanoi center

This ensures predictable search results when testing location-based features.

## API Overview

### Implemented Features
- **User Authentication** - Register, login, profile management
- **Location-Based Search** - Find services by coordinates and radius
- **Service Management** - Browse service types and details
- **Favorites System** - Save and manage favorite services
- **Address Search** - Search services by address components
- **Multi-Country Support** - Handle different address formats

### Sample Requests (Happy Path)

#### 1. Register New User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 2. Login User (or use root account)
```bash
# Login with root account
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "root@admin.com",
    "password": "root123"
  }'

# Login with another account (check user list from seed data)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 3. Search Services by Location (requires authentication)
```bash
# First, get a JWT token by registering or logging in
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')

# Search around Hanoi center (where seed data is generated)
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/services/search?latitude=21.0285&longitude=105.8542&radius=5&limit=10"

```

#### 4. Get Service Types
```bash
curl http://localhost:3000/api/v1/services/types
```

#### 5. Add Service to Favorites (requires auth)
```bash
curl -X POST http://localhost:3000/api/v1/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"service_id": 1}'
```

#### 6. Get User Favorites (requires auth)
```bash
curl http://localhost:3000/api/v1/favorites \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### API Testing with Swagger

1. Start server: `npm run dev`
2. Open: `http://localhost:3000/api-docs`
3. Register a user via `/auth/register`
4. Copy JWT token from response
5. Click "Authorize" and enter `Bearer <token>`
6. Test protected endpoints