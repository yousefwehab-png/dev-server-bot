# Discord Bot - 24/7 YouTube Streamer

A Discord bot that streams YouTube audio 24/7 in a voice channel. Built with Node.js.

## Features

- 🎵 **24/7 YouTube Streaming**: Continuously streams audio from a YouTube video in a voice channel
- 🔄 **Auto-Reconnect**: Automatically reconnects if disconnected from voice channel
- 💬 **Commands**: Basic commands to check status and reconnect

## Prerequisites

- Node.js 18.0 or higher
- Discord Bot Token

## Setup Instructions

### 1. Install Dependencies

The bot will automatically install dependencies when started on VeloHost/Pterodactyl.

For local development:
```bash
npm install
```

### 2. Configure .env File

The `.env` file should contain:
```
DISCORD_TOKEN=your_discord_bot_token_here
VOICE_CHANNEL_ID=1556953559105413130
YOUTUBE_URL=https://youtube.com/shorts/75YFE-bDUzE
```

### 3. Get Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to "Bot" tab and create a bot
4. Enable **Message Content Intent** and **Server Members Intent**
5. Copy the bot token
6. Invite the bot to your server with these permissions:
   - Connect
   - Speak
   - Read Messages
   - Send Messages
   - Read Message History

## Running the Bot

### On VeloHost/Pterodactyl:

1. Upload all files to the server
2. Click **★ Use on startup** on `index.js`
3. Click **📦 Install & run fix**
4. Press **Start**

### Local Development:

```bash
npm start
```

Or:
```bash
node index.js
```

### Run in background (Linux):

Using pm2 (recommended):
```bash
npm install -g pm2
pm2 start index.js --name discord-bot
pm2 save
pm2 startup
```

Using nohup:
```bash
nohup node index.js > bot.log 2>&1 &
```

## Bot Commands

- `!hello` - Bot says hello
- `!status` - Check if bot is streaming
- `!reconnect` - Force reconnect to voice channel

## Configuration

- **VOICE_CHANNEL_ID**: The Discord voice channel ID where the bot will stream
- **YOUTUBE_URL**: The YouTube video URL to stream

## Troubleshooting

### Bot won't connect to voice channel:
- Ensure the bot has "Connect" and "Speak" permissions
- Check that the voice channel ID is correct
- Verify the bot is in the correct server

### Stream stops after a while:
- The bot has auto-reconnect functionality
- Check the bot logs for errors
- Ensure the server has stable internet connection

### VeloHost/Pterodactyl Issues:
- Make sure you selected "Use on startup" on index.js
- Click "Install & run fix" before starting
- Ensure Node.js version is 18.0 or higher

## Files

- `index.js` - Main bot script
- `package.json` - Node.js dependencies and configuration
- `.env` - Environment variables (create this from .env.example)
- `.env.example` - Environment variables template
- `README.md` - This file

## Security Warning

⚠️ **NEVER commit or share your `.env` file or Discord token!** Your token gives full control of your bot.

If you accidentally exposed your token:
1. Go to https://discord.com/developers/applications
2. Navigate to your bot application
3. Click "Bot" tab
4. Click "Reset Token" to generate a new one
5. Update your `.env` file with the new token

## Notes

- The bot will automatically reconnect if disconnected from the voice channel
- YouTube shorts are supported
- The bot checks connection status continuously
- Built for Node.js 18+ with Discord.js v14
