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
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest"});
    
    // Sujets Tech & Abstract "Senior/High-End"
    const topics = [
      'Abstract Glassmorphism Data Flow', 
      'Cyberpunk Workstation Isometric', 
      'Bioluminescent AI Neural Network', 
      'Futuristic Quantum Server Room', 
      'Hyper-realistic Mechanical Eye',
      'Floating Anti-Gravity Gadgets',
      'Neon-Noir Cityscape Reflection',
      'Minimalist Bauhaus Tech Product'
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const promptInstruction = `
      Agis comme un Directeur Artistique Senior spécialisé dans le design 3D haut de gamme (tendance Awwwards / Apple / Behance).
      
      TA MISSION :
      Génère un PROMPT DE GÉNÉRATION D'IMAGE (pour Midjourney/DALL-E 3) EXTRÊMEMENT DÉTAILLÉ et "Senior" sur le thème : "${randomTopic}".
      
      STRUCTURE DU PROMPT ATTENDUE (en Anglais) :
      [Sujet Principal] + [Détails de l'environnement] + [Éclairage & Ambiance] + [Matériaux & Textures] + [Angle de caméra] + [Moteur de rendu & Style].
      
      INCLURE OBLIGATOIREMENT CES MOTS-CLÉS DANS LE PROMPT :
      "Octane Render, Unreal Engine 5, 8k Resolution, Ray Tracing, Volumetric Lighting, Photorealistic, Extremely Detailed, Depth of Field, Masterpiece, Trending on ArtStation".
      
      Pour le style, vise : Minimalist, Clean, High-Tech, Cinematic.
      
      RÉPONSE :
      Donne UNIQUEMENT le prompt en anglais brut, sans guillemets, sans introduction.
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