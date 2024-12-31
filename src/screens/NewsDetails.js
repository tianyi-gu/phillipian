import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { summarizer } from '../components/AI/Summarizer';

export default function NewsDetails({ route }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const { article } = route.params;

  const generateSummary = async () => {
    setLoading(true);
    try {
      const result = await summarizer.summarize(article.content);
      setSummary(result);
    } catch (error) {
      console.error('Summary generation failed:', error);
      // TODO: Add error handling UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.date}>{article.publishDate}</Text>
      <Text style={styles.author}>By {article.author}</Text>
      
      <TouchableOpacity 
        style={[
          styles.summaryButton,
          loading && styles.summaryButtonDisabled
        ]}
        onPress={generateSummary}
        disabled={loading}
      >
        <Text style={styles.summaryButtonText}>
          {loading ? "Generating Summary..." : "Generate Summary"}
        </Text>
        {loading && <ActivityIndicator color="#fff" style={styles.loader} />}
      </TouchableOpacity>

      {summary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      )}

      <Text style={styles.content}>{article.content}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
  },
  summaryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryButtonDisabled: {
    backgroundColor: '#999',
  },
  summaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginLeft: 8,
  },
  summaryContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
