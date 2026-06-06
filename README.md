# OrbitBot 🌌

OrbitBot is a Slack bot that brings NASA’s most beautiful space imagery directly into your workspace. It delivers the Astronomy Picture of the Day and other space visuals with simple slash commands, making space exploration accessible and engaging.

---

## 🚀 Features

* `/spacepic` → Get NASA Astronomy Picture of the Day
* Displays image, title, and explanation
* Clean Slack message formatting
* Real-time NASA API integration
* Lightweight and fast response system

---

## 🧠 How It Works

OrbitBot connects Slack commands to NASA’s public API. When a user requests an image, the bot fetches the latest space data and returns a formatted message with the image and description.

---

## 🛠️ Tech Stack

* Python
* Flask
* Slack API
* NASA Open API
* Requests library

---

## ⚙️ Setup

### 1. Clone the repo

```bash
git clone ..
cd orbitbot
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Create `.env`

```
SLACK_BOT_TOKEN=your-slack-token
SLACK_SIGNING_SECRET=your-secret
NASA_API_KEY=your-nasa-key
```

### 4. Run the bot

```bash
python app.py
```

### 5. Expose server (for Slack)

```bash
ngrok http 3000
```

---

## 📡 NASA API Used

* Astronomy Picture of the Day (APOD):
  https://api.nasa.gov/planetary/apod

---

## 🌌 Future Improvements

* Mars rover image explorer
* Daily automated space drops
* Image history tracking
* Interactive space categories

---

## 📜 License

Open source for educational use.
