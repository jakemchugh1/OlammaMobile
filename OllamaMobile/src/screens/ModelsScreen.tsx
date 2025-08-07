import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  IconButton,
  ActivityIndicator,
  Searchbar,
  Chip,
  Appbar,
  Surface,
  FAB,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OllamaModel } from '../types';
import { ollamaApi } from '../services/ollamaApi';

const ModelsScreen = () => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [pullDialogVisible, setPullDialogVisible] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [pullingModel, setPullingModel] = useState(false);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const serverStatus = await ollamaApi.checkServerStatus();
      setIsServerConnected(serverStatus);
      
      if (serverStatus) {
        const modelList = await ollamaApi.listModels();
        setModels(modelList);
        setFilteredModels(modelList);
      } else {
        setModels([]);
        setFilteredModels([]);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setIsServerConnected(false);
      setModels([]);
      setFilteredModels([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchModels();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredModels(models);
    } else {
      const filtered = models.filter(model =>
        model.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredModels(filtered);
    }
  };

  const deleteModel = (modelName: string) => {
    Alert.alert(
      'Delete Model',
      `Are you sure you want to delete "${modelName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ollamaApi.deleteModel(modelName);
              await fetchModels(); // Refresh the list
              Alert.alert('Success', 'Model deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete model');
            }
          },
        },
      ]
    );
  };

  const pullModel = async () => {
    if (!newModelName.trim()) return;

    setPullingModel(true);
    try {
      await ollamaApi.pullModel(newModelName.trim());
      Alert.alert('Success', `Model "${newModelName}" pulled successfully`);
      setNewModelName('');
      setPullDialogVisible(false);
      await fetchModels(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', `Failed to pull model: ${newModelName}`);
    } finally {
      setPullingModel(false);
    }
  };

  const formatSize = (size: string) => {
    const bytes = parseInt(size);
    if (isNaN(bytes)) return size;
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let value = bytes;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const renderModel = ({ item }: { item: OllamaModel }) => (
    <Card style={styles.modelCard}>
      <Card.Content>
        <View style={styles.modelHeader}>
          <Text variant="titleMedium" style={styles.modelName}>
            {item.name}
          </Text>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => deleteModel(item.name)}
          />
        </View>
        
        <View style={styles.modelDetails}>
          <Chip mode="outlined" compact style={styles.chip}>
            {item.details.parameter_size}
          </Chip>
          <Chip mode="outlined" compact style={styles.chip}>
            {formatSize(item.size)}
          </Chip>
          <Chip mode="outlined" compact style={styles.chip}>
            {item.details.family}
          </Chip>
        </View>
        
        <Text variant="bodySmall" style={styles.modelInfo}>
          Modified: {new Date(item.modified_at).toLocaleDateString()}
        </Text>
        
        {item.details.quantization_level && (
          <Text variant="bodySmall" style={styles.modelInfo}>
            Quantization: {item.details.quantization_level}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  useEffect(() => {
    fetchModels();
  }, []);

  if (!isServerConnected && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="Models" />
          <Appbar.Action icon="refresh" onPress={fetchModels} />
        </Appbar.Header>
        
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorTitle}>
            Server Not Connected
          </Text>
          <Text variant="bodyLarge" style={styles.errorText}>
            Unable to connect to Ollama server. Please make sure:
          </Text>
          <Text variant="bodyMedium" style={styles.errorBullet}>
            • Ollama is installed and running
          </Text>
          <Text variant="bodyMedium" style={styles.errorBullet}>
            • Server is accessible at the configured URL
          </Text>
          <Button mode="contained" onPress={fetchModels} style={styles.retryButton}>
            Retry Connection
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Models" />
        <Appbar.Action icon="refresh" onPress={fetchModels} />
      </Appbar.Header>

      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search models..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
      </Surface>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading models...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredModels}
          keyExtractor={item => item.digest}
          renderItem={renderModel}
          style={styles.modelsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge">No models found</Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Pull a model to get started
              </Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setPullDialogVisible(true)}
        label="Pull Model"
      />

      <Portal>
        <Dialog visible={pullDialogVisible} onDismiss={() => setPullDialogVisible(false)}>
          <Dialog.Title>Pull New Model</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Model Name (e.g., llama3.2, gemma3)"
              value={newModelName}
              onChangeText={setNewModelName}
              disabled={pullingModel}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPullDialogVisible(false)} disabled={pullingModel}>
              Cancel
            </Button>
            <Button onPress={pullModel} loading={pullingModel} disabled={!newModelName.trim()}>
              Pull Model
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  searchbar: {
    backgroundColor: '#f0f0f0',
  },
  modelsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modelCard: {
    marginVertical: 4,
    backgroundColor: '#ffffff',
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelName: {
    flex: 1,
    fontWeight: 'bold',
  },
  modelDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  modelInfo: {
    color: '#666666',
    marginBottom: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptySubtext: {
    marginTop: 8,
    color: '#666666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#666666',
  },
  errorBullet: {
    marginBottom: 8,
    color: '#666666',
  },
  retryButton: {
    marginTop: 24,
  },
});

export default ModelsScreen;