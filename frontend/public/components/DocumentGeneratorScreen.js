import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';

export default function DocumentGeneratorScreen({ navigation }) {
  const [selectedDocType, setSelectedDocType] = useState('rental');
  const [formData, setFormData] = useState({
    // Common fields
    party1Name: '',
    party1Address: '',
    party2Name: '',
    party2Address: '',
    date: '',
    amount: '',
    duration: '',
    // Specific fields
    propertyAddress: '',
    customTerms: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState('');

  const documentTypes = {
    rental: 'Rental Agreement',
    nda: 'Non-Disclosure Agreement',
    service: 'Service Agreement',
    employment: 'Employment Contract',
    purchase: 'Purchase Agreement'
  };

  const generateDocument = async () => {
    if (!formData.party1Name || !formData.party2Name) {
      Alert.alert('Missing Information', 'Please fill in at least the party names.');
      return;
    }

    setIsGenerating(true);

    try {
      const backendUrl = getBackendUrl();
      console.log('Attempting to connect to backend:', backendUrl);
      // Prepare the prompt for document generation
      const prompt = `Generate a ${documentTypes[selectedDocType]} with the following details:
      
Party 1: ${formData.party1Name}
Address: ${formData.party1Address}
Party 2: ${formData.party2Name}  
Address: ${formData.party2Address}
Date: ${formData.date || 'To be filled'}
Amount: ${formData.amount || 'To be determined'}
Duration: ${formData.duration || 'To be specified'}
${selectedDocType === 'rental' ? `Property Address: ${formData.propertyAddress}` : ''}
Custom Terms: ${formData.customTerms || 'Standard terms apply'}

Please generate a professional, legally structured document with appropriate clauses.`;

      // Make API call to backend
      const requestBody = {
        document_type: selectedDocType,
        form_data: formData,
        prompt: prompt
      };

      console.log('Sending request to backend:', requestBody);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${backendUrl}/generate_document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setGeneratedDocument(data.generated_document);
      } else {
        const errorData = await response.text();
        console.error('Backend error:', errorData);
        throw new Error(`Document generation failed: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Document generation error:', error);

      // Always use fallback for any network/fetch errors
      if (error instanceof TypeError ||
          error.name === 'TypeError' ||
          error.message.includes('fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('Failed to fetch') ||
          error.message.includes('ERR_NETWORK') ||
          error.message.includes('ERR_INTERNET_DISCONNECTED')) {

        console.log('Backend not available, using fallback template generation...');

        // Fallback to client-side template generation
        const fallbackDocument = generateFallbackDocument(selectedDocType, formData);
        setGeneratedDocument(fallbackDocument);

        Alert.alert(
          'Template Mode Active',
          'Generated document using template. For AI-powered documents, ensure the backend is running on port 8000.'
        );
      } else {
        Alert.alert(
          'Generation Error',
          `Failed to generate document: ${error.message}`
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackDocument = (docType, data) => {
    const templates = {
      rental: `RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement ("Agreement") is entered into on ${data.date || '[DATE]'}, between ${data.party1Name || '[LANDLORD NAME]'}, an individual ("Landlord"), and ${data.party2Name || '[TENANT NAME]'}, an individual ("Tenant").

1. PARTIES
Landlord: ${data.party1Name || '[LANDLORD NAME]'}
Address: ${data.party1Address || '[LANDLORD ADDRESS]'}

Tenant: ${data.party2Name || '[TENANT NAME]'}
Address: ${data.party2Address || '[TENANT ADDRESS]'}

2. PREMISES
Landlord hereby leases to Tenant and Tenant hereby leases from Landlord the premises located at ${data.propertyAddress || '[PROPERTY ADDRESS]'} (the "Premises"). The Premises shall be used and occupied by Tenant exclusively as a private single-family residence.

3. TERM
The term of this Agreement shall be for ${data.duration || '[DURATION]'}, commencing on ${data.date || '[START DATE]'} and ending on [END DATE], unless sooner terminated in accordance with the terms hereof.

4. RENT
Tenant agrees to pay Landlord rent in the amount of $${data.amount || '[AMOUNT]'} per month, due and payable in advance on the first day of each month. Rent shall be paid to Landlord at the address specified above or such other place as Landlord may designate in writing.

5. SECURITY DEPOSIT
Upon execution of this Agreement, Tenant shall deposit with Landlord the sum of $${data.amount || '[AMOUNT]'} as a security deposit to secure Tenant's faithful performance of the terms of this lease. The security deposit shall be returned to Tenant within thirty (30) days after termination of this lease, less any amounts withheld by Landlord for unpaid rent, cleaning costs, or damages beyond normal wear and tear.

6. USE OF PREMISES
The Premises shall be used exclusively as a private dwelling for Tenant and Tenant's immediate family. No part of the Premises shall be used for any business, profession, or trade of any kind, or for any purpose other than as a private dwelling.

7. MAINTENANCE AND REPAIRS
Tenant acknowledges that the Premises are in good order and repair. Tenant shall, at Tenant's own expense, keep and maintain the Premises in good condition and repair. Landlord shall be responsible for major structural repairs and maintenance of mechanical systems.

8. UTILITIES
Tenant shall be responsible for arranging for and paying all utilities and services supplied to the Premises, including but not limited to gas, electricity, water, sewer, telephone, cable television, and internet services.

9. PETS
No animals, birds, or pets of any kind shall be brought on the Premises without the prior written consent of Landlord. If consent is given, Tenant agrees to pay an additional security deposit and monthly pet fee as determined by Landlord.

10. ALTERATIONS
Tenant shall make no alterations to the Premises without the prior written consent of Landlord. Any alterations made by Tenant shall become the property of Landlord upon termination of this lease.

11. ENTRY BY LANDLORD
Landlord may enter the Premises at reasonable times to inspect the property, make necessary repairs, or show the property to prospective tenants or buyers, provided that Landlord gives Tenant at least 24 hours' prior notice.

12. TERMINATION
This lease may be terminated by either party upon thirty (30) days' written notice to the other party. Upon termination, Tenant shall surrender the Premises in good condition, reasonable wear and tear excepted.

13. SPECIAL TERMS AND CONDITIONS
${data.customTerms || 'No additional terms specified.'}

14. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State where the Premises are located.

15. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter hereof.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

LANDLORD:

_________________________________ Date: ___________
${data.party1Name || '[LANDLORD NAME]'}

TENANT:

_________________________________ Date: ___________
${data.party2Name || '[TENANT NAME]'}

⚠️ LEGAL DISCLAIMER: This document is a template for informational purposes only and does not constitute legal advice. This agreement should be reviewed by a qualified attorney before execution to ensure compliance with local laws and regulations.`,

      nda: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into on ${data.date || '[DATE]'}, between ${data.party1Name || '[DISCLOSING PARTY]'}, a [corporation/individual] ("Disclosing Party"), and ${data.party2Name || '[RECEIVING PARTY]'}, a [corporation/individual] ("Receiving Party").

1. PARTIES
Disclosing Party: ${data.party1Name || '[DISCLOSING PARTY]'}
Address: ${data.party1Address || '[DISCLOSING PARTY ADDRESS]'}

Receiving Party: ${data.party2Name || '[RECEIVING PARTY]'}
Address: ${data.party2Address || '[RECEIVING PARTY ADDRESS]'}

2. PURPOSE
The parties wish to explore a potential business relationship and may disclose confidential information to each other in connection with this evaluation.

3. DEFINITION OF CONFIDENTIAL INFORMATION
For purposes of this Agreement, "Confidential Information" shall include all information or material that has or could have commercial value or other utility in the business in which Disclosing Party is engaged. Confidential Information includes, but is not limited to, technical data, trade secrets, know-how, research, product plans, products, services, customers, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, or other business information.

4. OBLIGATIONS OF RECEIVING PARTY
Receiving Party agrees to:
a) Hold and maintain the Confidential Information in strict confidence;
b) Not disclose the Confidential Information to any third parties without prior written consent;
c) Not use the Confidential Information for any purpose other than evaluating the potential business relationship;
d) Take reasonable precautions to protect the confidentiality of the Confidential Information.

5. EXCEPTIONS
The obligations set forth in Section 4 shall not apply to information that:
a) Is or becomes publicly available through no breach of this Agreement;
b) Is rightfully known by Receiving Party prior to disclosure;
c) Is rightfully received by Receiving Party from a third party without breach of any confidentiality obligation;
d) Is required to be disclosed by law or court order.

6. TERM
This Agreement shall remain in effect for ${data.duration || '[DURATION]'} from the date first written above, unless terminated earlier by mutual written consent of the parties.

7. RETURN OF MATERIALS
All documents, materials, and other tangible expressions of Confidential Information shall be returned to Disclosing Party immediately upon request or upon termination of this Agreement.

8. REMEDIES
Receiving Party acknowledges that disclosure of Confidential Information would cause irreparable harm to Disclosing Party for which monetary damages would be inadequate. Therefore, Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity.

9. SPECIAL TERMS
${data.customTerms || 'No additional terms specified.'}

10. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of [STATE/JURISDICTION].

11. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties concerning the subject matter hereof and supersedes all prior agreements and understandings.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

DISCLOSING PARTY:

_________________________________ Date: ___________
${data.party1Name || '[DISCLOSING PARTY]'}

RECEIVING PARTY:

_________________________________ Date: ___________
${data.party2Name || '[RECEIVING PARTY]'}

⚠️ LEGAL DISCLAIMER: This document is a template for informational purposes only and does not constitute legal advice. This agreement should be reviewed by a qualified attorney before execution to ensure compliance with applicable laws and specific business requirements.`,

      service: `PROFESSIONAL SERVICE AGREEMENT

This Professional Service Agreement ("Agreement") is entered into on ${data.date || '[DATE]'}, between ${data.party1Name || '[SERVICE PROVIDER]'}, a [corporation/individual] ("Service Provider"), and ${data.party2Name || '[CLIENT]'}, a [corporation/individual] ("Client").

1. PARTIES
Service Provider: ${data.party1Name || '[SERVICE PROVIDER]'}
Address: ${data.party1Address || '[SERVICE PROVIDER ADDRESS]'}

Client: ${data.party2Name || '[CLIENT]'}
Address: ${data.party2Address || '[CLIENT ADDRESS]'}

2. SERVICES
Service Provider agrees to provide professional services as mutually agreed upon by the parties. The specific scope of services, deliverables, and timelines shall be detailed in separate statements of work or project specifications.

3. COMPENSATION
In consideration for the services provided, Client agrees to pay Service Provider the total amount of ${data.amount || '[AMOUNT]'}. Payment terms and schedule shall be as follows:
a) Payment shall be made within thirty (30) days of receipt of invoice;
b) Late payments may incur a service charge of 1.5% per month;
c) All expenses must be pre-approved by Client in writing.

4. TERM AND TERMINATION
This Agreement shall commence on ${data.date || '[START DATE]'} and continue for ${data.duration || '[DURATION]'}, unless terminated earlier in accordance with the provisions herein. Either party may terminate this Agreement with thirty (30) days written notice to the other party.

5. DELIVERABLES AND PERFORMANCE
Service Provider shall deliver all work products and services in accordance with the agreed-upon specifications and timelines. All deliverables shall be of professional quality and meet industry standards.

6. INTELLECTUAL PROPERTY
All work products, including but not limited to documents, designs, software, and other materials created by Service Provider in the course of providing services shall become the property of Client upon full payment of all fees due.

7. CONFIDENTIALITY
Service Provider acknowledges that during the course of providing services, Service Provider may have access to confidential information belonging to Client. Service Provider agrees to maintain the confidentiality of such information and not disclose it to any third parties.

8. INDEPENDENT CONTRACTOR
Service Provider is an independent contractor and not an employee of Client. Service Provider shall be responsible for all taxes, insurance, and other obligations related to Service Provider's status as an independent contractor.

9. LIABILITY AND INDEMNIFICATION
Service Provider's liability under this Agreement shall be limited to the total amount paid by Client to Service Provider. Each party agrees to indemnify and hold harmless the other party from any claims arising out of their respective negligent acts or omissions.

10. SPECIAL TERMS AND CONDITIONS
${data.customTerms || 'No additional terms specified.'}

11. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of [STATE/JURISDICTION].

12. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter hereof.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

SERVICE PROVIDER:

_________________________________ Date: ___________
${data.party1Name || '[SERVICE PROVIDER]'}

CLIENT:

_________________________________ Date: ___________
${data.party2Name || '[CLIENT]'}

⚠️ LEGAL DISCLAIMER: This document is a template for informational purposes only and does not constitute legal advice. This agreement should be reviewed by a qualified attorney before execution to ensure compliance with applicable laws and specific business requirements.`
    };

    return templates[docType] || templates.service;
  };

  const getBackendUrl = () => {
    // Detect if we're on mobile or web and use appropriate backend URL
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // For mobile access, use the same IP as the frontend but port 8000
      const currentHost = window.location.hostname;
      return `http://${currentHost}:8000`;
    }
    // For localhost development
    return 'http://localhost:8000';
  };

  if (generatedDocument) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Generated Document</Text>
        </View>

        <View style={styles.documentContainer}>
          <ScrollView style={styles.documentScrollContainer}>
            <Text style={styles.documentText}>{generatedDocument}</Text>
          </ScrollView>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.copyButton} onPress={() => {
            // Copy to clipboard logic would go here
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(generatedDocument);
              Alert.alert('Copied', 'Document copied to clipboard');
            } else {
              Alert.alert('Copy', 'Document text ready for manual copy');
            }
          }}>
            <Text style={styles.copyButtonText}>📋 Copy Document</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.newDocButton} onPress={() => {
            setGeneratedDocument('');
            setFormData({
              party1Name: '',
              party1Address: '',
              party2Name: '',
              party2Address: '',
              date: '',
              amount: '',
              duration: '',
              propertyAddress: '',
              customTerms: ''
            });
          }}>
            <Text style={styles.newDocButtonText}>📄 Generate New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ DISCLAIMER: This is an AI-generated draft for professional review only. 
            Always have legal documents reviewed by a qualified attorney before use.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>�� Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Document Generator</Text>
        <Text style={styles.subtitle}>AI-Powered Legal Drafting Assistant</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Type</Text>
        <View style={styles.docTypeGrid}>
          {Object.entries(documentTypes).map(([key, name]) => (
            <TouchableOpacity
              key={key}
              style={[styles.docTypeButton, selectedDocType === key && styles.docTypeActive]}
              onPress={() => setSelectedDocType(key)}
            >
              <Text style={[styles.docTypeText, selectedDocType === key && styles.docTypeTextActive]}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Details</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Party 1 Name (e.g., Landlord/Company)"
          value={formData.party1Name}
          onChangeText={(text) => setFormData({...formData, party1Name: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Party 1 Address"
          value={formData.party1Address}
          onChangeText={(text) => setFormData({...formData, party1Address: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Party 2 Name (e.g., Tenant/Individual)"
          value={formData.party2Name}
          onChangeText={(text) => setFormData({...formData, party2Name: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Party 2 Address"
          value={formData.party2Address}
          onChangeText={(text) => setFormData({...formData, party2Address: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Date (e.g., January 1, 2024)"
          value={formData.date}
          onChangeText={(text) => setFormData({...formData, date: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Amount (e.g., $1,500/month)"
          value={formData.amount}
          onChangeText={(text) => setFormData({...formData, amount: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Duration (e.g., 12 months)"
          value={formData.duration}
          onChangeText={(text) => setFormData({...formData, duration: text})}
        />
        
        {selectedDocType === 'rental' && (
          <TextInput
            style={styles.input}
            placeholder="Property Address"
            value={formData.propertyAddress}
            onChangeText={(text) => setFormData({...formData, propertyAddress: text})}
          />
        )}
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Custom Terms or Special Clauses (optional)"
          value={formData.customTerms}
          onChangeText={(text) => setFormData({...formData, customTerms: text})}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity 
        style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]} 
        onPress={generateDocument}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.generateButtonText}>🤖 Generate Document</Text>
        )}
      </TouchableOpacity>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          🔒 Privacy: Document generation uses AI processing. Generated content is for professional review only.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007bff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  docTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  docTypeButton: {
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  docTypeActive: {
    backgroundColor: '#007bff',
  },
  docTypeText: {
    color: '#333',
    fontWeight: '500',
  },
  docTypeTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: '#28a745',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  documentContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 500,
  },
  documentScrollContainer: {
    maxHeight: 460,
  },
  documentText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#333',
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    margin: 20,
    gap: 10,
  },
  copyButton: {
    backgroundColor: '#17a2b8',
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  newDocButton: {
    backgroundColor: '#6f42c1',
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  newDocButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disclaimer: {
    backgroundColor: '#fff3cd',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 18,
  },
});
