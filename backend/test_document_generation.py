#!/usr/bin/env python
"""
Test script to verify that AI document generation is working properly
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_ai_document_generation():
    """Test AI-powered document generation."""
    print("🤖 Testing AI Document Generation...")
    
    # Check API key
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ No GEMINI_API_KEY found")
        return False
    
    print(f"✅ API Key found: {api_key[:10]}...")
    
    try:
        # Import the LLM service
        from llm_service import get_llm_service
        
        # Test data similar to what the user provided
        test_form_data = {
            'party1Name': 'John Doe',
            'party1Address': '123 Oak Avenue, Anytown, CA 90210',
            'party2Name': 'Jane Smith', 
            'party2Address': '123 Main Street, Anytown, CA 90210',
            'propertyAddress': '123 Main Street, Anytown, CA 90210',
            'amount': '1500.00',
            'date': 'September 1, 2024',
            'duration': '12 months',
            'customTerms': 'Late fee of $50 if rent is paid after the 5th of the month. Occupancy by guests over 15 days without consent is a breach.'
        }
        
        # Create a rental agreement prompt (same as in main.py)
        prompt = f"""You are a professional legal document drafter. Generate a complete, comprehensive RESIDENTIAL LEASE AGREEMENT that reads like a real legal document a lawyer would draft. This should be a full, flowing narrative document with proper legal structure and language.

Incorporate these specific details into the document:

LANDLORD INFORMATION:
- Full Name: {test_form_data.get('party1Name', 'John Doe')}
- Address: {test_form_data.get('party1Address', '123 Oak Avenue, Anytown, CA 90210')}

TENANT INFORMATION:
- Full Name: {test_form_data.get('party2Name', 'Jane Smith')}
- Address: {test_form_data.get('party2Address', '456 Main Street, Anytown, CA 90210')}

PROPERTY & LEASE DETAILS:
- Rental Property Address: {test_form_data.get('propertyAddress', '789 Rental Street, Anytown, CA 90210')}
- Monthly Rent Amount: ${test_form_data.get('amount', '1,500.00')}
- Security Deposit: ${test_form_data.get('amount', '1,500.00')}
- Lease Start Date: {test_form_data.get('date', 'September 1, 2024')}
- Lease Term: {test_form_data.get('duration', '12 months')}
- Special Terms: {test_form_data.get('customTerms', 'Standard lease terms apply')}

REQUIREMENTS FOR THE DOCUMENT:
1. Start with a clear title "RESIDENTIAL LEASE AGREEMENT"
2. Write in complete, flowing paragraphs and clauses like a real lease
3. Include these essential sections with full legal language:
   - PARTIES (identify landlord and tenant with addresses)
   - PREMISES (describe the rental property)
   - TERM (lease duration and dates)
   - RENT (monthly amount, due date, late fees)
   - SECURITY DEPOSIT (amount and return conditions)
   - USE OF PREMISES (residential use only)
   - MAINTENANCE AND REPAIRS (responsibilities)
   - UTILITIES (who pays what)
   - PETS (policy and restrictions)
   - ALTERATIONS (tenant restrictions)
   - ENTRY BY LANDLORD (notice requirements)
   - TERMINATION (conditions and notice)
   - GOVERNING LAW (state jurisdiction)
   - ENTIRE AGREEMENT (integration clause)
   - SIGNATURES (spaces for both parties)

4. Use proper legal language and structure
5. Write complete sentences and paragraphs, not bullet points
6. Include standard legal protections and clauses
7. Make it comprehensive and professional
8. Add appropriate legal disclaimers

Generate the COMPLETE legal document text that could be printed and signed immediately after professional review."""
        
        # Get LLM service and generate document
        llm_service = get_llm_service()
        print("✅ LLM Service initialized")
        
        print("🔄 Generating document with AI...")
        generated_document = llm_service.generate_document(prompt, max_tokens=2000)
        
        print("✅ Document generated successfully!")
        print("\n📄 Generated Document Preview:")
        print("=" * 80)
        print(generated_document[:500] + "..." if len(generated_document) > 500 else generated_document)
        print("=" * 80)
        
        # Check if it's a complete document (not just field list)
        is_complete_document = (
            "RESIDENTIAL LEASE AGREEMENT" in generated_document.upper() and
            len(generated_document) > 1000 and
            "LANDLORD:" not in generated_document.split('\n')[5:15]  # Check it's not just a field list
        )
        
        if is_complete_document:
            print("✅ SUCCESS: Generated a complete legal document!")
            print(f"📊 Document length: {len(generated_document)} characters")
            return True
        else:
            print("❌ Generated document appears to be incomplete or in field-list format")
            return False
            
    except Exception as e:
        print(f"❌ Error during document generation: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Legal Document AI Generation Test")
    print("=" * 50)
    
    success = test_ai_document_generation()
    
    if success:
        print("\n🎉 SUCCESS! AI document generation is working properly!")
        print("The app should now generate complete legal documents instead of field lists.")
    else:
        print("\n⚠️ Issues found. Check the errors above.")
        print("The app may fall back to template generation.")
