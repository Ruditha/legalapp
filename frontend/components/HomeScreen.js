import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [selectedModel, setSelectedModel] = useState('gemini'); // Default to Gemini

  // Request camera and media library permissions
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert('Permission required', 'Camera and media library permissions are needed to upload documents.');
        return false;
      }
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      navigation.navigate('Analysis', {
        imageUri: result.assets[0].uri,
        aiModel: selectedModel
      });
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      navigation.navigate('Analysis', {
        imageUri: result.assets[0].uri,
        aiModel: selectedModel
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Legal Document Analyzer</Text>
        <Text style={styles.subtitle}>AI-Powered Legal Awareness</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>📄 Upload a legal document for AI-powered analysis</Text>
        <Text style={styles.infoSubtext}>Get summaries, key points, and legal insights</Text>
      </View>

      <View style={styles.aiSelectionContainer}>
        <Text style={styles.aiSelectionTitle}>Choose AI Model:</Text>
        <View style={styles.aiButtonsRow}>
          <TouchableOpacity
            style={[styles.aiButton, selectedModel === 'gemini' && styles.aiButtonActive]}
            onPress={() => setSelectedModel('gemini')}
          >
            <Text style={[styles.aiButtonText, selectedModel === 'gemini' && styles.aiButtonTextActive]}>
              🤖 Gemini API
            </Text>
            <Text style={styles.aiButtonSubtext}>Fast & Accurate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.aiButton, selectedModel === 'bart' && styles.aiButtonActive]}
            onPress={() => setSelectedModel('bart')}
          >
            <Text style={[styles.aiButtonText, selectedModel === 'bart' && styles.aiButtonTextActive]}>
              🧠 BART + BERT
            </Text>
            <Text style={styles.aiButtonSubtext}>Local Processing</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
          <Text style={styles.primaryButtonText}>📁 Pick from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
          <Text style={styles.primaryButtonText}>📷 Take Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Features</Text>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>🔍</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Document Analysis</Text>
            <Text style={styles.featureDescription}>Extract and analyze legal document content</Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>📝</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Key Points Extraction</Text>
            <Text style={styles.featureDescription}>Identify crucial legal terms and conditions</Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>💡</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Smart Summaries</Text>
            <Text style={styles.featureDescription}>Get clear, concise document summaries</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  infoSubtext: {
    color: '#1976d2',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  aiSelectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  aiSelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  aiButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  aiButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  aiButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 2,
  },
  aiButtonTextActive: {
    color: '#1976d2',
  },
  aiButtonSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});
