const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../services/database');
const leetcodeService = require('../services/leetcodeService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register your LeetCode username for weekly updates')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Your display name (how you want to appear in updates)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('leetcode_username')
        .setDescription('Your LeetCode username')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const displayName = interaction.options.getString('name');
      const leetcodeUsername = interaction.options.getString('leetcode_username');
      const discordId = interaction.user.id;
      const discordUsername = interaction.user.username;

      console.log(`📝 Registration attempt: ${discordUsername} -> ${leetcodeUsername}`);

      // Check if user is already registered
      const existingUser = await database.getUserByDiscordId(discordId);
      if (existingUser) {
        const embed = new EmbedBuilder()
          .setTitle('❌ Already Registered')
          .setDescription(`You are already registered with LeetCode username: **${existingUser.leetcode_username}**`)
          .setColor('#ff0000')
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Check if LeetCode username is already taken
      const existingLeetcodeUser = await database.getUserByLeetcodeUsername(leetcodeUsername);
      if (existingLeetcodeUser) {
        const embed = new EmbedBuilder()
          .setTitle('❌ Username Already Taken')
          .setDescription(`The LeetCode username **${leetcodeUsername}** is already registered by another user.`)
          .setColor('#ff0000')
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Validate LeetCode username
      console.log(`🔍 Validating LeetCode username: ${leetcodeUsername}`);
      const isValid = await leetcodeService.validateUser(leetcodeUsername);
      
      if (!isValid) {
        const embed = new EmbedBuilder()
          .setTitle('❌ Invalid LeetCode Username')
          .setDescription(`Could not find LeetCode user: **${leetcodeUsername}**\n\nPlease check your username and try again.`)
          .setColor('#ff0000')
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Register the user
      await database.registerUser(discordId, discordUsername, displayName, leetcodeUsername);

      const embed = new EmbedBuilder()
        .setTitle('✅ Registration Successful')
        .setDescription(`You have been successfully registered!\n\n**Display Name:** ${displayName}\n**LeetCode:** ${leetcodeUsername}`)
        .setColor('#00ff00')
        .setTimestamp()
        .addFields({
          name: '📅 Weekly Updates',
          value: 'You will now receive weekly updates every Monday at 9 AM showing your LeetCode progress!',
          inline: false
        });

      await interaction.editReply({ embeds: [embed] });

      console.log(`✅ User registered successfully: ${displayName} (${leetcodeUsername})`);

    } catch (error) {
      console.error('Error in register command:', error);
      
      const embed = new EmbedBuilder()
        .setTitle('❌ Registration Failed')
        .setDescription('An error occurred during registration. Please try again later.')
        .setColor('#ff0000')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
}; 