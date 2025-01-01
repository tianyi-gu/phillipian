import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const QueryResult = ({ loading, result }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!result) return null;

  if (result.error) {
    return (
      <View style={styles.resultBox}>
        <Text style={styles.errorText}>{result.error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.resultBox}>
      <Text style={styles.answerLabel}>Answer:</Text>
      <Text style={styles.answerText}>{result.answer}</Text>
      
      {result.context && (
        <>
          <Text style={styles.contextLabel}>Context:</Text>
          <Text style={styles.contextText}>{result.context}</Text>
        </>
      )}
      
      {result.source && (
        <View style={styles.sourceContainer}>
          <Text style={styles.sourceText}>Source: {result.source}</Text>
          {result.score && (
            <Text style={styles.scoreText}>
              Confidence: {Math.round(result.score * 100)}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultBox: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  contextLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  contextText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ccc',
    marginBottom: 16,
  },
  sourceContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  scoreText: {
    fontSize: 14,
    color: '#888',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
});

export default QueryResult;