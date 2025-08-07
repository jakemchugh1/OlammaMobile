import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  List,
  Switch,
  TextInput,
  Button,
  Divider,
  Surface,
  Appbar,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ollamaApi } from '../services/ollamaApi';

interface Settings {
  serverUrl: string;
  temperature: number;
  topP: number;
  topK: number;
  darkMode: boolean;
  streamResponse: boolean;
  autoSave: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  serverUrl: 'http://localhost:11434',
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  darkMode: false,
  streamResponse: true,
  autoSave: true,
};

const SettingsScreen = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [tempUrl, setTempUrl] = useState('');

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('app_settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        setTempUrl(parsed.serverUrl || DEFAULT_SETTINGS.serverUrl);
      } else {
        setTempUrl(DEFAULT_SETTINGS.serverUrl);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const checkServerStatus = async () => {
    setServerStatus('checking');
    try {
      const isConnected = await ollamaApi.checkServerStatus();
      setServerStatus(isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      setServerStatus('disconnected');
    }
  };

  const updateServerUrl = () => {
    if (tempUrl.trim() === '') {
      Alert.alert('Error', 'Server URL cannot be empty');
      return;
    }

    const newSettings = { ...settings, serverUrl: tempUrl.trim() };
    saveSettings(newSettings);
    ollamaApi.setBaseURL(tempUrl.trim());
    checkServerStatus();
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            saveSettings(DEFAULT_SETTINGS);
            setTempUrl(DEFAULT_SETTINGS.serverUrl);
            ollamaApi.setBaseURL(DEFAULT_SETTINGS.serverUrl);
            checkServerStatus();
          },
        },
      ]
    );
  };

  const getStatusIcon = () => {
    switch (serverStatus) {
      case 'checking':
        return 'loading';
      case 'connected':
        return 'check-circle';
      case 'disconnected':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'connected':
        return '#4CAF50';
      case 'disconnected':
        return '#F44336';
      default:
        return '#FFC107';
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings.serverUrl) {
      ollamaApi.setBaseURL(settings.serverUrl);
      checkServerStatus();
    }
  }, [settings.serverUrl]);

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
        <Appbar.Action icon="restore" onPress={resetSettings} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Server Settings */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Server Configuration
          </Text>
          
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.serverStatus}>
                <Text variant="bodyMedium">Server Status</Text>
                <View style={styles.statusRow}>
                  <IconButton
                    icon={getStatusIcon()}
                    iconColor={getStatusColor()}
                    size={20}
                  />
                  <Text
                    variant="bodyMedium"
                    style={{ color: getStatusColor() }}
                  >
                    {serverStatus === 'checking'
                      ? 'Checking...'
                      : serverStatus === 'connected'
                      ? 'Connected'
                      : 'Disconnected'}
                  </Text>
                </View>
              </View>

              <TextInput
                label="Server URL"
                value={tempUrl}
                onChangeText={setTempUrl}
                placeholder="http://localhost:11434"
                style={styles.input}
              />

              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={checkServerStatus}
                  style={styles.button}
                >
                  Test Connection
                </Button>
                <Button
                  mode="contained"
                  onPress={updateServerUrl}
                  style={styles.button}
                >
                  Save URL
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Surface>

        {/* Model Parameters */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Model Parameters
          </Text>
          
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.parameterRow}>
                <Text variant="bodyMedium">Temperature: {settings.temperature}</Text>
                <Text variant="bodySmall" style={styles.parameterDesc}>
                  Higher values make output more creative
                </Text>
              </View>

              <View style={styles.parameterRow}>
                <Text variant="bodyMedium">Top P: {settings.topP}</Text>
                <Text variant="bodySmall" style={styles.parameterDesc}>
                  Nucleus sampling parameter
                </Text>
              </View>

              <View style={styles.parameterRow}>
                <Text variant="bodyMedium">Top K: {settings.topK}</Text>
                <Text variant="bodySmall" style={styles.parameterDesc}>
                  Limits token selection to top K options
                </Text>
              </View>
            </Card.Content>
          </Card>
        </Surface>

        {/* App Preferences */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            App Preferences
          </Text>
          
          <Card style={styles.card}>
            <List.Item
              title="Stream Responses"
              description="Show responses as they're generated"
              right={() => (
                <Switch
                  value={settings.streamResponse}
                  onValueChange={(value) =>
                    saveSettings({ ...settings, streamResponse: value })
                  }
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Auto-save Chats"
              description="Automatically save chat history"
              right={() => (
                <Switch
                  value={settings.autoSave}
                  onValueChange={(value) =>
                    saveSettings({ ...settings, autoSave: value })
                  }
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Dark Mode"
              description="Use dark theme (coming soon)"
              right={() => (
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) =>
                    saveSettings({ ...settings, darkMode: value })
                  }
                  disabled
                />
              )}
            />
          </Card>
        </Surface>

        {/* App Information */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            About
          </Text>
          
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.aboutText}>
                Ollama Mobile
              </Text>
              <Text variant="bodySmall" style={styles.aboutText}>
                Version 1.0.0
              </Text>
              <Text variant="bodySmall" style={styles.aboutText}>
                A mobile client for Ollama AI models
              </Text>
            </Card.Content>
          </Card>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontWeight: 'bold',
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  serverStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 0.48,
  },
  parameterRow: {
    marginBottom: 16,
  },
  parameterDesc: {
    color: '#666666',
    marginTop: 4,
  },
  aboutText: {
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default SettingsScreen;