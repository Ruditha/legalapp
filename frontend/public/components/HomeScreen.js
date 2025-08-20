import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const selectedModel = 'gemini'; // Always use Gemini API

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
        <Text style={styles.title}>Legal Professional Assistant</Text>
        <Text style={styles.subtitle}>AI-Powered Document Analysis & Generation</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>⚖️ Professional Legal Document Assistant</Text>
        <Text style={styles.infoSubtext}>For lawyers, law students & legal professionals</Text>
        <Text style={styles.disclaimerText}>🔒 Secure processing • 📋 Analysis & generation • ⚠️ Professional use only</Text>
      </View>


      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📄 Document Analysis</Text>
        <Text style={styles.sectionSubtitle}>Upload existing documents for AI analysis</Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
          <Text style={styles.primaryButtonText}>📁 Pick from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
          <Text style={styles.primaryButtonText}>📷 Take Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>✍️ Document Generation</Text>
        <Text style={styles.sectionSubtitle}>Create new legal documents from templates</Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => navigation.navigate('DocumentGenerator')}
        >
          <Text style={styles.generateButtonText}>🤖 Generate Document</Text>
          <Text style={styles.generateButtonSubtext}>Rental agreements, NDAs, contracts & more</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navigationContainer}>
        <Text style={styles.navigationTitle}>Quick Access</Text>

        <View style={styles.navigationRow}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.navButtonIcon}>📚</Text>
            <Text style={styles.navButtonText}>History</Text>
            <Text style={styles.navButtonSubtext}>View analyzed documents</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.navButtonIcon}>⚙️</Text>
            <Text style={styles.navButtonText}>Settings</Text>
            <Text style={styles.navButtonSubtext}>App preferences</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Features</Text>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>🔍</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Advanced Analysis</Text>
            <Text style={styles.featureDescription}>AI-powered extraction of critical legal terms, dates, and obligations</Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>⚠️</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Risk Assessment</Text>
            <Text style={styles.featureDescription}>Identify high-risk clauses and potential legal complications</Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>📅</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Critical Dates</Text>
            <Text style={styles.featureDescription}>Extract payment deadlines, contract expiration, and key dates</Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>💰</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Financial Terms</Text>
            <Text style={styles.featureDescription}>Analyze payment amounts, penalties, and financial obligations</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>✍️</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Document Generation</Text>
            <Text style={styles.featureDescription}>Create legal drafts from templates - rental agreements, NDAs, contracts</Text>
          </View>
        </View>
      </View>

      <View style={styles.professionalDisclaimer}>
        <Text style={styles.disclaimerTitle}>⚠️ Professional Use Notice</Text>
        <Text style={styles.disclaimerText}>
          This tool is designed for legal professionals, law students, and those with legal knowledge.
          All AI-generated content is for informational purposes only and should be reviewed by qualified legal counsel.
          Not a substitute for professional legal advice.
        </Text>
        <Text style={styles.privacyNotice}>
          🔒 Privacy: Documents are processed securely. No long-term storage of your documents.
        </Text>
      </View>
    </ScrollView>
  );
}

// Professional color scheme with correct priority: 3,2,1,5,6,4
const colors = {
  // Priority 3 - Most used: Rose/Pink (#D57888)
  primary: '#D57888',      // Soft rose - main brand color (most used)

  // Priority 2 - Slightly less: Brown (#755950)
  secondary: '#755950',    // Warm brown - secondary elements

  // Priority 1 - Slightly less than brown: Navy (#303E4A)
  tertiary: '#303E4A',     // Dark navy - text and accents

  // Priority 5 - Less: Light cream (#F7DFC0)
  background: '#F7DFC0',   // Light cream - subtle backgrounds

  // Priority 6 - Less: Yellow (#FFEE09)
  warning: '#FFEE09',      // Bright yellow - alerts only

  // Priority 4 - Least used: Peach (#F0AF59) - minimal use
  highlight: '#F0AF59',    // Warm peach - very minimal use

  // Supporting colors
  white: '#FFFFFF',
  textPrimary: '#303E4A',     // Navy for main text
  textSecondary: '#755950',   // Brown for secondary text

  // Functional colors
  success: '#D57888',      // Rose for success
  danger: '#303E4A',       // Navy for danger
  info: '#755950'          // Brown for info
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: colors.white,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  infoText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  infoSubtext: {
    color: colors.secondary,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
  },
  disclaimerText: {
    color: colors.accent,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
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
    backgroundColor: colors.secondary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigationContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  navigationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 18,
    textAlign: 'center',
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  navButton: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  navButtonIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.tertiary,
    marginBottom: 6,
  },
  navButtonSubtext: {
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  featureEmoji: {
    fontSize: 28,
    marginRight: 18,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: colors.darkGray,
    textAlign: 'center',
    fontWeight: '500',
  },
  generateButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  generateButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  generateButtonSubtext: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.95,
    fontWeight: '500',
  },
  professionalDisclaimer: {
    backgroundColor: colors.cream,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.peach,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 12,
  },
  privacyNotice: {
    fontSize: 12,
    color: colors.accent,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
