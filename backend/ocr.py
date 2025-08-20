import cv2
import numpy as np
import pytesseract
from PIL import Image
import os

# Set the path to the Tesseract executable if it's not in your PATH
# pytesseract.pytesseract.tesseract_cmd = r'/usr/local/bin/tesseract' # Example for macOS/Linux
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe' # Example for Windows

def preprocess_image(image_path_or_array):
    """
    Applies image pre-processing techniques to enhance OCR accuracy.
    Handles both file paths and numpy arrays (from in-memory processing).
    """
    if isinstance(image_path_or_array, str):
        img = cv2.imread(image_path_or_array)
        if img is None:
            raise ValueError(f"Image not found or could not be read: {image_path_or_array}")
    else: # Assume it's a numpy array (e.g., from BytesIO)
        img = image_path_or_array

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Deskew (tilt correction) - Basic implementation
    # This is a simplified deskew. More advanced methods exist for complex documents.
    coords = np.column_stack(np.where(gray > 0))
    if coords.shape[0] > 0: # Ensure there are points to calculate angle
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        (h, w) = img.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    else:
        rotated = img # No text found, no rotation needed

    # Binarization (adaptive thresholding) - good for varying lighting
    processed = cv2.adaptiveThreshold(
        cv2.cvtColor(rotated, cv2.COLOR_BGR2GRAY),
        255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2 # Block size 11, C value 2
    )

    # Optional: Noise reduction (e.g., median blur) - uncomment if needed
    # processed = cv2.medianBlur(processed, 3)

    return processed

def extract_text_from_image(image_path):
    """
    Extracts text from an image file using Tesseract OCR after pre-processing.
    """
    processed_image = preprocess_image(image_path)
    # Use PIL Image to pass to pytesseract
    text = pytesseract.image_to_string(Image.fromarray(processed_image), lang='eng') # 'eng' for English
    return text

# For multi-column texts, you'd typically use pytesseract.image_to_data()
# to get bounding box information and then sort/group text by columns.
# This is more advanced and beyond a basic starter.