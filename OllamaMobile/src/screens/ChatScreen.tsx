import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Surface,
  Text,
  Card,
  IconButton,
  ActivityIndicator,
  Appbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatMessage } from '../types';
import { ollamaApi } from '../services/ollamaApi';

const ChatScreen = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Check if server is running
      const isServerRunning = await ollamaApi.checkServerStatus();
      if (!isServerRunning) {
        Alert.alert(
          'Server Error',
          'Ollama server is not running. Please start the Ollama service.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      const response = await ollamaApi.generateResponse({
        model: selectedModel,
        prompt: inputText.trim(),
        stream: false,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      Alert.alert('Error', 'Failed to get response from model');
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <Card
      style={[
        styles.messageCard,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <Card.Content>
        <Text
          style={[
            styles.messageText,
            item.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
          ]}
        >
          {item.content}
        </Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString()}
        </Text>
      </Card.Content>
    </Card>
  );

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `Hello! I'm ready to help you. I'm currently using the ${selectedModel} model. What would you like to talk about?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={`Chat - ${selectedModel}`} />
        <Appbar.Action icon="delete-sweep" onPress={clearChat} />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderMessage}
          style={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <Surface style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              multiline
              style={styles.textInput}
              disabled={isLoading}
              onSubmitEditing={sendMessage}
            />
            <IconButton
              icon="send"
              disabled={!inputText.trim() || isLoading}
              onPress={sendMessage}
            />
          </View>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flex: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  messageCard: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#000000',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  assistantMessageText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666666',
  },
});

export default ChatScreen;