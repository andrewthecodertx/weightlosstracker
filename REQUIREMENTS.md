# Weight Loss Tracker - Technical Requirements Document

**Version:** 1.0
**Last Updated:** 2025-11-18
**Project Status:** Planning Phase

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Functional Requirements](#functional-requirements)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [Database Design](#database-design)
7. [API Specifications](#api-specifications)
8. [Security Requirements](#security-requirements)
9. [Performance & Scalability](#performance--scalability)
10. [Infrastructure & Deployment](#infrastructure--deployment)
11. [Development Workflow](#development-workflow)
12. [Testing Strategy](#testing-strategy)
13. [Monitoring & Observability](#monitoring--observability)
14. [Risk Assessment](#risk-assessment)
15. [Timeline & Milestones](#timeline--milestones)

---

## Executive Summary

### Project Overview

A comprehensive weight loss tracking application with social features, team
challenges, real-time messaging, and progress analytics. The platform enables
users to track their weight loss journey individually or as part of competitive
teams.

### Core Objectives

1. Provide intuitive weight tracking with visual progress charts
2. Enable team-based challenges and competition
3. Foster community engagement through posts and messaging
4. Deliver real-time updates and notifications
5. Ensure data privacy and security
6. Scale to support thousands of concurrent users

### Key Features

- Individual weight tracking with photos and notes
- Team formation and management
- Public and team-specific social feeds
- Real-time direct and group messaging
- Challenges and competitions with leaderboards
- Achievement/badge system
- Analytics and progress visualization
- Mobile-responsive design

---

## System Architecture

### Architecture Style

**Hybrid Architecture:**

- **Frontend:** Astro with React Islands (partial hydration)
- **Backend:** Node.js REST API
- **Real-time Layer:** WebSocket server (Socket.io)
- **Caching Layer:** Redis
- **Database:** PostgreSQL
- **File Storage:** S3-compatible object storage

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Web Browser  │  │   PWA App    │  │  Mobile App  │       │
│  │   (Astro)    │  │  (Workbox)   │  │(React Native)│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   Application Servers   │   │   WebSocket Servers     │
│   (Node.js + Express)   │   │    (Socket.io)          │
│   - API Endpoints       │   │   - Real-time messaging │
│   - Authentication      │   │   - Live updates        │
│   - Business Logic      │   │   - Presence tracking   │
└─────────────────────────┘   └─────────────────────────┘
         │                                 │
         │                                 │
         ├─────────────────────────────────┤
         │                                 │
         ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Redis Cluster                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Cache Store │  │  Pub/Sub     │  │ Rate Limiter │       │
│  │  - Sessions  │  │  - Socket.io │  │ - API Limits │       │
│  │  - API Cache │  │  - Events    │  │ - Per User   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Primary)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables: users, teams, posts, messages, challenges   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         PostgreSQL Read Replicas (Optional)                 │
│                 - Analytics Queries                         │
│                 - Reporting                                 │
└─────────────────────────────────────────────────────────────┘

         ┌────────────────────────────────────┐
         │      External Services             │
         ├────────────────────────────────────┤
         │  - S3 (File Storage)               │
         │  - SendGrid (Email)                │
         │  - Firebase (Push Notifications)   │
         │  - Cloudflare (CDN)                │
         │  - Sentry (Error Tracking)         │
         │  - Datadog (Monitoring)            │
         └────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

**Framework:** Astro 4.x

- **Rationale:**
  - Server-first approach for optimal performance
  - Islands architecture for selective hydration
  - Built-in asset optimization
  - SEO-friendly with SSR/SSG capabilities

**UI Framework:** React 18.x (for interactive components)

- **Component Library:** Radix UI + Tailwind CSS
- **State Management:** Zustand (lightweight, modern)
- **Form Handling:** React Hook Form + Zod validation
- **Charts:** Recharts + D3.js for custom visualizations
- **HTTP Client:** Axios with interceptors

**Progressive Web App:**

- **Service Worker:** Workbox 7.x
- **Offline Support:** IndexedDB for local data
- **Installability:** Web App Manifest

### Backend

**Runtime:** Node.js 20.x LTS

- **Framework:** Express 4.x
- **Language:** TypeScript 5.x
- **ORM:** Prisma 5.x
  - Type-safe database access
  - Built-in migrations
  - Excellent developer experience

**API Design:**

- **Style:** RESTful API with versioning (v1, v2)
- **Validation:** Zod schemas
- **Documentation:** OpenAPI 3.0 (Swagger)
- **Rate Limiting:** express-rate-limit + Redis

**Authentication:**

- **JWT Tokens:** Access (15min) + Refresh (7 days) token strategy
- **Password Hashing:** bcrypt (cost factor: 12)
- **Session Management:** Redis-backed sessions
- **OAuth Providers:** Google, Facebook, Apple (future)

### Database

**Primary Database:** PostgreSQL 16.x

- **Connection Pooling:** pg-pool (max 20 connections)
- **Migrations:** Prisma Migrate
- **Backups:** Automated daily backups with 30-day retention
- **Replication:** 1 primary + 2 read replicas (for analytics)

**Cache Layer:** Redis 7.x

- **Deployment:** Redis Cluster (3 master + 3 replica)
- **Persistence:** RDB snapshots + AOF
- **Eviction Policy:** allkeys-lru

### Real-Time Communication

**WebSocket:** Socket.io 4.x

- **Adapter:** socket.io-redis for horizontal scaling
- **Reconnection:** Automatic with exponential backoff
- **Authentication:** JWT-based handshake
- **Rooms:** User rooms, team rooms, conversation rooms

### File Storage

**Object Storage:** AWS S3 (or MinIO for self-hosting)

- **Image Processing:** Sharp library for resizing
- **CDN:** CloudFlare for image delivery
- **Uploads:** Presigned URLs for direct client uploads
- **File Types:**
  - Images: JPEG, PNG, WebP (max 10MB)
  - Avatars: Auto-resize to 200x200, 400x400
  - Progress photos: Max 5MB, auto-compress

**Storage Structure:**

```
s3://weight-tracker-prod/
├── avatars/
│   ├── {userId}/
│   │   ├── original.jpg
│   │   ├── 200x200.webp
│   │   └── 400x400.webp
├── progress-photos/
│   ├── {userId}/
│   │   └── {timestamp}-{id}.jpg
└── team-avatars/
    └── {teamId}/
        └── avatar.jpg
```

### Email Service

**Provider:** SendGrid

- **Templates:** Transactional email templates
- **Types:**
  - Welcome email
  - Email verification
  - Password reset
  - Weekly progress summary
  - Team challenge notifications
  - Achievement unlocked
- **Unsubscribe:** Per-category preferences
- **Analytics:** Open rates, click tracking

### Push Notifications

**Service:** Firebase Cloud Messaging (FCM)

- **Web Push:** PWA notifications
- **Mobile:** React Native FCM integration
- **Notification Types:**
  - New message received
  - Team member weight update
  - Challenge milestone reached
  - Achievement earned
  - Daily reminder (configurable)
- **Delivery:** Background jobs via BullMQ

### Background Jobs

**Queue System:** BullMQ (Redis-backed)

- **Worker Processes:** Separate worker instances
- **Job Types:**
  - Send email notifications
  - Process image uploads
  - Calculate leaderboards
  - Generate weekly reports
  - Clean up expired data
- **Monitoring:** Bull Board dashboard

---

## Functional Requirements

### 1. User Management

#### 1.1 Registration & Authentication

**FR-1.1.1:** User registration with email and password

- Email validation (format + uniqueness)
- Password requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Email verification required before full access
- CAPTCHA for bot prevention

**FR-1.1.2:** Social authentication (Phase 2)

- Google Sign-In
- Facebook Login
- Apple Sign In

**FR-1.1.3:** Password management

- Forgot password flow with email reset link
- Reset link expires in 1 hour
- Password change from settings
- Password history (prevent reuse of last 3 passwords)

**FR-1.1.4:** Session management

- JWT access token (15min expiry)
- Refresh token (7 days expiry)
- Automatic token refresh
- Logout from all devices option

#### 1.2 User Profile

**FR-1.2.1:** Profile information

- Username (unique, 3-20 chars, alphanumeric + underscore)
- Display name
- Avatar upload
- Bio (max 500 chars)
- Privacy settings (profile visibility, weight visibility)

**FR-1.2.2:** Weight tracking setup

- Current weight
- Goal weight
- Target date (optional)
- Height
- Age/Date of birth
- Gender
- Activity level
- Preferred units (metric/imperial)

**FR-1.2.3:** Profile editing

- Update personal information
- Change avatar
- Delete account (soft delete with 30-day grace period)

### 2. Weight Tracking

**FR-2.1:** Manual weight entry

- Weight value (required)
- Entry date/time (default: now, can backdate)
- Notes (optional, max 1000 chars)
- Photo attachments (max 3 photos per entry)
- Body composition metrics (optional):
  - Body fat percentage
  - Muscle mass
  - Water percentage

**FR-2.2:** Weight history view

- List view with filters (date range, sort order)
- Graph view with multiple time ranges (7d, 30d, 90d, 1y, all)
- Export to CSV
- Edit previous entries
- Delete entries (with confirmation)

**FR-2.3:** Progress visualization

- Line chart with trend line
- Weight change indicators (daily, weekly, monthly)
- Goal progress percentage
- BMI calculation and tracking
- Before/after photo comparison
- Projected goal date based on current trend

**FR-2.4:** Reminders

- Daily weigh-in reminder (configurable time)
- Weekly check-in notification
- Milestone celebrations

### 3. Team Features

**FR-3.1:** Team creation

- Team name (unique, 3-50 chars)
- Description (max 500 chars)
- Team avatar
- Privacy settings:
  - Public (anyone can join)
  - Private (invite/join code only)
- Maximum member limit (default: 50, max: 200)

**FR-3.2:** Team joining

- Browse public teams
- Search teams by name/description
- Join via invite code
- Join request for private teams (admin approval)

**FR-3.3:** Team management

- Roles: Owner, Admin, Moderator, Member
- Permissions:
  - Owner: All permissions, transfer ownership, delete team
  - Admin: Invite/remove members, manage challenges, edit team
  - Moderator: Moderate posts, manage challenges
  - Member: Participate, post, message
- Remove members
- Leave team
- Promote/demote members

**FR-3.4:** Team leaderboard

- Sort by:
  - Total weight lost
  - Weight loss percentage
  - Current streak (consecutive weigh-ins)
  - Challenge points
- Time period filters (week, month, all-time)
- Real-time updates via WebSocket

### 4. Social Features

#### 4.1 Posts & Feed

**FR-4.1.1:** Create posts

- Post types:
  - General update
  - Milestone celebration
  - Tip/advice
  - Question
  - Recipe
  - Workout
- Title (optional, max 100 chars)
- Content (required, max 5000 chars)
- Media attachments (images, max 5 per post)
- Tags (max 10)
- Visibility:
  - Public (global feed)
  - Team only
  - Followers only (Phase 2)

**FR-4.1.2:** Feed views

- Public feed (all public posts)
- Team feed (team-specific posts)
- Personal feed (own posts)
- Infinite scroll pagination
- Real-time new post notifications

**FR-4.1.3:** Post interactions

- Like/unlike posts
- Comment on posts
- Nested comments (max 3 levels)
- Edit own posts (within 24 hours)
- Delete own posts
- Report inappropriate content
- Bookmark posts (Phase 2)

**FR-4.1.4:** Content moderation

- User reporting system
- Admin/moderator review queue
- Auto-flag based on keywords
- Soft delete with restore option
- User content history

#### 4.2 Messaging System

**FR-4.2.1:** Direct messaging

- One-on-one conversations
- Send text messages
- Send images
- Message status: sent, delivered, read
- Typing indicators
- Real-time delivery via WebSocket

**FR-4.2.2:** Group messaging

- Create group conversations
- Add/remove participants
- Group name and avatar
- Leave group
- Admin controls (owner can remove members)

**FR-4.2.3:** Team chat

- Dedicated team group chat (auto-created with team)
- All team members included
- Synchronized with team membership

**FR-4.2.4:** Message features

- Edit messages (within 5 minutes)
- Delete messages (delete for self or for everyone)
- React to messages with emoji (Phase 2)
- Search message history
- Message pagination (20 messages per page)
- Unread message count
- Push notifications for new messages

### 5. Challenges & Competitions

**FR-5.1:** Challenge creation

- Challenge name (max 100 chars)
- Description (max 1000 chars)
- Type:
  - Weight loss percentage
  - Total pounds/kg lost
  - Consistency (consecutive weigh-ins)
  - Activity-based (Phase 2)
- Start date
- End date (max 365 days from start)
- Target value
- Reward points
- Team-specific or individual

**FR-5.2:** Challenge participation

- Join active challenges
- View challenge details
- Track personal progress
- View challenge leaderboard
- Receive progress notifications

**FR-5.3:** Challenge completion

- Automatic completion detection
- Award badges/achievements
- Display winner announcement
- Archive completed challenges

### 6. Achievements & Gamification

**FR-6.1:** Achievement system

- Predefined achievements:
  - First weigh-in
  - 7-day streak
  - 30-day streak
  - Lost 5 lbs / 2.5 kg
  - Lost 10 lbs / 5 kg
  - Lost 25 lbs / 10 kg
  - Lost 50 lbs / 25 kg
  - Reached goal weight
  - First challenge completed
  - 10 posts created
  - Helped 10 team members (likes on helpful tips)
- Custom team achievements (Phase 2)

**FR-6.2:** Badge display

- Achievement showcase on profile
- Badge icons and descriptions
- Achievement notifications
- Leaderboard by achievement points
- Social sharing (Phase 2)

### 7. Analytics & Reports

**FR-7.1:** Personal analytics

- Weight loss trends
- Average weekly loss
- Best/worst weeks
- Consistency score
- BMI trend
- Body composition changes

**FR-7.2:** Team analytics (for admins)

- Team member activity
- Average weight loss
- Most active members
- Challenge participation rates

**FR-7.3:** Weekly email summary

- Personal progress recap
- Team highlights
- Upcoming challenges
- Motivational content

---

## Non-Functional Requirements

### 1. Performance

**NFR-1.1:** Page Load Times

- Initial page load: < 2 seconds (on 4G connection)
- Subsequent page navigation: < 500ms
- API response time: < 200ms (p95)
- WebSocket message latency: < 100ms

**NFR-1.2:** Throughput

- Support 1,000 concurrent users per server instance
- Handle 10,000 API requests per minute
- Process 1,000 WebSocket messages per second

**NFR-1.3:** Database Performance

- Query response time: < 50ms (p95)
- Connection pool size: 20 per instance
- Query timeout: 5 seconds

### 2. Scalability

**NFR-2.1:** Horizontal Scaling

- Stateless application servers
- Load balancing across multiple instances
- Auto-scaling based on CPU/memory (70% threshold)

**NFR-2.2:** Data Growth

- Support 100,000 users initially
- Plan for 1,000,000 users within 2 years
- Weight entries: ~10-20 million records per year

**NFR-2.3:** WebSocket Scaling

- Socket.io Redis adapter for multi-server support
- Sticky sessions via load balancer

### 3. Availability & Reliability

**NFR-3.1:** Uptime

- Target: 99.9% uptime (8.76 hours downtime/year)
- Planned maintenance windows: Sunday 2-4 AM UTC

**NFR-3.2:** Fault Tolerance

- Database replication (1 primary + 2 replicas)
- Redis cluster with failover
- Graceful degradation if cache unavailable
- Circuit breaker pattern for external services

**NFR-3.3:** Disaster Recovery

- Automated daily database backups
- 30-day backup retention
- Point-in-time recovery (PITR) capability
- RTO (Recovery Time Objective): < 4 hours
- RPO (Recovery Point Objective): < 1 hour

### 4. Security

**NFR-4.1:** Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Session timeout: 15 minutes of inactivity
- Secure password storage (bcrypt, cost factor 12)

**NFR-4.2:** Data Protection

- HTTPS/TLS 1.3 for all connections
- Database encryption at rest (AES-256)
- Sensitive data encrypted in database
- PII (Personally Identifiable Information) protection

**NFR-4.3:** API Security

- Rate limiting:
  - Anonymous: 10 req/min
  - Authenticated: 100 req/min
  - Per-endpoint limits for sensitive operations
- CORS configuration for allowed origins
- Request size limits (JSON: 1MB, File upload: 10MB)
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (output escaping)

**NFR-4.4:** Compliance

- GDPR compliance (EU users)
- CCPA compliance (California users)
- Data export capability
- Right to be forgotten (account deletion)
- Privacy policy and terms of service

### 5. Usability

**NFR-5.1:** Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast (4.5:1 minimum)
- Alt text for images

**NFR-5.2:** Responsive Design

- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px, 1440px
- Touch-friendly UI (min 44x44px tap targets)
- Optimized for iOS Safari and Chrome Android

**NFR-5.3:** Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari iOS 14+
- Chrome Android 90+

### 6. Maintainability

**NFR-6.1:** Code Quality

- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Minimum 80% code coverage for critical paths
- Automated code reviews (SonarQube)

**NFR-6.2:** Documentation

- API documentation (OpenAPI/Swagger)
- Architecture decision records (ADRs)
- Database schema documentation
- Deployment runbooks
- Inline code comments for complex logic

**NFR-6.3:** Logging

- Structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Centralized log aggregation (ELK stack or similar)
- Request ID tracking across services
- No sensitive data in logs

### 7. Monitoring & Observability

**NFR-7.1:** Application Monitoring

- Real-time error tracking (Sentry)
- Performance monitoring (Datadog/New Relic)
- Custom metrics (API response times, cache hit rates)
- Uptime monitoring (external ping service)

**NFR-7.2:** Infrastructure Monitoring

- Server CPU, memory, disk usage
- Database connections, query performance
- Redis memory usage, key expiration
- Network latency and throughput

**NFR-7.3:** Alerting

- Error rate threshold: > 1% of requests
- Response time threshold: p95 > 1 second
- Database connection pool exhaustion
- Disk space < 20% free
- On-call rotation with PagerDuty

---

## Database Design

### Schema Overview

See `projectplan.md` lines 186-367 for complete SQL schema. Key improvements:

### Additional Indexes

```sql
-- Performance indexes
CREATE INDEX idx_posts_author_date ON posts(author_id, created_at DESC);
CREATE INDEX idx_messages_sender_date ON messages(sender_id, created_at DESC);
CREATE INDEX idx_weight_entries_date ON weight_entries(recorded_at DESC);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);

-- Composite indexes for common queries
CREATE INDEX idx_posts_team_visibility ON posts(team_id, visibility, created_at DESC);
CREATE INDEX idx_comments_post_parent ON comments(post_id, parent_id, created_at);
```

### Database Partitioning (Future)

For large-scale data:

```sql
-- Partition weight_entries by year
CREATE TABLE weight_entries_2024 PARTITION OF weight_entries
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE weight_entries_2025 PARTITION OF weight_entries
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### Connection Pooling Configuration

```javascript
// prisma/client.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
  pool: {
    min: 2,
    max: 20,
    acquireTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  },
});

export default prisma;
```

### Data Retention Policy

```sql
-- Soft delete implementation
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN deleted_at TIMESTAMP;

-- Cleanup job (runs monthly)
-- Permanently delete accounts after 30 days in deleted state
DELETE FROM users
WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '30 days';

-- Archive old weight entries (> 2 years)
CREATE TABLE weight_entries_archive AS
SELECT * FROM weight_entries
WHERE recorded_at < NOW() - INTERVAL '2 years';

DELETE FROM weight_entries
WHERE recorded_at < NOW() - INTERVAL '2 years';
```

---

## API Specifications

### API Versioning Strategy

```
https://api.weighttracker.com/v1/users
https://api.weighttracker.com/v2/users
```

- Version in URL path
- Maintain v1 for at least 6 months after v2 release
- Deprecation warnings in response headers

### Authentication

**Header:** `Authorization: Bearer {access_token}`

**Refresh Token Endpoint:**

```
POST /v1/auth/refresh
Body: { "refreshToken": "..." }
Response: { "accessToken": "...", "refreshToken": "..." }
```

### Rate Limiting

**Response Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1637251200
```

**Rate Limit Exceeded Response:**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

### Standard Response Format

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-18T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-11-18T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Pagination

**Request:**

```
GET /v1/posts?page=2&limit=20&sortBy=createdAt&order=desc
```

**Response:**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "totalPages": 10,
    "totalItems": 200,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### Key Endpoints

#### Authentication

```
POST   /v1/auth/register
POST   /v1/auth/login
POST   /v1/auth/logout
POST   /v1/auth/refresh
POST   /v1/auth/forgot-password
POST   /v1/auth/reset-password
POST   /v1/auth/verify-email
```

#### Users

```
GET    /v1/users/me
PATCH  /v1/users/me
DELETE /v1/users/me
POST   /v1/users/me/avatar
GET    /v1/users/:userId
```

#### Weight Tracking

```
GET    /v1/weight-entries
POST   /v1/weight-entries
GET    /v1/weight-entries/:entryId
PATCH  /v1/weight-entries/:entryId
DELETE /v1/weight-entries/:entryId
GET    /v1/weight-entries/stats
GET    /v1/weight-entries/chart?period=30d
```

#### Teams

```
GET    /v1/teams
POST   /v1/teams
GET    /v1/teams/:teamId
PATCH  /v1/teams/:teamId
DELETE /v1/teams/:teamId
POST   /v1/teams/:teamId/join
POST   /v1/teams/:teamId/leave
GET    /v1/teams/:teamId/members
POST   /v1/teams/:teamId/members/:userId/remove
PATCH  /v1/teams/:teamId/members/:userId/role
GET    /v1/teams/:teamId/leaderboard
```

#### Posts

```
GET    /v1/posts?visibility=public&page=1&limit=20
POST   /v1/posts
GET    /v1/posts/:postId
PATCH  /v1/posts/:postId
DELETE /v1/posts/:postId
POST   /v1/posts/:postId/like
DELETE /v1/posts/:postId/like
GET    /v1/posts/:postId/comments
POST   /v1/posts/:postId/comments
```

#### Messages

```
GET    /v1/conversations
POST   /v1/conversations
GET    /v1/conversations/:conversationId
GET    /v1/conversations/:conversationId/messages
POST   /v1/conversations/:conversationId/messages
PATCH  /v1/messages/:messageId
DELETE /v1/messages/:messageId
```

#### Challenges

```
GET    /v1/challenges
POST   /v1/challenges
GET    /v1/challenges/:challengeId
PATCH  /v1/challenges/:challengeId
DELETE /v1/challenges/:challengeId
POST   /v1/challenges/:challengeId/join
GET    /v1/challenges/:challengeId/leaderboard
```

### Input Validation with Zod

```typescript
// schemas/user.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const weightEntrySchema = z.object({
  weight: z.number().positive('Weight must be positive').max(1000, 'Weight seems unrealistic'),
  recordedAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  muscleMass: z.number().positive().optional(),
  waterPercentage: z.number().min(0).max(100).optional(),
});
```

### Validation Middleware

```typescript
// middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        });
      }
      next(error);
    }
  };
};

// Usage
app.post('/v1/auth/register', validate(registerSchema), registerController);
```

---

## Security Requirements

### 1. Input Sanitization

```typescript
// middleware/sanitize.ts
import sanitizeHtml from 'sanitize-html';

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize all string inputs
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeHtml(obj, {
        allowedTags: [], // No HTML allowed
        allowedAttributes: {},
      });
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = sanitizeObject(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};
```

### 2. Rate Limiting Configuration

```typescript
// middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../lib/redis/client';

// General API rate limit
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis.client,
    prefix: 'rl:api:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.',
        retryAfter: req.rateLimit.resetTime,
      },
    });
  },
});

// Strict rate limit for authentication endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis.client,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
});

// File upload rate limit
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
});
```

### 3. Content Security Policy

```typescript
// middleware/security.ts
import helmet from 'helmet';

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.weighttracker.com', 'wss://api.weighttracker.com'],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});
```

### 4. CORS Configuration

```typescript
// middleware/cors.ts
import cors from 'cors';

const allowedOrigins = [
  'https://weighttracker.com',
  'https://www.weighttracker.com',
  'http://localhost:3000', // Development only
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
});
```

### 5. File Upload Security

```typescript
// middleware/upload.ts
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5, // Max 5 files per upload
  },
  fileFilter: (req, file, callback) => {
    // Only allow images
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

// File validation after upload
export const validateUploadedFile = async (file: Express.Multer.File) => {
  // Verify file signature (magic numbers)
  const fileSignatures = {
    'image/jpeg': [0xff, 0xd8, 0xff],
    'image/png': [0x89, 0x50, 0x4e, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
  };

  const signature = fileSignatures[file.mimetype as keyof typeof fileSignatures];
  if (signature) {
    const header = Array.from(file.buffer.slice(0, signature.length));
    if (!header.every((byte, i) => byte === signature[i])) {
      throw new Error('File signature does not match file type');
    }
  }
};
```

### 6. Encryption for Sensitive Data

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(text: string): string {
  const [ivHex, authTagHex, encrypted] = text.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### 7. SQL Injection Prevention

Using Prisma ORM automatically provides protection through parameterized queries:

```typescript
// SAFE - Prisma parameterizes automatically
const user = await prisma.user.findUnique({
  where: { email: userInput }, // Safe even if userInput is malicious
});

// For raw queries, always use parameterized queries
const result = await prisma.$queryRaw`
  SELECT * FROM users
  WHERE email = ${email} AND username = ${username}
`;
```

### 8. XSS Prevention

**Backend:** Sanitize all user input (shown above)

**Frontend:**

```typescript
// React automatically escapes content
<div>{userContent}</div> // Safe

// For rendering HTML, use DOMPurify
import DOMPurify from 'dompurify';

const SafeContent = ({ html }: { html: string }) => {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });

  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
};
```

---

## Performance & Scalability

### 1. Caching Strategy (Improved)

```typescript
// lib/redis/cache.ts
import { redis } from './client';

export class CacheService {
  /**
   * Get with SCAN instead of KEYS for pattern invalidation
   */
  async invalidatePattern(pattern: string): Promise<void> {
    let cursor = '0';
    do {
      const [newCursor, keys] = await redis.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = newCursor;

      if (keys.length > 0) {
        await redis.client.del(...keys);
      }
    } while (cursor !== '0');
  }

  /**
   * Cache-aside pattern with race condition prevention
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300): Promise<T> {
    // Try to get from cache
    const cached = await redis.get(key);
    if (cached !== null) {
      return cached as T;
    }

    // Use lock to prevent thundering herd
    const lockKey = `lock:${key}`;
    const lockAcquired = await redis.client.set(
      lockKey,
      '1',
      'NX',
      'EX',
      10 // 10 second lock
    );

    if (lockAcquired) {
      try {
        // Fetch data
        const data = await fetcher();

        // Store in cache
        await redis.set(key, data, ttl);

        return data;
      } finally {
        // Release lock
        await redis.client.del(lockKey);
      }
    } else {
      // Another process is fetching, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.getOrSet(key, fetcher, ttl);
    }
  }
}

export const cache = new CacheService();
```

### 2. Database Query Optimization

```typescript
// lib/db/repositories/weight-entry.repository.ts
import prisma from '../client';

export class WeightEntryRepository {
  /**
   * Get weight history with pagination and caching
   */
  async getWeightHistory(userId: string, page: number = 1, limit: number = 20) {
    const cacheKey = `weight:history:${userId}:${page}:${limit}`;

    return cache.getOrSet(
      cacheKey,
      async () => {
        const [entries, total] = await Promise.all([
          prisma.weightEntry.findMany({
            where: { userId },
            orderBy: { recordedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
              id: true,
              weight: true,
              recordedAt: true,
              notes: true,
              bodyFatPercentage: true,
              // Don't select photoUrls if not needed
            },
          }),
          prisma.weightEntry.count({ where: { userId } }),
        ]);

        return {
          entries,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      300 // 5 minutes
    );
  }

  /**
   * Efficient statistics calculation
   */
  async getStatistics(userId: string) {
    const cacheKey = `weight:stats:${userId}`;

    return cache.getOrSet(
      cacheKey,
      async () => {
        // Use aggregation to calculate stats in a single query
        const stats = await prisma.$queryRaw`
          WITH weight_stats AS (
            SELECT
              COUNT(*) as total_entries,
              MIN(weight) as min_weight,
              MAX(weight) as max_weight,
              AVG(weight) as avg_weight,
              FIRST_VALUE(weight) OVER (ORDER BY recorded_at ASC) as starting_weight,
              FIRST_VALUE(weight) OVER (ORDER BY recorded_at DESC) as current_weight
            FROM weight_entries
            WHERE user_id = ${userId}
          )
          SELECT * FROM weight_stats
        `;

        return stats;
      },
      900 // 15 minutes
    );
  }
}
```

### 3. WebSocket Scaling with Redis Adapter

```typescript
// lib/websocket/socket-server.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redis } from '../redis/client';

export class SocketServer {
  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
      },
      // Connection options
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 10000,
      // Transports priority
      transports: ['websocket', 'polling'],
    });

    // Redis adapter for horizontal scaling
    const pubClient = redis.publisher;
    const subClient = redis.subscriber;

    this.io.adapter(createAdapter(pubClient, subClient));

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // ... rest of implementation
}
```

### 4. Background Job Processing

```typescript
// lib/jobs/queue.ts
import { Queue, Worker } from 'bullmq';
import { redis } from '../redis/client';

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Email queue
export const emailQueue = new Queue('email', { connection });

// Email worker
const emailWorker = new Worker(
  'email',
  async (job) => {
    const { to, template, data } = job.data;

    // Send email via SendGrid
    await sendEmail(to, template, data);
  },
  {
    connection,
    concurrency: 5, // Process 5 emails concurrently
    limiter: {
      max: 100, // Max 100 jobs
      duration: 60000, // per minute
    },
  }
);

// Image processing queue
export const imageQueue = new Queue('image-processing', { connection });

const imageWorker = new Worker(
  'image-processing',
  async (job) => {
    const { imageUrl, userId, type } = job.data;

    // Download image
    const image = await downloadImage(imageUrl);

    // Resize and optimize
    const resized = await sharp(image)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    // Upload to S3
    const uploadedUrl = await uploadToS3(resized, `${type}/${userId}`);

    return { uploadedUrl };
  },
  {
    connection,
    concurrency: 3,
  }
);

// Leaderboard calculation queue
export const leaderboardQueue = new Queue('leaderboard', { connection });

const leaderboardWorker = new Worker(
  'leaderboard',
  async (job) => {
    const { teamId } = job.data;

    // Calculate team leaderboard
    const leaderboard = await calculateTeamLeaderboard(teamId);

    // Update cache
    await redis.set(`team:leaderboard:${teamId}`, leaderboard, 300);

    // Emit via WebSocket
    io.to(`team:${teamId}`).emit('leaderboard:updated', leaderboard);
  },
  {
    connection,
    concurrency: 2,
  }
);
```

### 5. Database Read Replicas

```typescript
// lib/db/client.ts
import { PrismaClient } from '@prisma/client';

// Primary database (writes)
export const prismaPrimary = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

// Read replica (reads)
export const prismaReplica = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_REPLICA_URL || process.env.DATABASE_URL },
  },
});

// Helper to route queries
export function getPrismaClient(readOnly: boolean = false) {
  return readOnly ? prismaReplica : prismaPrimary;
}

// Usage in repositories
export class TeamRepository {
  async getTeamLeaderboard(teamId: string) {
    // Use read replica for analytics
    const client = getPrismaClient(true);

    return client.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        // Custom ordering logic
      },
    });
  }
}
```

---

## Infrastructure & Deployment

### 1. Server Architecture

**Environment:** Production

```
┌─────────────────────────────────────────────────────────┐
│              Cloudflare CDN + DDoS Protection           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         Load Balancer (Nginx / AWS ALB)                 │
│         - SSL Termination (TLS 1.3)                     │
│         - Sticky sessions for WebSocket                 │
│         - Health checks                                 │
└─────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ App Server 1 │ │ App Server 2 │ │ App Server 3 │
│ Node.js      │ │ Node.js      │ │ Node.js      │
│ 4 vCPU       │ │ 4 vCPU       │ │ 4 vCPU       │
│ 8GB RAM      │ │ 8GB RAM      │ │ 8GB RAM      │
└──────────────┘ └──────────────┘ └──────────────┘
            │             │             │
            └─────────────┼─────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Redis Cluster (Managed)                    │
│              3 Masters + 3 Replicas                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         PostgreSQL (Managed - AWS RDS / DigitalOcean)   │
│         1 Primary + 2 Read Replicas                     │
│         - Automated backups                             │
│         - Point-in-time recovery                        │
└─────────────────────────────────────────────────────────┘
```

### 2. Containerization (Docker)

**Dockerfile:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

USER nodejs

EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

**docker-compose.yml (Development):**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://user:password@db:5432/weighttracker
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - db
      - redis
    volumes:
      - ./src:/app/src

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: weighttracker
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  worker:
    build: .
    command: node dist/worker.js
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://user:password@db:5432/weighttracker
      REDIS_HOST: redis
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
```

### 3. Kubernetes Deployment (Optional - Phase 2)

**deployment.yaml:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: weight-tracker-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: weight-tracker-api
  template:
    metadata:
      labels:
        app: weight-tracker-api
    spec:
      containers:
        - name: api
          image: weighttracker/api:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
            - name: REDIS_HOST
              value: redis-service
          resources:
            requests:
              memory: '512Mi'
              cpu: '500m'
            limits:
              memory: '2Gi'
              cpu: '2000m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### 4. CI/CD Pipeline (GitHub Actions)

**.github/workflows/deploy.yml:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: weighttracker/api:${{ github.sha }},weighttracker/api:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /app/weight-tracker
            docker-compose pull
            docker-compose up -d --no-deps --build api
            docker-compose run --rm api npx prisma migrate deploy
```

### 5. Environment Variables

**.env.example:**

```bash
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://weighttracker.com
API_URL=https://api.weighttracker.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/weighttracker
DATABASE_REPLICA_URL=postgresql://user:password@replica:5432/weighttracker

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your-32-byte-hex-encryption-key

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=weight-tracker-uploads

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@weighttracker.com

# Firebase Cloud Messaging
FCM_SERVER_KEY=your-fcm-server-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-api-key

# External Services
CLOUDFLARE_API_KEY=your-cloudflare-key
```

### 6. Deployment Checklist

**Pre-Deployment:**

- [ ] Run all tests locally
- [ ] Update database schema (migrations)
- [ ] Review environment variables
- [ ] Check for breaking API changes
- [ ] Update API documentation
- [ ] Create database backup
- [ ] Review security headers
- [ ] Check rate limiting configuration

**Deployment:**

- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Monitor error rates
- [ ] Deploy to production
- [ ] Run database migrations
- [ ] Verify health checks pass
- [ ] Check WebSocket connections
- [ ] Monitor performance metrics

**Post-Deployment:**

- [ ] Monitor error rates (< 1%)
- [ ] Check API response times
- [ ] Verify background jobs running
- [ ] Test critical user flows
- [ ] Monitor database performance
- [ ] Check cache hit rates
- [ ] Review logs for anomalies

---

## Development Workflow

### 1. Git Workflow

**Branch Strategy:**

```
main (production)
  ├── develop (staging)
  │   ├── feature/user-authentication
  │   ├── feature/team-challenges
  │   ├── bugfix/weight-entry-validation
  │   └── hotfix/security-patch
```

**Branch Naming:**

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Urgent production fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

**Commit Convention:**

```
type(scope): subject

body

footer
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Example:**

```
feat(auth): add JWT refresh token rotation

- Implement refresh token rotation for enhanced security
- Add token blacklist in Redis
- Update authentication middleware

Closes #123
```

### 2. Code Review Guidelines

**PR Template:**

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally

## Screenshots (if applicable)

## Related Issues

Closes #123
```

**Review Criteria:**

1. Code quality and readability
2. Test coverage (minimum 80% for new code)
3. Performance implications
4. Security considerations
5. Documentation completeness
6. Breaking changes clearly marked

### 3. Local Development Setup

**Prerequisites:**

- Node.js 20.x
- Docker & Docker Compose
- Git

**Setup Steps:**

```bash
# Clone repository
git clone https://github.com/yourorg/weight-tracker.git
cd weight-tracker

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your local values

# Start Docker services (PostgreSQL + Redis)
docker-compose up -d db redis

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev

# In another terminal, start worker
npm run worker:dev
```

**Development Scripts:**

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "worker:dev": "tsx watch src/worker.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

---

## Testing Strategy

### 1. Unit Tests (Jest)

**Coverage Requirements:**

- Overall: 80% minimum
- Critical paths (auth, payments): 95% minimum
- Utilities: 100% minimum

**Example Test:**

```typescript
// __tests__/services/weight-entry.service.test.ts
import { WeightEntryService } from '../../src/services/weight-entry.service';
import { prismaMock } from '../mocks/prisma';

describe('WeightEntryService', () => {
  let service: WeightEntryService;

  beforeEach(() => {
    service = new WeightEntryService();
  });

  describe('createEntry', () => {
    it('should create a weight entry successfully', async () => {
      const mockEntry = {
        id: '123',
        userId: 'user-1',
        weight: 75.5,
        recordedAt: new Date(),
      };

      prismaMock.weightEntry.create.mockResolvedValue(mockEntry);

      const result = await service.createEntry('user-1', {
        weight: 75.5,
      });

      expect(result).toEqual(mockEntry);
      expect(prismaMock.weightEntry.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          weight: 75.5,
          recordedAt: expect.any(Date),
        },
      });
    });

    it('should throw error for invalid weight', async () => {
      await expect(service.createEntry('user-1', { weight: -10 })).rejects.toThrow(
        'Weight must be positive'
      );
    });
  });
});
```

### 2. Integration Tests

```typescript
// __tests__/integration/auth.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/db/client';

describe('Authentication API', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Test1234!',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            email: 'test@example.com',
            username: 'testuser',
          },
        },
      });

      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'invalid-email',
          username: 'testuser',
          password: 'Test1234!',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

### 3. E2E Tests (Playwright)

```typescript
// e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Weight Tracking Journey', () => {
  test('complete weight tracking flow', async ({ page }) => {
    // Register
    await page.goto('/register');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Add first weight entry
    await page.click('text=Add Weight Entry');
    await page.fill('[name="weight"]', '80');
    await page.fill('[name="notes"]', 'Starting my journey!');
    await page.click('text=Save Entry');

    // Verify entry appears in list
    await expect(page.locator('text=80 kg')).toBeVisible();
    await expect(page.locator('text=Starting my journey!')).toBeVisible();

    // Check chart is displayed
    await expect(page.locator('[data-testid="weight-chart"]')).toBeVisible();
  });
});
```

### 4. Load Testing (k6)

```javascript
// load-tests/api-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% errors
  },
};

export default function () {
  const BASE_URL = 'https://api.weighttracker.com';

  // Login
  const loginRes = http.post(`${BASE_URL}/v1/auth/login`, {
    email: 'test@example.com',
    password: 'Test1234!',
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const token = loginRes.json('data.accessToken');

  // Get weight entries
  const entriesRes = http.get(`${BASE_URL}/v1/weight-entries`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(entriesRes, {
    'entries retrieved': (r) => r.status === 200,
  });

  sleep(1);
}
```

---

## Monitoring & Observability

### 1. Error Tracking (Sentry)

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1, // 10% of transactions
    profilesSampleRate: 0.1,
    integrations: [new ProfilingIntegration()],
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.['authorization'];
      }
      return event;
    },
  });
}

// Express error handler
export const sentryErrorHandler = Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capture 4xx and 5xx errors
    return error.status >= 400;
  },
});
```

### 2. Application Metrics (Prometheus)

```typescript
// lib/monitoring/metrics.ts
import client from 'prom-client';

// Create a Registry
export const register = new client.Registry();

// Default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

export const activeWebSocketConnections = new client.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections',
  registers: [register],
});

export const cacheHitRate = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
  registers: [register],
});

export const cacheMissRate = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
  registers: [register],
});

// Middleware to track metrics
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;

    httpRequestDuration.observe(
      { method: req.method, route: req.route?.path || req.path, status: res.statusCode },
      duration
    );

    httpRequestTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });
  });

  next();
};

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### 3. Logging (Winston)

```typescript
// lib/logging/logger.ts
import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'weight-tracker-api' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),

    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),

    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
};
```

### 4. Health Checks

```typescript
// routes/health.ts
import { Router } from 'express';
import { prisma } from '../lib/db/client';
import { redis } from '../lib/redis/client';

const router = Router();

// Liveness probe (is the app running?)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Readiness probe (is the app ready to serve traffic?)
router.get('/ready', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;

    // Check Redis
    await redis.client.ping();
    checks.redis = true;

    const allHealthy = Object.values(checks).every((v) => v);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ready' : 'not ready',
      checks,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      checks,
      error: error.message,
      timestamp: new Date(),
    });
  }
});

