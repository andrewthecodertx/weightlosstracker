I'll help you build a comprehensive weight loss tracking app with team features! Let me suggest some framework options that would work well for this project.

## Frontend Framework Options

### **React + Next.js** (Recommended)
- **Pros**: Excellent for complex, interactive UIs with real-time updates. Next.js adds SSR/SSG for better SEO and performance. Huge ecosystem for charting libraries (Recharts, Chart.js, Victory)
- **Best for**: If you want a modern, scalable app with excellent performance
- **Learning curve**: Moderate

### **Vue.js + Nuxt**
- **Pros**: Gentle learning curve, great documentation, built-in state management with Vuex
- **Best for**: If you prefer a more opinionated, batteries-included framework
- **Learning curve**: Easy to moderate

### **SvelteKit**
- **Pros**: Compile-time optimizations, smaller bundle sizes, built-in animations perfect for charts
- **Best for**: If performance is critical and you want cutting-edge technology
- **Learning curve**: Moderate

## Backend Framework Options

### **Node.js + Express + PostgreSQL** (Recommended)
```javascript
// Example structure
├── server/
│   ├── models/        // User, Team, WeightEntry, Challenge
│   ├── routes/        // API endpoints
│   ├── middleware/    // Auth, validation
│   └── services/      // Business logic
```

### **Django + Django REST Framework**
- **Pros**: Batteries-included, excellent admin panel, robust ORM, built-in user authentication
- **Best for**: Rapid development with comprehensive features out of the box
- **Database**: PostgreSQL or MySQL

### **Laravel (PHP)**
- **Pros**: Elegant syntax, excellent ORM (Eloquent), built-in authentication scaffolding
- **Best for**: If you're comfortable with PHP and want a mature ecosystem

## Database Options

### **PostgreSQL** (Recommended)
- Excellent for relational data (users → teams → challenges)
- JSONB support for flexible data storage
- Great for analytics queries

### **MongoDB**
- Good for flexible schema if requirements change frequently
- Easier to store varied workout/meal data

## Essential Tech Stack Components

### **Authentication**
- **Auth0** or **Clerk**: Managed authentication with social logins
- **Supabase Auth**: If using Supabase as your backend
- **NextAuth.js**: If using Next.js

### **Real-time Updates**
- **Socket.io**: For live team updates and challenges
- **Pusher** or **Ably**: Managed WebSocket services

### **Charting Libraries**
- **Recharts**: React-based, responsive charts
- **Chart.js**: Framework-agnostic, extensive chart types
- **D3.js**: For custom, complex visualizations

### **File Storage** (for profile pics, progress photos)
- **AWS S3** or **Cloudinary**
- **Supabase Storage**: If using Supabase

## Recommended Full Stack Combinations

### **Option 1: Modern JavaScript Stack** ⭐
```
Frontend: Next.js 14+ (React)
Backend: Node.js + Express + Prisma ORM
Database: PostgreSQL
Auth: NextAuth.js or Clerk
Charts: Recharts + Tremor
Hosting: Vercel (frontend) + Railway/Render (backend)
```

### **Option 2: Full-Stack Framework**
```
Framework: T3 Stack (Next.js + TypeScript + Prisma + tRPC)
Database: PostgreSQL via Supabase
Auth: Clerk or NextAuth
Charts: Recharts
Hosting: Vercel
```

### **Option 3: Rapid Development**
```
Frontend: Vue 3 + Nuxt 3
Backend: Supabase (BaaS) or PocketBase
Database: PostgreSQL (via Supabase)
Charts: Chart.js
Hosting: Netlify/Vercel
```

## Key Features to Plan For

```typescript
// Example data models to consider
interface User {
  id: string;
  email: string;
  profile: UserProfile;
  currentWeight: number;
  goalWeight: number;
  team?: Team;
  weightEntries: WeightEntry[];
}

interface Team {
  id: string;
  name: string;
  members: User[];
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
}

interface WeightEntry {
  id: string;
  userId: string;
  weight: number;
  date: Date;
  notes?: string;
  photos?: string[];
}

interface Challenge {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  teams: Team[];
  goalType: 'percentage' | 'total_pounds' | 'consistency';
}
```

## Architecture Considerations

