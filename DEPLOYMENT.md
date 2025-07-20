# 🚀 Heroku Deployment Guide

## Current Status
Your Heroku app `jdw-leetcode-discord-bot` is already set up with PostgreSQL and basic configuration.

## 🔧 Required Updates

### 1. Get New Discord Server Information
- **Enable Developer Mode** in Discord (User Settings → Advanced → Developer Mode)
- **Get Guild ID**: Right-click your new Discord server → Copy Server ID
- **Get Channel ID**: Right-click the channel where you want weekly updates → Copy Channel ID

### 2. Update Heroku Environment Variables

Run these commands (replace with your actual IDs):

```bash
# Update to your new Discord server
heroku config:set GUILD_ID=your_new_guild_id -a jdw-leetcode-discord-bot
heroku config:set CHANNEL_ID=your_new_channel_id -a jdw-leetcode-discord-bot

# Update LeetCode backend URL (replace with your deployed backend)
heroku config:set LEETCODE_API_URL=your_deployed_backend_url -a jdw-leetcode-discord-bot

# Set production environment
heroku config:set NODE_ENV=production -a jdw-leetcode-discord-bot
```

### 3. Deploy Updated Code

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Update for new Discord server and add admin commands"

# Deploy to Heroku
git push heroku main

# Start the dyno
heroku ps:scale web=1 -a jdw-leetcode-discord-bot
```

### 4. Register Commands on New Server

After deployment, register the slash commands on your new Discord server:

```bash
# Register commands locally (will use your .env file)
node register-commands.js

# Or register directly on Heroku
heroku run node register-commands.js -a jdw-leetcode-discord-bot
```

## 🔍 Verification Steps

### 1. Check Bot Status
```bash
heroku logs --tail -a jdw-leetcode-discord-bot
```

### 2. Test Commands
- Try `/register` in your new Discord server
- Try `/testupdate` (admin only)
- Try `/admin-unregister @user` (admin only)

### 3. Check Environment Variables
```bash
heroku config -a jdw-leetcode-discord-bot
```

## 🛠️ Troubleshooting

### Bot Not Responding
1. Check if the bot is online in Discord
2. Verify bot has proper permissions in the new server
3. Check Heroku logs: `heroku logs --tail -a jdw-leetcode-discord-bot`

### Commands Not Showing
1. Run command registration: `node register-commands.js`
2. Check if bot has "Use Slash Commands" permission
3. Verify GUILD_ID is correct

### Weekly Updates Not Sending
1. Check CHANNEL_ID is correct
2. Verify bot has "Send Messages" permission in the channel
3. Check Heroku logs for errors

## 📋 Required Bot Permissions

Make sure your bot has these permissions in the new Discord server:
- ✅ Send Messages
- ✅ Use Slash Commands
- ✅ Read Message History
- ✅ Mention Everyone (for weekly updates)

## 🔗 Useful Commands

```bash
# View logs
heroku logs --tail -a jdw-leetcode-discord-bot

# Check app status
heroku ps -a jdw-leetcode-discord-bot

# Restart the app
heroku restart -a jdw-leetcode-discord-bot

# Open Heroku dashboard
heroku open -a jdw-leetcode-discord-bot
```

## 🎯 Next Steps

1. Update your `.env` file with the new Discord server information
2. Run the Heroku config commands above
3. Deploy the updated code
4. Register commands on the new server
5. Test all functionality

Your bot will then be running 24/7 on Heroku with the new Discord server! 🎉 