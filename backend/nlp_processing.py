from typing import List, Dict
import spacy
from sentence_transformers import SentenceTransformer
from transformers import pipeline
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from functools import lru_cache
import os

# Import LLM service for cloud-based analysis
try:
    from llm_service import get_llm_service
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False

# --- Constants ---
# Words indicating legal actions/obligations/rights
LEGAL_ACTION_WORDS = {"shall", "must", "will", "may", "agrees", "obligated", "undertakes", "covenants"}
# Words indicating conditions
CONDITIONAL_WORDS = {"if", "unless", "provided that", "in the event", "upon condition that", "subject to"}

# Predefined legal phrases for semantic matching (expand this list significantly!)
# These are conceptual categories or specific phrases you want to detect.
TARGET_PHRASES = [
    "indemnify the other party",
    "hold harmless from any losses",
    "liable for damages",
    "terminate the agreement",
    "expiration of this contract",
    "governing law",
    "dispute resolution mechanism",
    "confidential information",
    "force majeure event",
    "breach of contract",
    "assignment of rights",
    "intellectual property ownership",
    "warranties and representations",
    "effective date of this agreement",
    "notice period for termination",
    "payment schedule",
    "delivery terms",
    "default interest rate",
    "severability clause",
    "entire agreement clause",
    "amendment procedure",
    "jurisdiction of courts",
    "arbitration clause",
    "non-disclosure obligation",
    "limitation of liability",
    "representation and warranty",
    "due diligence",
    "escrow account",
    "lien on property",
    "guarantee of performance"
]

# --- Model Loading (Singleton Pattern) ---
# These models are loaded once when the module is first imported.
# This avoids reloading them for every API request.

# SpaCy model for dependency parsing and sentence tokenization
# 'en_core_web_lg' is recommended for better parsing than 'sm'
try:
    nlp = spacy.load("en_core_web_lg")
except OSError:
    print("Downloading en_core_web_lg model for SpaCy...")
    spacy.cli.download("en_core_web_lg")
    nlp = spacy.load("en_core_web_lg")

# HuggingFace Transformers pipeline for summarization
# 'facebook/bart-large-cnn' is a good general choice.
# For production, consider 'sshleifer/distilbart-cnn-12-6' for smaller size, or legal-specific models.
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Sentence-BERT model for semantic similarity
# 'all-mpnet-base-v2' is a good general-purpose model for sentence embeddings.
sbert_model = SentenceTransformer('all-mpnet-base-v2')

# Precompute embeddings for target phrases (done once at startup)
# This makes semantic similarity checks very fast during runtime.
target_phrase_embeddings = sbert_model.encode(TARGET_PHRASES)

# --- Core NLP Functions ---

def summarize_document(text: str, ai_model: str = "gemini") -> str:
    """
    Generates an abstractive summary of the given English text.
    Uses selected AI model: 'gemini' for LLM or 'bart' for local BART+BERT.
    """
    if len(text.split()) < 50:
        return "Document too short to generate a meaningful summary."

    # Use Gemini API if selected and available
    if ai_model == "gemini" and LLM_AVAILABLE and os.getenv('GEMINI_API_KEY'):
        try:
            llm_service = get_llm_service()
            return llm_service.summarize_document(text)
        except Exception as e:
            print(f"Gemini summarization failed, using local fallback: {e}")
            ai_model = "bart"  # Fallback to BART

    # Use local BART model if selected or as fallback
    if ai_model == "bart":
        try:
            # Try local BART model
            summary = summarizer(text, max_length=250, min_length=50, do_sample=False)
            return summary[0]['summary_text']
        except Exception as e:
            print(f"BART model unavailable, using enhanced fallback: {e}")
            # Enhanced fallback with better legal document analysis
            return _create_enhanced_summary(text)

    # Default fallback
    return _create_enhanced_summary(text)


