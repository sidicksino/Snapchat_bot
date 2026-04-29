require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const FormData = require('form-data');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

async function runBot() {
    console.log("💎 Smart Luxury Snap Engine Started...");

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // 🧠 SCENE SYSTEM (WITH TIME TYPES)
        const scenes = [
            { name: 'luxury hotel lobby at night', type: 'night' },
            { name: 'rainy neon luxury city street', type: 'night' },
            { name: 'underground luxury parking with supercars', type: 'night' },

            { name: 'high-end penthouse interior with skyline view', type: 'day' },
            { name: 'minimalist luxury bedroom with large windows', type: 'day' },
            { name: 'luxury shopping mall with glass reflections', type: 'day' },

            { name: 'rooftop infinity pool overlooking city skyline', type: 'sunset' },
            { name: 'wide cinematic bridge road', type: 'sunset' }
        ];

        const lightingMap = {
            day: [
                'soft natural daylight through large windows',
                'bright diffused daylight',
                'clean sunlight with soft shadows'
            ],
            night: [
                'warm ambient artificial lighting',
                'neon reflections on wet surfaces',
                'low cinematic lighting with soft glow'
            ],
            sunset: [
                'golden hour sunlight',
                'warm sunset glow',
                'orange and pink sky reflections'
            ]
        };

        const weatherMap = {
            day: ['clear sky', 'slightly cloudy', 'bright clean air'],
            night: ['clear night', 'rainy atmosphere with reflections', 'light fog'],
            sunset: ['warm clear sunset', 'soft cloudy sunset', 'slight haze']
        };

        const moods = [
            'quiet and peaceful',
            'slightly lonely but calm',
            'private luxury moment',
            'cinematic silence',
            'soft emotional atmosphere'
        ];

        const cameraStyles = [
            'shot on 35mm lens',
            'ultra wide cinematic framing',
            'low angle perspective',
            'depth of field focus',
            'soft background blur'
        ];

        // 🎯 SELECT SMARTLY
        const selectedScene = scenes[Math.floor(Math.random() * scenes.length)];

        const randomLight =
            lightingMap[selectedScene.type][
            Math.floor(Math.random() * lightingMap[selectedScene.type].length)
            ];

        const randomWeather =
            weatherMap[selectedScene.type][
            Math.floor(Math.random() * weatherMap[selectedScene.type].length)
            ];

        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        const randomCamera = cameraStyles[Math.floor(Math.random() * cameraStyles.length)];

        // 🧠 ADVANCED PROMPT
        const promptInstruction = `
Act as a professional luxury photographer.

Create an ultra realistic image prompt.

SCENE:
${selectedScene.name}

TIME:
${selectedScene.type}

LIGHTING:
${randomLight}

WEATHER:
${randomWeather}

MOOD:
${randomMood}

CAMERA:
${randomCamera}

RULES:
- Must look like real photography, NOT AI
- Physically correct lighting and time of day
- Natural imperfections (grain, reflections, shadows)
- Clean luxury composition
- Real materials: glass, marble, polished metal
- Depth and atmosphere are important

KEYWORDS:
photorealistic, cinematic lighting, 8k, depth of field, realistic textures, natural shadows

OUTPUT:
Return only the prompt in English.
`;

        // 🔁 GENERATE PROMPT
        let promptGenere = null;

        for (let i = 0; i < 5; i++) {
            try {
                const result = await model.generateContent(promptInstruction);
                promptGenere = result.response.text().trim();
                console.log("✅ Prompt generated");
                break;
            } catch {
                await new Promise(r => setTimeout(r, 4000));
            }
        }

        if (!promptGenere) throw new Error("Prompt failed");

        // 🎨 GENERATE IMAGE
        let buffer = null;

        for (let i = 0; i < 5; i++) {
            try {
                const response = await axios.post(
                    "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
                    { inputs: promptGenere },
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.HF_TOKEN}`,
                            "Content-Type": "application/json",
                            Accept: "image/png"
                        },
                        responseType: "arraybuffer",
                        timeout: 90000
                    }
                );

                buffer = Buffer.from(response.data, "binary");
                console.log("✅ Image generated");
                break;

            } catch (imageErr) {
                console.warn(`🔹 Image generation attempt ${i + 1} failed: ${imageErr.message}`);
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        const telegramUrl = `https://api.telegram.org/bot${telegramToken}`;

        // 🧠 HUMAN CAPTION
        const captionInstruction = `
Write a short Snapchat caption (max 6 words).

Style:
- lowercase
- human, emotional, natural
- no quotes, no explanation

Examples:
"this feels unreal"
"late nights like this"
"one day fr"

Output only caption.
`;

        let caption = "this feels unreal";

        try {
            const result = await model.generateContent(captionInstruction);
            caption = result.response.text().trim();
        } catch { }

        const safePrompt =
            promptGenere.length > 800
                ? promptGenere.substring(0, 800) + "..."
                : promptGenere;

        if (buffer) {
            // 📸 SEND IMAGE
            const form = new FormData();
            form.append('chat_id', telegramChatId);
            form.append('caption', caption);
            form.append('photo', buffer, { filename: 'luxury.png' });

            try {
                await axios.post(`${telegramUrl}/sendPhoto`, form, {
                    headers: form.getHeaders()
                });
                console.log("🚀 Image sent");

                // 🧠 SEND PROMPT
                await axios.post(`${telegramUrl}/sendMessage`, {
                    chat_id: telegramChatId,
                    text: `🧠 Prompt:\n\`${safePrompt}\``,
                    parse_mode: 'Markdown'
                });
            } catch (telegramErr) {
                console.error("❌ Telegram Send Error:", telegramErr.message);
            }

        } else {
            console.log("⚠️ Image generation failed after 5 attempts. Sending failure notice...");
            try {
                await axios.post(`${telegramUrl}/sendMessage`, {
                    chat_id: telegramChatId,
                    text: `⚠️ Image failed\n\n${safePrompt}`
                });
            } catch (telegramErr) {
                console.error("❌ Telegram Send Error:", telegramErr.message);
            }
        }

    } catch (err) {
        console.error("❌ Fatal Error:", err.message);
        if (err.response) {
            console.error("Response data:", err.response.data.toString());
        }
    }
}

runBot();