1. **API Design**: RESTful or GraphQL for complex data relationships
2. **State Management**: Redux Toolkit, Zustand, or Pinia depending on framework
3. **Caching**: Redis for leaderboard data and frequently accessed stats
4. **Background Jobs**: Bull/BullMQ for sending notifications, calculating stats
5. **Testing**: Jest + React Testing Library, Cypress for E2E

## Project Architecture

```
weight-tracker/
├── src/
│   ├── pages/                 # Astro pages (SSG/SSR)
│   │   ├── index.astro        # Landing page
│   │   ├── dashboard.astro    # User dashboard
│   │   ├── teams/
│   │   │   ├── [teamId].astro
│   │   │   └── create.astro
│   │   ├── posts/
│   │   │   ├── index.astro
│   │   │   └── [postId].astro
│   │   └── api/               # API endpoints
│   │       ├── auth/
│   │       ├── posts/
│   │       ├── messages/
│   │       └── weight/
│   ├── components/
│   │   ├── astro/            # Static Astro components
│   │   ├── react/            # Interactive React islands
│   │   ├── vue/              # Vue components if needed
│   │   └── svelte/           # Svelte for animations
│   ├── layouts/
│   ├── lib/                  # Utilities and configs
│   │   ├── db/
│   │   ├── redis/
│   │   └── websocket/
│   └── middleware/
```

## Database Schema (PostgreSQL)

```sql
-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    bio TEXT,
    privacy_settings JSONB DEFAULT '{"profile": "public", "weight": "team", "posts": "public"}'::jsonb
);

-- User Profiles with Weight Data
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    current_weight DECIMAL(5,2),
    goal_weight DECIMAL(5,2),
    height DECIMAL(5,2), -- in cm
    activity_level VARCHAR(20), -- sedentary, light, moderate, active, very_active
    date_of_birth DATE,
    gender VARCHAR(20),
    preferred_units VARCHAR(10) DEFAULT 'metric', -- metric or imperial
    UNIQUE(user_id)
);

-- Weight Entries for Tracking
CREATE TABLE weight_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL,
    body_fat_percentage DECIMAL(4,2),
    muscle_mass DECIMAL(5,2),
    water_percentage DECIMAL(4,2),
    notes TEXT,
    photo_urls TEXT[], -- Array of photo URLs
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_weight_entries_user_date (user_id, recorded_at DESC)
);

-- Teams for Group Competition
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES users(id),
    is_public BOOLEAN DEFAULT TRUE,
    join_code VARCHAR(10) UNIQUE,
    max_members INTEGER DEFAULT 50,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Memberships
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- admin, moderator, member
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    weight_loss_goal DECIMAL(5,2), -- individual goal within team
    starting_weight DECIMAL(5,2),
    UNIQUE(team_id, user_id)
);

-- Posts (Public and Team)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE, -- NULL for public posts
    title VARCHAR(255),
    content TEXT NOT NULL,
    post_type VARCHAR(20) DEFAULT 'update', -- update, milestone, tip, question, recipe, workout
    visibility VARCHAR(20) DEFAULT 'public', -- public, team, private
    media_urls TEXT[],
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_posts_visibility (visibility, created_at DESC),
    INDEX idx_posts_team (team_id, created_at DESC)
);

-- Comments on Posts
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- for nested comments
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_comments_post (post_id, created_at)
);

-- Messaging System
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_group BOOLEAN DEFAULT FALSE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE, -- for team group chats
    name VARCHAR(100), -- for group conversations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMP,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, weight_update, achievement
    metadata JSONB, -- for special message types
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_messages_conversation (conversation_id, created_at DESC)
);

-- Challenges and Competitions
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(30), -- weight_loss_percentage, total_weight, consistency, activity
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    target_value DECIMAL(10,2), -- depends on challenge type
    reward_points INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_challenges_active (team_id, start_date, end_date)
);

-- Challenge Participation
CREATE TABLE challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    starting_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    target_value DECIMAL(10,2),
    completed BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(challenge_id, user_id)
);

-- Achievements/Badges System
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    points INTEGER DEFAULT 0,
    criteria_type VARCHAR(50), -- weight_loss, consistency, social, challenge_completion
    criteria_value JSONB,
    UNIQUE(name)
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);
```

## Redis Caching Strategy

