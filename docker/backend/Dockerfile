FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required by Playwright and build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    wget \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browser binaries (for SDK web scraping)
RUN playwright install chromium

# Copy shared root-level modules (used by backend agents)
COPY langgraph_nodes ./langgraph_nodes
COPY prompts ./prompts
COPY agents ./agents
COPY utils ./utils

# Copy the backend application code
COPY backend ./backend

# Create directories for runtime-generated static files
RUN mkdir -p backend/public/logos backend/public/sdk

# Set working directory to backend where main.py lives
WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
