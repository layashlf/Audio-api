# Core System Logic (Pseudo-Code)

This document outlines the algorithmic logic for the four main components of the Audio-API backend.

---

## 1. Authentication (Token Rotation Strategy)

We use a **Refresh Token Rotation** strategy to ensure security. Every time a token is refreshed, the old one is invalidated (revoked), and a new pair is issued.

```typescript
// LOGIN
function login(email, password) {
  const user = db.users.findByEmail(email);
  if (!bcrypt.compare(password, user.passwordHash)) {
    throw new UnauthorizedError();
  }

  return generateTokenPair(user);
}

// TOKEN GENERATION & STORAGE
function generateTokenPair(user) {
  const accessToken = jwt.sign({ sub: user.id }, { expiresIn: '15m' });
  const refreshToken = crypto.randomUUID(); // Opaque string
  
  // Store only the HASH of the refresh token
  const tokenHash = bcrypt.hash(refreshToken);
  
  db.refreshTokens.create({
    userId: user.id,
    token: tokenHash,
    expiresAt: now() + 30_DAYS,
    isRevoked: false
  });

  return { accessToken, refreshToken };
}

// REFRESH TOKEN ROTATION
async function refreshAccessToken(incomingRefreshToken) {
  // 1. Find all active tokens for user
  // 2. Iterate and match hash (bcrypt.compare)
  const storedToken = db.refreshTokens.findMatching(incomingRefreshToken);

  if (!storedToken || storedToken.isRevoked) {
    throw new UnauthorizedError("Invalid or reused token");
  }

  // 3. Revoke the OLD token (Rotation)
  db.refreshTokens.update(storedToken.id, { isRevoked: true });

  // 4. Issue NEW pair
  return generateTokenPair(storedToken.user);
}
```

---

## 2. Dynamic Rate Limiting (Redis Sliding Window)

Limits are determined dynamically based on the user's subscription tier at runtime.

```typescript
// MIDDLEWARE
async function rateLimitMiddleware(req, next) {
  const userId = req.user.id;
  
  // 1. Get User Tier
  const user = db.users.get(userId);
  const limit = user.subscription === 'PAID' ? 100 : 20;

  // 2. Check Redis (Sliding Window Algorithm)
  const windowKey = `rate_limit:${userId}`;
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute ago

  // Redis Transaction
  redis.multi()
    .zremrangebyscore(windowKey, 0, windowStart) // Remove requests older than 1m
    .zcard(windowKey)                            // Count requests in current window
    .zadd(windowKey, now, uniqueId)              // Add current request
    .expire(windowKey, 60)
    .exec();

  const currentCount = redisResult[1];

  if (currentCount >= limit) {
    throw new TooManyRequestsError(`Limit is ${limit} req/min`);
  }

  next();
}
```

---

## 3. Audio Generation Pipeline (Cron + Queue + WebSocket)

This asynchronous flow handles long-running AI tasks without blocking the API.

```typescript
// A. CRON SCHEDULER (Runs every 30s)
function cronJob() {
  // Find prompts that are stuck in 'PENDING'
  const pendingPrompts = db.prompts.find({ status: 'PENDING' });

  for (const prompt of pendingPrompts) {
    // Prioritize PAID users
    const priority = prompt.user.subscription === 'PAID' ? 10 : 1;
    
    // Add to BullMQ
    jobQueue.add('generate-audio', { promptId: prompt.id }, { priority });
  }
}

// B. WORKER PROCESSOR
async function processAudioJob(job) {
  const { promptId } = job.data;
  const prompt = db.prompts.get(promptId);

  // 1. Update Status
  prompt.update({ status: 'PROCESSING' });

  // 2. Simulation (or real AI call)
  const audioMetadata = await AIPriorityQueue.generate(prompt.text);

  // 3. Save & Index
  const audio = db.audio.create({
    userId: prompt.userId,
    promptId: prompt.id,
    url: audioMetadata.url,
    ...audioMetadata
  });
  
  meiliSearch.index('audios').add(audio);

  // 4. Complete & Notify
  prompt.update({ status: 'COMPLETED', audioId: audio.id });
  
  // Real-time Push
  webSocketGateway.to(prompt.userId).emit('prompt-completed', audio);
}
```

---

## 4. Unified Search (Federated)

Searches multiple indexes (Users, Audio) in parallel and returns paginated results for both.

```typescript
async function unifiedSearch(query, limit, cursor) {
  // Cursor is treated as an offset integer
  const offset = parseInt(cursor || "0");

  // Run searches in parallel
  const [userResults, audioResults] = await Promise.all([
    meiliSearch.index('users').search(query, { limit, offset }),
    meiliSearch.index('audios').search(query, { limit, offset })
  ]);

  // Determine next cursors
  const nextUserCursor = userResults.length >= limit ? (offset + limit) : null;
  const nextAudioCursor = audioResults.length >= limit ? (offset + limit) : null;

  return {
    users: {
      data: userResults.hits,
      meta: { next_cursor: nextUserCursor }
    },
    audio: {
      data: audioResults.hits,
      meta: { next_cursor: nextAudioCursor }
    }
  };
}
```
