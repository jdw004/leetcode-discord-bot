# 🚀 Combined Discord Bot + API Deployment Guide

Your Discord bot and LeetCode API are now **combined into a single Heroku app**!

## 🏗️ **Architecture**

```
jdw-leetcode-discord-bot.herokuapp.com/
├── /api/*          → LeetCode API endpoints
├── /health         → Health check
└── Discord Bot     → Runs in background
```

## ✅ **What's Combined**

- ✅ **Discord Bot**: Handles slash commands and weekly updates
- ✅ **LeetCode API**: Provides mock data for testing
- ✅ **PostgreSQL Database**: Stores user registrations
- ✅ **Single Deployment**: Everything on one Heroku app

## 🚀 **Deployment Steps**

### **1. Update Environment Variables**

```bash
# Update to your new Discord server
heroku config:set GUILD_ID=your_new_guild_id -a jdw-leetcode-discord-bot
heroku config:set CHANNEL_ID=your_new_channel_id -a jdw-leetcode-discord-bot

# Set the API URL to use the same app
heroku config:set LEETCODE_API_URL=https://jdw-leetcode-discord-bot.herokuapp.com/api -a jdw-leetcode-discord-bot

# Set production environment
heroku config:set NODE_ENV=production -a jdw-leetcode-discord-bot
```

### **2. Deploy the Combined App**

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Combine Discord bot with LeetCode API"

# Deploy to Heroku
git push heroku main

# Start the dyno
heroku ps:scale web=1 -a jdw-leetcode-discord-bot
```

### **3. Test the Deployment**

```bash
# Check health endpoint
curl https://jdw-leetcode-discord-bot.herokuapp.com/health

# Test API endpoint
curl https://jdw-leetcode-discord-bot.herokuapp.com/api/recent-problems/jdw004

# Check logs
heroku logs --tail -a jdw-leetcode-discord-bot
```

## 📋 **API Endpoints**

Your combined app now provides these endpoints:

- `GET /health` - Health check
- `GET /api/recent-problems/:username` - Get recent problems
- `GET /api/user/:username` - Get user profile
- `GET /api/stats/:username` - Get user statistics

## 🔧 **Benefits of Combined Deployment**

✅ **Single Heroku app** - Easier management  
✅ **Shared environment variables** - No duplication  
✅ **Cost effective** - Only one dyno  
✅ **Simplified deployment** - One codebase  
✅ **Consistent data** - Same API for bot and external use  

## 🎯 **Next Steps**

1. **Update your Discord server info** in Heroku config
2. **Deploy the combined app**
3. **Register commands** on your new Discord server
4. **Test all functionality**

## 🔍 **Verification**

After deployment, test:

1. **API Health**: `curl https://jdw-leetcode-discord-bot.herokuapp.com/health`
2. **Discord Commands**: Try `/register` in your Discord server
3. **Weekly Updates**: Use `/testupdate` (admin only)
4. **Admin Commands**: Try `/admin-unregister @user` (admin only)

Your bot will now use the **same Heroku app** for both the Discord bot and the LeetCode API! 🎉 