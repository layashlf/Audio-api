# MusicGPT Backend API

A NestJS backend for the MusicGPT AI music creation platform. Users can submit text prompts that get processed into audio files through background jobs. The system includes user authentication, subscription management, rate limiting, and unified search.

## Features

- JWT authentication with refresh tokens
- User registration and login
- Subscription tiers (FREE/PAID) with rate limiting
- CRUD operations for users and audio files
- Unified search across users and audio content
- Background job processing with BullMQ
- Redis caching with TTL
- Email notifications
- Docker containerization

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis with BullMQ
- **Search**: MeiliSearch
- **Authentication**: JWT with bcrypt hashing
- **Email**: Nodemailer with BullMQ queues
- **Testing**: Jest with Supertest
- **Containerization**: Docker and Docker Compose

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- npm or yarn

## Getting Started

### Environment Setup

1. Clone the repository and navigate to the project:

```bash
git clone <repository-url>
cd musicgpt
```

2. Copy the environment file:

```bash
cp html/.env.example html/.env
```

3. The default environment variables in `.env.example` are configured for Docker development.

### Environment Variables

Key environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5433/musicgpt"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="30d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# MeiliSearch
MEILI_HOST="http://localhost:7700"
MEILI_MASTER_KEY="masterKey"

# Email (optional)
SMTP_HOST="localhost"
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASS=""

# Application
NODE_ENV="development"
PORT=3000
API_PREFIX="/v1"
```

### Running with Docker

Start all services:

```bash
./start.sh
```

This starts:

- NestJS API server (port 3000)
- PostgreSQL database (port 5433)
- Redis cache (port 6379)
- MeiliSearch (port 7700)
- Mailpit for email testing (ports 1025, 8025)

Access the application at http://localhost:3000

### Local Development

1. Install dependencies:

```bash
cd html
npm install
```

2. Set up the database:

```bash
npx prisma migrate dev
npx prisma generate
```

3. Start the development server:

```bash
npm run start:dev
```

## Project Structure

```
html/src/
├── authentication/          # User auth, registration, login
│   ├── application/         # Use cases for auth operations
│   ├── domain/             # User entities, value objects
│   ├── infrastructure/     # Prisma repositories, token service
│   ├── dto/                # Request/response DTOs
│   └── guard/              # JWT guards
├── user/                   # User management
├── audio/                  # Audio file management
├── subscription/           # Subscription tiers and rate limiting
├── search/                 # Unified search with MeiliSearch
├── prisma/                 # Database configuration
├── config/                 # Environment validation
├── decorators/             # Custom decorators
├── interceptors/           # Response transformation
├── utils/                  # Email service, helpers
└── templates/              # Email templates
```

## Architecture

The application follows clean architecture principles:

- **Domain Layer**: Business entities and rules
- **Application Layer**: Use cases that orchestrate business operations
- **Infrastructure Layer**: External concerns (database, external APIs)
- **Presentation Layer**: Controllers and DTOs

Key architectural decisions:

- Repository pattern for data access
- Use cases for business logic encapsulation
- Dependency injection throughout
- JWT tokens stored as httpOnly cookies
- Refresh tokens hashed in database
- Rate limiting enforced at middleware level
- Background jobs processed with BullMQ

## Authentication Flow

The application uses JWT access + refresh token authentication:

1. User registers/logs in → receives short-lived access token (15min) + long-lived refresh token (30 days)
2. Access token used for API requests with Bearer header
3. When access token expires, client uses refresh token to get new pair via `/auth/refresh`
4. Refresh tokens are hashed and stored in database for security
5. Logout invalidates refresh token by hashing it in the database

## Token Invalidation Strategy

**Token Rotation Approach:**

- Each refresh request generates new access + refresh token pair
- Old refresh token is invalidated immediately after use
- Refresh tokens stored as bcrypt-hashed values in database
- Logout hashes the current refresh token to invalidate it
- No token blacklisting needed due to rotation strategy

## Job Queue Processing Flow

1. User submits prompt via `POST /prompts` → status = `"PENDING"`
2. Cron job (runs every 30 seconds) scans for PENDING prompts
3. Paid users get priority (BullMQ priority: 10) over free users (priority: 1)
4. Jobs queued with user priority for processing
5. Worker processes job: PENDING → PROCESSING → COMPLETED
6. On completion: creates Audio record, indexes for search, sends WebSocket notification

## Cron Scheduler Explanation

A scheduled task runs every 30 seconds using `@nestjs/schedule`:

```typescript
@Cron('*/30 * * * * *')  // Every 30 seconds
async handlePendingPrompts() {
  // Find PENDING prompts
  // Enqueue with priority based on subscription
  // Update status to PROCESSING
}
```

## Cache Strategy & Invalidation Rules

- **Redis-backed caching** with 1-minute TTL
- **Cache keys**: `users:page:{page}:limit:{limit}`, `audio:page:{page}:limit:{limit}`
- **Automatic invalidation** on UPDATE operations (PUT /users/:id, PUT /audio/:id)
- **Cache miss** falls back to database query
- **No caching** on POST operations to ensure data consistency

## Rate Limiting Logic

- **Redis-backed sliding window** rate limiting using `@nestjs/throttler`
- **FREE tier**: 20 requests/minute
- **PAID tier**: 100 requests/minute
- **Enforced on all authenticated routes** via guard middleware
- **Returns 429 status** when limits exceeded
- **User-specific limits** based on subscription status

## Unified Search Ranking Logic

- **MeiliSearch** with custom ranking rules: `['words', 'typo', 'proximity', 'attribute', 'exactness']`
- **Exact matches** score higher than partial matches
- **User results** prioritized over audio results in response
- **Ranking score** included in responses via `_rankingScore` field
- **Cursor-based pagination** for efficient large result sets

## Subscription Perks Logic

**FREE Tier:**

- Rate limit: 20 requests/minute
- Queue priority: 1 (standard)
- Basic features only

**PAID Tier:**

- Rate limit: 100 requests/minute
- Queue priority: 10 (high priority processing)
- Faster prompt processing via prioritized job queue

## Architecture Diagrams

### System Context Diagram

```
[MusicGPT Backend]
├── Users (Web/Mobile Clients)
├── External Services
│   ├── MeiliSearch (Search)
│   ├── Redis (Cache/Queue)
│   └── PostgreSQL (Database)
└── Background Workers
    └── Audio Generation Worker
