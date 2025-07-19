const cron = require('node-cron');
const moment = require('moment');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config');
const database = require('./database');
const leetcodeService = require('./leetcodeService');

class WeeklyUpdate {
  constructor() {
    this.isRunning = false;
  }

  start(client) {
    console.log(`📅 Scheduling weekly updates with cron: ${config.WEEKLY_UPDATE_CRON}`);
    
    cron.schedule(config.WEEKLY_UPDATE_CRON, async () => {
      await this.sendWeeklyUpdate(client);
    }, {
      timezone: config.UPDATE_TIMEZONE
    });

    // Also run immediately for testing
    // this.sendWeeklyUpdate(client);
  }

  async sendWeeklyUpdate(client) {
    if (this.isRunning) {
      console.log('Weekly update already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('🔄 Starting weekly update...');

    try {
      const channel = client.channels.cache.get(config.CHANNEL_ID);
      if (!channel) {
        console.error('❌ Could not find Discord channel');
        return;
      }

      const users = await database.getAllActiveUsers();
      if (users.length === 0) {
        console.log('📭 No active users found for weekly update');
        return;
      }

      console.log(`📊 Processing ${users.length} users for weekly update`);

      const weekStart = moment().startOf('week').format('YYYY-MM-DD');
      const weekEnd = moment().endOf('week').format('YYYY-MM-DD');
      
      const userStats = [];
      let totalProblems = 0;

      // Process each user
      for (const user of users) {
        try {
          console.log(`📈 Processing user: ${user.discord_username} (${user.leetcode_username})`);
          
          const result = await leetcodeService.getRecentProblems(user.leetcode_username, 7);
          
          if (result.success) {
            const problemsSolved = result.count;
            totalProblems += problemsSolved;
            
            userStats.push({
              discordUsername: user.discord_username,
              leetcodeUsername: user.leetcode_username,
              problemsSolved: problemsSolved,
              problems: result.problems
            });

            // Save weekly stats to database
            await database.saveWeeklyStats(user.id, weekStart, problemsSolved);
            await database.updateUserLastUpdated(user.discord_id);
            
            console.log(`✅ ${user.discord_username}: ${problemsSolved} problems`);
          } else {
            console.log(`❌ Failed to get data for ${user.discord_username}: ${result.error}`);
            userStats.push({
              discordUsername: user.discord_username,
              leetcodeUsername: user.leetcode_username,
              problemsSolved: 0,
              problems: []
            });
          }
        } catch (error) {
          console.error(`Error processing user ${user.discord_username}:`, error);
          userStats.push({
            discordUsername: user.discord_username,
            leetcodeUsername: user.leetcode_username,
            problemsSolved: 0,
            problems: []
          });
        }
      }

      // Create and send embed
      const embed = this.createWeeklyEmbed(userStats, weekStart, weekEnd, totalProblems);
      await channel.send({ embeds: [embed] });

      console.log(`✅ Weekly update completed! Total problems: ${totalProblems}`);

    } catch (error) {
      console.error('❌ Error in weekly update:', error);
    } finally {
      this.isRunning = false;
    }
  }

  createWeeklyEmbed(userStats, weekStart, weekEnd, totalProblems) {
    const embed = new EmbedBuilder()
      .setTitle('📊 LeetCode Weekly Update')
      .setDescription(`**Week of ${weekStart} to ${weekEnd}**`)
      .setColor('#00ff00')
      .setTimestamp()
      .setFooter({ text: 'LeetCode Discord Bot' });

    // Sort users by problems solved (descending)
    const sortedStats = userStats.sort((a, b) => b.problemsSolved - a.problemsSolved);

    // Create fields for each user
    if (sortedStats.length > 0) {
      let userList = '';
      let rank = 1;

      for (const stat of sortedStats) {
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '📊';
        userList += `${medal} **${stat.discordUsername}** (${stat.leetcodeUsername})\n`;
        userList += `   Solved: **${stat.problemsSolved}** problems\n\n`;
        rank++;
      }

      embed.addFields({
        name: '🏆 Weekly Rankings',
        value: userList || 'No problems solved this week',
        inline: false
      });

      embed.addFields({
        name: '📈 Summary',
        value: `**Total Problems Solved:** ${totalProblems}\n**Active Users:** ${userStats.length}`,
        inline: false
      });
    } else {
      embed.addFields({
        name: '📭 No Activity',
        value: 'No problems were solved this week.',
        inline: false
      });
    }

    return embed;
  }

  async sendTestUpdate(client) {
    console.log('🧪 Sending test weekly update...');
    await this.sendWeeklyUpdate(client);
  }
}

module.exports = new WeeklyUpdate(); 