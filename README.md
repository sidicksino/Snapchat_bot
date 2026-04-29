# 💎 Luxury Snap Engine (Snapchat Bot)

A high-end cinematic image generation bot that uses AI to create hyper-realistic "luxury lifestyle" shots and sends them to Telegram. It combines the power of **Google Gemini** for intelligent prompt/caption engineering and **Hugging Face (Flux.1-Schnell)** for state-of-the-art image generation.

## 🚀 Features

- **Luxury Content Engine**: Randomly selects cinematic scenes (penthouses, supercars, luxury lobbies, etc.).
- **Anti-AI Prompting**: Uses Gemini to engineer prompts that avoid the "AI look," focusing on real-world photography techniques (35mm lens, natural grain, depth of field).
- **Human Captions**: Generates short, lowercase, Snapchat-style captions that feel authentic.
- **Automated Workflow**: 
    1. Generates a master prompt.
    2. Generates a high-resolution image.
    3. Crafts a natural caption.
    4. Delivers everything to Telegram.

## 🛠️ Tech Stack

- **Logic**: Node.js
- **LLM**: [Google Gemini Flash](https://aistudio.google.com/) (Prompts & Captions)
- **Image Gen**: [Flux.1-Schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell) via Hugging Face Inference API
- **Communication**: Telegram Bot API

## 📋 Prerequisites

- Node.js installed
- A Telegram Bot token (from [@BotFather](https://t.me/botfather))
- A Google AI Studio API Key
- A Hugging Face Access Token

## ⚙️ Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd SnapChat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   HF_TOKEN=your_hugging_face_token
   ```

## 🏃 Usage

To run the engine once:
```bash
npm start
```
or
```bash
npm run main
```

## 📜 License
ISC
