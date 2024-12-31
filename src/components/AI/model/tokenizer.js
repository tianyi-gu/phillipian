class Tokenizer {
    constructor() {
      this.vocab = null;
      this.maxLength = 1024;  // Maximum sequence length
    }
  
    async loadVocab() {
      try {
        // Load vocab.json from assets
        this.vocab = require('../../../../assets/model/vocab.json');
        console.log('Tokenizer vocabulary loaded');
      } catch (error) {
        console.error('Error loading vocabulary:', error);
        throw error;
      }
    }
  
    // Convert text to token IDs
    encode(text) {
      if (!this.vocab) {
        throw new Error('Vocabulary not loaded');
      }
  
      // Basic tokenization (we'll improve this)
      const tokens = text.toLowerCase()
        .split(/\s+/)
        .map(token => this.vocab[token] || this.vocab['[UNK]']);
  
      // Add special tokens
      return [this.vocab['[CLS]'], ...tokens, this.vocab['[SEP]']];
    }
  
    // Convert token IDs back to text
    decode(tokenIds) {
      if (!this.vocab) {
        throw new Error('Vocabulary not loaded');
      }
  
      const reverseVocab = Object.fromEntries(
        Object.entries(this.vocab).map(([k, v]) => [v, k])
      );
  
      return tokenIds
        .map(id => reverseVocab[id] || '[UNK]')
        .join(' ')
        .replace(/\[CLS\]|\[SEP\]/g, '');
    }
  }
  
  export default new Tokenizer();