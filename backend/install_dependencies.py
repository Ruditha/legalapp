#!/usr/bin/env python
"""
Dependency Installation Script for Legal Awareness App Backend
This script installs all required Python packages for production deployment.
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a shell command and handle errors."""
    print(f"\n📦 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Legal Awareness App Backend - Dependency Installation")
    print("=" * 60)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version.split()[0]} detected")
    
    # Create virtual environment if it doesn't exist
    if not os.path.exists('venv'):
        if not run_command('python -m venv venv', 'Creating virtual environment'):
            sys.exit(1)
    
    # Activate virtual environment and install dependencies
    activate_cmd = 'source venv/bin/activate' if os.name != 'nt' else 'venv\\Scripts\\activate'
    
    commands = [
        (f'{activate_cmd} && pip install --upgrade pip', 'Upgrading pip'),
        (f'{activate_cmd} && pip install -r requirements.txt', 'Installing Python dependencies'),
        (f'{activate_cmd} && python -m spacy download en_core_web_sm', 'Downloading spaCy English model'),
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            print(f"\n❌ Installation failed at: {description}")
            sys.exit(1)
    
    print("\n🎉 All dependencies installed successfully!")
    print("\n📋 Next steps:")
    print("1. Copy .env.example to .env and add your GEMINI_API_KEY")
    print("2. Run: source venv/bin/activate (Linux/Mac) or venv\\Scripts\\activate (Windows)")
    print("3. Run: python main.py")

if __name__ == "__main__":
    main()
