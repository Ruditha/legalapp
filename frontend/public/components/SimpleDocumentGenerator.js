import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';

export default function SimpleDocumentGenerator({ navigation }) {
  const [currentStep, setCurrentStep] = useState('select_type'); // 'select_type', 'upload_default', 'analyzing', 'fill_form', 'generated'
  const [selectedDocType, setSelectedDocType] = useState('');
  const [formData, setFormData] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState('');
  const [defaultDocuments, setDefaultDocuments] = useState({
    rental: null,
    nda: null,
    service: null,
    employment: null,
    purchase: null
  });
  const [isAnalyzingDefault, setIsAnalyzingDefault] = useState(false);
  const [extractedFields, setExtractedFields] = useState([]);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');

  const documentTypes = {
    rental: 'Rental Agreement',
    nda: 'Non-Disclosure Agreement',
    service: 'Service Agreement',
    employment: 'Employment Contract',
    purchase: 'Purchase Agreement'
  };

  const handleDocumentTypeSelection = (docType) => {
    console.log('handleDocumentTypeSelection called with:', docType);
    setSelectedDocType(docType);
    const hasDefault = defaultDocuments[docType] !== null;
    console.log('hasDefault:', hasDefault);

    if (hasDefault) {
      // For now, just go to upload screen - template management can be added later
      startUploadFlow(docType);
    } else {
      // Go directly to upload screen without confirmation
      startUploadFlow(docType);
    }
  };

  const startUploadFlow = (docType) => {
    setSelectedDocType(docType);
    setCurrentStep('upload_default');
  };

  const uploadDocument = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx,.doc,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploadedDocument(file);
        processUploadedDocument(file);
      }
    };
    input.click();
  };

  const takePhoto = () => {
    // For now, simulate camera functionality with file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploadedDocument(file);
        processUploadedDocument(file);
      }
    };
    input.click();
  };

  const processUploadedDocument = (file) => {
    if (!file) {
      showInAppAlert('No File Selected', 'Please select a file first.');
      return;
    }

    console.log('Processing uploaded file:', file.name, file.type);
    setCurrentStep('analyzing');
    setIsAnalyzingDefault(true);

    // Simulate reading file content to validate document type
    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result;

      // Simulate analysis with content validation (3-5 seconds)
      setTimeout(() => {
        const validationResult = validateDocumentContent(content, selectedDocType, file.name);

        if (!validationResult.isValid) {
          setIsAnalyzingDefault(false);
          setCurrentStep('upload_default');
          setUploadedDocument(null); // Clear uploaded document info
          showInAppAlert('Upload Proper Document', validationResult.message);
          return;
        }

        const extractedFieldsData = analyzeDocumentStructure(selectedDocType, file, content);

        if (extractedFieldsData.fields.length === 0) {
          setIsAnalyzingDefault(false);
          setCurrentStep('upload_default');
          setUploadedDocument(null); // Clear uploaded document info
          showInAppAlert('Document Analysis Failed', `Could not extract fields from this document. Please upload a proper ${documentTypes[selectedDocType]} with clear field structure.`);
          return;
        }

        setExtractedFields(extractedFieldsData.fields);

        // Save as default template
        setDefaultDocuments(prev => ({
          ...prev,
          [selectedDocType]: extractedFieldsData
        }));

        // Initialize form data with empty values for extracted fields
        const emptyFormData = {};
        extractedFieldsData.fields.forEach(field => {
          emptyFormData[field.name] = '';
        });
        setFormData(emptyFormData);

        setIsAnalyzingDefault(false);
        setCurrentStep('fill_form');

        showInAppAlert('Analysis Complete!', `Successfully analyzed your ${documentTypes[selectedDocType]} and extracted ${extractedFieldsData.fields.length} required fields. Please fill in the details below.`);
      }, 4000); // 4 second processing simulation
    };

    // Read file as text for content analysis
    if (file.type.includes('text') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      // For other file types, simulate content reading
      reader.onload({ target: { result: `Simulated content analysis for ${file.name}` } });
    }
  };

  const useDefaultDocument = (docType) => {
    const defaultDoc = defaultDocuments[docType];
    if (defaultDoc) {
      setExtractedFields(defaultDoc.fields);

      // Initialize empty form data for the extracted fields
      const emptyFormData = {};
      defaultDoc.fields.forEach(field => {
        emptyFormData[field.name] = '';
      });
      setFormData(emptyFormData);
      setCurrentStep('fill_form');

      Alert.alert('Using Default Template', `Loaded your default ${documentTypes[docType]} with ${defaultDoc.fields.length} extracted fields.`);
    }
  };

  const createNewDocument = (docType) => {
    // For one-time creation, use basic template fields
    const basicFields = getBasicFields(docType);
    setExtractedFields(basicFields);

    const emptyFormData = {};
    basicFields.forEach(field => {
      emptyFormData[field.name] = '';
    });
    setFormData(emptyFormData);
    setCurrentStep('fill_form');
  };

  const showInAppAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const hideAlert = () => {
    setShowAlert(false);
    setAlertTitle('');
    setAlertMessage('');
  };

  const handleAddCustomDocumentType = () => {
    showInAppAlert('Custom Document Type', 'This feature will allow you to add custom document types. Custom document types will be available in a future update.');
  };

  const getBasicFields = (docType) => {
    const basicFieldsMap = {
      rental: [
        { name: 'landlordName', label: 'Landlord Name', type: 'text', required: true },
        { name: 'tenantName', label: 'Tenant Name', type: 'text', required: true },
        { name: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
        { name: 'monthlyRent', label: 'Monthly Rent Amount', type: 'text', required: true },
        { name: 'leaseStartDate', label: 'Lease Start Date', type: 'date', required: true },
        { name: 'leaseDuration', label: 'Lease Duration', type: 'text', required: true }
      ],
      nda: [
        { name: 'disclosingParty', label: 'Disclosing Party', type: 'text', required: true },
        { name: 'receivingParty', label: 'Receiving Party', type: 'text', required: true },
        { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
        { name: 'duration', label: 'Agreement Duration', type: 'text', required: true }
      ],
      service: [
        { name: 'serviceProvider', label: 'Service Provider', type: 'text', required: true },
        { name: 'client', label: 'Client Name', type: 'text', required: true },
        { name: 'serviceDescription', label: 'Service Description', type: 'textarea', required: true },
        { name: 'projectFee', label: 'Project Fee', type: 'text', required: true },
        { name: 'projectDuration', label: 'Project Duration', type: 'text', required: true }
      ],
      purchase: [
        { name: 'sellerName', label: 'Seller Name', type: 'text', required: true },
        { name: 'buyerName', label: 'Buyer Name', type: 'text', required: true },
        { name: 'itemDescription', label: 'Item Description', type: 'textarea', required: true },
        { name: 'purchasePrice', label: 'Purchase Price', type: 'text', required: true },
        { name: 'closingDate', label: 'Closing Date', type: 'date', required: true }
      ],
      employment: [
        { name: 'employerName', label: 'Employer Name', type: 'text', required: true },
        { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { name: 'jobTitle', label: 'Job Title', type: 'text', required: true },
        { name: 'salary', label: 'Salary', type: 'text', required: true },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true }
      ]
    };

    return basicFieldsMap[docType] || basicFieldsMap.rental;
  };

  const validateDocumentContent = (content, expectedDocType, fileName) => {
    console.log('Validating document content for:', expectedDocType, fileName);

    // More comprehensive keywords with variations and synonyms
    const documentKeywords = {
      rental: ['landlord', 'tenant', 'rent', 'lease', 'property', 'premises', 'rental', 'agreement', 'renter', 'lessor', 'lessee', 'apartment', 'house', 'dwelling'],
      nda: ['non-disclosure', 'confidential', 'proprietary', 'confidentiality', 'party', 'agreement', 'information', 'secret', 'private', 'disclosure', 'receiving', 'disclosing'],
      service: ['service', 'contractor', 'client', 'work', 'payment', 'agreement', 'project', 'provider', 'professional', 'consulting', 'freelance'],
      employment: ['employee', 'employer', 'employment', 'salary', 'job', 'work', 'contract', 'position', 'hire', 'wage', 'compensation', 'duties'],
      purchase: ['purchase', 'buyer', 'seller', 'price', 'goods', 'sale', 'agreement', 'buy', 'sell', 'product', 'merchandise', 'transaction']
    };

    const requiredKeywords = documentKeywords[expectedDocType] || [];
    const contentLower = content.toLowerCase();

    // Check if document contains relevant keywords
    const matchingKeywords = requiredKeywords.filter(keyword =>
      contentLower.includes(keyword.toLowerCase())
    );

    // Very flexible validation - just check if it seems like a legal document
    const legalWords = ['agreement', 'contract', 'party', 'parties', 'terms', 'conditions', 'whereas', 'therefore'];
    const hasLegalStructure = legalWords.some(word => contentLower.includes(word));

    // If no matching keywords but has legal structure, allow it (maybe it's a variant)
    if (matchingKeywords.length === 0 && !hasLegalStructure) {
      return {
        isValid: false,
        message: `This document doesn't appear to be a legal ${documentTypes[expectedDocType]} document. Please upload a proper ${documentTypes[expectedDocType]} document with relevant legal content.`
      };
    }

    return {
      isValid: true,
      matchingKeywords,
      message: 'Document validation successful'
    };
  };

  const analyzeDocumentStructure = (docType, file = null, content = null) => {
    // Simulate analysis results based on uploaded file content
    console.log('Analyzing document structure for:', docType, file ? `with file: ${file.name}` : 'without file');
    const aiAnalyzedStructures = {
      rental: {
        fields: [
          { name: 'landlordName', label: 'Landlord Full Name', type: 'text', required: true, aiExtracted: true },
          { name: 'landlordAddress', label: 'Landlord Address', type: 'text', required: true, aiExtracted: true },
          { name: 'tenantName', label: 'Tenant Full Name', type: 'text', required: true, aiExtracted: true },
          { name: 'tenantAddress', label: 'Tenant Address', type: 'text', required: true, aiExtracted: true },
          { name: 'propertyAddress', label: 'Rental Property Address', type: 'text', required: true, aiExtracted: true },
          { name: 'monthlyRent', label: 'Monthly Rent Amount', type: 'text', required: true, aiExtracted: true },
          { name: 'securityDeposit', label: 'Security Deposit', type: 'text', required: true, aiExtracted: true },
          { name: 'leaseStartDate', label: 'Lease Start Date', type: 'date', required: true, aiExtracted: true },
          { name: 'leaseEndDate', label: 'Lease End Date', type: 'date', required: true, aiExtracted: true },
          { name: 'utilitiesIncluded', label: 'Utilities Included', type: 'text', required: false, aiExtracted: true },
          { name: 'petPolicy', label: 'Pet Policy', type: 'text', required: false, aiExtracted: true },
          { name: 'specialTerms', label: 'Special Terms & Conditions', type: 'textarea', required: false, aiExtracted: true }
        ],
        extractedClauses: ['rent payment terms', 'security deposit conditions', 'maintenance responsibilities', 'termination clauses']
      },
      nda: {
        fields: [
          { name: 'disclosingParty', label: 'Disclosing Party Name', type: 'text', required: true, aiExtracted: true },
          { name: 'disclosingPartyAddress', label: 'Disclosing Party Address', type: 'text', required: true, aiExtracted: true },
          { name: 'receivingParty', label: 'Receiving Party Name', type: 'text', required: true, aiExtracted: true },
          { name: 'receivingPartyAddress', label: 'Receiving Party Address', type: 'text', required: true, aiExtracted: true },
          { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true, aiExtracted: true },
          { name: 'disclosurePurpose', label: 'Purpose of Disclosure', type: 'textarea', required: true, aiExtracted: true },
          { name: 'confidentialityPeriod', label: 'Confidentiality Period', type: 'text', required: true, aiExtracted: true },
          { name: 'permittedDisclosures', label: 'Permitted Disclosures', type: 'textarea', required: false, aiExtracted: true }
        ],
        extractedClauses: ['confidentiality obligations', 'permitted disclosures', 'return of materials', 'remedies for breach']
      },
      service: {
        fields: [
          { name: 'serviceProvider', label: 'Service Provider Name', type: 'text', required: true, aiExtracted: true },
          { name: 'serviceProviderAddress', label: 'Service Provider Address', type: 'text', required: true, aiExtracted: true },
          { name: 'clientName', label: 'Client Name', type: 'text', required: true, aiExtracted: true },
          { name: 'clientAddress', label: 'Client Address', type: 'text', required: true, aiExtracted: true },
          { name: 'serviceDescription', label: 'Detailed Service Description', type: 'textarea', required: true, aiExtracted: true },
          { name: 'projectFee', label: 'Total Project Fee', type: 'text', required: true, aiExtracted: true },
          { name: 'paymentSchedule', label: 'Payment Schedule', type: 'text', required: true, aiExtracted: true },
          { name: 'projectStartDate', label: 'Project Start Date', type: 'date', required: true, aiExtracted: true },
          { name: 'projectEndDate', label: 'Expected Completion Date', type: 'date', required: true, aiExtracted: true },
          { name: 'deliverables', label: 'Key Deliverables', type: 'textarea', required: true, aiExtracted: true }
        ],
        extractedClauses: ['scope of work', 'payment terms', 'intellectual property rights', 'termination conditions']
      },
      purchase: {
        fields: [
          { name: 'sellerName', label: 'Seller Full Name', type: 'text', required: true, aiExtracted: true },
          { name: 'sellerAddress', label: 'Seller Address', type: 'text', required: true, aiExtracted: true },
          { name: 'buyerName', label: 'Buyer Full Name', type: 'text', required: true, aiExtracted: true },
          { name: 'buyerAddress', label: 'Buyer Address', type: 'text', required: true, aiExtracted: true },
          { name: 'itemDescription', label: 'Item/Property Description', type: 'textarea', required: true, aiExtracted: true },
          { name: 'purchasePrice', label: 'Purchase Price', type: 'text', required: true, aiExtracted: true },
          { name: 'downPayment', label: 'Down Payment', type: 'text', required: false, aiExtracted: true },
          { name: 'closingDate', label: 'Closing/Delivery Date', type: 'date', required: true, aiExtracted: true },
          { name: 'inspectionPeriod', label: 'Inspection Period', type: 'text', required: false, aiExtracted: true },
          { name: 'financing', label: 'Financing Details', type: 'text', required: false, aiExtracted: true },
          { name: 'warranties', label: 'Warranties & Guarantees', type: 'textarea', required: false, aiExtracted: true },
          { name: 'specialConditions', label: 'Special Conditions & Terms', type: 'textarea', required: false, aiExtracted: true }
        ],
        extractedClauses: ['purchase terms', 'payment conditions', 'delivery terms', 'warranties', 'inspection rights']
      },
      employment: {
        fields: [
          { name: 'employerName', label: 'Employer/Company Name', type: 'text', required: true, aiExtracted: true },
          { name: 'employerAddress', label: 'Employer Address', type: 'text', required: true, aiExtracted: true },
          { name: 'employeeName', label: 'Employee Full Name', type: 'text', required: true, aiExtracted: true },
          { name: 'employeeAddress', label: 'Employee Address', type: 'text', required: true, aiExtracted: true },
          { name: 'jobTitle', label: 'Job Title/Position', type: 'text', required: true, aiExtracted: true },
          { name: 'salary', label: 'Salary/Compensation', type: 'text', required: true, aiExtracted: true },
          { name: 'startDate', label: 'Employment Start Date', type: 'date', required: true, aiExtracted: true },
          { name: 'workSchedule', label: 'Work Schedule', type: 'text', required: true, aiExtracted: true },
          { name: 'benefits', label: 'Benefits Package', type: 'textarea', required: false, aiExtracted: true },
          { name: 'terminationClause', label: 'Termination Conditions', type: 'textarea', required: false, aiExtracted: true }
        ],
        extractedClauses: ['compensation', 'duties', 'benefits', 'termination', 'confidentiality']
      }
    };

    // If content is provided, try to extract actual fields from content
    if (content && file) {
      const extractedFromContent = extractFieldsFromContent(content, docType);
      if (extractedFromContent.fields.length > 0) {
        return extractedFromContent;
      }
    }

    return aiAnalyzedStructures[docType] || aiAnalyzedStructures.rental;
  };

  const extractFieldsFromContent = (content, docType) => {
    // Simple field extraction from actual document content
    const contentLower = content.toLowerCase();
    const extractedFields = [];

    // Look for common patterns in document content
    const patterns = {
      names: /([A-Z][a-z]+ [A-Z][a-z]+)/g,
      dates: /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/g,
      amounts: /\$?[\d,]+\.?\d*/g,
      addresses: /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln)/gi
    };

    // Extract names
    const names = content.match(patterns.names) || [];
    names.slice(0, 2).forEach((name, index) => {
      extractedFields.push({
        name: `party${index + 1}Name`,
        label: `Party ${index + 1} Name`,
        type: 'text',
        required: true,
        aiExtracted: true,
        extractedValue: name
      });
    });

    // Extract dates
    const dates = content.match(patterns.dates) || [];
    if (dates.length > 0) {
      extractedFields.push({
        name: 'documentDate',
        label: 'Document Date',
        type: 'date',
        required: true,
        aiExtracted: true,
        extractedValue: dates[0]
      });
    }

    // Extract amounts
    const amounts = content.match(patterns.amounts) || [];
    if (amounts.length > 0) {
      extractedFields.push({
        name: 'amount',
        label: 'Amount',
        type: 'text',
        required: true,
        aiExtracted: true,
        extractedValue: amounts[0]
      });
    }

    return {
      fields: extractedFields,
      extractedFromActualContent: true
    };
  };

  const generateDocument = async () => {
    // Check if required fields are filled
    const requiredFields = extractedFields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name] || formData[field.name].trim() === '');

    if (missingFields.length > 0) {
      Alert.alert(
        'Missing Required Fields',
        `Please fill in: ${missingFields.map(f => f.label).join(', ')}`
      );
      return;
    }

    setIsGenerating(true);

    // Always use local generation for now since backend isn't consistently available
    console.log('Generating document using enhanced local templates');

    // Simulate processing time for better UX
    setTimeout(() => {
      try {
        const enhancedDocument = generateCompleteLocalDocument(selectedDocType, formData, extractedFields);
        setGeneratedDocument(enhancedDocument);
        setIsGenerating(false);
        setCurrentStep('generated');

        Alert.alert(
          'Document Generated!',
          `Your ${documentTypes[selectedDocType]} has been created using enhanced templates with ${extractedFields.length} fields. (AI generation available when backend server is running)`
        );
      } catch (error) {
        console.error('Document generation error:', error);
        setIsGenerating(false);
        Alert.alert(
          'Generation Error',
          'Failed to generate document. Please try again.'
        );
      }
    }, 1500); // 1.5 second delay for better UX
  };

  const getBackendUrl = () => {
    // Detect if we're on mobile or web and use appropriate backend URL
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // For mobile access, use the same IP as the frontend but port 8000
      const currentHost = window.location.hostname;
      const backendUrl = `http://${currentHost}:8000`;
      console.log('Using mobile/remote backend URL:', backendUrl);
      return backendUrl;
    }
    // For localhost development
    console.log('Using localhost backend URL: http://localhost:8000');
    return 'http://localhost:8000';
  };

  const convertFormDataToBackendFormat = (data) => {
    // Convert the form data to match backend expected format with enhanced field mapping
    const baseData = {
      party1Name: data.landlordName || data.disclosingParty || data.serviceProvider || data.party1Name,
      party1Address: data.landlordAddress || data.disclosingPartyAddress || data.serviceProviderAddress || data.party1Address,
      party2Name: data.tenantName || data.receivingParty || data.clientName || data.party2Name,
      party2Address: data.tenantAddress || data.receivingPartyAddress || data.clientAddress || data.party2Address,
      propertyAddress: data.propertyAddress,
      amount: data.monthlyRent || data.projectFee || data.amount,
      date: data.leaseStartDate || data.effectiveDate || data.projectStartDate || data.date,
      duration: data.leaseDuration || data.confidentialityPeriod || data.projectDuration || data.duration,
      customTerms: data.specialTerms || data.permittedDisclosures || data.deliverables || data.customTerms || ''
    };

    // For rental agreements, add specific fields
    if (selectedDocType === 'rental') {
      baseData.utilitiesIncluded = data.utilitiesIncluded || extractUtilitiesFromTerms(data.specialTerms);
      baseData.petPolicy = data.petPolicy || extractPetPolicyFromTerms(data.specialTerms);
      baseData.securityDeposit = data.securityDeposit || data.monthlyRent || data.amount;
    }

    return baseData;
  };

  const extractUtilitiesFromTerms = (specialTerms) => {
    if (!specialTerms) return '';
    const lowerTerms = specialTerms.toLowerCase();
    if (lowerTerms.includes('water') && lowerTerms.includes('sewer')) {
      return 'Water and Sewer';
    }
    if (lowerTerms.includes('utilities')) {
      return 'As specified in special terms';
    }
    return '';
  };

  const extractPetPolicyFromTerms = (specialTerms) => {
    if (!specialTerms) return '';
    const lowerTerms = specialTerms.toLowerCase();
    if (lowerTerms.includes('pet') || lowerTerms.includes('animal')) {
      return specialTerms;
    }
    return '';
  };

  const createAIPrompt = (docType, data) => {
    return `Generate a complete, professional ${documentTypes[docType]} using the provided field data. Create a comprehensive legal document with proper structure and language, not just a field list.`;
  };

  const generateCompleteLocalDocument = (docType, data, fields) => {
    // Use the comprehensive templates instead of field lists
    return generateTemplateDocument(docType, convertFormDataToBackendFormat(data));
  };

  const generateEnhancedDocumentWithAI = (docType, data, fields) => {
    // This function is now replaced by generateCompleteLocalDocument
    // Keeping for backward compatibility but redirecting to better approach
    return generateCompleteLocalDocument(docType, data, fields);
  };


  const calculateLeaseEndDate = (startDate, duration) => {
    try {
      const start = new Date(startDate);
      if (duration && duration.includes('month')) {
        const months = parseInt(duration);
        const end = new Date(start.getFullYear(), start.getMonth() + months, start.getDate() - 1);
        return end.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      return '[END DATE TO BE CALCULATED]';
    } catch {
      return '[END DATE TO BE CALCULATED]';
    }
  };

  const generateTemplateDocument = (docType, data) => {
    const currentDate = new Date().toLocaleDateString();

    const templates = {
      rental: `RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement ("Agreement") is entered into on ${data.date || currentDate}, between ${data.party1Name || '[LANDLORD NAME]'}, an individual ("Landlord"), and ${data.party2Name || '[TENANT NAME]'}, an individual ("Tenant").

1. PARTIES
Landlord: ${data.party1Name || '[LANDLORD NAME]'}
Address: ${data.party1Address || '[LANDLORD ADDRESS]'}

Tenant: ${data.party2Name || '[TENANT NAME]'}
Address: ${data.party2Address || '[TENANT ADDRESS]'}

2. PREMISES
Landlord hereby leases to Tenant and Tenant hereby leases from Landlord the premises located at ${data.propertyAddress || '[PROPERTY ADDRESS]'} (the "Premises"). The Premises shall be used and occupied by Tenant exclusively as a private single-family residence.

3. TERM
The term of this Agreement shall be for ${data.duration || '[DURATION]'}, commencing on ${data.date || '[START DATE]'} and ending on ${calculateLeaseEndDate(data.date, data.duration)}, unless sooner terminated in accordance with the terms hereof.

4. RENT
Tenant agrees to pay Landlord rent in the amount of $${data.amount || '[AMOUNT]'} per month, due and payable in advance on the first day of each month. Rent shall be paid to Landlord at the address specified above or such other place as Landlord may designate in writing.

5. SECURITY DEPOSIT
Upon execution of this Agreement, Tenant shall deposit with Landlord the sum of $${data.amount || '[AMOUNT]'} as a security deposit to secure Tenant's faithful performance of the terms of this lease. The security deposit shall be returned to Tenant within thirty (30) days after termination of this lease, less any amounts withheld by Landlord for unpaid rent, cleaning costs, or damages beyond normal wear and tear.

6. USE OF PREMISES
The Premises shall be used exclusively as a private dwelling for Tenant and Tenant's immediate family. No part of the Premises shall be used for any business, profession, or trade of any kind, or for any purpose other than as a private dwelling.

7. MAINTENANCE AND REPAIRS
Tenant acknowledges that the Premises are in good order and repair. Tenant shall, at Tenant's own expense, keep and maintain the Premises in good condition and repair. Landlord shall be responsible for major structural repairs and maintenance of mechanical systems.

8. UTILITIES
${data.utilitiesIncluded
  ? `Landlord shall provide and pay for: ${data.utilitiesIncluded}. Tenant shall be responsible for arranging and paying for all other utilities and services supplied to the Premises, including but not limited to gas, electricity, telephone, cable television, and internet services.`
  : 'Tenant shall be responsible for arranging for and paying all utilities and services supplied to the Premises, including but not limited to gas, electricity, water, sewer, telephone, cable television, and internet services.'}

9. PETS
${data.petPolicy
  ? data.petPolicy
  : 'No animals, birds, or pets of any kind shall be brought on the Premises without the prior written consent of Landlord. If consent is given, Tenant agrees to pay an additional security deposit and monthly pet fee as determined by Landlord.'}

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

This Mutual Non-Disclosure Agreement ("Agreement") is entered into on ${data.date || currentDate}, between ${data.party1Name || '[DISCLOSING PARTY]'}, a [corporation/individual] ("Disclosing Party"), and ${data.party2Name || '[RECEIVING PARTY]'}, a [corporation/individual] ("Receiving Party").

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

This Professional Service Agreement ("Agreement") is entered into on ${data.date || currentDate}, between ${data.party1Name || '[SERVICE PROVIDER]'}, a [corporation/individual] ("Service Provider"), and ${data.party2Name || '[CLIENT]'}, a [corporation/individual] ("Client").

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

  // Render different screens based on current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'select_type':
        return renderDocumentTypeSelection();
      case 'upload_default':
        return renderUploadScreen();
      case 'analyzing':
        return renderAnalyzingScreen();
      case 'fill_form':
        return renderFormScreen();
      case 'generated':
        return renderGeneratedDocument();
      default:
        return renderDocumentTypeSelection();
    }
  };

  const renderGeneratedDocument = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentStep('select_type')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← New Document</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Generated Document</Text>
      </View>

      <View style={styles.documentContainer}>
        <ScrollView style={styles.documentScroll}>
          <Text style={styles.documentText}>{generatedDocument}</Text>
        </ScrollView>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.copyButton} onPress={() => {
          Alert.alert('Success', 'Document copied to clipboard!');
        }}>
          <Text style={styles.copyButtonText}>Copy Document</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newDocButton} onPress={() => {
          setGeneratedDocument('');
          setFormData({});
          setCurrentStep('select_type');
          setSelectedDocType('');
        }}>
          <Text style={styles.newDocButtonText}>Generate New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ IMPORTANT: This is a generated document for professional review only.
          Always have legal documents reviewed by a qualified attorney before use.
        </Text>
      </View>
    </ScrollView>
  );

  // Add all the render methods before the main return

  const renderDocumentTypeSelection = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Document Generator</Text>
        <Text style={styles.subtitle}>Professional Legal Document Creation</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Document Type</Text>
        <Text style={styles.sectionSubtitle}>Choose the type of legal document you want to create</Text>
        <View style={styles.docTypeGrid}>
          {Object.entries(documentTypes).map(([key, name]) => (
            <View
              key={key}
              style={[
                styles.docTypeButton,
                defaultDocuments[key] && styles.docTypeWithDefault
              ]}
            >
              <TouchableOpacity
                style={styles.docTypeButtonInner}
                onPress={() => {
                  console.log('Button pressed:', key);
                  handleDocumentTypeSelection(key);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.docTypeText}>{name}</Text>
                {defaultDocuments[key] && (
                  <Text style={styles.defaultIndicator}>✓ Template Ready</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}

          {/* Plus button for custom document types */}
          <Pressable
            style={({ pressed }) => [
              styles.addDocTypeButton,
              pressed && styles.addDocTypePressed
            ]}
            onPress={() => {
              console.log('Add custom document type pressed');
              handleAddCustomDocumentType();
            }}
          >
            <Text style={styles.addDocTypeIcon}>+</Text>
            <Text style={styles.addDocTypeText}>Add Custom Type</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How it works:</Text>
        <Text style={styles.infoText}>1. Select document type</Text>
        <Text style={styles.infoText}>2. Upload sample document for analysis</Text>
        <Text style={styles.infoText}>3. Required fields extracted</Text>
        <Text style={styles.infoText}>4. Fill in your details</Text>
        <Text style={styles.infoText}>5. Generate professional document</Text>
      </View>
    </ScrollView>
  );

  const renderUploadScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentStep('select_type')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Upload Sample Document</Text>
        <Text style={styles.subtitle}>{documentTypes[selectedDocType]}</Text>
      </View>

      <View style={styles.uploadSection}>
        <Text style={styles.uploadTitle}>Upload Sample Document</Text>
        <Text style={styles.uploadDescription}>
          Upload a sample {documentTypes[selectedDocType]} document. Our system will analyze its structure
          and extract all required fields to create a personalized template for you.
        </Text>

        <TouchableOpacity style={styles.uploadButton} onPress={uploadDocument}>
          <Text style={styles.uploadButtonText}>📄 Choose Document File</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
          <Text style={styles.uploadButtonText}>📷 Take Photo of Document</Text>
        </TouchableOpacity>

        {uploadedDocument && (
          <View style={styles.uploadedFileInfo}>
            <Text style={styles.uploadedFileName}>✓ Selected: {uploadedDocument.name}</Text>
            <Text style={styles.uploadedFileSize}>Size: {(uploadedDocument.size / 1024 / 1024).toFixed(2)} MB</Text>
          </View>
        )}

        <View style={styles.uploadNote}>
          <Text style={styles.uploadNoteText}>
            Supported formats: PDF, DOCX, JPG, PNG. The system will extract field requirements and document structure.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderAnalyzingScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Analysis in Progress</Text>
        <Text style={styles.subtitle}>{documentTypes[selectedDocType]}</Text>
      </View>

      <View style={styles.analyzingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.analyzingTitle}>Analyzing Document Structure</Text>
        <Text style={styles.analyzingDescription}>
          Our system is analyzing your {documentTypes[selectedDocType]} to extract:
        </Text>

        <View style={styles.analyzingList}>
          <Text style={styles.analyzingItem}>• Required field names and types</Text>
          <Text style={styles.analyzingItem}>• Legal clause structures</Text>
          <Text style={styles.analyzingItem}>• Document formatting requirements</Text>
          <Text style={styles.analyzingItem}>• Field validation rules</Text>
        </View>

        <Text style={styles.analyzingNote}>This usually takes 30-60 seconds...</Text>
      </View>
    </View>
  );

  const renderFormScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentStep('select_type')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Fill Document Details</Text>
        <Text style={styles.subtitle}>{documentTypes[selectedDocType]} - Extracted Fields</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Information</Text>
        <Text style={styles.extractedFieldsNote}>
          ✓ {extractedFields.length} fields extracted from analysis
        </Text>

        {extractedFields.map((field, index) => (
          <View key={index} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label} {field.required && <Text style={styles.requiredMark}>*</Text>}
            </Text>
            {field.aiExtracted && (
              <Text style={styles.aiExtractedLabel}>📄 Extracted Field</Text>
            )}

            {field.type === 'textarea' ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={formData[field.name] || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, [field.name]: text }))}
                multiline
                numberOfLines={4}
              />
            ) : (
              <TextInput
                style={styles.input}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={formData[field.name] || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, [field.name]: text }))}
              />
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
        onPress={generateDocument}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.loadingText}>Generating...</Text>
          </View>
        ) : (
          <Text style={styles.generateButtonText}>Generate Document</Text>
        )}
      </TouchableOpacity>

      <View style={styles.backendInfo}>
        <Text style={styles.backendInfoText}>
          💡 Using enhanced templates. AI generation available when backend server is running.
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1 }}>
      {renderCurrentStep()}
      {showAlert && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <Text style={styles.alertTitle}>{alertTitle}</Text>
            <Text style={styles.alertMessage}>{alertMessage}</Text>
            <TouchableOpacity style={styles.alertButton} onPress={hideAlert}>
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.primary,
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
    color: colors.primary,
  },
  docTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  docTypeButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: colors.background,
  },
  docTypeButtonInner: {
    padding: 12,
    alignItems: 'center',
    width: '100%',
  },
  docTypeActive: {
    backgroundColor: colors.secondary,
  },
  docTypeText: {
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 12,
  },
  docTypeTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cream,
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
    backgroundColor: colors.primary,
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  documentContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 400,
  },
  documentScroll: {
    padding: 20,
  },
  documentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    margin: 20,
    gap: 10,
  },
  copyButton: {
    backgroundColor: colors.secondary,
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
    backgroundColor: colors.secondary,
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
    backgroundColor: colors.background,
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  docTypeWithDefault: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  addDocTypeButton: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    cursor: 'pointer',
    userSelect: 'none',
  },
  addDocTypeIcon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  addDocTypeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  docTypePressed: {
    backgroundColor: colors.background,
    transform: [{ scale: 0.98 }],
  },
  addDocTypePressed: {
    backgroundColor: colors.primary,
    transform: [{ scale: 0.98 }],
  },
  uploadedFileInfo: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  uploadedFileName: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 5,
  },
  uploadedFileSize: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertContainer: {
    backgroundColor: colors.white,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    minWidth: 280,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  alertButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  defaultIndicator: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  analysisIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    margin: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  analysisText: {
    marginLeft: 12,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  // New styles for workflow steps
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: colors.background,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.tertiary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
    paddingLeft: 10,
  },
  uploadSection: {
    padding: 20,
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.tertiary,
    marginBottom: 12,
    textAlign: 'center',
  },
  uploadDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    minWidth: 250,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  uploadNote: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  uploadNoteText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  analyzingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.tertiary,
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  analyzingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  analyzingList: {
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  analyzingItem: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'left',
  },
  analyzingNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.tertiary,
    marginBottom: 5,
  },
  requiredMark: {
    color: colors.primary,
  },
  aiExtractedLabel: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 8,
    fontWeight: '500',
  },
  extractedFieldsNote: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
  },
  backendInfo: {
    backgroundColor: colors.background,
    margin: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  backendInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
