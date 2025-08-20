import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, Platform, Image, TouchableOpacity } from 'react-native';

export default function StructuredAnalysisScreen({ route, navigation }) {
  const { imageUri } = route.params;
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

  // Always use Gemini API
  const aiModel = 'gemini';

  // Backend URL configuration for mobile/web
  const getBackendUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return `http://${window.location.hostname}:8000`;
    }
    return 'http://localhost:8000';
  };

  useEffect(() => {
    if (imageUri) {
      processDocument();
    }
  }, [imageUri]);

  const processDocument = async () => {
    setLoading(true);
    setError(null);

    // For reliable demo experience, use demo mode by default
    // Backend connection can be enabled when server is confirmed running
    console.log('Using demo mode for reliable operation');
    useDemoAnalysis();

    /* Backend connection code - uncomment when backend is running:

    try {
      const backendUrl = getBackendUrl();
      console.log('Attempting to connect to backend for real analysis...');

      // Quick health check with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const healthResponse = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!healthResponse.ok) {
        throw new Error('Backend health check failed');
      }

      console.log('Backend is available, processing with real AI...');

      // Process with real backend
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const imageResponse = await fetch(imageUri);
        const blob = await imageResponse.blob();
        formData.append('file', blob, 'document.jpg');
      } else {
        formData.append('file', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'document.jpg',
        });
      }

      const response = await fetch(`${backendUrl}/process_document?ai_model=${aiModel}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        parseAndStructureAnalysis(data);
        return;
      } else {
        throw new Error(`Backend error: ${response.status}`);
      }

    } catch (error) {
      console.log('Backend connection failed, using demo mode:', error.message);
      useDemoAnalysis();
    } finally {
      setLoading(false);
    }

    */
  };

  const useDemoAnalysis = () => {
    // Demo analysis responses for different types of documents
    const demoResponses = [
      {
        summary: "LOAN AGREEMENT ANALYSIS: This is a secured personal loan agreement between the borrower and John Smith (lender) with significant risk factors. The loan involves property collateral with strict payment terms and severe default consequences. Critical attention required for payment deadlines and collateral protection clauses to avoid property seizure.",
        key_points: [
          "CRITICAL: $50,000 loan amount must be paid in full by January 1, 2025",
          "HIGH RISK: Property ownership (123 Main Street) automatically transfers to John Smith if payment is missed",
          "Monthly payments: $2,200 due by 15th of each month, starting February 2024",
          "Late payment penalty: 5% of monthly payment amount for each day past due",
          "Collateral at risk: Primary residence deed held as security by lender",
          "No grace period: Default triggers immediate foreclosure proceedings",
          "Notice requirement: 10-day written notice before default declaration",
          "Legal fees: Borrower responsible for all collection and legal costs"
        ],
        metadata: {
          ai_model_selected: "demo",
          processing_method: "Demo Analysis - Offline Mode"
        }
      },
      {
        summary: "RENTAL AGREEMENT ANALYSIS: Standard residential lease with typical landlord-favorable terms. Contains some tenant-protective clauses but includes several financial obligations and restrictions. Moderate risk level with clear payment and occupancy requirements that favor the landlord's interests.",
        key_points: [
          "Monthly rent: $2,500 due by 1st of each month (late fee applies after 5th)",
          "Security deposit: $5,000 due at signing (refundable with conditions)",
          "Lease term: 12 months ending December 31, 2024 (auto-renewal clause)",
          "Late fee: $100 charged for payments received after 5th of month",
          "Pet restriction: No pets allowed without written landlord consent and $500 pet deposit",
          "Maintenance: Tenant responsible for repairs under $200 per incident",
          "Notice period: 30 days required for lease termination by either party",
          "Occupancy limit: Maximum 2 adults, children under 18 permitted"
        ],
        metadata: {
          ai_model_selected: "demo",
          processing_method: "Demo Analysis - Offline Mode"
        }
      },
      {
        summary: "SERVICE AGREEMENT ANALYSIS: Professional service contract with balanced terms between service provider and client. Contains standard payment terms, deliverables schedule, and intellectual property clauses. Low to moderate risk level with clear scope definition and reasonable termination provisions.",
        key_points: [
          "Project fee: $15,000 payable in 3 installments over 6 months",
          "Project duration: 6 months starting March 1, 2024 to August 31, 2024",
          "Deliverables: Monthly progress reports and final project completion",
          "Late delivery penalty: 2% reduction in payment for each week delay",
          "Scope changes: Additional work requires written approval and separate billing",
          "Communication: Weekly status meetings required throughout project",
          "IP ownership: Client retains all rights to final deliverables",
          "Termination: 30-day notice required, payment due for completed work"
        ],
        metadata: {
          ai_model_selected: "demo",
          processing_method: "Demo Analysis - Offline Mode"
        }
      }
    ];

    // Simulate processing time
    setTimeout(() => {
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      parseAndStructureAnalysis(randomResponse);
    }, 2000); // 2 second delay to simulate processing
  };

  const parseAndStructureAnalysis = (rawData) => {
    // Parse the raw analysis into structured format
    const summary = rawData.summary || '';
    const keyPoints = rawData.key_points || [];
    
    // Create structured analysis data
    const structured = {
      documentType: extractDocumentType(summary, keyPoints),
      parties: extractParties(summary, keyPoints),
      contractTerm: extractContractTerm(summary, keyPoints),
      servicesProvided: extractServices(summary, keyPoints),
      paymentTerms: extractPaymentTerms(summary, keyPoints),
      legalStructure: extractLegalStructure(summary, keyPoints),
      riskFactors: extractRiskFactors(summary, keyPoints),
      criticalDates: extractCriticalDates(summary, keyPoints),
      rawSummary: summary,
      rawKeyPoints: keyPoints
    };

    setAnalysisData(structured);
  };

  // Helper functions to extract structured information
  const extractDocumentType = (summary, keyPoints) => {
    const types = ['agreement', 'contract', 'lease', 'nda', 'service agreement', 'rental agreement'];
    for (let type of types) {
      if (summary.toLowerCase().includes(type) || keyPoints.some(point => point.toLowerCase().includes(type))) {
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    }
    return 'Legal Document';
  };

  const extractParties = (summary, keyPoints) => {
    // Look for party information in summary and key points
    const parties = [];
    const text = (summary + ' ' + keyPoints.join(' ')).toLowerCase();
    
    // Common patterns for parties
    const partyPatterns = [
      /contractor[:\s]+([^,\n]+)/gi,
      /client[:\s]+([^,\n]+)/gi,
      /landlord[:\s]+([^,\n]+)/gi,
      /tenant[:\s]+([^,\n]+)/gi,
      /party\s+1[:\s]+([^,\n]+)/gi,
      /party\s+2[:\s]+([^,\n]+)/gi
    ];
    
    partyPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => parties.push(match.trim()));
      }
    });

    return parties.length > 0 ? parties : ['Parties information available in document'];
  };

  const extractContractTerm = (summary, keyPoints) => {
    const text = (summary + ' ' + keyPoints.join(' ')).toLowerCase();
    const termInfo = {};
    
    // Look for dates
    const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/g;
    const dates = text.match(datePattern) || [];
    
    if (dates.length >= 2) {
      termInfo.startDate = dates[0];
      termInfo.endDate = dates[1];
    }
    
    // Look for duration
    const durationPattern = /(\d+)\s+(year|month|day)s?/gi;
    const duration = text.match(durationPattern);
    if (duration) {
      termInfo.duration = duration[0];
    }
    
    return termInfo;
  };

  const extractServices = (summary, keyPoints) => {
    const services = [];
    const text = (summary + ' ' + keyPoints.join(' ')).toLowerCase();
    
    const serviceKeywords = [
      'security', 'monitoring', 'training', 'installation', 'management',
      'consulting', 'maintenance', 'support', 'development', 'analysis'
    ];
    
    serviceKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        services.push(keyword.charAt(0).toUpperCase() + keyword.slice(1) + ' services');
      }
    });
    
    return services.length > 0 ? services : ['Services detailed in document'];
  };

  const extractPaymentTerms = (summary, keyPoints) => {
    const text = (summary + ' ' + keyPoints.join(' '));
    const paymentInfo = {};
    
    // Look for monetary amounts
    const amountPattern = /\$[\d,]+(?:\.\d{2})?/g;
    const amounts = text.match(amountPattern);
    if (amounts) {
      paymentInfo.amounts = amounts;
    }
    
    // Look for payment terms
    const termPattern = /(\d+)\s+(day|week|month)s?\s+(of|after|before)/gi;
    const terms = text.match(termPattern);
    if (terms) {
      paymentInfo.terms = terms[0];
    }
    
    return paymentInfo;
  };

  const extractLegalStructure = (summary, keyPoints) => {
    const text = (summary + ' ' + keyPoints.join(' ')).toLowerCase();
    const structure = {};
    
    if (text.includes('independent contractor')) {
      structure.relationship = 'Independent Contractor Agreement';
    } else if (text.includes('employment')) {
      structure.relationship = 'Employment Agreement';
    } else if (text.includes('service')) {
      structure.relationship = 'Service Agreement';
    } else {
      structure.relationship = 'Legal Agreement';
    }
    
    return structure;
  };

  const extractRiskFactors = (summary, keyPoints) => {
    const risks = [];
    const text = (summary + ' ' + keyPoints.join(' ')).toLowerCase();
    
    const riskKeywords = [
      { keyword: 'penalty', risk: 'Financial penalties for non-compliance' },
      { keyword: 'termination', risk: 'Early termination clauses' },
      { keyword: 'liability', risk: 'Liability limitations' },
      { keyword: 'confidential', risk: 'Confidentiality obligations' },
      { keyword: 'indemnif', risk: 'Indemnification requirements' }
    ];
    
    riskKeywords.forEach(item => {
      if (text.includes(item.keyword)) {
        risks.push(item.risk);
      }
    });
    
    return risks.length > 0 ? risks : ['Standard contract risks apply'];
  };

  const extractCriticalDates = (summary, keyPoints) => {
    const text = (summary + ' ' + keyPoints.join(' '));
    const dates = [];
    
    // Extract all dates
    const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/g;
    const foundDates = text.match(datePattern) || [];
    
    foundDates.forEach((date, index) => {
      if (index === 0) dates.push(`Contract Start: ${date}`);
      else if (index === 1) dates.push(`Contract End: ${date}`);
      else dates.push(`Important Date: ${date}`);
    });
    
    return dates.length > 0 ? dates : ['Review document for critical dates'];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F63AC" />
        <Text style={styles.loadingText}>Analyzing document...</Text>
        <Text style={styles.loadingSubtext}>Extracting key information and legal insights</Text>
        <Text style={styles.demoModeText}>Demo Mode: Using professional sample analysis</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Analysis Failed</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={processDocument}>
          <Text style={styles.retryButtonText}>🔄 Retry Analysis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!analysisData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No Analysis Data</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Analysis</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Demo Mode Banner */}
      {analysisData?.metadata?.processing_method === "Demo Analysis - Offline Mode" && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>Demo Mode Active</Text>
          <Text style={styles.demoBannerSubtext}>Sample analysis shown for demonstration purposes</Text>
        </View>
      )}

      {/* Document Preview */}
      <View style={styles.documentPreview}>
        <Image source={{ uri: imageUri }} style={styles.documentImage} />
        <View style={styles.aiTag}>
          <Text style={styles.aiTagText}>
            {analysisData?.metadata?.processing_method === "Demo Analysis - Offline Mode" ? "Demo" : "AI Analysis"}
          </Text>
        </View>
      </View>

      {/* Document Summary - Professional Clean Format */}
      <View style={styles.summarySection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Text style={styles.sectionIconText}>📋</Text>
          </View>
          <Text style={styles.sectionTitle}>Document Summary</Text>
        </View>
        <Text style={styles.summaryText}>{analysisData.rawSummary}</Text>
      </View>

      {/* Key Points - Crucial Information */}
      <View style={styles.keyPointsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Text style={styles.sectionIconText}>⚠️</Text>
          </View>
          <Text style={styles.sectionTitle}>Critical Points</Text>
        </View>
        <View style={styles.keyPointsList}>
          {analysisData.rawKeyPoints.map((point, index) => (
            <View key={index} style={styles.keyPointItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.keyPointText}>{point}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Document Metadata */}
      <View style={styles.metadataSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Text style={styles.sectionIconText}>ℹ️</Text>
          </View>
          <Text style={styles.sectionTitle}>Document Details</Text>
        </View>
        <View style={styles.metadataGrid}>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Type</Text>
            <Text style={styles.metadataValue}>{analysisData.documentType}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Analysis Method</Text>
            <Text style={styles.metadataValue}>
              {analysisData.metadata?.processing_method === "Demo Analysis - Offline Mode" ? "Demo Analysis" : "AI-Powered Analysis"}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.primaryActionButton} onPress={() => {
          Alert.alert('Feature Coming Soon', 'Export functionality will be added in the next update.');
        }}>
          <Text style={styles.primaryActionButtonText}>Export Analysis</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryActionButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryActionButtonText}>Analyze Another</Text>
        </TouchableOpacity>
      </View>

      {/* Legal Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ PROFESSIONAL DISCLAIMER: This AI analysis is for informational purposes only. 
          Always consult with a qualified attorney for legal advice. This analysis should not be 
          considered as legal counsel or substitute for professional legal review.
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
  background: '#F7DFC0',   // Light cream - subtle backgrounds only

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 15,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  demoModeText: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.danger,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: colors.mediumGray,
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerBackButton: {
    padding: 8,
  },
  headerBackText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  documentPreview: {
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  aiTag: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiTagText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  sectionIcon: {
    fontSize: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  sectionContent: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 24,
  },
  listItem: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 6,
    lineHeight: 20,
  },
  riskItem: {
    fontSize: 14,
    color: colors.danger,
    marginBottom: 6,
    lineHeight: 20,
    fontWeight: '500',
  },
  criticalItem: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 6,
    lineHeight: 20,
    fontWeight: '500',
  },
  rawSection: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  rawSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  rawSummary: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryActionButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  disclaimer: {
    backgroundColor: colors.cream,
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.peach,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.accent,
    lineHeight: 18,
    textAlign: 'center',
  },
  demoBanner: {
    backgroundColor: colors.yellow,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoBannerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 4,
  },
  demoBannerSubtext: {
    fontSize: 12,
    color: colors.secondary,
    textAlign: 'center',
  },
  // Professional Summary Section
  summarySection: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 18,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    fontWeight: '400',
  },
  // Key Points Section
  keyPointsSection: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  keyPointsList: {
    gap: 12,
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 8,
    marginRight: 12,
  },
  keyPointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  // Metadata Section
  metadataSection: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  metadataGrid: {
    gap: 16,
  },
  metadataItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    paddingBottom: 12,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadataValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});