```

### Container Diagram

```
[MusicGPT System]
├── API Container (NestJS)
│   ├── Controllers
│   ├── Use Cases
│   ├── Repositories
│   └── Services
├── Worker Container (BullMQ)
├── Database Container (PostgreSQL)
├── Cache Container (Redis)
└── Search Container (MeiliSearch)
```

### Component Diagram

```
[API Application]
├── Presentation Layer
│   ├── Controllers
│   └── DTOs
├── Application Layer
│   ├── Use Cases
│   └── Services
├── Domain Layer
│   ├── Entities
│   └── Repositories (Interfaces)
└── Infrastructure Layer
    ├── Repositories (Implementations)
    ├── External Services
    └── Database
```

## API Endpoints

### Authentication

- `POST /v1/auth/register` - Register new user
- `POST /v1/auth/login` - User login
- `GET /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Logout user
- `GET /v1/auth/email` - Check email availability

### Users

- `GET /v1/users?page=1&limit=10&subscriptionStatus=FREE` - List users (paginated & filtered)
- `GET /v1/users?limit=10&offset=0&subscriptionStatus=FREE` - Alternative offset-based pagination

**Response Format:**

```json
{
  "data": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "displayName": "User Name",
      "status": "ACTIVE",
      "subscriptionStatus": "FREE"
    }
  ],
  "pagination": {
    "total_records": 100,
    "current_page": 1,
    "total_pages": 10,
    "next_page": 2,
    "prev_page": null,
    "per_page": 10,
    "offset": 0
  }
}
```

