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

## Setup

### Prerequisites

1. **Discord Bot Token**: Create a Discord application and bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. **LeetCode Backend**: Ensure the LeetCode backend is running on `http://localhost:3000`
3. **PostgreSQL Database**: Local PostgreSQL installation or Heroku Postgres addon
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
   DATABASE_URL=postgresql://username:password@localhost:5432/leetcode_bot
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

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Discord bot token | Required |
| `CLIENT_ID` | Discord application client ID | Required |
| `GUILD_ID` | Discord server ID | Required |
| `CHANNEL_ID` | Discord channel for weekly updates | Required |
| `LEETCODE_API_URL` | LeetCode backend API URL | `http://localhost:3000/api` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost:5432/leetcode_bot` |
| `WEEKLY_UPDATE_CRON` | Cron schedule for weekly updates | `0 9 * * 1` |
| `UPDATE_TIMEZONE` | Timezone for updates | `America/New_York` |

### Weekly Update Schedule

The bot sends weekly updates every Monday at 9 AM by default. You can customize this using the `WEEKLY_UPDATE_CRON` environment variable.

Examples:
- `0 9 * * 1` - Every Monday at 9 AM
- `0 18 * * 5` - Every Friday at 6 PM
- `0 12 * * 0` - Every Sunday at 12 PM

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  discord_username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  leetcode_username TEXT UNIQUE NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);
```

### Weekly Stats Table
```sql
CREATE TABLE weekly_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  week_start DATE NOT NULL,
  problems_solved INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE(user_id, week_start)
);
```

## Weekly Update Format

The bot sends weekly updates with:
- 🏆 **Weekly Rankings**: Users ranked by problems solved
- 📈 **Summary**: Total problems solved and active users
- 🥇 **Medals**: Gold, silver, bronze for top 3 users

## Heroku Deployment

### Setup for Heroku

1. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL Addon**:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set DISCORD_TOKEN=your_discord_bot_token
   heroku config:set CLIENT_ID=your_discord_client_id
   heroku config:set GUILD_ID=your_discord_server_id
   heroku config:set CHANNEL_ID=your_discord_channel_id
   heroku config:set LEETCODE_API_URL=your_leetcode_backend_url
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

5. **Start the Dyno**:
   ```bash
   heroku ps:scale web=1
   ```

The `DATABASE_URL` will be automatically set by Heroku when you add the PostgreSQL addon.

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
        ├── database.js     # SQLite database operations
        ├── leetcodeService.js # LeetCode API integration
        └── weeklyUpdate.js # Weekly update logic
```

### Adding New Commands

1. Create a new file in `src/commands/`
2. Export an object with `data` (SlashCommandBuilder) and `execute` function
3. The bot will automatically load the command

## Troubleshooting

### Common Issues

1. **Bot not responding**: Check if the bot token is correct and has proper permissions
2. **Commands not showing**: Ensure the bot has been invited with proper scopes
3. **Weekly updates not sending**: Check the channel ID and bot permissions
4. **Database errors**: Ensure the data directory exists and is writable

### Logs

The bot provides detailed console logs for debugging:
- User registration attempts
- LeetCode API calls
- Weekly update processing
- Database operations

## License

MIT License - feel free to use and modify as needed. 