from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scripts.summarizer import Summarizer
from haystack.document_stores import InMemoryDocumentStore
from haystack.nodes import BM25Retriever, TransformersReader
from haystack.pipelines import ExtractiveQAPipeline
from transformers import DistilBertTokenizer, DistilBertForQuestionAnswering
import os
import logging
from typing import Optional, Dict

logging.basicConfig(level=logging.WARNING)
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

# Initialize components
summarizer = Summarizer()
model_name = "distilbert-base-uncased-distilled-squad"
document_store = InMemoryDocumentStore(use_bm25=True)
retriever = BM25Retriever(
    document_store=document_store,
    top_k=3
)
reader = TransformersReader(
    model_name_or_path=model_name,
    context_window_size=500
)

def init_document_store():
    archive_folder = "../archive_texts"
    
    if not os.path.exists(archive_folder):
        logger.error(f"Directory '{archive_folder}' does not exist")
        return
    
    text_files = [f for f in os.listdir(archive_folder) if f.endswith(".txt")]
    if not text_files:
        logger.error(f"No .txt files found in '{archive_folder}'")
        return
    
    logger.warning(f"Found files: {text_files}")
    
    if not document_store.get_document_count():
        documents = []
        for filename in text_files:
            try:
                with open(os.path.join(archive_folder, filename), "r", encoding="utf-8") as file:
                    content = file.read()
                    if not content.strip():
                        logger.warning(f"Empty file: {filename}")
                        continue
                    
                    documents.append({
                        "content": content,
                        "meta": {
                            "name": filename,
                            "date": filename.split('_')[1] if '_' in filename else None
                        }
                    })
                    logger.warning(f"Loaded: {filename}")
                    
            except Exception as e:
                logger.error(f"Error processing {filename}: {str(e)}")
        
        if documents:
            document_store.write_documents(documents)
            logger.warning(f"Total documents loaded: {len(documents)}")

@app.on_event("startup")
async def initialize():
    init_document_store()
    global pipeline
    pipeline = ExtractiveQAPipeline(reader=reader, retriever=retriever)

@app.post("/api/summarize", response_model=Dict[str, str])
async def summarize_article(request: SummarizeRequest):
    try:
        if not request.content:
            raise HTTPException(status_code=400, detail="No content provided")
            
        summary = summarizer.summarize(request.content)
        return {
            'summary': summary,
            'original_text': request.content
        }
    except Exception as e:
        logger.error(f"Error in summarize_article: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_archives(request: QueryRequest):
    try:
        if not request.question:
            raise HTTPException(status_code=400, detail="No question provided")
        
        # Log the incoming question
        logger.warning(f"Received question: {request.question}")
        
        result = pipeline.run(
            query=request.question,
            params={
                "Retriever": {"top_k": 3},
                "Reader": {"top_k": 1}
            }
        )
        
        # Log the pipeline result
        logger.warning(f"Pipeline result: {result}")
        
        if result["answers"]:
            answer = result["answers"][0]
            
            # Find the sentence containing the answer in the context
            context_sentences = answer.context.split('.')
            answer_sentence = next((s for s in context_sentences if answer.answer in s), '')
            if answer_sentence:
                # Get surrounding sentences for more context
                answer_idx = context_sentences.index(answer_sentence)
                start_idx = max(0, answer_idx - 1)
                end_idx = min(len(context_sentences), answer_idx + 2)
                answer.answer = '. '.join(context_sentences[start_idx:end_idx]).strip() + '.'
            
            response_data = {
                'answer': answer.answer,
                'context': answer.context,
                'score': float(answer.score),
                'source': answer.meta.get('name', 'Unknown')
            }
            # Log the response we're sending back
            logger.warning(f"Sending response: {response_data}")
            return response_data
        else:
            logger.warning("No answer found")
            return {
                'answer': 'No answer found',
                'context': '',
                'score': 0,
                'source': None
            }
            
    except Exception as e:
        logger.error(f"Error in query_archives: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001, reload=True)