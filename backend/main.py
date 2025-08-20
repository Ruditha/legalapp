from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from pydantic import BaseModel
import uvicorn
import os
import shutil
from typing import List, Dict, Optional
import logging
from dotenv import load_dotenv
from datetime import datetime, timedelta
import re

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import custom modules
from ocr import extract_text_from_image
from nlp_processing import summarize_document, highlight_key_points, enhance_summary

# Data models for document generation
class DocumentGenerationRequest(BaseModel):
    document_type: str
    form_data: Dict[str, Optional[str]]
    prompt: Optional[str] = None

# --- FastAPI App Setup ---
app = FastAPI(
    title="Legal Awareness App Backend",
    description="API for processing legal documents: OCR, Summarization, and Key Point Highlighting."
)

# Configure CORS to allow frontend to connect
# Get allowed origins from environment or use defaults
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:8081,http://10.0.2.2:8081,exp://localhost:8081').split(',')
origins = [
    "http://localhost",
    "http://localhost:3000",  # React development server
    "http://localhost:8081",  # Expo development server
    "http://localhost:19009", # Webpack dev server
    "exp://localhost:8081",   # Expo Go app
    "http://10.0.2.2:8000",   # Android emulator to host
    "http://10.0.2.2:8081",   # Android emulator to Expo
    "*",  # Allow all origins for development (restrict in production)
] + allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/health")
async def health_check():
    """Health check endpoint to verify backend is running."""
    return {
        "status": "healthy",
        "message": "Legal Awareness App Backend is running",
        "llm_available": bool(os.getenv('GEMINI_API_KEY')),
        "version": "2.0.0"
    }

@app.post("/generate_document")
async def generate_document_endpoint(request: DocumentGenerationRequest):
    """
    Generates a legal document based on provided parameters and document type.
    Uses AI to create professional legal drafts from templates.
    """
    logger.info(f"Generating {request.document_type} document")

    try:
        # Check if Gemini API is available
        if not os.getenv('GEMINI_API_KEY') or os.getenv('GEMINI_API_KEY') == 'your_actual_gemini_api_key_here':
            logger.warning("Gemini API not available, using template fallback")
            return generate_document_fallback(request)

        # Import LLM service for document generation
        from llm_service import get_llm_service

        # Create the prompt for AI generation
        generation_prompt = create_generation_prompt(request.document_type, request.form_data)

        # Generate document using LLM
        llm_service = get_llm_service()
        try:
            # Use the document generation method for creating complete legal documents
            generated_content = llm_service.generate_document(generation_prompt, max_tokens=2000)

            logger.info(f"Successfully generated {request.document_type} document using AI")

            return {
                "generated_document": generated_content,
                "document_type": request.document_type,
                "metadata": {
                    "generation_method": "Google Gemini API",
                    "template_used": request.document_type,
                    "disclaimer": "AI-generated draft. Requires professional legal review."
                }
            }
        except Exception as e:
            logger.error(f"AI generation failed: {e}, falling back to template")
            return generate_document_fallback(request)

    except Exception as e:
        logger.error(f"Document generation error: {e}")
        return generate_document_fallback(request)

def create_generation_prompt(document_type: str, form_data: Dict) -> str:
    """Create comprehensive AI prompt for full legal document generation."""

    # Document-specific prompts for better results
    if document_type == 'rental':
        return create_rental_agreement_prompt(form_data)
    elif document_type == 'nda':
        return create_nda_prompt(form_data)
    elif document_type == 'service':
        return create_service_agreement_prompt(form_data)
    else:
        return create_generic_agreement_prompt(document_type, form_data)

