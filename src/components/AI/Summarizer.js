// src/components/AI/Summarizer.js
import * as tf from '@tensorflow/tfjs';
import { load } from '@tensorflow-models/tfjs-converter';

export class Summarizer {
  constructor() {
    this.model = null;
    this.tokenizer = null;
    this.isLoading = false;
  }

  async load() {
    if (this.model && this.tokenizer) {
      return; // Already loaded
    }

    if (this.isLoading) {
      // Wait for existing load to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    try {
      this.isLoading = true;
      console.log('Loading TensorFlow.js...');
      await tf.ready();
      
      console.log('Loading model...');
      this.model = await load('assets/model/model.json');
      
      console.log('Loading tokenizer...');
      const tokenizerResponse = await fetch('assets/model/tokenizer.json');
      this.tokenizer = await tokenizerResponse.json();
      
      console.log('Model and tokenizer loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async tokenize(text) {
    // Prepare input text
    const cleanText = text.trim().replace(/\s+/g, ' ');
    
    // Tokenize input
    const tokens = [];
    let currentToken = '';
    
    for (const char of cleanText) {
      currentToken += char;
      if (this.tokenizer.vocab[currentToken]) {
        tokens.push(this.tokenizer.vocab[currentToken]);
        currentToken = '';
      }
    }
    
    // Add padding and special tokens
    const maxLength = 1024;
    const paddedTokens = [
      this.tokenizer.vocab['<s>'], // Start token
      ...tokens.slice(0, maxLength - 2), // Truncate if too long
      this.tokenizer.vocab['</s>'] // End token
    ];
    
    // Create attention mask
    const attentionMask = new Array(paddedTokens.length).fill(1);
    
    // Pad to max length
    while (paddedTokens.length < maxLength) {
      paddedTokens.push(this.tokenizer.vocab['<pad>']);
      attentionMask.push(0);
    }
    
    return {
      inputIds: tf.tensor2d([paddedTokens], [1, maxLength]),
      attentionMask: tf.tensor2d([attentionMask], [1, maxLength])
    };
  }

  async decode(outputIds) {
    // Create reverse vocab mapping
    const idToToken = Object.fromEntries(
      Object.entries(this.tokenizer.vocab).map(([token, id]) => [id, token])
    );
    
    // Convert ids to tokens
    let text = '';
    for (const id of outputIds) {
      const token = idToToken[id];
      if (token && !token.startsWith('<') && !token.endsWith('>')) {
        text += token.replace('Ġ', ' '); // Handle space tokens
      }
    }
    
    return text.trim();
  }

  async summarize(text) {
    if (!this.model || !this.tokenizer) {
      await this.load();
    }

    try {
      console.log('Tokenizing input...');
      const inputs = await this.tokenize(text);
      
      console.log('Generating summary...');
      const result = await this.model.executeAsync({
        input_ids: inputs.inputIds,
        attention_mask: inputs.attentionMask
      });
      
      // Get the output logits
      const logits = result.logits || result[0];
      
      // Generate summary tokens using greedy decoding
      const outputIds = [];
      const maxLength = 150;
      
      for (let i = 0; i < maxLength; i++) {
        const nextTokenLogits = logits.slice([0, i, 0], [1, 1, -1]);
        const nextToken = await tf.argMax(nextTokenLogits, -1).data();
        outputIds.push(nextToken[0]);
        
        // Stop if we hit the end token
        if (nextToken[0] === this.tokenizer.vocab['</s>']) {
          break;
        }
      }
      
      console.log('Decoding summary...');
      const summary = await this.decode(outputIds);
      
      // Cleanup tensors
      tf.dispose([inputs.inputIds, inputs.attentionMask, ...result]);
      
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const summarizer = new Summarizer();