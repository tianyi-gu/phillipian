from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scripts.summarizer import Summarizer
import logging
from typing import Optional, Dict

# Initialize logging
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

# Initialize summarizer
summarizer = Summarizer()

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

# Commented out RAG features for later implementation
"""
@app.post("/api/query")
async def query_archives():
    pass

@app.get("/api/articles")
async def get_articles():
    pass
"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001, reload=True)