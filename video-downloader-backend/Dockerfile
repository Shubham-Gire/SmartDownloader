FROM python:3.11-slim

# Install FFmpeg, FFprobe, certificates, and tools needed for Deno
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    curl \
    unzip && \
    rm -rf /var/lib/apt/lists/*

# Verify FFmpeg and FFprobe
RUN which ffmpeg && \
    which ffprobe

# Install Deno for yt-dlp JavaScript challenges
RUN curl -fsSL https://deno.land/install.sh | sh

ENV DENO_INSTALL=/root/.deno
ENV PATH="/root/.deno/bin:${PATH}"

# Verify Deno
RUN deno --version

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY . .

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Render provides PORT automatically
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]