```javascript
// lib/redis/cache-keys.js
/**
 * Redis caching strategy for the weight loss tracker app
 * Uses a consistent key naming pattern for easy management
 */

export const CacheKeys = {
  // User-related caches
  userProfile: (userId) => `user:profile:${userId}`, // TTL: 1 hour
  userStats: (userId) => `user:stats:${userId}`, // TTL: 15 minutes
  userRecentWeight: (userId) => `user:weight:recent:${userId}`, // TTL: 5 minutes
  
  // Team leaderboards and stats
  teamLeaderboard: (teamId) => `team:leaderboard:${teamId}`, // TTL: 5 minutes
  teamStats: (teamId) => `team:stats:${teamId}`, // TTL: 10 minutes
  teamMembers: (teamId) => `team:members:${teamId}`, // TTL: 30 minutes
  
  // Feed and posts
  publicFeed: (page) => `feed:public:page:${page}`, // TTL: 2 minutes
  teamFeed: (teamId, page) => `feed:team:${teamId}:page:${page}`, // TTL: 2 minutes
  postDetails: (postId) => `post:${postId}`, // TTL: 10 minutes
  postComments: (postId, page) => `post:${postId}:comments:${page}`, // TTL: 5 minutes
  
  // Real-time messaging
  unreadCount: (userId) => `messages:unread:${userId}`, // TTL: 30 seconds
  conversationList: (userId) => `conversations:user:${userId}`, // TTL: 1 minute
  
  // Challenge data
  challengeLeaderboard: (challengeId) => `challenge:leaderboard:${challengeId}`, // TTL: 5 minutes
  activeChallenge: (teamId) => `challenge:active:${teamId}`, // TTL: 10 minutes
  
  // Analytics and charts
  weightProgress: (userId, days) => `analytics:weight:${userId}:${days}days`, // TTL: 1 hour
  teamProgress: (teamId) => `analytics:team:${teamId}`, // TTL: 30 minutes
};

// lib/redis/client.js
import Redis from 'ioredis';

class RedisCache {
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
    
    this.subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
    });
    
    this.publisher = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
    });
  }

  /**
   * Get cached data with automatic JSON parsing
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Parsed data or null if not found
   */
  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cache with automatic JSON stringification
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  async set(key, value, ttl = 300) {
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
    }
  }

  /**
   * Invalidate cache entries by pattern
   * @param {string} pattern - Pattern to match keys
   */
  async invalidatePattern(pattern) {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }
}

export const redis = new RedisCache();
```

## Messaging System with WebSockets

