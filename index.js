require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');

// Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

async function runBot() {
  console.log("💎 Démarrage du bot Telegram...");

  try {
    // 1. Génération du Prompt via Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    
    // Sujets Tech aléatoires
    const topics = ['React Component', 'Server Room', 'Cyberpunk Hacker', 'Code Editor', 'API Network'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const promptInstruction = `
      Tu es un directeur artistique 3D (style Apple).
      Génère un PROMPT EN ANGLAIS pour une image 3D photoréaliste sur le thème : "${randomTopic}".
      Style : Octane Render, Unreal Engine 5, Minimalist, Glassmorphism, 8k.
      Réponds UNIQUEMENT avec le prompt anglais.
    `;

    const result = await model.generateContent(promptInstruction);
    const promptGenere = result.response.text();

    console.log("Prompt généré :", promptGenere);

    // 2. Envoi sur Telegram
    const message = `
🚀 **Ton Défi Snap 3D**

🎨 **Sujet :** ${randomTopic}

👇 **Copie ce prompt pour Bing Image Creator :**
\`${promptGenere}\`

_Généré par Gemini & GitHub Actions_
    `;

    // URL de l'API Telegram
    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

    await axios.post(url, {
      chat_id: telegramChatId,
      text: message,
      parse_mode: 'Markdown' // Permet de mettre en gras
    });

    console.log("✅ Message envoyé sur Telegram !");

  } catch (error) {
    console.error("❌ Erreur :", error.message);
    process.exit(1);
  }
}

runBot();