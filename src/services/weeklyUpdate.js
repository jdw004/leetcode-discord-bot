const cron = require('node-cron');
const moment = require('moment');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config');
const database = require('./database');
const leetcodeService = require('./leetcodeService');
const axios = require('axios'); // Added axios for calendar data fetching

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
      console.log(`📢 Using channel ID: ${config.CHANNEL_ID}`);
      const channel = client.channels.cache.get(config.CHANNEL_ID);
      if (!channel) {
        console.error(`❌ Could not find Discord channel with ID: ${config.CHANNEL_ID}`);
        console.error('Available channels:', client.channels.cache.map(c => `${c.name} (${c.id})`).join(', '));
        return;
      }
      console.log(`✅ Found channel: ${channel.name} (${channel.id})`);

      const users = await database.getAllActiveUsers();
      if (users.length === 0) {
        console.log('📭 No active users found for weekly update');
        return;
      }

      console.log(`📊 Processing ${users.length} users for weekly update`);

      // Calculate the proper week range (Monday to Sunday)
      // Get the most recent Monday (or today if it's Monday)
      const today = moment();
      const dayOfWeek = today.day(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate days to subtract to get to Monday
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = moment().subtract(daysToMonday, 'days').startOf('day');
      const weekEnd = weekStart.clone().add(6, 'days').endOf('day');
      
      // For weekly updates, we want the PREVIOUS week, not the current week
      // If today is Monday, we want last week (Monday to Sunday)
      // If today is any other day, we want the week that just ended
      const previousWeekStart = weekStart.clone().subtract(7, 'days');
      const previousWeekEnd = weekEnd.clone().subtract(7, 'days');
      
      console.log(`📅 Current week range: ${weekStart.format('YYYY-MM-DD')} to ${weekEnd.format('YYYY-MM-DD')}`);
      console.log(`📅 Previous week range: ${previousWeekStart.format('YYYY-MM-DD')} to ${previousWeekEnd.format('YYYY-MM-DD')}`);
      
      // Use the previous week for the update
      const weekStartToUse = previousWeekStart;
      const weekEndToUse = previousWeekEnd;
      
      const userStats = [];
      let totalProblems = 0;

      // Process each user
      for (const user of users) {
        try {
          console.log(`📈 Processing user: ${user.discord_username} (${user.leetcode_username})`);
          
          // Calculate the number of days to look back from today to include the entire week
          const daysToLookBack = Math.ceil(moment().diff(weekStartToUse, 'days', true));
          console.log(`📊 Fetching ${daysToLookBack} days of data for ${user.leetcode_username}`);
          
          const result = await leetcodeService.getRecentProblems(user.leetcode_username, daysToLookBack);
          
          if (result.success) {
            console.log(`📊 Raw API response for ${user.leetcode_username}: ${result.count} problems, ${result.problems.length} problem objects`);
            
            // Filter problems to only include those within our week range
            const weekProblems = result.problems.filter(problem => {
              const problemDate = moment(problem.solvedAt);
              const isInWeek = problemDate.isBetween(weekStartToUse, weekEndToUse, 'day', '[]'); // inclusive
              
              if (isInWeek) {
                console.log(`✅ Including problem for ${user.leetcode_username}: ${problem.title} at ${problemDate.format('YYYY-MM-DD')}`);
              } else {
                console.log(`❌ Excluding problem for ${user.leetcode_username}: ${problem.title} at ${problemDate.format('YYYY-MM-DD')} (outside week range)`);
              }
              
              return isInWeek;
            });
            
            let problemsSolved = weekProblems.length;
            
            // Only use estimation if we have a high number of submissions indicating missing data
            if (result.calendarSubmissions && result.calendarSubmissions >= 35 && problemsSolved < result.calendarSubmissions * 0.3) {
              console.log(`⚠️  High submission count detected for ${user.leetcode_username}: Found ${problemsSolved} problems but calendar shows ${result.calendarSubmissions} submissions`);
              
              // Calculate the actual submissions in the week range from the calendar
              const weekStartTimestamp = Math.floor(weekStartToUse.valueOf() / 1000);
              const weekEndTimestamp = Math.floor(weekEndToUse.valueOf() / 1000);
              
              // Get calendar data for the specific week
              const calendarResponse = await axios.get(`${config.LEETCODE_API_URL.replace('/api', '')}/api/recent-problems-calendar/${user.leetcode_username}?days=${daysToLookBack}`);
              
              if (calendarResponse.data.success) {
                const calendarData = calendarResponse.data;
                let weekSubmissions = 0;
                
                // Sum up submissions that fall within our week range
                calendarData.dailyBreakdown.forEach(day => {
                  if (day.timestamp >= weekStartTimestamp && day.timestamp <= weekEndTimestamp) {
                    weekSubmissions += day.submissions;
                  }
                });
                
                console.log(`📊 Calendar shows ${weekSubmissions} submissions in the week range (${weekStartToUse.format('YYYY-MM-DD')} to ${weekEndToUse.format('YYYY-MM-DD')})`);
                
                // Estimate problems based on submission-to-problem ratio
                // If we have recent submission data, use that ratio
                let estimatedProblems = weekSubmissions;
                
                if (result.recentSubmissionsCount > 0 && result.count > 0) {
                  // Calculate ratio from recent data
                  const submissionToProblemRatio = result.recentSubmissionsCount / result.count;
                  console.log(`📊 Submission-to-problem ratio from recent data: ${submissionToProblemRatio.toFixed(2)}`);
                  
                  // Apply this ratio to the week submissions
                  estimatedProblems = Math.round(weekSubmissions / submissionToProblemRatio);
                  console.log(`📊 Estimated problems based on ratio: ${estimatedProblems}`);
                } else {
                  // Conservative estimate: assume 1 problem per 2-3 submissions
                  estimatedProblems = Math.round(weekSubmissions / 2.5);
                  console.log(`📊 Conservative estimate (1 problem per 2.5 submissions): ${estimatedProblems}`);
                }
                
                // Use the higher of the two values, but be reasonable
                const maxReasonableProblems = Math.min(estimatedProblems, weekSubmissions);
                problemsSolved = Math.max(problemsSolved, maxReasonableProblems);
                
                console.log(`📊 Final adjusted count for ${user.leetcode_username}: ${problemsSolved} problems (estimated due to high submission count)`);
              } else {
                console.log(`❌ Failed to get calendar data for ${user.leetcode_username}, using original count`);
              }
            } else {
              console.log(`📊 Using original API count for ${user.leetcode_username}: ${problemsSolved} problems (${result.calendarSubmissions || 0} total submissions)`);
            }
            
            totalProblems += problemsSolved;
            
            console.log(`📊 Final count for ${user.leetcode_username}: ${problemsSolved} problems in week range`);
            
            userStats.push({
              displayName: user.display_name,
              leetcodeUsername: user.leetcode_username,
              problemsSolved: problemsSolved,
              problems: weekProblems
            });

            // Save weekly stats to database
            await database.saveWeeklyStats(user.id, weekStartToUse.format('YYYY-MM-DD'), problemsSolved);
            await database.updateUserLastUpdated(user.discord_id);
            
            console.log(`✅ ${user.discord_username}: ${problemsSolved} problems (filtered from ${result.count} total)`);
          } else {
            console.log(`❌ Failed to get data for ${user.discord_username}: ${result.error}`);
            userStats.push({
              displayName: user.display_name,
              leetcodeUsername: user.leetcode_username,
              problemsSolved: 0,
              problems: []
            });
          }
        } catch (error) {
          console.error(`Error processing user ${user.discord_username}:`, error);
          userStats.push({
            displayName: user.display_name,
            leetcodeUsername: user.leetcode_username,
            problemsSolved: 0,
            problems: []
          });
        }
      }

      // Create and send embed
      const embed = this.createWeeklyEmbed(userStats, weekStartToUse.format('YYYY-MM-DD'), weekEndToUse.format('YYYY-MM-DD'), totalProblems);
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
        userList += `${medal} **${stat.displayName}** (${stat.leetcodeUsername})\n`;
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