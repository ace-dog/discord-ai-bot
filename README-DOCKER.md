# Docker Deployment Guide

This guide explains how to run the Discord AI Bot with Ollama using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))

## Quick Start

1. **Set up environment variables**

   Edit the `.env` file and add your Discord bot token:
   ```bash
   DISCORD_TOKEN=your_discord_bot_token_here
   ```

2. **Start the services**

   ```bash
   docker-compose up -d
   ```

   This will:
   - Start the Ollama service
   - Pull the llama3.1 model automatically
   - Start the Discord bot

3. **View logs**

   ```bash
   # View all logs
   docker-compose logs -f

   # View bot logs only
   docker-compose logs -f discord-bot

   # View Ollama logs only
   docker-compose logs -f ollama
   ```

4. **Stop the services**

   ```bash
   docker-compose down
   ```

## GPU Support (Optional)

If you have an NVIDIA GPU and want to use it with Ollama:

1. Install [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)

2. Uncomment the GPU section in `docker-compose.yml`:
   ```yaml
   deploy:
     resources:
       reservations:
         devices:
           - driver: nvidia
             count: all
             capabilities: [gpu]
   ```

3. Restart the services:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Configuration

### Using Different Models

To use a different Ollama model:

1. Edit `config.js`:
   ```javascript
   ollamaModel: 'llama3.1',  // Change to your preferred model
   ```

2. Update the model name in `docker-compose.yml` in the discord-bot service command:
   ```yaml
   wget --post-data='{"name":"your-model-name"}' \
   ```

3. Rebuild and restart:
   ```bash
   docker-compose up -d --build
   ```

### Running on Host Network

If you want the bot to use `localhost:11434` for Ollama (e.g., if Ollama is already running on your host):

1. Set environment variable:
   ```bash
   export OLLAMA_HOST=http://host.docker.internal:11434
   ```

2. Or add to `.env`:
   ```
   OLLAMA_HOST=http://host.docker.internal:11434
   ```

## Troubleshooting

### Bot can't connect to Ollama

Check if Ollama is running:
```bash
docker-compose ps
```

Check Ollama logs:
```bash
docker-compose logs ollama
```

### Model not found

Manually pull the model:
```bash
docker-compose exec ollama ollama pull llama3.1
```

### Bot crashes on startup

Check bot logs:
```bash
docker-compose logs discord-bot
```

Verify environment variables:
```bash
docker-compose config
```

## Updating

To update the bot code:

```bash
# Rebuild and restart the bot
docker-compose up -d --build discord-bot
```

To update Ollama:

```bash
# Pull latest Ollama image
docker-compose pull ollama

# Restart services
docker-compose up -d
```

## Data Persistence

Ollama models are stored in a Docker volume named `ollama_data`. This persists even when containers are stopped or removed.

To completely remove all data:
```bash
docker-compose down -v
```

## Resource Usage

- **Ollama**: Memory usage depends on the model size (llama3.1 requires ~4-8GB RAM)
- **Discord Bot**: Minimal (~50-100MB RAM)

Monitor resource usage:
```bash
docker stats
```
