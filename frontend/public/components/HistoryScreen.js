import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';

export default function HistoryScreen({ navigation }) {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    loadDocumentHistory();
  }, []);

  const loadDocumentHistory = () => {
    // Demo data - in real app, this would come from storage/database
    const demoDocuments = [
      {
        id: '1',
        title: 'Rental Agreement - Downtown Apartment',
        date: '2024-01-15',
        type: 'Rental Contract',
        status: 'Analyzed',
        keyPoints: [
          '💰 Monthly rent: $2,500 due by 1st of each month',
          '⚠️ Late fee: $100 after 5-day grace period',
          '🔒 Security deposit: $5,000 (refundable)',
          '📅 Lease term: 12 months ending Dec 31, 2024',
          '🚫 No pets allowed without written consent'
        ],
        riskLevel: 'Low'
      },
      {
        id: '2', 
        title: 'Loan Agreement - Personal Loan',
        date: '2024-01-10',
        type: 'Loan Contract',
        status: 'Analyzed',
        keyPoints: [
          '💰 Principal amount: $50,000 at 8.5% APR',
          '⚠️ CRITICAL: Payment due by Jan 1, 2025 or property ownership transfers to John Smith',
          '📅 Monthly payments: $2,200 for 24 months',
          '🏠 Collateral: 123 Main Street property deed',
          '⚖️ Default triggers immediate foreclosure proceedings'
        ],
        riskLevel: 'High'
      },
      {
        id: '3',
        title: 'Employment Contract - Software Engineer',
        date: '2024-01-08',
        type: 'Employment Agreement',
        status: 'Analyzed',
        keyPoints: [
          '💼 Annual salary: $95,000 with quarterly reviews',
          '📅 Start date: February 1, 2024',
          '🔒 Non-compete clause: 6 months after termination',
          '💰 Bonus eligibility: Up to 15% based on performance',
          '🏥 Benefits: Health, dental, 401k with 4% match'
        ],
        riskLevel: 'Medium'
      },
      {
        id: '4',
        title: 'Service Agreement - Web Development',
        date: '2024-01-05',
        type: 'Service Contract',
        status: 'Analyzed',
        keyPoints: [
          '💰 Total project cost: $15,000 in 3 payments',
          '📅 Delivery deadline: March 15, 2024',
          '⚠️ Late penalty: $500 per week after deadline',
          '🔄 Revision limit: 3 rounds of changes included',
          '📋 Scope: E-commerce website with payment integration'
        ],
        riskLevel: 'Low'
      }
    ];
    setDocuments(demoDocuments);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High': return '#ff4444';
      case 'Medium': return '#ff8800';
      case 'Low': return '#44aa44';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  const viewDocument = (doc) => {
    Alert.alert(
      doc.title,
      'Document Details:\n\n' + doc.keyPoints.join('\n\n'),
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Re-analyze', onPress: () => navigation.navigate('Analysis', { documentId: doc.id }) }
      ]
    );
  };

  const deleteDocument = (docId) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to remove this document from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setDocuments(docs => docs.filter(doc => doc.id !== docId));
          }
        }
      ]
    );
  };

  const renderDocument = ({ item }) => (
    <TouchableOpacity style={styles.documentCard} onPress={() => viewDocument(item)}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentTitle}>{item.title}</Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteDocument(item.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.documentMeta}>
        <Text style={styles.documentType}>{item.type}</Text>
        <Text style={styles.documentDate}>{formatDate(item.date)}</Text>
      </View>
      
      <View style={styles.riskContainer}>
        <Text style={styles.riskLabel}>Risk Level: </Text>
        <Text style={[styles.riskLevel, { color: getRiskColor(item.riskLevel) }]}>
          {item.riskLevel}
        </Text>
      </View>
      
      <Text style={styles.keyPointsPreview}>
        Key Points: {item.keyPoints.length} identified
      </Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.status}>✅ {item.status}</Text>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Document History</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{documents.length}</Text>
          <Text style={styles.statLabel}>Documents</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {documents.filter(doc => doc.riskLevel === 'High').length}
          </Text>
          <Text style={styles.statLabel}>High Risk</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {documents.reduce((total, doc) => total + doc.keyPoints.length, 0)}
          </Text>
          <Text style={styles.statLabel}>Key Points</Text>
        </View>
      </View>

      {documents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>No Documents Yet</Text>
          <Text style={styles.emptyText}>
            Start analyzing legal documents to build your history
          </Text>
          <TouchableOpacity 
            style={styles.analyzeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.analyzeButtonText}>Analyze Document</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={documents}
          renderItem={renderDocument}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  documentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  documentType: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  documentDate: {
    fontSize: 14,
    color: '#666',
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskLabel: {
    fontSize: 14,
    color: '#666',
  },
  riskLevel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  keyPointsPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  status: {
    fontSize: 12,
    color: '#44aa44',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  analyzeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
