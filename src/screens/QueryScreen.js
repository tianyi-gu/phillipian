import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import QueryInput from '../components/Query/QueryInput';
import QueryResult from '../components/Query/QueryResult';
import { API_URL } from '../config/api';

const QueryScreen = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleQuery = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      console.log('Sending question:', question.trim());
      
      const response = await fetch(`${API_URL}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim()
        })
      });

      const data = await response.json();
      console.log('Received response:', data);
      
      setResult(data);
    } catch (error) {
      console.error('Query failed:', error);
      setResult({ error: 'Failed to get answer' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      {/* Header */}
      <View className="pt-12 px-4 pb-4">
        <Text 
          className="text-4xl text-black dark:text-white"
          style={{ fontFamily: "SpaceGroteskBold" }}
        >
          Ask Archives
        </Text>
        <Text 
          className="text-base text-gray-600 dark:text-gray-400 mt-1"
          style={{ fontFamily: "SpaceGrotesk" }}
        >
          Ask Questions About The Phillipian's Archives!
        </Text>
      </View>

      <View style={styles.container}>
        <QueryInput 
          question={question}
          setQuestion={setQuestion}
          onSubmit={handleQuery}
        />
        <ScrollView style={styles.resultContainer}>
          <QueryResult loading={loading} result={result} />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  resultContainer: {
    flex: 1,
    padding: 15,
  },
});

export default QueryScreen;