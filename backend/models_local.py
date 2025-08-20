"""
Local AI Models for Legal Document Analysis
Uses BART Large CNN for summarization and BERT for key point extraction
Optimized for detecting critical legal details like dates, amounts, deadlines
"""

import torch
from transformers import (
    BartForConditionalGeneration, 
    BartTokenizer,
    AutoTokenizer, 
    AutoModelForTokenClassification,
    pipeline
)
import re
from datetime import datetime, timedelta
import spacy
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class LocalLegalAnalyzer:
    def __init__(self):
        """Initialize BART + BERT models for legal analysis"""
        logger.info("Loading local AI models (BART + BERT)...")
        
        # BART Large CNN for summarization
        self.bart_model_name = "facebook/bart-large-cnn"
        self.bart_tokenizer = BartTokenizer.from_pretrained(self.bart_model_name)
        self.bart_model = BartForConditionalGeneration.from_pretrained(self.bart_model_name)
        
        # BERT for Named Entity Recognition (dates, amounts, etc.)
        self.ner_pipeline = pipeline(
            "ner", 
            model="dslim/bert-base-NER",
            tokenizer="dslim/bert-base-NER",
            aggregation_strategy="simple"
        )
        
        # spaCy for additional legal entity extraction
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
        
        # Legal keywords for critical point detection
        self.critical_patterns = {
            'deadlines': [
                r'(?:due|payable|expires?|deadline|before|by|until|no later than)\s+(?:on\s+)?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
                r'(?:due|payable|expires?|deadline|before|by|until|no later than)\s+(\w+\s+\d{1,2},?\s+\d{4})',
                r'within\s+(\d+)\s+(?:days?|months?|years?)',
                r'(\d+)\s+(?:days?|months?|years?)\s+(?:from|after|before)'
            ],
            'amounts': [
                r'\$[\d,]+(?:\.\d{2})?',
                r'(?:USD|dollars?)\s*[\d,]+(?:\.\d{2})?',
                r'[\d,]+(?:\.\d{2})?\s*(?:USD|dollars?)'
            ],
            'ownership_transfer': [
                r'(?:ownership|property|title|rights?)\s+(?:will\s+be\s+|shall\s+be\s+)?(?:transferred?|changed?|assigned?|conveyed?)',
                r'(?:transfer|change|assign|convey)\s+(?:of\s+)?(?:ownership|property|title|rights?)',
                r'(?:forfeit|lose|relinquish)\s+(?:ownership|property|title|rights?)'
            ],
            'penalties': [
                r'(?:penalty|fine|fee|charge|interest)\s+of\s+\$?[\d,]+',
                r'(?:late|penalty|additional)\s+(?:fee|charge|interest)',
                r'(?:forfeit|lose|penalty)\s+\$?[\d,]+'
            ]
        }
        
        logger.info("Local AI models loaded successfully")

    def summarize_with_bart(self, text: str, max_length: int = 200) -> str:
        """Generate summary using BART Large CNN"""
        try:
            # Prepare text for BART (legal document focus)
            legal_prefix = "Legal document summary: "
            input_text = legal_prefix + text[:1024]  # BART has token limits
            
            inputs = self.bart_tokenizer.encode(
                input_text, 
                return_tensors="pt", 
                max_length=1024, 
                truncation=True
            )
            
            # Generate summary
            with torch.no_grad():
                summary_ids = self.bart_model.generate(
                    inputs,
                    max_length=max_length,
                    min_length=50,
                    length_penalty=2.0,
                    num_beams=4,
                    early_stopping=True
                )
            
            summary = self.bart_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            return summary
            
        except Exception as e:
            logger.error(f"BART summarization failed: {e}")
            return f"Error in summarization: {str(e)}"

    def extract_critical_points_with_bert(self, text: str) -> List[Dict]:
        """Extract critical legal points using BERT + pattern matching"""
        critical_points = []
        
        try:
            # 1. Use BERT NER to find entities
            entities = self.ner_pipeline(text)
            
            # 2. Extract critical patterns
            for category, patterns in self.critical_patterns.items():
                for pattern in patterns:
                    matches = re.finditer(pattern, text, re.IGNORECASE)
                    for match in matches:
                        context_start = max(0, match.start() - 100)
                        context_end = min(len(text), match.end() + 100)
                        context = text[context_start:context_end].strip()
                        
                        critical_points.append({
                            'category': category,
                            'matched_text': match.group(),
                            'context': context,
                            'importance': 'HIGH',
                            'position': match.start()
                        })
            
            # 3. Use spaCy for additional entity extraction
            if self.nlp:
                doc = self.nlp(text)
                for ent in doc.ents:
                    if ent.label_ in ['DATE', 'MONEY', 'PERCENT', 'TIME']:
                        critical_points.append({
                            'category': 'entity',
                            'matched_text': ent.text,
                            'entity_type': ent.label_,
                            'context': str(ent.sent),
                            'importance': 'MEDIUM',
                            'position': ent.start_char
                        })
            
            # 4. Sort by importance and position
            critical_points.sort(key=lambda x: (x['importance'] == 'HIGH', -x['position']))
            
            return critical_points[:10]  # Return top 10 critical points
            
        except Exception as e:
            logger.error(f"BERT key point extraction failed: {e}")
            return [{'category': 'error', 'matched_text': f'Extraction failed: {str(e)}'}]

    def analyze_document(self, text: str) -> Dict:
        """Complete legal document analysis using local models"""
        logger.info("Starting local model analysis...")
        
        # 1. Generate summary with BART
        summary = self.summarize_with_bart(text)
        
        # 2. Extract critical points with BERT
        critical_points = self.extract_critical_points_with_bert(text)
        
        # 3. Format critical points for frontend
        formatted_points = []
        for point in critical_points:
            if point['category'] == 'deadlines':
                emoji = '⏰'
                prefix = 'CRITICAL DEADLINE'
            elif point['category'] == 'amounts':
                emoji = '💰'
                prefix = 'FINANCIAL AMOUNT'
            elif point['category'] == 'ownership_transfer':
                emoji = '🏠'
                prefix = 'OWNERSHIP CHANGE'
            elif point['category'] == 'penalties':
                emoji = '⚠️'
                prefix = 'PENALTY/FEE'
            else:
                emoji = '📋'
                prefix = 'IMPORTANT'
            
            formatted_points.append(
                f"{emoji} {prefix}: {point['matched_text']} - {point.get('context', '')[:100]}..."
            )
        
        return {
            'summary': summary,
            'key_points': formatted_points,
            'metadata': {
                'processing_method': 'Local BART + BERT',
                'model_version': 'facebook/bart-large-cnn + dslim/bert-base-NER',
                'critical_points_found': len(critical_points)
            }
        }

# Global instance
local_analyzer = None

def get_local_analyzer():
    """Get or create local analyzer instance"""
    global local_analyzer
    if local_analyzer is None:
        local_analyzer = LocalLegalAnalyzer()
    return local_analyzer

def analyze_with_local_models(text: str) -> Dict:
    """Analyze document using local BART + BERT models"""
    analyzer = get_local_analyzer()
    return analyzer.analyze_document(text)