def calculate_lease_end_date(start_date_str: str, duration_str: str) -> str:
    """Calculate lease end date from start date and duration."""
    try:
        # Parse common date formats
        for date_format in ['%B %d, %Y', '%m/%d/%Y', '%Y-%m-%d', '%d/%m/%Y']:
            try:
                start_date = datetime.strptime(start_date_str, date_format)
                break
            except ValueError:
                continue
        else:
            return '[END DATE TO BE CALCULATED]'

        # Parse duration
        duration_lower = duration_str.lower()
        if 'month' in duration_lower:
            months_match = re.search(r'(\d+)', duration_lower)
            if months_match:
                months = int(months_match.group(1))
                # Calculate end date (subtract 1 day for proper lease end)
                end_date = start_date + timedelta(days=30*months) - timedelta(days=1)
                return end_date.strftime('%B %d, %Y')
        elif 'year' in duration_lower:
            years_match = re.search(r'(\d+)', duration_lower)
            if years_match:
                years = int(years_match.group(1))
                end_date = start_date + timedelta(days=365*years) - timedelta(days=1)
                return end_date.strftime('%B %d, %Y')

        return '[END DATE TO BE CALCULATED]'
    except Exception:
        return '[END DATE TO BE CALCULATED]'

def parse_form_data_details(form_data: Dict) -> Dict:
    """Parse and enhance form data with specific field extraction."""
    # Extract utilities information
    utilities = form_data.get('utilitiesIncluded', '')
    if not utilities:
        custom_terms = form_data.get('customTerms', '')
        # Look for utilities in custom terms
        if 'water' in custom_terms.lower() or 'sewer' in custom_terms.lower():
            utilities = 'Water and Sewer included'

    # Extract pet policy
    pet_policy = form_data.get('petPolicy', '')
    if not pet_policy:
        custom_terms = form_data.get('customTerms', '')
        # Look for pet policy in custom terms
        if 'pet' in custom_terms.lower() or 'animal' in custom_terms.lower():
            pet_policy = custom_terms

    return {
        'utilitiesIncluded': utilities,
        'petPolicy': pet_policy,
        **form_data
    }

def create_rental_agreement_prompt(form_data: Dict) -> str:
    """Create detailed prompt for rental agreement generation with precise field mapping."""

    # Parse and enhance form data
    enhanced_data = parse_form_data_details(form_data)

    # Calculate lease end date if we have start date and duration
    start_date = enhanced_data.get('date', 'September 1, 2024')
    duration = enhanced_data.get('duration', '12 months')
    lease_end_date = calculate_lease_end_date(start_date, duration)

    # Extract utilities and pet policy
    utilities_info = enhanced_data.get('utilitiesIncluded', 'Tenant responsible for all utilities')
    pet_policy_info = enhanced_data.get('petPolicy', 'No pets without written consent')

    return f"""You are a professional legal document drafter. Generate a complete, comprehensive RESIDENTIAL LEASE AGREEMENT that reads like a real legal document a lawyer would draft. This should be a full, flowing narrative document with proper legal structure and language.

CRITICAL: You must use the EXACT field mappings below. Do not interchange addresses or dates.

PARTIES SECTION - Use these exact details:
- LANDLORD Full Name: {enhanced_data.get('party1Name', 'John Doe')}
- LANDLORD Address: {enhanced_data.get('party1Address', '123 Oak Avenue, Anytown, CA 90210')}
- TENANT Full Name: {enhanced_data.get('party2Name', 'Jane Smith')}
- TENANT Address: {enhanced_data.get('party2Address', '456 Main Street, Anytown, CA 90210')}

PREMISES SECTION - Use this EXACT rental property address:
- RENTAL PROPERTY Address (for premises section): {enhanced_data.get('propertyAddress', '789 Rental Street, Anytown, CA 90210')}

LEASE TERMS - Use these EXACT financial and timing details:
- Monthly Rent Amount: ${enhanced_data.get('amount', '1,500.00')}
- Security Deposit Amount: ${enhanced_data.get('amount', '1,500.00')}
- Lease Start Date: {start_date}
- Lease End Date: {lease_end_date}
- Lease Duration: {duration}

UTILITIES SECTION - Integrate this specific information:
- Utilities Included: {utilities_info}

PET POLICY SECTION - Integrate this specific policy:
- Pet Policy Details: {pet_policy_info}

SPECIAL TERMS & CONDITIONS:
{enhanced_data.get('customTerms', 'Standard lease terms apply')}

CRITICAL MAPPING REQUIREMENTS:
1. In PARTIES section: Use LANDLORD Address for landlord, TENANT Address for tenant
2. In PREMISES section: Use RENTAL PROPERTY Address (NOT landlord address)
3. In TERM section: Include BOTH start date AND calculated end date
4. In UTILITIES section: Integrate the specific utilities information provided
5. In PETS section: Integrate the detailed pet policy provided (not generic text)
6. In RENT section: Use exact monthly rent amount
7. In SECURITY DEPOSIT section: Use exact deposit amount

DOCUMENT STRUCTURE REQUIREMENTS:
1. Start with title "RESIDENTIAL LEASE AGREEMENT"
2. Write in complete, flowing paragraphs and clauses like a real lease
3. Include these sections with specific data integration:
   - PARTIES (use landlord and tenant names/addresses as specified)
   - PREMISES (use RENTAL PROPERTY address, not landlord address)
   - TERM (include both start date and calculated end date)
   - RENT (monthly amount, due date, integrate late fee terms if provided)
   - SECURITY DEPOSIT (exact amount and return conditions)
   - USE OF PREMISES (residential use only)
   - MAINTENANCE AND REPAIRS (responsibilities)
   - UTILITIES (integrate specific utilities information)
   - PETS (integrate detailed pet policy, not generic boilerplate)
   - ALTERATIONS (tenant restrictions)
   - ENTRY BY LANDLORD (notice requirements)
   - TERMINATION (conditions and notice)
   - SPECIAL TERMS (integrate all custom terms provided)
   - GOVERNING LAW (state jurisdiction)
   - ENTIRE AGREEMENT (integration clause)
   - SIGNATURES (spaces for both parties with names)

4. Use proper legal language and structure
5. Write complete sentences and paragraphs, not bullet points
6. Ensure ALL provided data is integrated into appropriate sections
7. Do not use generic boilerplate when specific details are provided
8. Calculate and include the lease end date

Generate the COMPLETE legal document text with ALL provided details properly integrated."""