- `GET /v1/users/:id` - Get user by ID
- `PUT /v1/users/:id` - Update user

### Audio Files

- `GET /v1/audio?page=1&limit=10` - List audio files (paginated)
- `GET /v1/audio/:id` - Get audio file by ID
- `PUT /v1/audio/:id` - Update audio file

### Subscriptions

- `GET /v1/subscription` - Get current user's subscription
- `POST /v1/subscription/subscribe` - Subscribe to PAID tier
- `POST /v1/subscription/cancel` - Cancel subscription (downgrade to FREE)

### Prompts

- `POST /v1/prompts` - Create a new prompt for audio generation
- `GET /v1/prompts?page=1&limit=10&status=PENDING` - Get user's prompts (paginated & filtered)

### Search

- `GET /v1/search?q=query&limit=20&cursor=0` - Unified search across users and audio content

**Search Indexing:**

The search functionality uses MeiliSearch for fast, full-text search. Data is automatically indexed when:

- New users register
- New audio files are generated

For existing data, run the seed script to populate the search indexes:

```bash
docker exec -it nest-api-server bash -c "cd /app && node seed-meilisearch.js"
```

This indexes all existing users and audio files into MeiliSearch for search functionality.

## Development

### Available Scripts

```bash
npm run start:dev      # Development server with hot reload
npm run start:debug    # Debug mode
npm run build          # Production build
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run lint           # Code linting
npm run format         # Code formatting
```

### Database Operations

```bash
npx prisma studio      # Database GUI
npx prisma migrate dev # Run migrations
npx prisma generate    # Generate client
```

### API Documentation

Swagger documentation is available at http://localhost:3000/v1/docs

## Testing

Run unit tests:

```bash
npm run test
```

Run integration tests:

```bash
npm run test:e2e
```

### Load Testing for Rate Limiting

The project includes Artillery-based load testing scripts to verify rate limiting functionality.

1. Start the application with Docker:

```bash
./start.sh
```

2. Seed test users:

```bash
cd html
npm run seed:users
```

This creates:

- `free@example.com` (FREE tier, 20 requests/min)
- `paid@example.com` (PAID tier, 100 requests/min)

3. Configure environment (optional):

For testing against different environments, set the API base URL:

```bash
export API_BASE_URL="https://qa-api.yourcompany.com"
# or
export API_BASE_URL="https://uat-api.yourcompany.com"
```

If not set, defaults to `http://localhost:3000`.

4. Run load tests:

For FREE users:

```bash
npm run load-test:free
```

For PAID users:

```bash
npm run load-test:paid
```

The tests simulate 60 requests/min for FREE (exceeds limit) and 120 requests/min for PAID (exceeds limit). Expect 429 status codes for requests beyond the limits.

## Security Features

- **Password hashing** with bcrypt (12 salt rounds)
- **JWT access tokens** (15-minute expiration)
- **Refresh tokens** with rotation (30-day expiration)
- **HttpOnly cookies** for secure token storage
- **Rate limiting** based on subscription tier with Redis
- **Input validation** with class-validator and class-transformer
- **SQL injection prevention** via Prisma ORM
- **XSS protection** through input sanitization
- **CORS configuration** for cross-origin requests

## Deployment

### Production Build

```bash
npm run build
docker build -t musicgpt-backend .
docker run -p 3000:3000 musicgpt-backend
```

### Environment Variables

Key production variables:

```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="production-secret-key"
MEILI_HOST="http://meilisearch:7700"
```

## Docker Services

- **API Server**: Main application on port 3000
- **PostgreSQL**: Database on port 5433
- **Redis**: Cache and queues on port 6379
- **MeiliSearch**: Search engine on port 7700
- **Mailpit**: Email testing on ports 1025/8025

## Contributing

1. Follow the existing code structure and patterns
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

This project is part of the MusicGPT platform.
