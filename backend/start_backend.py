#!/usr/bin/env python3
"""
Startup script for RootGuard Bot FastAPI Backend
"""
import sys
import os
import subprocess

def check_python_version():
    """Check if Python version is 3.7 or higher"""
    if sys.version_info < (3, 7):
        print("Error: Python 3.7 or higher is required")
        sys.exit(1)
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_requirements():
    """Install required packages"""
    print("Installing requirements...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True, text=True)
        print("✓ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"Error installing requirements: {e}")
        print("You may need to install packages manually:")
        print("pip install -r requirements.txt")
        sys.exit(1)

def create_env_file():
    """Create .env file if it doesn't exist"""
    env_path = ".env"
    if not os.path.exists(env_path):
        print("Creating .env file...")
        with open(env_path, "w") as f:
            f.write("""# Database Configuration
DATABASE_URL=sqlite:///./irrigation_system.db

# API Configuration  
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# CORS Origins (add your frontend URLs)
CORS_ORIGINS=["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000"]
""")
        print("✓ Created .env file with default settings")
    else:
        print("✓ .env file already exists")

def start_server():
    """Start the FastAPI server"""
    print("\n🚀 Starting RootGuard Bot API Server...")
    print("Access the API at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server\n")
    
    try:
        os.system("python main.py")
    except KeyboardInterrupt:
        print("\n👋 Server stopped")

if __name__ == "__main__":
    print("🌱 RootGuard Bot Backend Setup")
    print("=" * 40)
    
    check_python_version()
    install_requirements()
    create_env_file()
    start_server()