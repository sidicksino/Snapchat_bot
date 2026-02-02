require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // Note: The SDK might not expose listModels directly on the main class in all versions,
    // but usually it's on the client or via a specific manager.
    // Actually, checking the docs for @google/generative-ai
    // It's often not straightforward in the simplified client.
    // But let's try the model manager if it exists, or just a raw fetch if needed.
    // Wait, the error message suggested "Call ListModels".
    
    // In strict v1beta REST API it's GET /v1beta/models.
    // The node SDK usually exposes `getGenerativeModel` but maybe not listModels directly easily?
    // Let's try the `GoogleGenerativeAI` instance. it doesn't have it.
    // It's usually `genAI.getGenerativeModel`... 
    
    // Let's try to infer from common knowledge of the SDK.
    // Since 0.1.0 it was different.
    
    // Let's try a direct fetch using the API Key to the REST endpoint.
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("Available Models:");
      data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
    } else {
      console.log("Error or no models found:", data);
    }

  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