def create_nda_prompt(form_data: Dict) -> str:
    """Create detailed prompt for NDA generation."""
    return f"""You are a professional legal document drafter. Generate a complete, comprehensive NON-DISCLOSURE AGREEMENT that reads like a real legal document a lawyer would draft.

Incorporate these details:

DISCLOSING PARTY:
- Name: {form_data.get('party1Name', 'ABC Corporation')}
- Address: {form_data.get('party1Address', '123 Business Ave, City, State 12345')}

RECEIVING PARTY:
- Name: {form_data.get('party2Name', 'John Smith')}
- Address: {form_data.get('party2Address', '456 Individual St, City, State 12345')}

AGREEMENT DETAILS:
- Effective Date: {form_data.get('date', 'January 1, 2024')}
- Duration: {form_data.get('duration', '2 years')}
- Special Terms: {form_data.get('customTerms', 'Standard confidentiality terms')}

Generate a complete NDA with sections for definition of confidential information, obligations, term, return of materials, remedies, and signatures."""

def create_service_agreement_prompt(form_data: Dict) -> str:
    """Create detailed prompt for service agreement generation."""
    return f"""You are a professional legal document drafter. Generate a complete, comprehensive SERVICE AGREEMENT that reads like a real legal document a lawyer would draft.

Incorporate these details:

SERVICE PROVIDER:
- Name: {form_data.get('party1Name', 'Professional Services LLC')}
- Address: {form_data.get('party1Address', '123 Business Ave, City, State 12345')}

CLIENT:
- Name: {form_data.get('party2Name', 'Client Company Inc')}
- Address: {form_data.get('party2Address', '456 Client St, City, State 12345')}

SERVICE DETAILS:
- Effective Date: {form_data.get('date', 'January 1, 2024')}
- Compensation: {form_data.get('amount', '$5,000')}
- Term: {form_data.get('duration', '6 months')}
- Special Terms: {form_data.get('customTerms', 'Standard service terms')}

Generate a complete service agreement with sections for services, compensation, term, deliverables, payment terms, termination, and signatures."""

