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
    const promptGenere = result.response.text().trim();
    console.log("Prompt généré :", promptGenere);



    // 2. Génération de l'image (Via Pollinations.ai - Free & Unlimited)
    console.log("🎨 Génération de l'image via Pollinations.ai...");
    
    // On encode le prompt pour l'URL
    const encodedPrompt = encodeURIComponent(promptGenere);
    // On ajoute des paramètres de qualité et de taille
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&seed=${Math.floor(Math.random() * 1000)}`;

    const imageResponse = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      timeout: 60000 // 60 seconds timeout for high-quality generation
    });
    const buffer = Buffer.from(imageResponse.data, 'binary');
    
    console.log("✅ Image générée !");


    // 3. Envoi sur Telegram (Photo)
    const FormData = require('form-data');
    const form = new FormData();
    form.append('chat_id', telegramChatId);
    
    // Truncate prompt if too long for Telegram caption (limit is 1024 chars usually)
    const safePrompt = promptGenere.length > 800 ? promptGenere.substring(0, 800) + "..." : promptGenere;

    form.append('caption', `
🚀 **Ton Défi Snap 3D**

🎨 **Sujet :** ${randomTopic}

👇 **Prompt Utilisé :**
\`${safePrompt}\`

_Généré par Gemini & Pollinations_
    `);
    form.append('parse_mode', 'Markdown');
    form.append('photo', buffer, { filename: 'image.png' });

    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendPhoto`;

    await axios.post(telegramUrl, form, {
      headers: form.getHeaders()
    });

    console.log("✅ Photo envoyée sur Telegram !");

  } catch (error) {
    console.error("❌ Erreur :", error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

runBot();