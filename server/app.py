from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scripts.summarizer import Summarizer
from haystack.document_stores import InMemoryDocumentStore
from haystack.nodes import BM25Retriever, TransformersReader
from haystack.pipelines import ExtractiveQAPipeline
from transformers import MarianMTModel, MarianTokenizer
import os
import logging
from typing import Optional, Dict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SummarizeRequest(BaseModel):
    title: Optional[str] = None
    content: str

class QueryRequest(BaseModel):
    question: str

class TranslateRequest(BaseModel):
    text: str
    target_language: str

# Dictionary mapping language codes to Marian model names
LANGUAGE_MODELS = {
    'es': 'Helsinki-NLP/opus-mt-en-es',
    'fr': 'Helsinki-NLP/opus-mt-en-fr',
    'de': 'Helsinki-NLP/opus-mt-en-de',
    'zh': 'Helsinki-NLP/opus-mt-en-zh',
    'ru': 'Helsinki-NLP/opus-mt-en-ru',
    'ja': 'Helsinki-NLP/opus-mt-en-jap',
    'ko': 'Helsinki-NLP/opus-mt-en-ko',
    'ar': 'Helsinki-NLP/opus-mt-en-ar',
    'hi': 'Helsinki-NLP/opus-mt-en-hi',
}

# Cache for models and tokenizers
model_cache = {}

# Initialize components
summarizer = Summarizer()
model_name = "deepset/deberta-v3-base-squad2"

# Configure document store with better similarity settings
document_store = InMemoryDocumentStore(
    use_bm25=True,
    bm25_parameters={
        "b": 0.75,
        "k1": 1.2,
    }
)

# Configure retriever
retriever = BM25Retriever(
    document_store=document_store,
    top_k=5,
    scale_score=True
)

reader = TransformersReader(
    model_name_or_path=model_name,
    top_k=3
)

def init_document_store():
    if document_store.get_document_count() > 0:
        logger.warning("Document store already initialized")
        return
    
    try:
        load_documents()
        logger.warning(f"Document store initialized with {document_store.get_document_count()} documents")
    except Exception as e:
        logger.error(f"Error initializing document store: {str(e)}")

def load_documents():
    archive_folder = "../archive_texts"
    
    if not os.path.exists(archive_folder):
        logger.error(f"Directory '{archive_folder}' does not exist")
        return
    
    text_files = [f for f in os.listdir(archive_folder) if f.endswith(".txt")]
    if not text_files:
        logger.error(f"No .txt files found in '{archive_folder}'")
        return
    
    if not document_store.get_document_count():
        documents = []
        for filename in text_files:
            try:
                with open(os.path.join(archive_folder, filename), "r", encoding="utf-8") as file:
                    content = file.read()
                    if not content.strip():
                        continue
                    
                    date = filename.split('_')[1] if '_' in filename else None
                    
                    documents.append({
                        "content": content,
                        "meta": {
                            "name": filename,
                            "date": date,
                            "year": date[:4] if date else None,
                            "keywords": filename.lower()
                        }
                    })
                    
            except Exception as e:
                logger.error(f"Error processing {filename}: {str(e)}")
        
        if documents:
            document_store.write_documents(documents)

# Initialize at startup
init_document_store()

@app.post("/api/summarize")
async def summarize(request: SummarizeRequest):
    try:
        summary = summarizer.summarize(request.content)
        return {"summary": summary, "original_text": request.content}
    except Exception as e:
        logger.error(f"Error in summarize: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_archives(request: QueryRequest):
    try:
        if not request.question:
            raise HTTPException(status_code=400, detail="No question provided")
        
        # Get relevant documents
        retriever_result = retriever.retrieve(
            query=request.question
        )
        
        # Process only the highest-scored document from retriever
        if retriever_result:
            best_doc = retriever_result[0]
            
            # Get answers from the best document
            result = reader.predict(
                query=request.question,
                documents=[best_doc]
            )
            
            if result['answers']:
                best_answer = result['answers'][0]
                
                # Find the paragraph containing the answer
                paragraphs = [p.strip() for p in best_doc.content.split('\n') if p.strip()]
                context_paragraph = next(
                    (p for p in paragraphs if best_answer.answer in p), 
                    ''
                )
                
                if context_paragraph:
                    # Split into sentences and find the one containing the answer
                    sentences = [s.strip() + '.' for s in context_paragraph.split('.') if s.strip()]
                    relevant_sentences = []
                    
                    # Find the answer sentence and include one sentence before and after for context
                    for i, sentence in enumerate(sentences):
                        if best_answer.answer in sentence:
                            if i > 0:
                                relevant_sentences.append(sentences[i-1])
                            relevant_sentences.append(sentence)
                            if i < len(sentences) - 1:
                                relevant_sentences.append(sentences[i+1])
                            break
                    
                    answer_text = ' '.join(relevant_sentences)
                else:
                    answer_text = best_answer.answer
                
                return {
                    'answer': answer_text.strip(),
                    'context': best_doc.content,
                    'score': float(best_doc.score),
                    'source': best_doc.meta.get('name', 'Unknown')
                }
                
        return {
            'answer': 'No answer found',
            'context': '',
            'score': 0,
            'source': None
        }
            
    except Exception as e:
        logger.error(f"Error in query_archives: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/translate")
async def translate_text(request: TranslateRequest):
    try:
        if request.target_language == 'en':
            return {"translated_text": request.text, "source_language": "en"}

        if request.target_language not in LANGUAGE_MODELS:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported target language: {request.target_language}"
            )

        model_name = LANGUAGE_MODELS[request.target_language]
        
        # Get or load model and tokenizer
        if model_name not in model_cache:
            logger.info(f"Loading translation model for {request.target_language}")
            tokenizer = MarianTokenizer.from_pretrained(model_name)
            model = MarianMTModel.from_pretrained(model_name)
            model_cache[model_name] = (model, tokenizer)
        else:
            model, tokenizer = model_cache[model_name]

        # Split text into sentences
        sentences = request.text.replace('\n', ' ').split('. ')
        translated_chunks = []
        current_chunk = []
        current_length = 0

        for sentence in sentences:
            # Add period back if it's not the last sentence
            if sentence != sentences[-1]:
                sentence += '.'
            
            # Tokenize sentence to check length
            tokens = tokenizer.encode(sentence)
            
            if current_length + len(tokens) > 512:
                # Translate current chunk
                chunk_text = ' '.join(current_chunk)
                encoded = tokenizer(chunk_text, return_tensors="pt", padding=True)
                translated = model.generate(**encoded)
                translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
                translated_chunks.append(translated_text)
                
                # Start new chunk
                current_chunk = [sentence]
                current_length = len(tokens)
            else:
                current_chunk.append(sentence)
                current_length += len(tokens)

        # Translate final chunk if any
        if current_chunk:
            chunk_text = ' '.join(current_chunk)
            encoded = tokenizer(chunk_text, return_tensors="pt", padding=True)
            translated = model.generate(**encoded)
            translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
            translated_chunks.append(translated_text)

        # Combine all translated chunks
        final_translation = ' '.join(translated_chunks)

        logger.info(f"Successfully translated text to {request.target_language}")
        
        return {
            "translated_text": final_translation,
            "source_language": "en"
        }

    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001, reload=True)