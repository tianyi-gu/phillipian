import tensorflow as tf
from transformers import AutoTokenizer, TFAutoModelForSeq2SeqLM
import os
import json
import tensorflowjs as tfjs
import shutil
import numpy as np
import time

def read_article(filename):
    """Read and parse article from archive_texts"""
    with open(os.path.join("../archive_texts", filename), 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Skip metadata section if it exists
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            return parts[2].strip()
    return content.strip()

def generate_summary(model, tokenizer, article):
    """Generate summary with timing measurements"""
    start_time = time.time()
    
    # Tokenization time
    tokenize_start = time.time()
    inputs = tokenizer(
        article,
        max_length=1024,
        truncation=True,
        padding='max_length',
        return_tensors="tf"
    )
    tokenize_time = time.time() - tokenize_start
    
    # Generation time
    generate_start = time.time()
    summary_ids = model.generate(
        inputs["input_ids"],
        num_beams=4,
        max_length=150,
        min_length=40,
        length_penalty=2.0,
        early_stopping=True
    )
    generate_time = time.time() - generate_start
    
    # Decoding time
    decode_start = time.time()
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    decode_time = time.time() - decode_start
    
    total_time = time.time() - start_time
    
    timing_info = {
        'tokenization': tokenize_time,
        'generation': generate_time,
        'decoding': decode_time,
        'total': total_time
    }
    
    return summary, timing_info

def convert_model():
    try:
        print("Starting model conversion process...")
        
        # Set up directories
        base_dir = "../assets/model"
        temp_dir = "../assets/model_temp"
        
        print(f"Output directory will be: {os.path.abspath(base_dir)}")
        
        # Create directories if they don't exist
        for dir_path in [base_dir, temp_dir]:
            if not os.path.exists(dir_path):
                os.makedirs(dir_path)
                print(f"Created directory: {dir_path}")

        # Load model and tokenizer
        model_name = "facebook/bart-large-cnn"
        print(f"Loading model and tokenizer from {model_name}...")
        
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        print("Tokenizer loaded successfully")
        
        print("Loading model (this might take a few minutes)...")
        model = TFAutoModelForSeq2SeqLM.from_pretrained(model_name, from_pt=True)
        print("Model loaded successfully")

        # Test the original model with an actual article
        print("\nTesting original model with actual article...")
        
        # Read an article from archive_texts
        article = read_article("phillipian_20200417_covid.txt")
        print("\nOriginal Article Preview (first 500 chars):")
        print(article[:500], "...\n")
        
        # Generate summary with timing
        summary, timing = generate_summary(model, tokenizer, article)
        
        print("\nGenerated Summary:")
        print(summary)
        print("\nTiming Information:")
        print(f"Tokenization time: {timing['tokenization']:.3f} seconds")
        print(f"Generation time: {timing['generation']:.3f} seconds")
        print(f"Decoding time: {timing['decoding']:.3f} seconds")
        print(f"Total time: {timing['total']:.3f} seconds")
        print("\nOriginal model test successful")

        # Define serving function
        @tf.function(input_signature=[{
            "input_ids": tf.TensorSpec(shape=[None, None], dtype=tf.int32),
            "attention_mask": tf.TensorSpec(shape=[None, None], dtype=tf.int32),
        }])
        def serving_fn(inputs):
            outputs = model(inputs, training=False)
            return {"logits": outputs.logits}

        # Save as SavedModel format
        print("\nSaving as SavedModel format...")
        tf.saved_model.save(
            model,
            temp_dir,
            signatures={"serving_default": serving_fn}
        )
        print("SavedModel saved successfully")

        # Convert to TensorFlow.js format
        print("Converting model to TensorFlow.js format...")
        tfjs.converters.convert_tf_saved_model(
            temp_dir,
            base_dir,
            skip_op_check=True,
            strip_debug_ops=True
        )
        print(f"Model converted and saved to {base_dir}")

        # Save tokenizer and configuration
        print("Saving tokenizer and configuration...")
        tokenizer.save_pretrained(base_dir)
        
        model_config = model.config.to_dict()
        config_path = os.path.join(base_dir, "config.json")
        with open(config_path, "w") as f:
            json.dump(model_config, f)
        print("Configuration saved successfully")

        # Clean up temporary directory
        print("Cleaning up temporary files...")
        shutil.rmtree(temp_dir)
        print("Cleanup completed")

        print("\nConversion completed successfully!")

    except Exception as e:
        print(f"Error during conversion: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise e

if __name__ == "__main__":
    print("Script started")
    convert_model()
    print("Script finished")