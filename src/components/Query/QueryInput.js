import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const QueryInput = ({ question, setQuestion, onSubmit }) => {
  const handleClear = () => {
    setQuestion('');
  };

  const handleSubmit = () => {
    if (question.trim()) {
      onSubmit();
    }
  };

  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question about Phillipian archives..."
          placeholderTextColor="#666"
          value={question}
          onChangeText={setQuestion}
          returnKeyType="search"
          multiline={true}
          numberOfLines={3}
          textAlignVertical="center"
          blurOnSubmit={true}
          onSubmitEditing={handleSubmit}
          onKeyPress={handleKeyPress}
        />
        {question.length > 0 && (
          <TouchableOpacity 
            onPress={handleClear}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {question.trim().length > 0 && (
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSubmit}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    padding: 15,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    minHeight: 80,
    maxHeight: 120,
    fontSize: 16,
    color: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'center',
  },
  clearButton: {
    padding: 8,
  },
  searchButton: {
    marginTop: 10,
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QueryInput;