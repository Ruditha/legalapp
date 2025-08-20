"""
Multi-Provider LLM Service Module for Legal Document Analysis
Supports multiple LLM providers with automatic fallback.
"""

import os
import logging
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MultiLLMService:
    def __init__(self):
        """Initialize the LLM service with multiple provider support."""
        self.providers = []
        self._setup_providers()
        
        if not self.providers:
            logger.warning("No LLM providers available. Using fallback mode.")
        else:
            logger.info(f"LLM Service initialized with {len(self.providers)} provider(s)")

    def _setup_providers(self):
        """Set up available LLM providers in order of preference."""
        
        # 1. Try Gemini (Google)
        if os.getenv('GEMINI_API_KEY'):
            try:
                import google.generativeai as genai
                genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
                model = genai.GenerativeModel('gemini-1.5-flash')
                self.providers.append(('gemini', model))
                logger.info("✅ Gemini provider initialized")
            except Exception as e:
                logger.error(f"❌ Gemini setup failed: {e}")
        
        # 2. Try OpenAI (requires: pip install openai)
        if os.getenv('OPENAI_API_KEY'):
            try:
                import openai
                openai.api_key = os.getenv('OPENAI_API_KEY')
                self.providers.append(('openai', openai))
                logger.info("✅ OpenAI provider initialized")
            except Exception as e:
                logger.error(f"❌ OpenAI setup failed: {e}")
        
        # 3. Try Anthropic Claude (requires: pip install anthropic)
        if os.getenv('ANTHROPIC_API_KEY'):
            try:
                import anthropic
                client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
                self.providers.append(('anthropic', client))
                logger.info("✅ Anthropic provider initialized")
            except Exception as e:
                logger.error(f"❌ Anthropic setup failed: {e}")
        
        # 4. Free alternative: Hugging Face (requires: pip install transformers)
        if os.getenv('HUGGINGFACE_API_KEY') or True:  # Can work without API key
            try:
                from transformers import pipeline
                # Use a free, smaller model for basic functionality
                summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
                self.providers.append(('huggingface', summarizer))
                logger.info("✅ Hugging Face provider initialized")
            except Exception as e:
                logger.error(f"❌ Hugging Face setup failed: {e}")

    def summarize_document(self, text: str) -> str:
        """Generate summary using the first available provider."""
        if not text or len(text.strip()) < 50:
            return "Document text too short for meaningful analysis."
        
        for provider_name, provider in self.providers:
            try:
                return self._summarize_with_provider(provider_name, provider, text)
            except Exception as e:
                logger.error(f"❌ {provider_name} summarization failed: {e}")
                continue
        
        # Fallback to simple truncation
        return f"AI summarization unavailable. Document preview: {' '.join(text.split()[:150])}..."

    def extract_key_points(self, text: str) -> List[str]:
        """Extract key points using the first available provider."""
        if not text or len(text.strip()) < 50:
            return ["Document text too short for key point extraction."]
        
        for provider_name, provider in self.providers:
            try:
                return self._extract_points_with_provider(provider_name, provider, text)
            except Exception as e:
                logger.error(f"❌ {provider_name} key point extraction failed: {e}")
                continue
        
        # Fallback to rule-based extraction
        return self._fallback_key_points(text)

    def _summarize_with_provider(self, provider_name: str, provider, text: str) -> str:
        """Summarize using specific provider."""
        prompt = f"""Summarize this legal document in 2-3 paragraphs, focusing on key obligations, rights, and risks:

{text}"""
        
        if provider_name == 'gemini':
            response = provider.generate_content(prompt)
            return response.text.strip()
        
        elif provider_name == 'openai':
            response = provider.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500
            )
            return response.choices[0].message.content.strip()
        
        elif provider_name == 'anthropic':
            response = provider.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text.strip()
        
        elif provider_name == 'huggingface':
            # For Hugging Face, use the summarization pipeline
            summary = provider(text, max_length=250, min_length=50, do_sample=False)
            return summary[0]['summary_text']
        
        return "Provider not supported"

    def _extract_points_with_provider(self, provider_name: str, provider, text: str) -> List[str]:
        """Extract key points using specific provider."""
        prompt = f"""Extract 8-10 crucial legal points from this document. Format as a list with emojis:

{text}

Focus on: obligations, payments, termination, liability, deadlines, risks."""
        
        if provider_name == 'gemini':
            response = provider.generate_content(prompt)
            return self._parse_points_response(response.text)
        
        elif provider_name == 'openai':
            response = provider.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=600
            )
            return self._parse_points_response(response.choices[0].message.content)
        
        elif provider_name == 'anthropic':
            response = provider.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=600,
                messages=[{"role": "user", "content": prompt}]
            )
            return self._parse_points_response(response.content[0].text)
        
        elif provider_name == 'huggingface':
            # For Hugging Face, use fallback method
            return self._fallback_key_points(text)
        
        return ["Provider not supported"]

    def _parse_points_response(self, response_text: str) -> List[str]:
        """Parse LLM response into clean key points."""
        points = []
        for line in response_text.split('\n'):
            line = line.strip()
            if line and not line.startswith('#') and len(line) > 10:
                cleaned_line = line.lstrip('•-*1234567890. ')
                if cleaned_line:
                    points.append(cleaned_line)
        return points[:10]

    def _fallback_key_points(self, text: str) -> List[str]:
        """Fallback key point extraction using rule-based methods."""
        points = []
        sentences = text.split('.')
        
        legal_keywords = ['shall', 'must', 'liable', 'terminate', 'payment', 'breach', 'obligation']
        
        for sentence in sentences[:20]:  # Check first 20 sentences
            sentence = sentence.strip()
            if any(keyword in sentence.lower() for keyword in legal_keywords):
                if len(sentence) > 20 and len(sentence) < 200:
                    points.append(f"⚖️ {sentence}")
                    if len(points) >= 8:
                        break
        
        if not points:
            points = [
                "📋 Review all terms and conditions carefully",
                "💰 Check payment obligations and deadlines", 
                "⚖️ Understand liability and risk allocation",
                "🔄 Review termination and renewal clauses",
                "⚠️ Automatic analysis not available - manual review recommended"
            ]
        
        return points

# Global instance
multi_llm_service = None

def get_multi_llm_service() -> MultiLLMService:
    """Get or create the global multi-LLM service instance."""
    global multi_llm_service
    if multi_llm_service is None:
        multi_llm_service = MultiLLMService()
    return multi_llm_service
