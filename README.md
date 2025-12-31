# Discord AI Bot

A privacy-focused Discord bot written in **TypeScript** that uses local AI to post jokes, start conversations, and keep your server active. All AI processing happens locally using Ollama, so your data stays private and there are no API costs.

Built with TypeScript for type safety and better developer experience.

## Features

- **Topic-Based Jokes**: Request jokes about specific topics with `!joke <topic>`
- **Random Joke Posting**: Automatically posts jokes at scheduled intervals
- **Conversation Starters**: Generates engaging questions to spark discussions
- **Auto-Engagement**: Monitors channel activity and engages when things get quiet
- **Natural Conversations**: Responds to messages naturally with AI-powered replies
- **Privacy-First**: Uses local AI models via Ollama - no data sent to external APIs
- **Customizable**: Easy-to-configure scheduling and behavior settings

## Prerequisites

1. **Node.js**: Version 18 or higher
2. **pnpm**: Fast, disk space efficient package manager
3. **Ollama**: For running local AI models
4. **Discord Bot**: A Discord application with a bot token

## Setup Instructions

### 1. Install Ollama

Install Ollama from [https://ollama.ai](https://ollama.ai)

After installation, pull a model:

```bash
ollama pull llama2
```

For better performance, you can use other models like `llama3`, `mistral`, or `phi3`:

```bash
ollama pull llama3
```

Verify Ollama is running:

```bash
ollama list
```

### 2. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Under "Privileged Gateway Intents", enable:
   - Message Content Intent
   - Server Members Intent
5. Copy your bot token (you'll need this later)
6. Go to "OAuth2" > "URL Generator"
7. Select scopes:
   - `bot`
8. Select bot permissions:
   - Send Messages
   - Read Messages/View Channels
   - Read Message History
9. Copy the generated URL and open it to invite the bot to your server

### 3. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

Or follow instructions at [https://pnpm.io/installation](https://pnpm.io/installation)

### 4. Install Bot Dependencies

```bash
cd discord-ai-bot
pnpm install
```

### 5. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your Discord bot token:

```
DISCORD_TOKEN=your_actual_bot_token_here
```

### 6. Configure Bot Settings

Edit [src/config.ts](src/config.ts) to customize the bot:

```javascript
export default {
  // Change the AI model (must be installed via Ollama)
  ollamaModel: 'llama2',  // or 'llama3', 'mistral', etc.

  // Activity monitoring
  inactivityThresholdMinutes: 60,  // Post when inactive for this long
  checkActivityIntervalMinutes: 15,  // How often to check

  // Scheduled posting (cron format)
  scheduledJokeCron: '0 */3 * * *',  // Every 3 hours
  scheduledConversationCron: '0 */4 * * *',  // Every 4 hours

  // Limit bot to specific channels (leave empty for all channels)
  allowedChannels: [],  // e.g., ['1234567890', '0987654321']

  // Response probability when not mentioned
  responseChance: 0.3,  // 30% chance to respond to messages
};
```

### 7. Build and Run the Bot

First, build the TypeScript code:

```bash
pnpm build
```

Then start the bot:

```bash
pnpm start
```

For development with auto-rebuild and restart:

```bash
# Terminal 1: Watch for TypeScript changes
pnpm watch

# Terminal 2: Run the bot
pnpm dev
```

## Commands

- `!joke` - Get a random joke
- `!joke <topic>` - Get a joke about a specific topic (e.g., `!joke programming`)
- `!conversation` - Get a conversation starter
- `!help` - Show help message

## How It Works

### Activity Monitoring
The bot tracks when messages are sent in channels. If a channel is inactive for the configured time (default: 60 minutes), the bot will post either a joke or conversation starter to re-engage the community.

### Scheduled Posts
The bot posts on a schedule using cron expressions:
- Random jokes every 3 hours
- Conversation starters every 4 hours

### Auto-Responses
The bot has a 30% chance to respond to regular messages (configurable). When mentioned directly, it always responds.

### Privacy
All AI processing happens locally on your machine using Ollama. No messages or data are sent to external AI services.

## Customization

### Adding More Joke Topics

Edit [src/config.ts](src/config.ts):

```typescript
jokeTopics: [
  'programming',
  'technology',
  'your-custom-topic',
  // add more topics...
]
```

### Changing Response Rate

Adjust `responseChance` in [src/config.ts](src/config.ts):

```typescript
responseChance: 0.5,  // 50% chance to respond
```

### Restricting to Specific Channels

Add channel IDs to [src/config.ts](src/config.ts):

```typescript
allowedChannels: ['1234567890', '0987654321'],
```

### Using a Different AI Model

1. Install the model with Ollama:
   ```bash
   ollama pull mistral
   ```

2. Update [src/config.ts](src/config.ts):
   ```typescript
   ollamaModel: 'mistral',
   ```

After making changes, rebuild:
   ```bash
   pnpm build
   ```

## Troubleshooting

**Bot doesn't respond:**
- Check that Message Content Intent is enabled in Discord Developer Portal
- Verify Ollama is running: `ollama list`
- Check bot has permissions to send messages in the channel

**"Model not found" error:**
- Run `ollama pull llama2` to download the model
- Verify model name matches in [config.js](config.js)

**Ollama connection error:**
- Ensure Ollama is running (it should start automatically)
- Check Ollama host in [config.js](config.js) (default: `http://localhost:11434`)

**Bot joins but doesn't post:**
- Check [config.js](config.js) `allowedChannels` setting
- Verify cron schedule syntax is correct
- Check bot has permission in the channels

## Performance Tips

- Use smaller models like `phi3` or `tinyllama` for faster responses
- Reduce `responseChance` to limit API calls
- Adjust `checkActivityIntervalMinutes` to balance engagement vs resources
- Use `llama3` or `mistral` for better quality responses

## License

MIT
