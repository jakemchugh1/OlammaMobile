import axios from 'axios';
import { OllamaModel, GenerateRequest, GenerateResponse, ChatRequest, ChatMessage } from '../types';

const DEFAULT_BASE_URL = 'http://localhost:11434';

class OllamaApiService {
  private baseURL: string;

  constructor(baseURL: string = DEFAULT_BASE_URL) {
    this.baseURL = baseURL;
  }

  setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw new Error('Failed to fetch models. Make sure Ollama server is running.');
    }
  }

  async generateResponse(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, request);
      return response.data;
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response');
    }
  }

  async chat(request: ChatRequest): Promise<ReadableStream<GenerateResponse>> {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...request, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.body as ReadableStream<GenerateResponse>;
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error('Failed to start chat');
    }
  }

  async pullModel(modelName: string): Promise<void> {
    try {
      const response = await axios.post(`${this.baseURL}/api/pull`, {
        name: modelName,
      });
      return response.data;
    } catch (error) {
      console.error('Error pulling model:', error);
      throw new Error(`Failed to pull model: ${modelName}`);
    }
  }

  async deleteModel(modelName: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/api/delete`, {
        data: { name: modelName },
      });
    } catch (error) {
      console.error('Error deleting model:', error);
      throw new Error(`Failed to delete model: ${modelName}`);
    }
  }

  async checkServerStatus(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export const ollamaApi = new OllamaApiService();