def highlight_key_points(text: str, ai_model: str = "gemini") -> List[Dict]:
    """
    Extracts crucial legal clauses and key points.
    Uses selected AI model: 'gemini' for LLM or 'bart' for local BART+BERT analysis.
    Returns a list of dictionaries, each containing the clause text, type, and confidence.
    """

    # Use Gemini API if selected and available
    if ai_model == "gemini" and LLM_AVAILABLE and os.getenv('GEMINI_API_KEY'):
        try:
            llm_service = get_llm_service()
            key_points_text = llm_service.extract_key_points(text)

            # Convert to the expected format for compatibility
            return [
                {
                    "text": point,
                    "type": "gemini_extracted",
                    "confidence": 0.95
                }
                for point in key_points_text
            ]
        except Exception as e:
            print(f"Gemini key point extraction failed, using local fallback: {e}")
            ai_model = "bart"  # Fallback to local processing

    # Use local BART+BERT processing if selected or as fallback
    if ai_model == "bart":
        doc = nlp(text)
        all_clauses = []

        # Step 1: Rule-based extraction (high precision for direct matches)
        all_clauses.extend(_extract_legal_actions(doc))
        all_clauses.extend(_extract_conditional_clauses(doc))

        # Step 2: Semantic similarity (catch paraphrases and broader concepts)
        all_clauses.extend(_find_semantic_matches(doc))

        # Step 3: Deduplicate and rank by confidence
        return _rank_and_deduplicate(all_clauses)

    # Default fallback
    return [{"text": "Could not extract key points with the selected model.", "type": "error", "confidence": 0.1}]

# --- Helper Functions for Key Point Extraction ---

def _extract_legal_actions(doc) -> List[Dict]:
    """
    Extracts sentences containing explicit legal action/obligation verbs
    and their associated subjects/objects using dependency parsing.
    """
    actions = []
    for sent in doc.sents:
        for token in sent:
            # Check if the token is an action word and an auxiliary verb or root of a clause
            if token.text.lower() in LEGAL_ACTION_WORDS and token.dep_ in ("ROOT", "aux", "auxpass"):
                # Attempt to get the full clause/sentence subtree
                # A more robust approach might build the clause from head to children
                clause_text = sent.text.strip()
                actions.append({
                    "text": clause_text,
                    "type": "obligation/right",
                    "confidence": 0.95 # High confidence for direct matches
                })
                break # Move to next sentence after finding one match in it
    return actions

def _extract_conditional_clauses(doc) -> List[Dict]:
    """
    Extracts sentences that express conditions (e.g., "If X, then Y").
    """
    conditions = []
    for sent in doc.sents:
        for token in sent:
            if token.text.lower() in CONDITIONAL_WORDS:
                conditions.append({
                    "text": sent.text.strip(),
                    "type": "condition",
                    "confidence": 0.85 # Good confidence
                })
                break # Move to next sentence
    return conditions

@lru_cache(maxsize=1000) # Cache embeddings for repeated sentences to save computation
def _find_semantic_matches(doc, threshold: float = 0.7) -> List[Dict]:
    """
    Compares each sentence in the document to a list of predefined legal phrases
    using Sentence-BERT to find semantically similar matches.
    """
    matches = []
    sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()] # Get all non-empty sentences
    if not sentences:
        return []

    # Encode all sentences in the document at once for efficiency
    sentence_embeddings = sbert_model.encode(sentences)

    # Compare each sentence's embedding to the precomputed target phrase embeddings
    for i, (sent, embedding) in enumerate(zip(sentences, sentence_embeddings)):
        # Calculate cosine similarity between the current sentence and all target phrases
        similarities = cosine_similarity([embedding], target_phrase_embeddings)[0]
        max_similarity_idx = np.argmax(similarities)
        
        # If the highest similarity is above the threshold, consider it a match
        if similarities[max_similarity_idx] >= threshold:
            matches.append({
                "text": sent,
                "type": "semantic_match",
                "matched_concept": TARGET_PHRASES[max_similarity_idx], # What it semantically matched
                "confidence": float(similarities[max_similarity_idx])
            })
    return matches

