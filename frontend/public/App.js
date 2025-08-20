import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './components/HomeScreen';
import StructuredAnalysisScreen from './components/StructuredAnalysisScreen';
import HistoryScreen from './components/HistoryScreen';
import SettingsScreen from './components/SettingsScreen';
import SimpleDocumentGenerator from './components/SimpleDocumentGenerator';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [imageUri, setImageUri] = useState(null);
  const [routeParams, setRouteParams] = useState({});

  const navigation = {
    navigate: (screen, params = {}) => {
      setCurrentScreen(screen);
      setRouteParams(params);
      if (params.imageUri) {
        setImageUri(params.imageUri);
      }
    },
    goBack: () => {
      // Smart back navigation
      if (currentScreen === 'Analysis') {
        setCurrentScreen('Home');
      } else {
        setCurrentScreen('Home');
      }
      setImageUri(null);
      setRouteParams({});
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Analysis':
        return (
          <StructuredAnalysisScreen
            route={{ params: { imageUri, ...routeParams } }}
            navigation={navigation}
          />
        );
      case 'History':
        return (
          <HistoryScreen
            navigation={navigation}
          />
        );
      case 'Settings':
        return (
          <SettingsScreen
            navigation={navigation}
          />
        );
      case 'DocumentGenerator':
        return (
          <SimpleDocumentGenerator
            navigation={navigation}
          />
        );
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#007bff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {currentScreen === 'Analysis' ? 'Document Analysis' : currentScreen === 'DocumentGenerator' ? 'Document Generator' : 'Legal Professional Assistant'}
        </Text>
      </View>
      <View style={styles.content}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
}

const colors = {
  primary: '#303E4A',      // Dark blue-gray
  secondary: '#4F63AC',    // Blue
  white: '#FFFFFF',
  lightGray: '#F8F9FA',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
});
