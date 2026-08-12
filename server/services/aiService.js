const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.generateBusinessInsight = async (message, contextData) => {
  // Validate configuration before proceeding
  const apiKey = process.env.AI_API_KEY;
  const modelName = process.env.GEMINI_MODEL;

  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured');
  }

  if (!modelName) {
    throw new Error('GEMINI_MODEL is not configured');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      You are an AI Business Assistant for a Mini ERP & CRM Operations Portal.
      Your goal is to answer user queries based ONLY on the provided business context data.
      Do not invent or hallucinate data. Be professional, concise, and helpful.
      
      Business Context Data:
      ${JSON.stringify(contextData, null, 2)}
      
      User Query:
      "${message}"
      
      Please provide a helpful, concise summary or answer based on the data above.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    // Log the actual error in the backend terminal during development
    console.error('AI Service Error (Gemini API):', error);
    
    // Throw a generic error to be caught by the controller
    throw new Error('AI service is temporarily unavailable.');
  }
};
