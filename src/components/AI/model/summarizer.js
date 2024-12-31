import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

class Summarizer {
  constructor() {
    this.model = null;
    this.isLoading = false;
  }

  async loadModel() {
    if (this.model) return this.model;
    
    try {
      await tf.ready();
      this.isLoading = true;
      
      // Updated paths to match your project structure
      const modelJson = require('../../../../assets/model/model.json');
      const modelWeights = require('../../../../assets/model/weights.bin');
      
      this.model = await tf.loadLayersModel(
        bundleResourceIO(modelJson, modelWeights)
      );
      
      console.log('Model loaded successfully');
      return this.model;
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async generateSummary(text) {
    if (!this.model) {
      await this.loadModel();
    }

    try {
      // TODO: Add tokenization and preprocessing
      const input = tf.tensor([text]);
      const prediction = await this.model.predict(input);
      
      // TODO: Add detokenization and postprocessing
      return prediction;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }
}

export default new Summarizer();