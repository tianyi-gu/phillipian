import React, { useState } from 'react';
import { TouchableOpacity, Text, Modal, View, ActivityIndicator } from 'react-native';

export const SummaryButton = ({ articleContent }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple extractive summarization for now
  const generateSummary = async () => {
    setLoading(true);
    try {
      // Simple summary logic - get first few sentences
      const sentences = articleContent.split(/[.!?]+/).filter(Boolean);
      const simpleSummary = sentences.slice(0, 3).join('. ') + '.';
      setSummary(simpleSummary);
    } catch (error) {
      console.error('Summary generation failed:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setModalVisible(true);
          generateSummary();
        }}
        className="bg-blue-500 p-3 rounded-lg mx-4 mb-4"
      >
        <Text className="text-white text-center font-medium">
          Summarize Article
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold dark:text-white">
                Summary
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-blue-500">Close</Text>
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <View className="py-8">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="text-center mt-2 dark:text-white">
                  Generating summary...
                </Text>
              </View>
            ) : (
              <Text className="text-gray-800 dark:text-gray-200 leading-6">
                {summary}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};