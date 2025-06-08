# chatbot.py
import requests
import os
import base64
from typing import List, Dict, Any
import PyPDF2
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings

class Chatbot:
    def __init__(self, api_key: str, kb_folder: str = "knowledge_base"):
        self.api_key = api_key
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        self.kb_folder = kb_folder
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
        self.vector_store = None
        
        # NEW: Conversation history storage
        self.conversation_history = []
        self.max_history_length = 10  # Keep last 10 exchanges
        
        self._initialize_vector_store()

    def _initialize_vector_store(self):
        """Initialize the vector store with existing documents."""
        if not os.path.exists(self.kb_folder):
            os.makedirs(self.kb_folder)
            return

        texts = []
        metadatas = []
        for fname in os.listdir(self.kb_folder):
            file_path = os.path.join(self.kb_folder, fname)
            if fname.endswith(".txt"):
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    texts.append(content)
                    metadatas.append({"source": fname})
            elif fname.endswith(".pdf"):
                texts_from_pdf, meta_from_pdf = self._process_pdf(file_path)
                texts.extend(texts_from_pdf)
                metadatas.extend(meta_from_pdf)

        if texts:
            self.vector_store = Chroma.from_texts(
                texts=texts,
                embeddings=self.embeddings,
                metadatas=metadatas
            )

    def _process_pdf(self, pdf_path: str) -> tuple[List[str], List[dict]]:
        """Process a PDF file and return chunks of text with their metadata."""
        pdf = PyPDF2.PdfReader(pdf_path)
        pdf_text = ""
        for page in pdf.pages:
            pdf_text += page.extract_text()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        texts = text_splitter.split_text(pdf_text)
        metadatas = [{"source": os.path.basename(pdf_path), "chunk": i} for i in range(len(texts))]
        return texts, metadatas

    def add_document(self, file_path: str):
        """Add a new document to the knowledge base."""
        if file_path.endswith(".pdf"):
            texts, metadatas = self._process_pdf(file_path)
        elif file_path.endswith(".txt"):
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                texts = [content]
                metadatas = [{"source": os.path.basename(file_path)}]
        else:
            raise ValueError("Unsupported file format. Only .pdf and .txt files are supported.")

        if self.vector_store is None:
            self.vector_store = Chroma.from_texts(
                texts=texts,
                embeddings=self.embeddings,
                metadatas=metadatas
            )
        else:
            self.vector_store.add_texts(texts=texts, metadatas=metadatas)

    def retrieve_context(self, question: str, top_k: int = 3) -> List[str]:
        """Retrieve relevant context from the knowledge base using vector similarity search."""
        if self.vector_store is None:
            return []
            
        results = self.vector_store.similarity_search_with_score(question, k=top_k)
        contexts = []
        for doc, score in results:
            if score < 1.5:  # Only include relevant matches
                contexts.append(doc.page_content)
        return contexts

    def _build_conversation_context(self) -> str:
        """Build conversation context from history."""
        if not self.conversation_history:
            return ""
        
        context_parts = ["Previous conversation:"]
        for exchange in self.conversation_history[-5:]:  # Last 5 exchanges
            context_parts.append(f"User: {exchange['user']}")
            context_parts.append(f"Assistant: {exchange['assistant']}")
        
        context_parts.append("Current question:")
        return "\n".join(context_parts)

    def _add_to_history(self, user_message: str, assistant_response: str):
        """Add exchange to conversation history."""
        self.conversation_history.append({
            "user": user_message,
            "assistant": assistant_response
        })
        
        if len(self.conversation_history) > self.max_history_length:
            self.conversation_history = self.conversation_history[-self.max_history_length:]

    def ask(self, question: str, image_path: str = None) -> str:
        """Use RAG with conversation memory."""
        headers = {"Content-Type": "application/json"}
        
        # Get RAG context
        context_list = self.retrieve_context(question)
        rag_context = "\n".join(context_list) if context_list else ""
        
        # Get conversation context
        conversation_context = self._build_conversation_context()
        
        # Build the full prompt
        system_prompt = (
            "You are a friendly, helpful financial assistant. "
            "Answer in a clear, concise, and encouraging way. "
            "Use simple language and emojis if appropriate. "
            "Pay attention to the conversation history to maintain context."
        )
        
        # Combine all contexts
        full_context = []
        if rag_context:
            full_context.append(f"Knowledge Base Context:\n{rag_context}")
        if conversation_context:
            full_context.append(conversation_context)
        
        if full_context:
            prompt = f"{system_prompt}\n\n{chr(10).join(full_context)}\n\n{question}"
        else:
            prompt = f"{system_prompt}\n\n{question}"

        parts = [{"text": prompt}]
        
        # Handle image if provided
        if image_path and os.path.exists(image_path):
            with open(image_path, "rb") as img_file:
                img_b64 = base64.b64encode(img_file.read()).decode("utf-8")
            parts.append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": img_b64
                }
            })

        payload = {
            "contents": [{
                "parts": parts
            }]
        }

        try:
            response = requests.post(
                f"{self.api_url}?key={self.api_key}",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            assistant_response = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response available.")
            
            # Add to conversation history
            self._add_to_history(question, assistant_response)
            
            return assistant_response
            
        except requests.exceptions.RequestException as e:
            print(f"Error communicating with the Gemini API: {e}")
            error_response = "Sorry, I couldn't process your request at the moment."
            self._add_to_history(question, error_response)
            return error_response

    def clear_conversation(self):
        """Clear the conversation history."""
        self.conversation_history = []
        print("Conversation history cleared! 🔄")

    def get_conversation_summary(self) -> str:
        """Get a summary of the current conversation."""
        if not self.conversation_history:
            return "No conversation history yet."
        
        summary = f"Conversation Summary ({len(self.conversation_history)} exchanges):\n"
        for i, exchange in enumerate(self.conversation_history, 1):
            summary += f"{i}. User: {exchange['user'][:50]}...\n"
            summary += f"   Bot: {exchange['assistant'][:50]}...\n"
        
        return summary