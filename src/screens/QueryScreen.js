import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
  },
  resultContainer: {
    flex: 1,
    padding: 15,
  },
});

export default QueryScreen;