```javascript
// lib/websocket/socket-server.js
import { Server } from 'socket.io';
import { redis } from '../redis/client.js';
import jwt from 'jsonwebtoken';

/**
 * WebSocket server for real-time messaging and updates
 * Handles direct messages, team chats, and live updates
 */
export class SocketServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
      },
    });
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        
        // Join user's personal room for direct notifications
        socket.join(`user:${socket.userId}`);
        
        // Get user's teams and join team rooms
        const teams = await this.getUserTeams(socket.userId);
        teams.forEach(teamId => {
          socket.join(`team:${teamId}`);
        });
        
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Handle joining conversation rooms
      socket.on('join:conversation', async (conversationId) => {
        // Verify user is participant
        const isParticipant = await this.verifyConversationAccess(
          socket.userId, 
          conversationId
        );
        
        if (isParticipant) {
          socket.join(`conversation:${conversationId}`);
          
          // Mark messages as read
          await this.markMessagesAsRead(socket.userId, conversationId);
          
          // Notify other participants about read status
          socket.to(`conversation:${conversationId}`).emit('messages:read', {
            userId: socket.userId,
            conversationId,
            timestamp: new Date(),
          });
        }
      });
      
      // Handle sending messages
      socket.on('message:send', async (data) => {
        const { conversationId, content, messageType = 'text' } = data;
        
        // Verify access
        if (!await this.verifyConversationAccess(socket.userId, conversationId)) {
          return socket.emit('error', { message: 'Access denied' });
        }
        
        // Save message to database
        const message = await this.saveMessage({
          conversationId,
          senderId: socket.userId,
          content,
          messageType,
        });
        
        // Emit to all conversation participants
        this.io.to(`conversation:${conversationId}`).emit('message:new', message);
        
        // Update unread counts for other participants
        await this.updateUnreadCounts(conversationId, socket.userId);
        
        // Send push notifications to offline users
        await this.sendPushNotifications(conversationId, socket.userId, content);
      });
      
      // Handle typing indicators
      socket.on('typing:start', ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit('typing:update', {
          userId: socket.userId,
          isTyping: true,
        });
      });
      
      socket.on('typing:stop', ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit('typing:update', {
          userId: socket.userId,
          isTyping: false,
        });
      });
      
      // Handle weight updates broadcast to team
      socket.on('weight:update', async (data) => {
        const { weight, teamId } = data;
        
        // Broadcast to team members
        socket.to(`team:${teamId}`).emit('team:weight-update', {
          userId: socket.userId,
          weight,
          timestamp: new Date(),
        });
        
        // Invalidate team leaderboard cache
        await redis.invalidatePattern(`team:leaderboard:${teamId}*`);
      });
      
      // Handle post interactions
      socket.on('post:like', async ({ postId }) => {
        // Broadcast to users viewing the post
        socket.to(`post:${postId}`).emit('post:liked', {
          postId,
          userId: socket.userId,
        });
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        // Clean up any temporary data
      });
    });
  }
  
  // Helper methods (would be implemented with actual database queries)
  async getUserTeams(userId) {
    // Query database for user's teams
    return [];
  }
  
  async verifyConversationAccess(userId, conversationId) {
    // Verify user is participant in conversation
    return true;
  }
  
  async markMessagesAsRead(userId, conversationId) {
    // Update last_read_at in conversation_participants
  }
  
  async saveMessage(messageData) {
    // Save to database and return formatted message
    return messageData;
  }
  
  async updateUnreadCounts(conversationId, senderId) {
    // Update Redis cache for unread counts
  }
  
  async sendPushNotifications(conversationId, senderId, content) {
    // Send push notifications via service like Firebase or OneSignal
  }
}
```

## Astro Components Structure

```astro
---
// src/pages/dashboard.astro
import Layout from '../layouts/Layout.astro';
import WeightChart from '../components/react/WeightChart';
import TeamLeaderboard from '../components/react/TeamLeaderboard';
import PostFeed from '../components/react/PostFeed';
import MessageNotifications from '../components/react/MessageNotifications';
import { getUserData, getTeamData } from '../lib/api';

// This runs on the server
const user = await getUserData(Astro.cookies.get('token'));
const team = await getTeamData(user.teamId);
---

<Layout title="Dashboard">
  <div class="dashboard-grid">
    <!-- Static content rendered on server -->
    <section class="user-stats">
      <h2>Your Progress</h2>
      <div class="stat-cards">
        <div class="stat-card">
          <span class="label">Current Weight</span>
          <span class="value">{user.currentWeight} kg</span>
        </div>
        <div class="stat-card">
          <span class="label">Goal Weight</span>
          <span class="value">{user.goalWeight} kg</span>
        </div>
        <div class="stat-card">
          <span class="label">Progress</span>
          <span class="value">{user.progressPercentage}%</span>
        </div>
      </div>
    </section>

    <!-- Interactive React component for real-time chart -->
    <section class="weight-chart">
      <WeightChart 
        userId={user.id} 
        client:load 
        initialData={user.weightHistory}
      />
    </section>

    <!-- Team leaderboard with real-time updates -->
    <section class="team-section">
      <TeamLeaderboard 
        teamId={team.id} 
        client:visible 
        initialData={team.leaderboard}
      />
    </section>

    <!-- Post feed with infinite scroll -->
    <section class="feed-section">
      <PostFeed 
        userId={user.id}
        teamId={team.id}
        client:idle
      />
    </section>

    <!-- Message notifications with WebSocket connection -->
    <MessageNotifications 
      userId={user.id}
      client:only="react"
    />
  </div>
</Layout>

<style>
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: 2rem;
    padding: 2rem;
  }
  
  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

```jsx
// src/components/react/MessageNotifications.jsx
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

/**
 * Real-time message notifications component
 * Connects to WebSocket server for live updates
 */
