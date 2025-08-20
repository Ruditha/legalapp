import 'regenerator-runtime/runtime';
import { AppRegistry } from 'react-native';
import App from './App';

// Enhanced error handling for React Native Web
try {
  // Register the app
  AppRegistry.registerComponent('LegalAwarenessApp', () => App);

  // Wait for DOM to be ready
  const startApp = () => {
    const rootTag = document.getElementById('root');
    if (!rootTag) {
      console.error('Root element not found');
      return;
    }

    // Run the app in the browser
    AppRegistry.runApplication('LegalAwarenessApp', {
      initialProps: {},
      rootTag: rootTag,
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
  } else {
    startApp();
  }

} catch (error) {
  console.error('Error initializing app:', error);
}