export default router;
```

### 5. Alerting Rules

**Datadog/Prometheus Alerts:**

```yaml
# alerts.yml
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: 'High error rate detected'
          description: 'Error rate is {{ $value }} errors/sec'

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High response time'
          description: 'P95 latency is {{ $value }}s'

      - alert: DatabaseConnectionPoolExhausted
        expr: db_connections_active / db_connections_max > 0.9
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: 'Database connection pool nearly exhausted'

      - alert: RedisMemoryHigh
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'Redis memory usage high'
```

---

## Risk Assessment

### Technical Risks

| Risk                                        | Impact   | Probability | Mitigation                                                         |
| ------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------ |
| Database performance degradation with scale | High     | Medium      | Implement caching, read replicas, query optimization, partitioning |
| WebSocket server becomes bottleneck         | High     | Medium      | Redis adapter for horizontal scaling, connection limits            |
| Third-party service outages (SendGrid, S3)  | Medium   | Low         | Circuit breakers, graceful degradation, alternative providers      |
| Data loss from hardware failure             | High     | Low         | Automated backups, replication, disaster recovery plan             |
| Security breach / data leak                 | Critical | Low         | Security audits, penetration testing, encryption, monitoring       |
| Redis cache failure causing cascade         | Medium   | Low         | Fallback to database, circuit breaker pattern                      |
| Rate limiting bypass                        | Medium   | Medium      | Multiple layers (API + WAF), IP blocking, CAPTCHA                  |

### Business Risks

| Risk                              | Impact | Probability | Mitigation                                           |
| --------------------------------- | ------ | ----------- | ---------------------------------------------------- |
| Low user adoption                 | High   | Medium      | Beta testing, user feedback, marketing strategy      |
| Competition from established apps | Medium | High        | Unique features (team challenges), superior UX       |
| Regulatory compliance (GDPR/CCPA) | High   | Medium      | Legal review, privacy-first design, compliance tools |
| Hosting costs exceed budget       | Medium | Medium      | Cost monitoring, optimization, auto-scaling limits   |

### Timeline Risks

| Risk                            | Impact | Probability | Mitigation                                     |
| ------------------------------- | ------ | ----------- | ---------------------------------------------- |
| Feature scope creep             | High   | High        | Strict MVP definition, phased rollout          |
| Underestimated development time | Medium | High        | Buffer time in estimates, prioritization       |
| Key developer unavailability    | Medium | Low         | Knowledge sharing, documentation, code reviews |

---

## Timeline & Milestones

### Phase 1: MVP (8-12 weeks)

**Week 1-2: Foundation**

- [ ] Project setup (repo, CI/CD, environments)
- [ ] Database schema design and migrations
- [ ] Authentication system (register, login, JWT)
- [ ] User profile management
- [ ] Basic API structure

**Week 3-4: Core Features**

- [ ] Weight entry CRUD operations
- [ ] Weight history and charts
- [ ] Team creation and management
- [ ] Team membership system
- [ ] Basic leaderboard

**Week 5-6: Social Features**

- [ ] Post creation and feed
- [ ] Comments system
- [ ] Like/unlike functionality
- [ ] Team-specific posts
- [ ] Content moderation basics

**Week 7-8: Real-time Features**

- [ ] WebSocket server setup
- [ ] Real-time messaging (1-on-1)
- [ ] Team chat
- [ ] Live notifications
- [ ] Typing indicators

**Week 9-10: Polish & Testing**

- [ ] Responsive design improvements
- [ ] Performance optimization
- [ ] Security audit
- [ ] Unit test coverage (80%+)
- [ ] Integration tests
- [ ] Load testing

**Week 11-12: Launch Preparation**

- [ ] Documentation
- [ ] Deployment to production
- [ ] Monitoring setup
- [ ] Beta user testing
- [ ] Bug fixes from beta

### Phase 2: Enhanced Features (8-12 weeks)

**Weeks 13-16:**

- [ ] Challenge system
- [ ] Achievement/badge system
- [ ] Advanced analytics
- [ ] Weekly email reports
- [ ] Group messaging

**Weeks 17-20:**

- [ ] Progressive Web App (PWA)
- [ ] Push notifications
- [ ] Image optimization
- [ ] Social sharing
- [ ] User following system

**Weeks 21-24:**

- [ ] OAuth integration (Google, Facebook)
- [ ] Advanced search
- [ ] Bookmarks and favorites
- [ ] Export data features
- [ ] Admin dashboard

### Phase 3: Mobile & Scale (12+ weeks)

**Weeks 25-32:**

- [ ] React Native mobile app
- [ ] Offline support
- [ ] Camera integration for photos
- [ ] Health app integrations (Apple Health, Google Fit)
- [ ] Wearable device sync (Fitbit, Apple Watch)

**Weeks 33-36:**

- [ ] Kubernetes migration
- [ ] Advanced caching strategies
- [ ] Database sharding
- [ ] CDN optimization
- [ ] Multi-region deployment

---

## Appendices

### A. Glossary

- **BMI**: Body Mass Index
- **CCPA**: California Consumer Privacy Act
- **CDN**: Content Delivery Network
- **GDPR**: General Data Protection Regulation
- **JWT**: JSON Web Token
- **ORM**: Object-Relational Mapping
- **PWA**: Progressive Web App
- **RBAC**: Role-Based Access Control
- **RTO**: Recovery Time Objective
- **RPO**: Recovery Point Objective
- **SSR**: Server-Side Rendering
- **SSG**: Static Site Generation
- **WebSocket**: Two-way communication protocol

### B. References

- [Astro Documentation](https://docs.astro.build)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/index.html)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

### C. Contact Information

**Project Lead:** TBD
**Technical Architect:** TBD
**DevOps Lead:** TBD
**QA Lead:** TBD

---

**Document Version:** 1.0
**Next Review Date:** TBD
**Approval Status:** Draft
