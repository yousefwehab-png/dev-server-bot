require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('ffmpeg-static');
const fs = require('fs');

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID || '1556953559105413130';
const YOUTUBE_URL = process.env.YOUTUBE_URL || 'https://youtube.com/shorts/75YFE-bDUzE';

// Discord client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Voice connection variables
let voiceConnection = null;
let audioPlayer = createAudioPlayer();
let currentResource = null;

// Bot ready event
client.once('ready', () => {
  console.log(`${client.user.tag} has connected to Discord!`);
  console.log(`Bot is in ${client.guilds.cache.size} guild(s)`);
  
  // Set bot status
  client.user.setActivity('Streaming 24/7', { type: ActivityType.Streaming });
  
  // Start voice streaming
  joinAndStream();
});

// Join voice channel and start streaming
async function joinAndStream() {
  try {
    // Get the guild
    const guild = client.guilds.cache.first();
    if (!guild) {
      console.log('Bot is not in any guild!');
      return;
    }
    
    // Get the voice channel
    const voiceChannel = guild.channels.cache.get(VOICE_CHANNEL_ID);
    if (!voiceChannel) {
      console.log(`Voice channel ${VOICE_CHANNEL_ID} not found!`);
      return;
    }
    
    console.log(`Connecting to voice channel: ${voiceChannel.name}`);
    
    // Connect to voice channel
    voiceConnection = joinVoiceChannel({
      channelId: VOICE_CHANNEL_ID,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator
    });
    
    // Subscribe to audio player
    voiceConnection.subscribe(audioPlayer);
    
    // Start streaming
    streamYouTube();
    
  } catch (error) {
    console.error('Error joining voice channel:', error);
    // Retry after 30 seconds
    setTimeout(joinAndStream, 30000);
  }
}

// Stream YouTube audio
async function streamYouTube() {
  try {
    console.log('Fetching YouTube audio...');
    
    // Get video info
    const info = await ytdl.getInfo(YOUTUBE_URL);
    const stream = ytdl.downloadFromInfo(info, {
      quality: 'highestaudio',
      filter: 'audioonly'
    });
    
    // Create audio resource
    currentResource = createAudioResource(stream, {
      inputType: 'webm/opus',
      inlineVolume: true
    });
    
    // Play audio
    audioPlayer.play(currentResource);
    console.log(`Now streaming: ${info.videoDetails.title}`);
    
  } catch (error) {
    console.error('Error streaming YouTube:', error);
    // Retry after 30 seconds
    setTimeout(streamYouTube, 30000);
  }
}

// Handle audio player events
audioPlayer.on(AudioPlayerStatus.Idle, () => {
  console.log('Playback stopped, restarting...');
  setTimeout(streamYouTube, 5000);
});

audioPlayer.on('error', error => {
  console.error('Audio player error:', error);
  setTimeout(streamYouTube, 5000);
});

// Handle voice connection errors
if (voiceConnection) {
  voiceConnection.on('error', error => {
    console.error('Voice connection error:', error);
    setTimeout(joinAndStream, 30000);
  });
}

// Message handler for commands
client.on('messageCreate', async (message) => {
  // Ignore bot's own messages
  if (message.author.bot) return;
  
  // Check if it's a command
  if (message.content.startsWith('!')) {
    handleCommand(message);
  }
});

// Command handler
async function handleCommand(message) {
  const command = message.content.toLowerCase();
  
  if (command === '!hello') {
    await message.channel.send('Hello! I\'m your Discord bot 🤖');
  } else if (command === '!status') {
    if (voiceConnection && voiceConnection.state.status === 'ready') {
      const isPlaying = audioPlayer.state.status === AudioPlayerStatus.Playing;
      await message.channel.send(`✅ Streaming in voice channel. Playing: ${isPlaying}`);
    } else {
      await message.channel.send('❌ Not connected to voice channel');
    }
  } else if (command === '!reconnect') {
    if (voiceConnection) {
      voiceConnection.destroy();
    }
    await joinAndStream();
    await message.channel.send('Reconnected to voice channel!');
  }
}

// Interaction handler (for slash commands if needed)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  const { commandName } = interaction;
  
  if (commandName === 'hello') {
    await interaction.reply('Hello! I\'m your Discord bot 🤖');
  } else if (commandName === 'status') {
    if (voiceConnection && voiceConnection.state.status === 'ready') {
      const isPlaying = audioPlayer.state.status === AudioPlayerStatus.Playing;
      await interaction.reply(`✅ Streaming in voice channel. Playing: ${isPlaying}`);
    } else {
      await interaction.reply('❌ Not connected to voice channel');
    }
  } else if (commandName === 'reconnect') {
    if (voiceConnection) {
      voiceConnection.destroy();
    }
    await joinAndStream();
    await interaction.reply('Reconnected to voice channel!');
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Bot shutting down...');
  if (voiceConnection) {
    voiceConnection.destroy();
  }
  client.destroy();
  process.exit(0);
});

// Start the bot
if (!DISCORD_TOKEN) {
  console.error('ERROR: DISCORD_TOKEN not found in .env file!');
  console.error('Please create a .env file with your Discord bot token.');
  process.exit(1);
}

client.login(DISCORD_TOKEN);
