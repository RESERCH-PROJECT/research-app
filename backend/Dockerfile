FROM python:3.12-slim

# Build argument to control GPU support
ARG ENABLE_GPU=false

WORKDIR /app

# Install system dependencies only when needed
RUN if [ "$ENABLE_GPU" = "true" ]; then \
    apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libxcb1 \
    libx11-6 \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*; \
    fi

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

CMD ["python", "main.py"]
