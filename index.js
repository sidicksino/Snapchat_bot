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

    let promptGenere = null;
    let geminiAttempts = 0;
    const maxGeminiAttempts = 5;

    while (geminiAttempts < maxGeminiAttempts && !promptGenere) {
        try {
            geminiAttempts++;
            if (geminiAttempts > 1) {
                console.log(`🔹 Nouvelle tentative Gemini ${geminiAttempts}/${maxGeminiAttempts}...`);
            }
            const result = await model.generateContent(promptInstruction);
            promptGenere = result.response.text().trim();
            console.log("✅ Prompt généré :", promptGenere);
        } catch (err) {
            let errorMsg = err.message;
            let status = err.status || (err.response ? err.response.status : "N/A");

            console.warn(`⚠️ Échec tentative Gemini ${geminiAttempts} (Status: ${status}): ${errorMsg}`);
            
            if (geminiAttempts === maxGeminiAttempts) {
                throw err; // Re-throw if all attempts fail
            }

            // Wait with exponential backoff: 5s, 10s, 20s, 40s
            const waitTime = Math.pow(2, geminiAttempts - 1) * 5000;
            await new Promise(r => setTimeout(r, waitTime));
        }
    }



    // 2. Génération de l'image (Via Pollinations.ai - Free & Unlimited)
    console.log("🎨 Génération de l'image via Pollinations.ai...");
    

    // 2. Génération de l'image (Via Hugging Face API - Flux.1-Schnell)
    console.log("🎨 Génération de l'image via Hugging Face (Flux.1-Schnell)...");

    if (!process.env.HF_TOKEN) {
        console.error("❌ ERREUR: HF_TOKEN est manquant ! Vérifiez les 'Secrets' GitHub.");
    }
    
    let buffer = null;
    let attempts = 0;
    const maxAttempts = 5; // HF loading needs retries

    while (attempts < maxAttempts && !buffer) {
        try {
            attempts++;
            console.log(`🔹 Tentative ${attempts}/${maxAttempts}...`);
            
            const response = await axios.post(
                "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
                { inputs: promptGenere },
                {
                    headers: { 
                        Authorization: `Bearer ${process.env.HF_TOKEN}`,
                        "Content-Type": "application/json",
                        "Accept": "image/png" 
                    },
                    responseType: 'arraybuffer',
                    timeout: 90000 
                }
            );
            
            buffer = Buffer.from(response.data, 'binary');
            console.log("✅ Image générée !");
            
        } catch (err) {
            let errorMsg = err.message;
            let status = err.response ? err.response.status : "N/A";

            if (err.response) {
                try {
                     const jsonErr = JSON.parse(err.response.data.toString());
                     if (jsonErr.error) errorMsg = jsonErr.error;
                } catch (e) { /* Content might be buffer */ }
            }

            console.warn(`⚠️ Échec tentative ${attempts} (Status: ${status}): ${errorMsg}`);
            
            // Fast fail on auth error
            if (status === 401 || status === 403) {
                 console.error("❌ ERREUR AUTHENTIFICATION: Vérifiez votre Token Hugging Face !");
                 break; 
            }

            await new Promise(r => setTimeout(r, 5000));
        }
    }

    // 3. Envoi sur Telegram
    const FormData = require('form-data');
    const telegramUrlBase = `https://api.telegram.org/bot${telegramToken}`;
    
    // Truncate prompt for caption
    const safePrompt = promptGenere.length > 800 ? promptGenere.substring(0, 800) + "..." : promptGenere;

    if (buffer) {
        // Mode PHOTO
        const form = new FormData();
        form.append('chat_id', telegramChatId);
        form.append('caption', `
🚀 **Ton Défi Snap 3D**

🎨 **Sujet :** ${randomTopic}

👇 **Prompt Utilisé :**
\`${safePrompt}\`

_Généré par Gemini & Hugging Face_
        `);
        form.append('parse_mode', 'Markdown');
        form.append('photo', buffer, { filename: 'image.png' });

        await axios.post(`${telegramUrlBase}/sendPhoto`, form, {
            headers: form.getHeaders()
        });
        console.log("✅ Photo envoyée sur Telegram !");
    } else {
        // Mode TEXTE (Fallback)
        console.log("⚠️ Passage en mode TEXTE seul (Erreur Image).");
        const message = `
🚀 **Ton Défi Snap 3D** (Mode Texte)

🎨 **Sujet :** ${randomTopic}

⚠️ _Impossible de générer l'image (Service indisponible)._

👇 **Copie ce prompt pour Bing/DALL-E :**
\`${safePrompt}\`

_Généré par Gemini_
        `;
        
        await axios.post(`${telegramUrlBase}/sendMessage`, {
            chat_id: telegramChatId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log("✅ Message Texte envoyé (Fallback) !");
    }

  } catch (error) {
    // Better Error Logging
    let errMsg = error.message;
    if (error.response && error.response.data) {
        // Try to convert buffer to string if it's a buffer
        if (Buffer.isBuffer(error.response.data)) {
            errMsg = error.response.data.toString('utf8');
        } else {
            errMsg = JSON.stringify(error.response.data);
        }
    }
    console.error("❌ Erreur Fatale :", errMsg);
    process.exit(1);
  }
}

runBot();