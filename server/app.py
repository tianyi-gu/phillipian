from flask import Flask, request, jsonify
from flask_cors import CORS
from scripts.summarizer import Summarizer
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the summarizer
summarizer = Summarizer()

@app.route('/api/summarize', methods=['POST'])
def summarize_article():
    try:
        data = request.json
        
        # Get article content from request
        title = data.get('title', '')
        content = data.get('content', '')
        
        if not content:
            return jsonify({'error': 'No content provided'}), 400
            
        # Generate summary from content
        summary = summarizer.summarize(content)
        
        return jsonify({
            'summary': summary,
            'original_text': content
        })
        
    except Exception as e:
        logging.error(f"Error in summarize_article: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)