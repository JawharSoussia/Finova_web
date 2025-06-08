const { GoogleGenerativeAI } = require("@google/generative-ai");

class Chatbot {  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    this.conversation_history = [];
  }
  async ask(question, context = {}) {
    try {
      const systemPrompt = "You are a friendly, helpful financial assistant. Answer in a clear, concise, and encouraging way. Use simple language and emojis if appropriate.";
      
      let prompt = question;
      if (context.documentName) {
        prompt = `Regarding the document "${context.documentName}": ${question}`;
      }

      // Keep it simple - just pass the current question
      const result = await this.model.generateContent([systemPrompt, prompt]);
      const response = await result.response;
      const answer = response.text();

      // Store the interaction in conversation history
      this.conversation_history.push(
        { role: 'user', content: question },
        { role: 'assistant', content: answer }
      );

      return answer;
    } catch (error) {
      console.error("API Error:", error);
      return "Sorry, I couldn't process your request at the moment.";
    }
  }

  clear_conversation() {
    this.conversation_history = [];
  }

  add_document(documentPath) {
    // TODO: Implement document processing logic
    // This could involve PDF parsing, text extraction, etc.
    return Promise.resolve();
  }
}

module.exports = Chatbot; // Export CommonJS