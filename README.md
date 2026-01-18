# Audio-api Backend

A NestJS backend for audio processing and generation. Users can submit text prompts that get processed into audio files through background jobs. The system includes user authentication, subscription management, rate limiting, and unified search.

## Features

- JWT authentication with refresh tokens
- User registration and login
- Subscription tiers (FREE/PAID) with rate limiting
- CRUD operations for users and audio files
- Unified search across users and audio content
- Background job processing with BullMQ
- Redis caching with TTL
- Docker containerization

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis with BullMQ
- **Search**: MeiliSearch
- **Authentication**: JWT with bcrypt hashing
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
└── utils/                  # Helper functions
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

The application implements JWT authentication with access and refresh tokens:

1. User registers or logs in, receiving a short-lived access token (15 minutes) and long-lived refresh token (30 days)
2. API requests include the access token in the Authorization header
3. When the access token expires, the client uses the refresh token to obtain a new token pair
4. Refresh tokens are hashed with bcrypt and stored securely in the database
5. Logout invalidates the refresh token by hashing it

## Token Invalidation Strategy

Using token rotation instead of blacklisting:

- Each refresh request issues new access and refresh token pairs
- The old refresh token becomes invalid immediately
- Refresh tokens are stored as bcrypt hashes in the database
- Logout works by hashing the current refresh token
- This approach eliminates the need for complex token blacklisting

## Job Queue Processing Flow

1. User submits a prompt via `POST /prompts`, setting status to "PENDING"
2. A cron job runs every 30 seconds to find pending prompts
3. Paid users receive higher priority (BullMQ priority 10) compared to free users (priority 1)
4. Jobs are queued based on user subscription level
5. The worker processes each job: PENDING → PROCESSING → COMPLETED
6. Upon completion, an audio record is created, indexed for search, and a WebSocket notification is sent

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

Caching is implemented with Redis and 1-minute TTL. Cache keys follow the pattern `users:page:{page}:limit:{limit}` and `audio:page:{page}:limit:{limit}`. Updates automatically invalidate relevant cache entries, while cache misses fall back to database queries. POST operations bypass caching to maintain data consistency.

## Rate Limiting Logic

Rate limiting uses Redis-backed sliding windows with the `@nestjs/throttler` package. Free tier users get 20 requests per minute, while paid users receive 100. Limits are enforced on all authenticated routes through guard middleware, returning HTTP 429 when exceeded. Limits are determined by each user's subscription status.

## Unified Search Ranking Logic

Search uses MeiliSearch with ranking rules prioritizing exact matches over partial matches. User results are prioritized over audio content in the response. Each result includes a ranking score, and cursor-based pagination handles large result sets efficiently.

## Subscription Perks Logic

Free tier users get 20 requests per minute with standard queue priority. Paid users receive 100 requests per minute and high-priority job processing, ensuring faster prompt completion through the BullMQ priority queue system.

## Architecture Diagrams

### System Context Diagram

```
┌─────────────────────────────────────┐
│         Audio-api Backend           │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐   │
│  │ Web/Mobile  │  │ Background  │   │
│  │   Clients   │  │   Workers   │   │
│  └─────────────┘  └─────────────┘   │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐   │
│  │ MeiliSearch │  │ PostgreSQL  │   │
│  │   (Search)  │  │ (Database)  │   │
│  └─────────────┘  └─────────────┘   │
│                                     │
│  ┌─────────────┐                    │
│  │   Redis     │                    │
│  │ (Cache/Queue│                    │
│  └─────────────┘                    │
└─────────────────────────────────────┘
```

### Container Diagram

```
┌─────────────────────────────────────┐
│       Audio-api Containers          │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐   │
│  │   NestJS    │  │   BullMQ    │   │
│  │ API Server  │  │   Worker    │   │
│  └─────────────┘  └─────────────┘   │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐   │
│  │ PostgreSQL  │  │   Redis     │   │
│  │ (Database)  │  │ (Cache)     │   │
│  └─────────────┘  └─────────────┘   │
│                                     │
│  ┌─────────────┐                    │
│  │ MeiliSearch │                    │
│  │   (Search)  │                    │
│  └─────────────┘                    │
└─────────────────────────────────────┘
```

### Component Diagram

```
┌─────────────────────────────────────┐
│       Application Layers            │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐ │
│  │    Presentation Layer           │ │
│  │  ┌─────────────┬─────────────┐  │ │
│  │  │ Controllers │    DTOs    │  │ │
│  │  └─────────────┴─────────────┘  │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐ │
│  │    Application Layer            │ │
│  │  ┌─────────────┬─────────────┐  │ │
│  │  │  Use Cases  │  Services  │  │ │
│  │  └─────────────┴─────────────┘  │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐ │
│  │      Domain Layer               │ │
│  │  ┌─────────────┬─────────────┐  │ │
│  │  │  Entities   │ Repositories│  │ │
│  │  │             │ (Interfaces)│  │ │
│  │  └─────────────┴─────────────┘  │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐ │
│  │   Infrastructure Layer          │ │
│  │  ┌─────────────┬─────────────┐  │ │
│  │  │Repositories │ External   │  │ │
│  │  │(Implement.) │ Services   │  │ │
│  │  └─────────────┴─────────────┘  │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
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

This project provides a scalable audio processing API.
