FROM python:3.13-slim

WORKDIR /app

# Instalar dependencias necesarias
RUN apt-get update && apt-get install -y \
    gcc \
    libcairo2 \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    libssl-dev \
    libharfbuzz0b \
    shared-mime-info \
    fonts-dejavu-core \
    libreoffice \
    && rm -rf /var/lib/apt/lists/*

# Esto ayuda a que Python encuentre las librerías compartidas más rápido
ENV LD_LIBRARY_PATH=/usr/lib:/usr/local/lib

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]