export default function MessageNotifications({ userId }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    const socketInstance = io(import.meta.env.PUBLIC_WS_URL, {
      auth: {
        token: localStorage.getItem('authToken'),
      },
    });

    socketInstance.on('connect', () => {
      console.log('Connected to message server');
    });

    socketInstance.on('message:new', (message) => {
      // Add new message to recent messages
      setRecentMessages(prev => [message, ...prev].slice(0, 5));
      
      // Increment unread count if panel is closed
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('New Message', {
          body: `${message.senderName}: ${message.content}`,
          icon: '/icon.png',
        });
      }
    });

    socketInstance.on('messages:read', ({ conversationId }) => {
      // Update read status for messages in that conversation
      setRecentMessages(prev => 
        prev.map(msg => 
          msg.conversationId === conversationId 
            ? { ...msg, read: true }
            : msg
        )
      );
    });

    setSocket(socketInstance);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  const handleOpenPanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      // Mark messages as read
      recentMessages.forEach(msg => {
        if (!msg.read) {
          socket?.emit('message:read', { 
            conversationId: msg.conversationId 
          });
        }
      });
    }
  };

  return (
    <div className="message-notifications">
      <button 
        className="notification-trigger"
        onClick={handleOpenPanel}
        aria-label="Messages"
      >
        <svg className="icon" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="panel-header">
            <h3>Messages</h3>
            <a href="/messages" className="view-all">View All</a>
          </div>
          
          <div className="message-list">
            {recentMessages.length === 0 ? (
              <p className="empty-state">No new messages</p>
            ) : (
              recentMessages.map(message => (
                <a 
                  key={message.id}
                  href={`/messages/${message.conversationId}`}
                  className={`message-item ${!message.read ? 'unread' : ''}`}
                >
                  <img 
                    src={message.senderAvatar || '/default-avatar.png'} 
                    alt={message.senderName}
                    className="avatar"
                  />
                  <div className="message-content">
                    <div className="sender">{message.senderName}</div>
                    <div className="preview">{message.content}</div>
                    <div className="time">
                      {formatRelativeTime(message.createdAt)}
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;
  
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
```

## API Structure Example

```javascript
// src/pages/api/posts/create.js
import { db } from '../../../lib/db';
import { redis } from '../../../lib/redis/client';
import { authenticate } from '../../../lib/auth';

/**
 * Create a new post
 * POST /api/posts/create
 */
export async function POST({ request, cookies }) {
  try {
    // Authenticate user
    const user = await authenticate(cookies.get('token'));
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // Parse request body
    const { title, content, postType, visibility, teamId, tags, mediaUrls } = 
      await request.json();

    // Validate input
    if (!content || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
      });
    }

    // Verify team membership if posting to team
    if (teamId) {
      const isMember = await db.query(
        'SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2',
        [teamId, user.id]
      );
      
      if (!isMember.rows.length) {
        return new Response(JSON.stringify({ error: 'Not a team member' }), {
          status: 403,
        });
      }
    }

    // Create post in database
    const post = await db.query(`
      INSERT INTO posts (
        author_id, team_id, title, content, post_type, 
        visibility, media_urls, tags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      user.id, teamId, title, content, postType, 
      visibility, mediaUrls, tags
    ]);

    // Invalidate relevant caches
    await redis.invalidatePattern('feed:*');
    if (teamId) {
      await redis.invalidatePattern(`feed:team:${teamId}:*`);
    }

    // Trigger notifications for mentions
    const mentions = extractMentions(content);
    if (mentions.length > 0) {
      await sendMentionNotifications(mentions, post.rows[0]);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      post: post.rows[0] 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating post:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create post' 
    }), {
      status: 500,
    });
  }
}

function extractMentions(content) {
  const mentionPattern = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionPattern.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}

async function sendMentionNotifications(usernames, post) {
  // Implementation for sending notifications
  // Could use WebSocket, push notifications, or email
}
```

This architecture gives you:

1. **Astro's Performance**: Server-side rendering with selective hydration for interactive components
2. **Framework Flexibility**: Use React for complex interactions, Vue for forms, Svelte for animations
3. **Real-time Features**: WebSocket integration for messaging and live updates
4. **Efficient Caching**: Redis for frequently accessed data and leaderboards
5. **Comprehensive Features**: Posts (public/team), messaging, challenges, achievements
6. **Scalable Database**: Well-indexed PostgreSQL schema with JSONB for flexible data

Would you like me to elaborate on any specific part of the implementation, such as the authentication system, chart components, or the mobile app considerations?
