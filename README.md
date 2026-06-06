# OrbitBot

OrbitBot is a Slack bot built with Bolt for JavaScript that adds fun space-themed interactions to your workspace.

## Features

- /nasapic, /spacepic, /apod: Fetch NASA Astronomy Picture of the Day with rich Slack formatting
- /dsb-catfact: Sends a random cat fact to the channel
- /orbitcatfact: Alias for the cat fact command
- /orbitoracle <question>: Cosmic yes/no style answer
- /orbitfact: Sends a quick space fact
- /orbitping: Checks bot responsiveness
- /orbitlaunch: Plays a staged launch animation effect in Slack
- /orbithelp: Shows available commands
- App mentions: Reply with a space fact when mentioned with the word "fact"

## Tech Stack

- Node.js
- @slack/bolt
- axios
- dotenv

## Setup

1. Install dependencies

```bash
npm install
```

2. Create a .env file

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-level-token
NASA_API_KEY=your-nasa-api-key
```

3. Run the bot

```bash
node index.js
```

## Slack App Notes

- Enable Socket Mode
- Add slash commands matching the bot handlers:
  - /nasapic
  - /spacepic
  - /apod
  - /dsb-catfact
  - /orbitcatfact
  - /orbitoracle
  - /orbitfact
  - /orbitping
  - /orbitlaunch
  - /orbithelp
- Subscribe to bot events and include app_mention

## NASA API

- APOD endpoint: https://api.nasa.gov/planetary/apod
