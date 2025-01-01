import tensorflow as tf
import numpy as np
from transformers import AutoTokenizer
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_article(filename):
    """Load article text from file"""
    try:
        with open(f"archive_texts/{filename}", 'r', encoding='utf-8') as f:
            return f.read().strip()
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        return None

def get_forced_prefix():
    """Get a list of valid sentence starters."""
    return [
        "The",
        "According to",
        "In the",
        "During the",
        "Following",
        "Recently",
        "As reported in",
    ]

def generate_text(interpreter, tokenizer, input_text, max_length=50):
    """Generate text using structured generation"""
    logger.info("Preparing input...")

    # Tokenize input
    inputs = tokenizer(
        input_text,
        max_length=128,
        padding='max_length',
        truncation=True,
        return_tensors="np"
    )
    input_ids = inputs['input_ids'].astype(np.int32)
    attention_mask = inputs['attention_mask'].astype(np.int32)

    # Get model details
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    # Initialize generation
    prefix = np.random.choice(get_forced_prefix())
    prefix_ids = tokenizer.encode(prefix, add_special_tokens=False)
    generated_ids = [tokenizer.bos_token_id] + prefix_ids

    logger.info(f"\nStarting generation with prefix: {prefix}")

    min_length = 10
    word_count = len(prefix_ids)

    for step in range(max_length):
        try:
            # Use only the last token for the decoder input
            decoder_input = np.array([[generated_ids[-1]]], dtype=np.int32)  # Shape: [1, 1]

            # Set input tensors
            for detail in input_details:
                name = detail['name'].lower()
                if 'attention' in name:
                    interpreter.set_tensor(detail['index'], attention_mask)
                elif 'decoder' in name:
                    interpreter.set_tensor(detail['index'], decoder_input)
                else:
                    interpreter.set_tensor(detail['index'], input_ids)

            # Run inference
            interpreter.invoke()
            logits = interpreter.get_tensor(output_details[0]['index'])[0, -1, :]

            # Apply temperature and create probability distribution
            temperature = 0.7
            logits = logits / temperature
            probs = tf.nn.softmax(logits).numpy()

            # Sample next token
            next_token = np.random.choice(len(probs), p=probs)

            # Append the token to the sequence
            generated_ids.append(next_token)

            # Get the text for the token
            token_text = tokenizer.decode([next_token]).strip()

            logger.info(f"Step {step}: Selected token: {token_text} (id: {next_token})")

            # Update word count and check stop conditions
            word_count += 1
            if word_count >= min_length and token_text in ['.', '!', '?']:
                logger.info("Sentence completed.")
                break
            if word_count >= max_length:
                logger.info("Maximum length reached.")
                break

        except Exception as e:
            logger.error(f"Error during generation: {e}")
            logger.error(f"Current state: {tokenizer.decode(generated_ids)}")
            break

    return tokenizer.decode(generated_ids, skip_special_tokens=True)





def test_model():
    """Test the TFLite model"""
    try:
        article = load_article("phillipian_20241213_poweroutage.txt")
        if not article:
            return
        
        logger.info("\nOriginal text:")
        logger.info("-" * 50)
        logger.info(f"{article[:200]}...")
        
        interpreter = tf.lite.Interpreter(model_path="assets/model/model.tflite")
        interpreter.allocate_tensors()
        
        tokenizer = AutoTokenizer.from_pretrained("assets/tokenizer")
        
        logger.info("\nGenerating summary...")
        summary = generate_text(interpreter, tokenizer, article)
        
        logger.info("\nGenerated summary:")
        logger.info("-" * 50)
        logger.info(summary)
        logger.info("-" * 50)
        
    except Exception as e:
        logger.error(f"Error in test_model: {e}")

if __name__ == "__main__":
    test_model()
