# Women's Finance Chatbot - RAG System

Simple RAG chatbot for women's finance questions using Google Gemini, SQLite, and vector database.

## Quick Start

1. **Install dependencies:**
```bash
pip3 install -r requirements.txt
```

2. **Set up environment:**
```bash
cp env_template.txt .env
# Edit .env and add your Gemini API key (already there, just verify)
```

3. **Initialize vector database:**
```bash
python3 initialize_db.py
```

4. **Start the chatbot:**
```bash
python3 main.py
```

5. **Open browser:** http://localhost:8000

## Configuration

Edit `.env` file:
- `GOOGLE_GEMINI_API_KEY` - Your Gemini API key
- `DATABASE_PATH` - SQLite database file (default: chatbot.db)
- `VECTOR_DB_PATH` - Vector database directory (default: ./vector_db)
- `KNOWLEDGE_BASE_PATH` - Path to your knowledge base documents

## Features

- RAG system with vector database
- SQLite for users and conversations
- Web search fallback
- Simple frontend
- Multi-format document support (PDF, DOCX, XLSX)

## Project Structure

- `main.py` - FastAPI application
- `database.py` - SQLite database manager
- `rag_system.py` - RAG system with Gemini
- `vector_store.py` - Vector database (ChromaDB)
- `document_processor.py` - Document processing
- `web_search.py` - Web search fallback
- `static/` - Frontend files

That's it! Simple and clean.