def create_generic_agreement_prompt(document_type: str, form_data: Dict) -> str:
    """Create generic prompt for other document types."""
    return f"""You are a professional legal document drafter. Generate a complete, comprehensive {document_type.upper()} AGREEMENT that reads like a real legal document a lawyer would draft.

Incorporate these details:
- Party 1: {form_data.get('party1Name', '[PARTY 1 NAME]')}
- Party 1 Address: {form_data.get('party1Address', '[PARTY 1 ADDRESS]')}
- Party 2: {form_data.get('party2Name', '[PARTY 2 NAME]')}
- Party 2 Address: {form_data.get('party2Address', '[PARTY 2 ADDRESS]')}
- Date: {form_data.get('date', '[DATE]')}
- Amount: {form_data.get('amount', '[AMOUNT]')}
- Duration: {form_data.get('duration', '[DURATION]')}
- Special Terms: {form_data.get('customTerms', 'Standard terms apply')}

Generate a complete legal agreement appropriate for this document type."""

def generate_document_fallback(request: DocumentGenerationRequest) -> Dict:
    """Fallback document generation using comprehensive templates when AI is unavailable."""

    templates = {
        "rental": f"""RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement ("Agreement") is entered into on {request.form_data.get('date', '[DATE]')}, between {request.form_data.get('party1Name', '[LANDLORD NAME]')}, an individual ("Landlord"), and {request.form_data.get('party2Name', '[TENANT NAME]')}, an individual ("Tenant").

1. PARTIES
Landlord: {request.form_data.get('party1Name', '[LANDLORD NAME]')}
Address: {request.form_data.get('party1Address', '[LANDLORD ADDRESS]')}

Tenant: {request.form_data.get('party2Name', '[TENANT NAME]')}
Address: {request.form_data.get('party2Address', '[TENANT ADDRESS]')}

2. PREMISES
Landlord hereby leases to Tenant and Tenant hereby leases from Landlord the premises located at {request.form_data.get('propertyAddress', '[PROPERTY ADDRESS]')} (the "Premises"). The Premises shall be used and occupied by Tenant exclusively as a private single-family residence.

3. TERM
The term of this Agreement shall be for {request.form_data.get('duration', '[DURATION]')}, commencing on {request.form_data.get('date', '[START DATE]')} and ending on [END DATE], unless sooner terminated in accordance with the terms hereof.

4. RENT
Tenant agrees to pay Landlord rent in the amount of ${request.form_data.get('amount', '[AMOUNT]')} per month, due and payable in advance on the first day of each month. Rent shall be paid to Landlord at the address specified above or such other place as Landlord may designate in writing.

5. SECURITY DEPOSIT
Upon execution of this Agreement, Tenant shall deposit with Landlord the sum of ${request.form_data.get('amount', '[AMOUNT]')} as a security deposit to secure Tenant's faithful performance of the terms of this lease. The security deposit shall be returned to Tenant within thirty (30) days after termination of this lease, less any amounts withheld by Landlord for unpaid rent, cleaning costs, or damages beyond normal wear and tear.

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
{request.form_data.get('customTerms', 'No additional terms specified.')}

14. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State where the Premises are located.

15. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter hereof.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

LANDLORD:

_________________________________ Date: ___________
{request.form_data.get('party1Name', '[LANDLORD NAME]')}

TENANT:

_________________________________ Date: ___________
{request.form_data.get('party2Name', '[TENANT NAME]')}

⚠️ LEGAL DISCLAIMER: This document is a template for informational purposes only and does not constitute legal advice. This agreement should be reviewed by a qualified attorney before execution to ensure compliance with local laws and regulations.""",

        "nda": f"""MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into on {request.form_data.get('date', '[DATE]')}, between {request.form_data.get('party1Name', '[DISCLOSING PARTY]')}, a [corporation/individual] ("Disclosing Party"), and {request.form_data.get('party2Name', '[RECEIVING PARTY]')}, a [corporation/individual] ("Receiving Party").

1. PARTIES
Disclosing Party: {request.form_data.get('party1Name', '[DISCLOSING PARTY]')}
Address: {request.form_data.get('party1Address', '[DISCLOSING PARTY ADDRESS]')}

Receiving Party: {request.form_data.get('party2Name', '[RECEIVING PARTY]')}
Address: {request.form_data.get('party2Address', '[RECEIVING PARTY ADDRESS]')}

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
This Agreement shall remain in effect for {request.form_data.get('duration', '[DURATION]')} from the date first written above, unless terminated earlier by mutual written consent of the parties.

7. RETURN OF MATERIALS
All documents, materials, and other tangible expressions of Confidential Information shall be returned to Disclosing Party immediately upon request or upon termination of this Agreement.

8. REMEDIES
Receiving Party acknowledges that disclosure of Confidential Information would cause irreparable harm to Disclosing Party for which monetary damages would be inadequate. Therefore, Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity.

9. SPECIAL TERMS
{request.form_data.get('customTerms', 'No additional terms specified.')}

10. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of [STATE/JURISDICTION].

11. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties concerning the subject matter hereof and supersedes all prior agreements and understandings.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

DISCLOSING PARTY:

_________________________________ Date: ___________
{request.form_data.get('party1Name', '[DISCLOSING PARTY]')}

RECEIVING PARTY:

_________________________________ Date: ___________
{request.form_data.get('party2Name', '[RECEIVING PARTY]')}

⚠️ LEGAL DISCLAIMER: This document is a template for informational purposes only and does not constitute legal advice. This agreement should be reviewed by a qualified attorney before execution to ensure compliance with applicable laws and specific business requirements."""}

        "service": f"""PROFESSIONAL SERVICE AGREEMENT

This Professional Service Agreement ("Agreement") is entered into on {request.form_data.get('date', '[DATE]')}, between {request.form_data.get('party1Name', '[SERVICE PROVIDER]')}, a [corporation/individual] ("Service Provider"), and {request.form_data.get('party2Name', '[CLIENT]')}, a [corporation/individual] ("Client").

1. PARTIES
Service Provider: {request.form_data.get('party1Name', '[SERVICE PROVIDER]')}
Address: {request.form_data.get('party1Address', '[SERVICE PROVIDER ADDRESS]')}

Client: {request.form_data.get('party2Name', '[CLIENT]')}
Address: {request.form_data.get('party2Address', '[CLIENT ADDRESS]')}

2. SERVICES
Service Provider agrees to provide professional services as mutually agreed upon by the parties. The specific scope of services, deliverables, and timelines shall be detailed in separate statements of work or project specifications.

3. COMPENSATION
In consideration for the services provided, Client agrees to pay Service Provider the total amount of {request.form_data.get('amount', '[AMOUNT]')}. Payment terms and schedule shall be as follows:
a) Payment shall be made within thirty (30) days of receipt of invoice;
b) Late payments may incur a service charge of 1.5% per month;
c) All expenses must be pre-approved by Client in writing.

4. TERM AND TERMINATION
This Agreement shall commence on {request.form_data.get('date', '[START DATE]')} and continue for {request.form_data.get('duration', '[DURATION]')}, unless terminated earlier in accordance with the provisions herein. Either party may terminate this Agreement with thirty (30) days written notice to the other party.

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
{request.form_data.get('customTerms', 'No additional terms specified.')}

11. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of [STATE/JURISDICTION].

12. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter hereof.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

SERVICE PROVIDER:

_________________________________ Date: ___________
{request.form_data.get('party1Name', '[SERVICE PROVIDER]')}

CLIENT:

_________________________________ Date: ___________
{request.form_data.get('party2Name', '[CLIENT]')}

⚠️ LEGAL DISCLAIMER: This document is a template for informational purposes only and does not constitute legal advice. This agreement should be reviewed by a qualified attorney before execution to ensure compliance with applicable laws and specific business requirements."""
    }

    generated_doc = templates.get(request.document_type, templates["service"])

    return {
        "generated_document": generated_doc,
        "document_type": request.document_type,
        "metadata": {
            "generation_method": "Template-based",
            "template_used": request.document_type,
            "disclaimer": "Template-generated draft. Requires professional legal review."
        }
    }

