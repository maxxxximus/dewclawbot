#!/bin/bash

# Deploy script для Gemini Proxy Cloud Function
# Використовує gcloud CLI для деплою у us-central1

set -e

# Кольори для консолі
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Deploying Gemini Proxy Cloud Function...${NC}"

# Перевірка необхідних environment variables
if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${RED}❌ GEMINI_API_KEY environment variable is required${NC}"
    echo "Set it with: export GEMINI_API_KEY=\"your-api-key\""
    exit 1
fi

if [ -z "$PROXY_SECRET" ]; then
    echo -e "${RED}❌ PROXY_SECRET environment variable is required${NC}"
    echo "Set it with: export PROXY_SECRET=\"your-secret-key\""
    exit 1
fi

# Перевірка gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Перевірка авторизації gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null 2>&1; then
    echo -e "${RED}❌ gcloud is not authenticated${NC}"
    echo "Run: gcloud auth login"
    exit 1
fi

# Отримання project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ No default GCP project set${NC}"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}✅ Project: $PROJECT_ID${NC}"
echo -e "${GREEN}✅ Region: us-central1${NC}"

# Деплой Cloud Function
echo -e "${YELLOW}📦 Deploying to Google Cloud...${NC}"

gcloud functions deploy gemini-proxy \
    --gen2 \
    --runtime=nodejs20 \
    --region=us-central1 \
    --source=. \
    --entry-point=geminiProxy \
    --trigger=http \
    --allow-unauthenticated \
    --set-env-vars="GEMINI_API_KEY=$GEMINI_API_KEY,PROXY_SECRET=$PROXY_SECRET" \
    --memory=256MB \
    --timeout=60s \
    --max-instances=10 \
    --min-instances=0

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    
    # Отримання URL функції
    FUNCTION_URL=$(gcloud functions describe gemini-proxy --region=us-central1 --format="value(serviceConfig.uri)")
    echo -e "${GREEN}📡 Function URL: $FUNCTION_URL${NC}"
    echo -e "${YELLOW}💡 Use this URL as GEMINI_PROXY_URL in your .env file${NC}"
    
    # Тестовий запит
    echo -e "${YELLOW}🧪 Testing deployment...${NC}"
    
    TEST_RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $PROXY_SECRET" \
        -d '{
            "prompt": "Generate a simple test image of a red circle"
        }' \
        -w "%{http_code}")
    
    HTTP_CODE="${TEST_RESPONSE: -3}"
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Test request successful (HTTP 200)${NC}"
    else
        echo -e "${YELLOW}⚠️  Test request returned HTTP $HTTP_CODE${NC}"
        echo "This might be normal - check the response for details"
    fi
    
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎯 Setup complete! Add these to your .env file:${NC}"
echo "GEMINI_PROXY_URL=$FUNCTION_URL"
echo "GEMINI_PROXY_SECRET=$PROXY_SECRET"
echo "GEMINI_PROXY_ENABLED=true"