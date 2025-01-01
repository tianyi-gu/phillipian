import os
import logging
import tensorflow as tf
from transformers import AutoTokenizer, TFAutoModelForSeq2SeqLM, AutoConfig

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_to_tflite(model, base_dir):
    """Convert TF model to TFLite format"""
    try:
        logger.info("Converting to TFLite...")
        
        # Create concrete function that accepts growing decoder sequence
        class WrappedModel(tf.Module):
            def __init__(self, model):
                super().__init__()
                self.model = model
            
            @tf.function(input_signature=[
                tf.TensorSpec(shape=[1, 128], dtype=tf.int32, name='input_ids'),
                tf.TensorSpec(shape=[1, 128], dtype=tf.int32, name='attention_mask'),
                tf.TensorSpec(shape=[1, None], dtype=tf.int32, name='decoder_input_ids')  # Dynamic sequence length
            ])
            def generate(self, input_ids, attention_mask, decoder_input_ids):
                return self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    decoder_input_ids=decoder_input_ids
                )['logits']
        
        wrapped_model = WrappedModel(model)
        concrete_func = wrapped_model.generate.get_concrete_function()
        
        # Convert to TFLite
        converter = tf.lite.TFLiteConverter.from_concrete_functions([concrete_func])
        
        # Enable dynamic shapes
        converter.target_spec.supported_ops = [
            tf.lite.OpsSet.TFLITE_BUILTINS,
            tf.lite.OpsSet.SELECT_TF_OPS
        ]
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.float32]  # Use full precision for better quality
        converter.allow_custom_ops = True
        converter.experimental_new_converter = True
        
        # Important: Enable dynamic shapes
        converter._experimental_disable_per_channel = True
        converter.experimental_enable_resource_variables = True
        
        # Convert model
        logger.info("Starting conversion...")
        tflite_model = converter.convert()
        
        # Save model
        os.makedirs(os.path.join(base_dir, 'assets/model'), exist_ok=True)
        tflite_path = os.path.join(base_dir, 'assets/model/model.tflite')
        with open(tflite_path, 'wb') as f:
            f.write(tflite_model)
            
        logger.info(f"TFLite model saved to {tflite_path}")
        return tflite_path
        
    except Exception as e:
        logger.error(f"Error in convert_to_tflite: {str(e)}")
        raise

def convert_model(model_name="facebook/bart-large-cnn", base_dir="."):
    """Convert and save the model and tokenizer"""
    try:
        logger.info(f"Loading model and tokenizer from {model_name}...")
        
        config = AutoConfig.from_pretrained(model_name)
        config.use_cache = False
        
        model = TFAutoModelForSeq2SeqLM.from_pretrained(
            model_name,
            config=config,
            from_pt=True
        )
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        # Save tokenizer
        tokenizer_path = os.path.join(base_dir, 'assets/tokenizer')
        os.makedirs(tokenizer_path, exist_ok=True)
        tokenizer.save_pretrained(tokenizer_path)
        
        # Convert and save model
        tflite_path = convert_to_tflite(model, base_dir)
        
        logger.info("Model conversion completed successfully!")
        return tflite_path
        
    except Exception as e:
        logger.error(f"Error during conversion: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        convert_model()
    except Exception as e:
        logger.error(f"Failed to convert model: {str(e)}")
        raise
