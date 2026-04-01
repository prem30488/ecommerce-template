# Redis Setup Guide

**Status:** Optional but Recommended for Performance

Redis is used for caching sales data and product lists. The app will work without it, but performance will be better with Redis enabled.

---

## ✅ Quick Setup (Choose One)

### Option 1: Docker (Easiest & Recommended)

**Prerequisite:** Docker Desktop installed

```bash
docker run -d -p 6379:6379 --name redis-cache redis:latest
```

**Verify it's running:**
```bash
docker ps | findstr redis-cache
```

**Stop when done:**
```bash
docker stop redis-cache
```

---

### Option 2: Windows (Native)

**Option 2a: Using WSL (Windows Subsystem for Linux)**
```bash
wsl
sudo service redis-server start
```

**Option 2b: Download from GitHub**
1. Go to: https://github.com/microsoftarchive/redis/releases
2. Download `Redis-x64-X.X.X.msi`
3. Run installer
4. Start Redis from Services or:
```bash
"C:\Program Files\Redis\redis-server.exe"
```

---

### Option 3: Mac

```bash
brew install redis
brew services start redis
```

---

### Option 4: Cloud (Redis Cloud)

For production, use Redis Cloud:

1. Sign up: https://redis.com/redis-cloud/
2. Create free database (30MB)
3. Get connection URL
4. Set environment variable:

```bash
# Create/update .env in backend/ folder
REDIS_URL=redis://:password@connection-url:6379
```

---

## 🚀 Start Backend with Redis

**Terminal 1:** Start Redis (if using Docker)
```bash
docker run -d -p 6379:6379 redis:latest
```

**Terminal 2:** Start Backend
```bash
cd backend
npm start
# Should show: ✅ Redis Connected Successfully
```

---

## ⚠️ Backend Without Redis

If you don't have Redis running, backend still starts:
```bash
cd backend
npm start
# Shows: ⚠️  Starting without Redis - some features like caching will be unavailable
```

**Impact:**
- ✅ All features work (products, sales, checkout, etc.)
- ✅ Sales module works (but without Redis cache)
- ⚠️  Slower response times (no caching)
- ⚠️  Every request queries the database

---

## 🔧 Verify Redis Connection

**After starting Redis, check backend logs:**

```
✅ Redis Connected Successfully
🔗 Redis connection established
```

---

## 📊 Performance Impact

| Feature | Without Redis | With Redis |
|---------|---------------|-----------|
| Load products | ~100-200ms | ~10-20ms (cached) |
| Sales data | ~50-100ms | <5ms (cached) |
| First request | Normal | Normal |
| Subsequent requests | Slow | **Fast** ✅ |

---

## 🐛 Troubleshooting

### Error: "Connection refused on port 6379"
- Redis is not running
- Check Option 1-4 above to start Redis

### Error: "Cannot connect to Docker daemon"
- Docker Desktop not running
- Start Docker Desktop application

### Error: "Port 6379 already in use"
- Another process using port 6379
- Use different port: `docker run -d -p 6380:6379 redis:latest`
- Then set: `REDIS_URL=redis://localhost:6380` in .env

---

## 📝 Environment Variable (.env)

**Create file:** `backend/.env`

```
# Redis configuration
REDIS_URL=redis://localhost:6379

# Or for Redis Cloud
REDIS_URL=redis://:myPassword@redis-12345.c123.us-east-1-2.ec2.cloud.redislabs.com:12345

# Other configs
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
PORT=3000
NODE_ENV=development
```

---

## ✨ Summary

- **Want caching?** Start Redis (Option 1-4)
- **Don't want Redis?** Just start backend - it works fine without it
- **Production?** Use Redis Cloud (Option 4) + environment variable

Redis is **optional** - the app will run either way! 🎉