@app.post("/process_document")
async def process_document_endpoint(
    file: UploadFile,
    ai_model: str = "gemini"  # Default to Gemini, can be 'gemini' or 'bart'
):
    """
    Processes an uploaded legal document using LLM-powered analysis:
    1. Extracts text using OCR.
    2. Summarizes the document using Google Gemini (with local fallback).
    3. Extracts and highlights crucial points using advanced LLM analysis.
    """
    logger.info(f"Processing document: {file.filename} using {ai_model.upper()} model")

    # Validate file type
    allowed_extensions = tuple(os.getenv('ALLOWED_FILE_TYPES', 'png,jpg,jpeg,tiff,bmp').split(','))
    if not file.filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail=f"Only image files ({', '.join(allowed_extensions).upper()}) are supported for OCR."
        )

    # Validate file size
    max_size = int(os.getenv('MAX_FILE_SIZE_MB', '5')) * 1024 * 1024
    if file.size and file.size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum {max_size // (1024*1024)}MB allowed."
        )

    # Save the uploaded file temporarily
    file_location = f"temp_{file.filename}"
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. OCR
        extracted_text = ""
        try:
            extracted_text = extract_text_from_image(file_location)
            if not extracted_text.strip():
                raise ValueError("OCR_FAILED: Could not extract text from the image. Please try a clearer photo.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OCR processing failed: {e}")

        # 2. Summarization using selected AI model
        summary_en = ""
        try:
            summary_en = summarize_document(extracted_text, ai_model=ai_model)
            # Enhance summary with legal keywords for visual emphasis in frontend
            enhanced_summary_en = enhance_summary(summary_en)
        except Exception as e:
            # Fallback to first N words if summarization fails
            summary_en = " ".join(extracted_text.split()[:150]) + "..."
            enhanced_summary_en = summary_en # No enhancement if main summary failed
            print(f"Summarization failed, using fallback: {e}")


        # 3. Crucial Points Highlighting using selected AI model
        key_points_structured: List[Dict] = []
        try:
            key_points_structured = highlight_key_points(extracted_text, ai_model=ai_model)
            # Send list of strings to frontend for simplicity
            key_points_text_only = [kp["text"] for kp in key_points_structured]
        except Exception as e:
            key_points_text_only = ["Could not extract specific key points."]
            print(f"Key point extraction failed: {e}")

        # Add metadata about the analysis
        analysis_metadata = {
            "ai_model_selected": ai_model,
            "llm_used": bool(os.getenv('GEMINI_API_KEY')) and ai_model == 'gemini',
            "ocr_success": True,
            "processing_method": f"Google Gemini API" if ai_model == 'gemini' else "Local BART + BERT"
        }

        logger.info(f"Document processing completed successfully using {analysis_metadata['processing_method']}")

        return {
            "summary": enhanced_summary_en,
            "key_points": key_points_text_only,
            "metadata": analysis_metadata
        }

    finally:
        # Clean up the temporary file
        if os.path.exists(file_location):
            os.remove(file_location)

# --- Run the FastAPI App ---
if __name__ == "__main__":
    logger.info("🚀 Starting Legal Awareness App Backend Server...")
    logger.info("📊 Server will run on: http://localhost:8000")
    logger.info("🔍 Health check: http://localhost:8000/health")
    logger.info("📄 API docs: http://localhost:8000/docs")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Listen on all network interfaces
        port=8000,
        reload=True,
        log_level="info"
    )
