# LeetCode Discord Bot

A Discord bot that integrates with the LeetCode backend to track user progress and send weekly updates. **Deployed on Heroku for 24/7 uptime.**

![Bot in Action](docs/images/LeetcodeExample.png)

*Screenshot showing the bot's weekly update feature in action*

## Features

- 🤖 **Discord Integration**: Slash commands for user registration and management
- 📊 **Weekly Updates**: Automated weekly progress reports with rankings
- 🗄️ **PostgreSQL Database**: User registration and statistics storage
- 🔄 **Backend Integration**: Connects to the LeetCode API backend
- ⏰ **Scheduled Updates**: Cron-based weekly update scheduling

## Commands

### `/register <name> <leetcode_username>`
Register your LeetCode username for weekly tracking. The name will be displayed in weekly updates.

### `/profile`
View your current registration and recent activity.

### `/unregister`
Remove your registration from the tracking system.

### `/testupdate` (Admin only)
Trigger a test weekly update for testing purposes.

### `/admin-unregister` (Admin only)
Delete unwanted users from the database.

## Setup

### Prerequisites

1. **Discord Bot Token**: Create a Discord application and bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. **LeetCode Backend**: Ensure the LeetCode backend is running on `http://localhost:3000` or host
3. **PostgreSQL Database**: Local PostgreSQL installation or hosted Postgres DB
4. **Node.js**: Version 14 or higher

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   Create a `.env` file in the root directory:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   GUILD_ID=your_discord_server_id
   CHANNEL_ID=your_discord_channel_id
   LEETCODE_API_URL=http://localhost:3000/api
   DATABASE_URL=postgresql://username:password@localhost:xxxx/leetcode_bot
   WEEKLY_UPDATE_CRON=0 9 * * 1
   UPDATE_TIMEZONE=America/New_York
   ```

3. **Start the bot**:
   ```bash
   npm start
   ```

### Discord Bot Setup

1. **Create Discord Application**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the "Bot" section and create a bot
   - Copy the bot token

2. **Invite Bot to Server**:
   - Go to OAuth2 > URL Generator
   - Select "bot" scope
   - Select permissions: Send Messages, Use Slash Commands, Read Message History
   - Use the generated URL to invite the bot

3. **Get Server and Channel IDs**:
   - Enable Developer Mode in Discord
   - Right-click on your server and channel to copy IDs

## Weekly Update Format

The bot sends weekly updates with:
- 🏆 **Weekly Rankings**: Users ranked by problems solved
- 📈 **Summary**: Total problems solved and active users
- 🥇 **Medals**: Gold, silver, bronze for top 3 users

## Development
```
leetcodeDiscordBot/
├── .gitignore              # Git ignore rules
├── config.js               # Bot configuration
├── package.json            # Dependencies and scripts
├── package-lock.json       # Locked dependencies
├── README.md               # Documentation
├── test-bot.js             # Test script
└── src/
    ├── index.js            # Main Discord bot
    ├── commands/           # Discord slash commands
    │   ├── register.js
    │   ├── profile.js
    │   ├── unregister.js
    │   └── testupdate.js
    └── services/           # Business logic
        ├── database.js     # Postgres database operations
        ├── leetcodeService.js # LeetCode API integration
        └── weeklyUpdate.js # Weekly update logic
```

## Troubleshooting

### Common Issues

1. **Bot not responding**: Check if the bot token is correct and has proper permissions
2. **Commands not showing**: Ensure the bot has been invited with correct scopes
3. **Weekly updates not sending**: Check the channel ID and bot permissions
4. **Database errors**: Ensure the data directory exists and is writable

### Logs

The bot provides detailed console logs for debugging:
- User registration attempts
- LeetCode API calls
- Weekly update processing
- Database operations