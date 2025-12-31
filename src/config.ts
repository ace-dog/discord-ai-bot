export interface Config {
  commandPrefix: string;
  ollamaModel: string;
  inactivityThresholdMinutes: number;
  checkActivityIntervalMinutes: number;
  scheduledJokeCron: string;
  scheduledConversationCron: string;
  allowedChannels: string[];
  jokeTopics: string[];
  conversationStarters: string[];
  responseChance: number;
  minMessageLength: number;
  ollamaHost: string;
}

const config: Config = {
  // Discord settings
  commandPrefix: '!',

  // AI Model settings
  ollamaModel: 'llama3.1',

  // Activity monitoring
  inactivityThresholdMinutes: 60,
  checkActivityIntervalMinutes: 15,

  // Scheduled posting
  scheduledJokeCron: '0 */3 * * *',
  scheduledConversationCron: '0 */4 * * *',

  // Channel settings - leave empty to work in all channels, or specify channel IDs
  allowedChannels: ['1455691731268796426'],  // test channel

  // Bot behavior
  jokeTopics: [
    'programming',
    'technology',
    'science',
    'animals',
    'food',
    'movies',
    'music',
    'sports'
  ],

  conversationStarters: [
    "What's everyone working on today?",
    "Anyone discovered something cool recently?",
    "What's your hot take on {topic}?",
    "If you could automate one thing in your life, what would it be?",
    "What's the most interesting thing you learned this week?"
  ],

  // Response settings
  responseChance: 0.3,
  minMessageLength: 10,

  // Ollama settings
  ollamaHost: 'http://localhost:11434'
};

export default config;
