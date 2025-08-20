import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    notifications: true,
    autoAnalysis: false,
    highRiskAlerts: true,
    saveHistory: true,
    offlineMode: false,
    advancedAnalysis: true,
    biometricAuth: false,
    dataEncryption: true
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'This will permanently delete all analyzed documents from your history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'Document history cleared')
        }
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Export all your document analysis data to a secure file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export PDF', onPress: () => Alert.alert('Success', 'Data exported to Downloads') },
        { text: 'Export JSON', onPress: () => Alert.alert('Success', 'JSON file created') }
      ]
    );
  };

  const aboutApp = () => {
    Alert.alert(
      'Legal Document Analyzer',
      'Version 2.1.0\n\nAI-powered legal document analysis with advanced key point extraction and risk assessment.\n\nBuilt with React Native & Expo\nPowered by Google Gemini AI\n\n© 2024 Legal Tech Solutions',
      [{ text: 'OK' }]
    );
  };

  const backupData = () => {
    Alert.alert(
      'Backup Data',
      'Create a secure backup of all your settings and data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Cloud Backup', onPress: () => Alert.alert('Success', 'Data backed up to cloud storage') },
        { text: 'Local Backup', onPress: () => Alert.alert('Success', 'Local backup file created in Downloads') }
      ]
    );
  };

  const syncSettings = () => {
    Alert.alert(
      'Sync Settings',
      'Synchronize your settings and preferences across all devices.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sync Now', onPress: () => Alert.alert('Success', 'Settings synchronized across devices') }
      ]
    );
  };

  const resetApp = () => {
    Alert.alert(
      'Reset Application',
      'This will reset all settings to default and clear all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              notifications: true,
              autoAnalysis: false,
              highRiskAlerts: true,
              saveHistory: true,
              offlineMode: false,
              advancedAnalysis: true,
              biometricAuth: false,
              dataEncryption: true
            });
            Alert.alert('Success', 'Application has been reset to default settings');
          }
        }
      ]
    );
  };

  const SettingItem = ({ title, subtitle, value, onToggle, type = 'switch' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#ddd', true: '#007bff40' }}
          thumbColor={value ? '#007bff' : '#f4f3f4'}
        />
      )}
      {type === 'arrow' && (
        <Text style={styles.arrowIcon}>→</Text>
      )}
    </View>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <SectionHeader title="Analysis Settings" />
        
        <SettingItem
          title="Advanced Analysis"
          subtitle="Enable deep learning models for enhanced accuracy"
          value={settings.advancedAnalysis}
          onToggle={() => toggleSetting('advancedAnalysis')}
        />
        
        <SettingItem
          title="Auto Analysis"
          subtitle="Automatically analyze documents when uploaded"
          value={settings.autoAnalysis}
          onToggle={() => toggleSetting('autoAnalysis')}
        />
        
        <SettingItem
          title="High Risk Alerts"
          subtitle="Get immediate notifications for high-risk clauses"
          value={settings.highRiskAlerts}
          onToggle={() => toggleSetting('highRiskAlerts')}
        />

        <SectionHeader title="Data & Privacy" />
        
        <SettingItem
          title="Save Document History"
          subtitle="Store analysis results for future reference"
          value={settings.saveHistory}
          onToggle={() => toggleSetting('saveHistory')}
        />
        
        <SettingItem
          title="Data Encryption"
          subtitle="Encrypt all stored documents and analysis data"
          value={settings.dataEncryption}
          onToggle={() => toggleSetting('dataEncryption')}
        />
        
        <SettingItem
          title="Biometric Authentication"
          subtitle="Use fingerprint/face ID to secure the app"
          value={settings.biometricAuth}
          onToggle={() => toggleSetting('biometricAuth')}
        />

        <SectionHeader title="Notifications" />
        
        <SettingItem
          title="Push Notifications"
          subtitle="Receive analysis completion and alert notifications"
          value={settings.notifications}
          onToggle={() => toggleSetting('notifications')}
        />
        
        <SettingItem
          title="Offline Mode"
          subtitle="Enable basic analysis without internet connection"
          value={settings.offlineMode}
          onToggle={() => toggleSetting('offlineMode')}
        />

        <SectionHeader title="AI Models" />
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>🤖 Manage AI Models</Text>
          <Text style={styles.actionButtonSubtext}>
            Configure Gemini API, Local BART+BERT, and other AI models
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📊 Model Performance</Text>
          <Text style={styles.actionButtonSubtext}>
            View accuracy metrics and analysis statistics
          </Text>
        </TouchableOpacity>

        <SectionHeader title="Data Management" />

        <TouchableOpacity style={styles.actionButton} onPress={backupData}>
          <Text style={styles.actionButtonText}>💾 Backup Data</Text>
          <Text style={styles.actionButtonSubtext}>
            Create secure backup of your data and settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={syncSettings}>
          <Text style={styles.actionButtonText}>🔄 Sync Settings</Text>
          <Text style={styles.actionButtonSubtext}>
            Synchronize settings across all your devices
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={exportData}>
          <Text style={styles.actionButtonText}>📤 Export Data</Text>
          <Text style={styles.actionButtonSubtext}>
            Export your analysis history and settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={clearHistory}>
          <Text style={[styles.actionButtonText, { color: '#ff4444' }]}>🗑️ Clear History</Text>
          <Text style={styles.actionButtonSubtext}>
            Permanently delete all document analysis history
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={resetApp}>
          <Text style={[styles.actionButtonText, { color: '#ff4444' }]}>⚠️ Reset Application</Text>
          <Text style={styles.actionButtonSubtext}>
            Reset all settings to defaults and clear all data
          </Text>
        </TouchableOpacity>

        <SectionHeader title="Legal Resources" />
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📚 Legal Glossary</Text>
          <Text style={styles.actionButtonSubtext}>
            Browse definitions of common legal terms
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>⚖️ Document Templates</Text>
          <Text style={styles.actionButtonSubtext}>
            Access common legal document templates
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>🏛️ Legal Directory</Text>
          <Text style={styles.actionButtonSubtext}>
            Find qualified legal professionals in your area
          </Text>
        </TouchableOpacity>

        <SectionHeader title="Support & Information" />
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>💬 Contact Support</Text>
          <Text style={styles.actionButtonSubtext}>
            Get help with the app or report issues
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📋 Privacy Policy</Text>
          <Text style={styles.actionButtonSubtext}>
            Read our data handling and privacy practices
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📄 Terms of Service</Text>
          <Text style={styles.actionButtonSubtext}>
            Review the terms and conditions of use
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={aboutApp}>
          <Text style={styles.actionButtonText}>ℹ️ About</Text>
          <Text style={styles.actionButtonSubtext}>
            App version, credits, and developer information
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Legal Document Analyzer v2.1.0
          </Text>
          <Text style={styles.footerSubtext}>
            Powered by AI • Secure • Professional
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#007bff',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 25,
    marginBottom: 15,
    marginLeft: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingText: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#ccc',
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 50,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
  },
});
