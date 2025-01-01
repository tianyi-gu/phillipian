from transformers import pipeline
import logging

class Summarizer:
    def __init__(self):
        try:
            self.summarizer = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                truncation=True,
                max_length=1024,
                min_length=30
            )
            logging.info("Summarizer initialized successfully")
        except Exception as e:
            logging.error(f"Error initializing summarizer: {str(e)}")
            raise

    def summarize(self, text: str) -> str:
        try:
            # Clean the text (remove extra whitespace, newlines)
            text = ' '.join(text.split())
            
            # Generate summary
            summary = self.summarizer(
                text,
                max_length=130,
                min_length=30,
                do_sample=False,
                truncation=True
            )
            
            return summary[0]['summary_text']
            
        except Exception as e:
            logging.error(f"Error in summarize: {str(e)}")
            raise