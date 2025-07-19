const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../services/database');
const leetcodeService = require('../services/leetcodeService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your LeetCode profile and recent activity'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const discordId = interaction.user.id;
      const user = await database.getUserByDiscordId(discordId);

      if (!user) {
        const embed = new EmbedBuilder()
          .setTitle('❌ Not Registered')
          .setDescription('You are not registered yet. Use `/register` to register your LeetCode username.')
          .setColor('#ff0000')
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Get recent activity
      const recentActivity = await leetcodeService.getRecentProblems(user.leetcode_username, 7);
      
      const embed = new EmbedBuilder()
        .setTitle('👤 Your LeetCode Profile')
        .setColor('#0099ff')
        .setTimestamp()
        .addFields({
          name: '📝 Registration Info',
          value: `**Discord:** ${user.discord_username}\n**LeetCode:** ${user.leetcode_username}\n**Registered:** ${new Date(user.registered_at).toLocaleDateString()}`,
          inline: false
        });

      if (recentActivity.success) {
        embed.addFields({
          name: '📊 Recent Activity (Last 7 Days)',
          value: `**Problems Solved:** ${recentActivity.count}\n**Username:** ${recentActivity.username}`,
          inline: false
        });

        if (recentActivity.problems.length > 0) {
          let recentProblems = '';
          recentActivity.problems.slice(0, 5).forEach((problem, index) => {
            recentProblems += `${index + 1}. ${problem.title}\n`;
          });
          
          if (recentActivity.problems.length > 5) {
            recentProblems += `... and ${recentActivity.problems.length - 5} more`;
          }

          embed.addFields({
            name: '📝 Recent Problems',
            value: recentProblems || 'No recent problems',
            inline: false
          });
        }
      } else {
        embed.addFields({
          name: '❌ Activity Unavailable',
          value: 'Could not fetch recent activity. This might be due to a private profile or API issues.',
          inline: false
        });
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in profile command:', error);
      
      const embed = new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription('An error occurred while fetching your profile. Please try again later.')
        .setColor('#ff0000')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
}; 