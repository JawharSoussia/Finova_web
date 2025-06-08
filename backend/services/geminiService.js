const axios = require("axios");
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function getGroqRecommendation(prompt) {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  // Modify prompt to strongly enforce JSON format
  const formattedPrompt = `${prompt}\n\nIMPORTANT: Your response MUST be valid JSON array of recommendations only, with no additional text. Each recommendation must have exactly these fields: "title", "detail", and "actionItems" (array of strings).`;

  const body = {
    model: "llama3-70b-8192",
    messages: [
      {
        role: "system",
        content: "You are a financial advisor that always responds in valid JSON format."
      },
      {
        role: "user",
        content: formattedPrompt
      }
    ],
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 1024,
  };

  try {
    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      }
    });

    if (!response.data.choices || !response.data.choices[0]?.message?.content) {
      throw new Error('Invalid response format from Groq API');
    }

    const text = response.data.choices[0].message.content.trim();

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : text;

    try {
      const parsedResponse = JSON.parse(jsonString);
      
      // Validate and sanitize the response
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response is not an array');
      }

      const sanitizedResponse = parsedResponse.map(item => ({
        title: String(item.title || '').trim(),
        detail: String(item.detail || '').trim(),
        actionItems: Array.isArray(item.actionItems) 
          ? item.actionItems.map(action => String(action).trim()).filter(Boolean)
          : ["Review your current financial situation"]
      }));

      return sanitizedResponse;

    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      
      // Fallback: Create structured response from text
      const recommendations = text
        .split(/\n(?=\d+\.|Title:)/)
        .filter(Boolean)
        .map(section => {
          const lines = section.split('\n').filter(Boolean);
          return {
            title: lines[0].replace(/^\d+\.\s*|Title:\s*/i, '').trim(),
            detail: lines.slice(1).join(' ').trim(),
            actionItems: [
              "Review the recommendation details",
              "Consult with a financial advisor if needed"
            ]
          };
        });

      return recommendations.length > 0 ? recommendations : [{
        title: "Financial Review",
        detail: "We're experiencing issues with generating detailed recommendations. Here are some general suggestions for your financial health.",
        actionItems: [
          "Review your monthly budget",
          "Track your expenses",
          "Set up an emergency fund"
        ]
      }];
    }

  } catch (error) {
    console.error("Error getting Groq recommendation:", error);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
    return [{
      title: "Financial Health Check",
      detail: "We're currently unable to generate personalized recommendations. Please try again later.",
      actionItems: ["Check back later for personalized recommendations"]
    }];
  }
}

// Add retry logic with exponential backoff
async function getWithRetry(prompt, retries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await getGroqRecommendation(prompt);
    } catch (error) {
      if (error.response?.status === 429 && attempt < retries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      throw error;
    }
  }
}

module.exports = { getGroqRecommendation, getWithRetry };