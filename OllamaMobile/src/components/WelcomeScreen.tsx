import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WelcomeScreenProps {
  onComplete: () => void;
}

enum Step {
  WELCOME = 0,
  SETUP,
  FINISH,
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>(Step.WELCOME);

  const handleNext = () => {
    if (step === Step.WELCOME) {
      setStep(Step.SETUP);
    } else if (step === Step.SETUP) {
      setStep(Step.FINISH);
    } else {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {step === Step.WELCOME && (
          <View style={styles.step}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>🦙</Text>
            </View>
            
            <Text variant="headlineMedium" style={styles.title}>
              Welcome to Ollama Mobile
            </Text>
            
            <Text variant="bodyLarge" style={styles.subtitle}>
              Chat with AI models running locally on your network
            </Text>
            
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.button}
            >
              Get Started
            </Button>
          </View>
        )}

        {step === Step.SETUP && (
          <View style={styles.step}>
            <Text variant="headlineSmall" style={styles.title}>
              Setup Requirements
            </Text>
            
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Before you begin:
                </Text>
                
                <Text variant="bodyMedium" style={styles.requirement}>
                  • Install Ollama on your computer or server
                </Text>
                
                <Text variant="bodyMedium" style={styles.requirement}>
                  • Ensure Ollama service is running
                </Text>
                
                <Text variant="bodyMedium" style={styles.requirement}>
                  • Your mobile device and Ollama server must be on the same network
                </Text>
                
                <Text variant="bodyMedium" style={styles.requirement}>
                  • Download at least one model (e.g., llama3.2)
                </Text>
              </Card.Content>
            </Card>

            <Surface style={styles.commandCard}>
              <Text variant="titleSmall" style={styles.commandTitle}>
                Quick Setup Commands:
              </Text>
              <Text variant="bodyMedium" style={styles.command}>
                ollama serve
              </Text>
              <Text variant="bodyMedium" style={styles.command}>
                ollama pull llama3.2
              </Text>
            </Surface>
            
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.button}
            >
              Continue
            </Button>
          </View>
        )}

        {step === Step.FINISH && (
          <View style={styles.step}>
            <Text variant="headlineSmall" style={styles.title}>
              You're all set!
            </Text>
            
            <Text variant="bodyLarge" style={styles.subtitle}>
              Configure your server connection in the Settings tab, then start chatting with your AI models.
            </Text>

            <Card style={styles.featuresCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Features:
                </Text>
                
                <Text variant="bodyMedium" style={styles.feature}>
                  💬 Chat with local AI models
                </Text>
                
                <Text variant="bodyMedium" style={styles.feature}>
                  📚 Manage your model library
                </Text>
                
                <Text variant="bodyMedium" style={styles.feature}>
                  ⚙️ Customize model parameters
                </Text>
                
                <Text variant="bodyMedium" style={styles.feature}>
                  🔒 Private and secure (no data leaves your network)
                </Text>
              </Card.Content>
            </Card>
            
            <Button
              mode="contained"
              onPress={onComplete}
              style={styles.button}
            >
              Start Using Ollama Mobile
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  step: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    fontSize: 80,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666666',
    paddingHorizontal: 16,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 32,
  },
  infoCard: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
  },
  featuresCard: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
  },
  cardTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  requirement: {
    marginBottom: 8,
    lineHeight: 20,
  },
  feature: {
    marginBottom: 8,
    lineHeight: 20,
  },
  commandCard: {
    width: '100%',
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  commandTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  command: {
    fontFamily: 'monospace',
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
});

export default WelcomeScreen;