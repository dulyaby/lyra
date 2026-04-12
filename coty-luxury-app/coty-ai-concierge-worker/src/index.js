import { GoogleGenerativeAI } from "@google/generative-ai";

export default {
  async fetch(request, env, ctx) {
    // 1. Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 2. Only allow POST
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const { messages, tools } = await request.json();

      if (!env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
      }

      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
      });

      // Separate system message from history
      const systemMessage = messages.find(m => m.role === "system");
      const chatHistory = messages
        .filter(m => m.role !== "system")
        .map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      // The last message is the current user prompt
      const lastMessage = chatHistory.pop();
      
      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 1000,
        },
        // If system message exists, we can pass it as systemInstruction in newer SDK versions
        // or prepend it to the first message.
        systemInstruction: systemMessage ? systemMessage.content : undefined,
      });

      const result = await chat.sendMessage(lastMessage.parts[0].text);
      const responseText = result.response.text();

      // 3. Return Response with CORS
      return new Response(JSON.stringify({ 
        choices: [{ 
          message: { 
            role: "assistant", 
            content: responseText 
          } 
        }] 
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
