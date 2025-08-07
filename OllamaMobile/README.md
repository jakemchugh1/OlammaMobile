# Ollama Mobile

A React Native Expo mobile application for interacting with Ollama AI models running on your local network.

## Features

- 💬 **Chat Interface**: Interactive conversations with AI models
- 📚 **Model Management**: View, pull, and delete AI models
- ⚙️ **Settings**: Configure server connection and model parameters
- 🔒 **Privacy First**: All data stays on your local network
- 📱 **Cross-Platform**: Works on both Android and iOS

## Prerequisites

Before using Ollama Mobile, you need:

1. **Ollama installed** on your computer or server
2. **Ollama service running** (`ollama serve`)
3. **At least one model downloaded** (e.g., `ollama pull llama3.2`)
4. **Network connectivity** between your mobile device and Ollama server

## Quick Setup

1. Install and start Ollama on your computer:
   ```bash
   # Install Ollama (visit ollama.com for your platform)
   
   # Start the service
   ollama serve
   
   # Pull a model
   ollama pull llama3.2
   ```

2. Install the mobile app dependencies:
   ```bash
   npm install
   ```

3. Run the app:
   ```bash
   # For iOS simulator
   npm run ios
   
   # For Android emulator
   npm run android
   
   # For web
   npm run web
   ```

## Configuration

1. Open the app and complete the welcome flow
2. Go to **Settings** tab
3. Set your **Server URL** (e.g., `http://192.168.1.100:11434`)
4. Test the connection
5. Go to **Models** tab to see your available models
6. Start chatting in the **Chat** tab!

## Default Server URLs

- **Local computer**: `http://localhost:11434`
- **Same network**: `http://[YOUR_COMPUTER_IP]:11434`
- **Custom port**: `http://[IP]:[PORT]`

## Screens Overview

### 1. Chat Screen
- Send messages to AI models
- View conversation history  
- Copy responses
- Clear chat history

### 2. Models Screen
- List all available models
- View model details (size, parameters, etc.)
- Pull new models from Ollama registry
- Delete unused models
- Refresh model list

### 3. Settings Screen
- Configure server connection
- Test server connectivity
- Adjust model parameters (temperature, top-p, top-k)
- Toggle app preferences
- Reset to default settings

## API Integration

The app communicates with Ollama's REST API:

- `GET /api/tags` - List models
- `POST /api/generate` - Generate responses
- `POST /api/chat` - Chat completion
- `POST /api/pull` - Pull models
- `DELETE /api/delete` - Delete models

## Development

### Project Structure
```
src/
├── components/     # Reusable UI components
├── screens/        # Main app screens
├── services/       # API services
├── types/          # TypeScript type definitions
└── theme/          # App theming
```

### Key Technologies
- **React Native & Expo**: Mobile app framework
- **React Navigation**: Screen navigation
- **React Native Paper**: Material Design components
- **AsyncStorage**: Local data persistence
- **Axios**: HTTP client for API calls

## Troubleshooting

### Can't connect to server?
1. Verify Ollama is running (`ollama serve`)
2. Check your server URL in Settings
3. Ensure both devices are on same network
4. Try your computer's IP address instead of `localhost`

### No models showing?
1. Pull a model: `ollama pull llama3.2`
2. Refresh the models list
3. Check server connection status

### Chat not working?
1. Verify a model is selected
2. Check server connectivity
3. Try a different model
4. Restart the Ollama service

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues related to:
- **Mobile app**: Create an issue in this repository
- **Ollama server**: Visit [ollama.com](https://ollama.com) or [Ollama GitHub](https://github.com/ollama/ollama)