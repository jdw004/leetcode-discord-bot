const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const express = require('express');
const config = require('../config');
const database = require('./services/database');
const leetcodeService = require('./services/leetcodeService');
const weeklyUpdate = require('./services/weeklyUpdate');
const { createAPI } = require('./api');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// Load commands
const fs = require('fs');
const path = require('path');
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
}

// Bot ready event
client.once('ready', async () => {
  console.log(`🤖 Discord Bot logged in as ${client.user.tag}`);
  
  // Initialize database
  await database.init();
  console.log('📊 Database initialized');
  
  // Register slash commands
  await registerCommands();
  console.log('⚡ Slash commands registered');
  
  // Start weekly update scheduler
  weeklyUpdate.start(client);
  console.log('📅 Weekly update scheduler started');
});

// Interaction handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    
    const errorMessage = 'There was an error while executing this command!';
    
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (followUpError) {
      console.error('Error sending error message:', followUpError);
    }
  }
});

// Register slash commands
async function registerCommands() {
  const { REST, Routes } = require('discord.js');
  const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

  const commands = [];
  for (const command of client.commands.values()) {
    commands.push(command.data.toJSON());
  }

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Create Express server for API
const app = express();
const PORT = process.env.PORT || 3000;

// Mount the API
app.use('/', createAPI());

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
});

// Login Discord bot
client.login(config.DISCORD_TOKEN); 