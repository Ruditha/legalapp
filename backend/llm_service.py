"""
LLM Service Module for Legal Document Analysis
Integrates with Google Gemini API for advanced document summarization and key point extraction.
"""

import os
import google.generativeai as genai
from typing import List, Dict
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        """Initialize the LLM service with Google Gemini."""
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        logger.info("LLM Service initialized with Google Gemini")

    def summarize_document(self, text: str) -> str:
        """
        Generate a comprehensive summary of the legal document using Gemini.
        
        Args:
            text (str): The extracted text from the legal document
            
        Returns:
            str: A structured summary highlighting key legal elements
        """
        if not text or len(text.strip()) < 50:
            return "Document text too short for meaningful analysis."
        
        prompt = f"""
        You are a legal document analysis expert. Analyze the following legal document text and provide a comprehensive, professional summary.

        Focus on:
        1. Document type and purpose
        2. Key parties involved
        3. Main obligations and rights
        4. Important terms and conditions
        5. Potential risks or concerns
        6. Critical deadlines or timeframes

        Document Text:
        {text}

        Provide a clear, structured summary in 2-3 paragraphs that a non-lawyer can understand, while highlighting the most important legal aspects.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error in LLM summarization: {e}")
            # Fallback to simple text truncation
            return f"Summary generation failed. Document preview: {' '.join(text.split()[:150])}..."

    def extract_key_points(self, text: str) -> List[str]:
        """
        Extract crucial legal points from the document using Gemini.
        
        Args:
            text (str): The extracted text from the legal document
            
        Returns:
            List[str]: A list of key legal points and concerns
        """
        if not text or len(text.strip()) < 50:
            return ["Document text too short for key point extraction."]
        
        prompt = f"""
        You are a legal document analysis expert. Analyze the following legal document and extract the most crucial points that someone should be aware of before signing.

        Focus on identifying:
        1. Financial obligations and payment terms
        2. Liability and indemnification clauses
        3. Termination conditions and notice periods
        4. Renewal and cancellation terms
        5. Intellectual property rights
        6. Confidentiality requirements
        7. Dispute resolution mechanisms
        8. Governing law and jurisdiction
        9. Risk factors and potential consequences
        10. Time-sensitive obligations

        Document Text:
        {text}

        Return ONLY a list of the most important points, each starting with an appropriate emoji and written in clear, actionable language. Limit to 8-10 key points maximum.
        """
        
        try:
            response = self.model.generate_content(prompt)
            points_text = response.text.strip()
            
            # Parse the response into individual points
            # Split by lines and clean up
            points = []
            for line in points_text.split('\n'):
                line = line.strip()
                if line and not line.startswith('#') and len(line) > 10:
                    # Remove bullet points and numbering
                    cleaned_line = line.lstrip('•-*1234567890. ')
                    if cleaned_line:
                        points.append(cleaned_line)
            
            return points[:10]  # Limit to 10 points maximum
            
        except Exception as e:
            logger.error(f"Error in LLM key point extraction: {e}")
            return ["Key point extraction failed. Please review the document manually."]

    def generate_document(self, prompt: str, max_tokens: int = 2000) -> str:
        """
        Generate a complete legal document using Gemini based on the provided prompt.

        Args:
            prompt (str): The detailed prompt for document generation
            max_tokens (int): Maximum tokens for the response

        Returns:
            str: A complete legal document
        """
        if not prompt or len(prompt.strip()) < 50:
            return "Prompt too short for meaningful document generation."

        try:
            # Configure generation parameters for longer, more comprehensive responses
            generation_config = {
                'max_output_tokens': max_tokens,
                'temperature': 0.3,  # Lower temperature for more consistent legal language
                'top_p': 0.8,
                'top_k': 40
            }

            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )

            generated_text = response.text.strip()

            # Ensure the document is substantial
            if len(generated_text) < 500:
                logger.warning("Generated document seems short, may need prompt refinement")

            return generated_text

        except Exception as e:
            logger.error(f"Error in document generation: {e}")
            raise Exception(f"Document generation failed: {e}")

    def analyze_document_comprehensive(self, text: str) -> Dict[str, any]:
        """
        Perform comprehensive document analysis combining summary and key points.
        
        Args:
            text (str): The extracted text from the legal document
            
        Returns:
            Dict containing summary and key_points
        """
        try:
            summary = self.summarize_document(text)
            key_points = self.extract_key_points(text)
            
            return {
                "summary": summary,
                "key_points": key_points,
                "analysis_method": "Google Gemini LLM",
                "success": True
            }
        except Exception as e:
            logger.error(f"Comprehensive analysis failed: {e}")
            return {
                "summary": "Document analysis failed due to technical issues.",
                "key_points": ["Please try again or contact support."],
                "analysis_method": "Error fallback",
                "success": False
            }

# Global instance
llm_service = None

def get_llm_service() -> LLMService:
    """Get or create the global LLM service instance."""
    global llm_service
    if llm_service is None:
        llm_service = LLMService()
    return llm_service

# Add direct method access for backward compatibility
def generate_document(prompt: str, max_tokens: int = 2000) -> str:
    """Generate a document using the global LLM service instance."""
    service = get_llm_service()
    return service.generate_document(prompt, max_tokens)
