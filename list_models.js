import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY;

async function listModels() {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
            headers: {
                "Authorization": `Bearer ${API_KEY}`
            }
        });
        const data = await response.json();
        const freeModels = data.data.filter(m => m.id.endsWith(':free')).map(m => m.id);
        console.log("Free Models:", JSON.stringify(freeModels, null, 2));
    } catch (e) {
        console.error(e);
    }
}

listModels();