def _rank_and_deduplicate(clauses: List[Dict]) -> List[Dict]:
    """
    Deduplicates clauses (keeping the one with highest confidence if text is identical)
    and sorts them by confidence in descending order. Limits to top N.
    """
    unique_clauses = {}
    for clause in clauses:
        # Use the clause text as the key for deduplication
        text_key = clause["text"].lower() # Case-insensitive deduplication
        if text_key not in unique_clauses or clause["confidence"] > unique_clauses[text_key]["confidence"]:
            unique_clauses[text_key] = clause
            
    # Sort the unique clauses by confidence in descending order
    sorted_clauses = sorted(unique_clauses.values(), key=lambda x: x["confidence"], reverse=True)
    
    # Return top 10 for brevity, can be adjusted
    return sorted_clauses[:10]

# --- Legacy Support (Optional but kept for main.py compatibility) ---
# This function is used by main.py to enhance the summary text itself.
# It uses a simple keyword check, which is fine for visual emphasis.
LEGAL_KEYWORDS_SIMPLE_FOR_HIGHLIGHTING = [
    "must", "shall", "will", "liable", "indemnify", "hold harmless",
    "terminate", "expiration", "duration", "penalty", "breach", "default",
    "ownership", "title", "rights", "obligations", "warranties", "covenants",
    "notwithstanding", "hereby", "herein", "thereof", "thereby", "agreement",
    "contract", "clause", "section", "article", "annexure", "schedule",
    "dispute", "arbitration", "jurisdiction", "governing law", "effective date",
    "commencement", "renewal", "notice", "consent", "waiver", "severability",
    "amendment", "assignment", "successors", "assigns", "force majeure",
    "confidential", "intellectual property", "damages", "injunction", "remedies",
    "representation", "warranty", "condition", "undertaking", "cancellation",
    "revocation", "validity", "enforceable", "binding", "stipulated", "provided that",
    "unless", "except", "not limited to", "including but not limited to",
    "notwithstanding anything to the contrary", "without prejudice", "hereunder"
]
def _create_enhanced_summary(text: str) -> str:
    """
    Create an enhanced summary using rule-based analysis when LLM is not available.
    """
    sentences = text.split('.')
    important_sentences = []

    # Look for sentences with legal importance indicators
    importance_keywords = [
        'party', 'parties', 'agreement', 'contract', 'obligation', 'shall', 'must',
        'payment', 'term', 'termination', 'liability', 'breach', 'damages',
        'intellectual property', 'confidential', 'dispute', 'governing law'
    ]

    for sentence in sentences[:50]:  # Analyze first 50 sentences
        sentence = sentence.strip()
        if len(sentence) > 30:  # Skip very short sentences
            score = sum(1 for keyword in importance_keywords if keyword.lower() in sentence.lower())
            if score >= 2:  # Sentence contains multiple important terms
                important_sentences.append(sentence)
                if len(important_sentences) >= 5:  # Limit to 5 key sentences
                    break

    if important_sentences:
        summary = "This legal document contains the following key elements: " + ". ".join(important_sentences) + "."
    else:
        # Basic fallback
        summary = f"Legal document analysis: {' '.join(text.split()[:150])}..."

    return summary

def enhance_summary(summary_text: str) -> str:
    """
    Adds simple markers to sentences in the summary that contain legal keywords.
    """
    enhanced_sentences = []
    for sent in summary_text.split('.'):
        if not sent.strip():
            continue

        found_keyword = False
        for keyword in LEGAL_KEYWORDS_SIMPLE_FOR_HIGHLIGHTING:
            if keyword in sent.lower():
                enhanced_sentences.append(f"⚖️ {sent.strip()}")
                found_keyword = True
                break
        if not found_keyword:
            enhanced_sentences.append(sent.strip())

    return '. '.join(enhanced_sentences) + ('.' if summary_text.endswith('.') else '')
