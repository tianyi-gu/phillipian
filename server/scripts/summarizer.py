import os
from transformers import AutoTokenizer, BartForConditionalGeneration
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Summarizer:
    # def __init__(self, model_name="facebook/bart-large-cnn"):
    def __init__(self, model_name="sshleifer/distilbart-cnn-12-6"):
        self.model_name = model_name
        self.model = None
        self.tokenizer = None
        self.cache_dir = os.path.join(os.path.dirname(__file__), '../models')
        os.makedirs(self.cache_dir, exist_ok=True)

    def load_model(self):
        """Load the model and tokenizer"""
        try:
            logger.info(f"Loading model and tokenizer from {self.model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                cache_dir=self.cache_dir
            )
            self.model = BartForConditionalGeneration.from_pretrained(
                self.model_name,
                cache_dir=self.cache_dir
            )
            logger.info("Model and tokenizer loaded successfully")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise

    def load_article(self, filename):
        """Load article text from file"""
        try:
            with open(f"../../archive_texts/{filename}", 'r', encoding='utf-8') as f:
                return f.read().strip()
        except Exception as e:
            logger.error(f"Error reading file: {e}")
            return None

    def summarize(self, text):
        """Generate summary for the given text"""
        try:
            if not self.model or not self.tokenizer:
                self.load_model()

            inputs = self.tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
            summary_ids = self.model.generate(
                **inputs,
                max_length=130,
                min_length=30,
                length_penalty=2.0,
                num_beams=4,
                early_stopping=True
            )
            summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            
            return summary
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            raise

def main():
    try:
        summarizer = Summarizer()
        
        # Load and summarize the article
        article = summarizer.load_article("phillipian_20141024_tang.txt")
        if not article:
            return
        
        logger.info("\nOriginal text:")
        logger.info("-" * 50)
        logger.info(f"{article[:200]}...")
        
        summary = summarizer.summarize(article)
        
        logger.info("\nGenerated summary:")
        logger.info("-" * 50)
        logger.info(summary)
        logger.info("-" * 50)
        
    except Exception as e:
        logger.error(f"Failed to summarize: {str(e)}")

if __name__ == "__main__":
    main()