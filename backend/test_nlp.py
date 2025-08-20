import os
import sys
from pprint import pprint

# Add the parent directory to the Python path to allow importing nlp_processing
# This is crucial when running test_nlp.py directly.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the function to test
from nlp_processing import highlight_key_points, summarize_document, enhance_summary

# --- Sample Legal Texts for Testing ---
sample_legal_texts = [
    {
        "name": "Obligation Clause (Direct)",
        "text": "Party A shall indemnify Party B against any and all losses arising from the breach of this agreement. The agreement must be terminated if either party defaults on payments.",
        "expected_types": ["obligation/right", "condition"]
    },
    {
        "name": "Semantic Match (Indemnification)",
        "text": "The Seller agrees to hold the Buyer harmless from any claims or damages resulting from defects in the product. This clause is crucial.",
        "expected_types": ["semantic_match"]
    },
    {
        "name": "Conditional Clause (Indirect)",
        "text": "In the event that the services are not rendered by the stipulated deadline, the Client reserves the right to withhold payment.",
        "expected_types": ["condition"]
    },
    {
        "name": "Mixed Clauses & Semantic Match",
        "text": "This contract will commence on January 1, 2024. The parties may extend the term by mutual written consent. Any dispute arising hereunder shall be resolved through binding arbitration. Confidential information must not be disclosed.",
        "expected_types": ["obligation/right", "semantic_match"]
    },
    {
        "name": "Complex Termination Clause",
        "text": "Notwithstanding anything to the contrary herein, either party may terminate this agreement for convenience by providing sixty (60) days' prior written notice to the other party. Upon such termination, all outstanding obligations shall immediately become due and payable.",
        "expected_types": ["obligation/right", "semantic_match"]
    },
    {
        "name": "Short, Simple Text (Summarization Test)",
        "text": "This is a very short text. It will not produce a good summary. This is for testing purposes only.",
        "expected_types": [] # No specific legal points expected
    }
]

# --- Test Execution ---
def run_tests():
    print("--- Running Tests for NLP Processing ---")
    print("\n--- Testing highlight_key_points (Advanced Extraction) ---")

    for i, test_case in enumerate(sample_legal_texts):
        print(f"\nTest Case {i+1}: {test_case['name']}")
        print(f"Original Text: \"{test_case['text']}\"")

        # Test highlight_key_points
        try:
            key_points = highlight_key_points(test_case["text"])
            print("Extracted Key Points (Structured):")
            pprint(key_points) # Use pprint for readable dictionary output

            # Basic validation
            found_types = [kp["type"] for kp in key_points]
            print(f"Found Types: {found_types}")
            
            # Check if expected types are present (simple check)
            for expected_type in test_case["expected_types"]:
                if expected_type not in found_types:
                    print(f"  WARNING: Expected type '{expected_type}' not found.")

        except Exception as e:
            print(f"  ERROR: Failed to extract key points: {e}")

    print("\n--- Testing Summarization and Summary Enhancement ---")
    for i, test_case in enumerate(sample_legal_texts):
        print(f"\nTest Case {i+1}: {test_case['name']}")
        print(f"Original Text: \"{test_case['text']}\"")
        
        # Test summarization
        try:
            summary = summarize_document(test_case["text"])
            print(f"Generated Summary: {summary}")
            
            # Test summary enhancement
            enhanced_summary = enhance_summary(summary)
            print(f"Enhanced Summary: {enhanced_summary}")
        except Exception as e:
            print(f"  ERROR: Failed to summarize or enhance: {e}")


    print("\n--- NLP Tests Complete ---")

if __name__ == "__main__":
    # Ensure models are downloaded before running tests
    print("Ensuring SpaCy and HuggingFace models are downloaded...")
    # These imports trigger model loading in nlp_processing.py
    # If models are not found, it will attempt to download them.
    # This might take a while on the first run.
    try:
        import spacy
        from transformers import pipeline
        from sentence_transformers import SentenceTransformer
        spacy.load("en_core_web_lg")
        pipeline("summarization", model="facebook/bart-large-cnn")
        SentenceTransformer('all-mpnet-base-v2')
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models. Please ensure internet connection or manual download: {e}")
        print("Run 'python -m spacy download en_core_web_lg' and ensure transformers/sentence_transformers dependencies are met.")
        sys.exit(1) # Exit if models can't be loaded

    run_tests()