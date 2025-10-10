#!/bin/bash

# StudySphere - GitHub Secrets Setup Helper
# This script helps you set up GitHub secrets for CI/CD

set -e

echo "🚀 StudySphere - GitHub Secrets Setup"
echo "======================================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found!"
    echo "Please install it: https://cli.github.com/"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "🔐 Please login to GitHub CLI first:"
    gh auth login
fi

echo "📝 Setting up secrets for your repository..."
echo ""

# Get Azure subscription ID
echo "🔍 Getting Azure subscription ID..."
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "✅ Subscription ID: $SUBSCRIPTION_ID"

# Get ACR details
echo "🔍 Getting ACR details..."
ACR_NAME="studysphereacr"
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv 2>/dev/null || echo "studysphereacr.azurecr.io")
echo "✅ ACR Login Server: $ACR_LOGIN_SERVER"

# Get PostgreSQL details
echo "🔍 Getting PostgreSQL details..."
PG_FQDN=$(az postgres flexible-server show --name studysphere-postgres --resource-group studysphere-rg --query fullyQualifiedDomainName -o tsv 2>/dev/null || echo "studysphere-postgres.postgres.database.azure.com")
echo "✅ PostgreSQL FQDN: $PG_FQDN"

# Prompt for sensitive values
echo ""
echo "📝 Please provide the following sensitive values:"
echo ""

read -sp "Database Admin Password: " DB_PASSWORD
echo ""

read -sp "JWT Secret (press Enter for random): " JWT_SECRET
echo ""
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "✅ Generated random JWT secret"
fi

read -p "Gemini API Key: " GEMINI_KEY
read -p "Azure Moderator Key: " MODERATOR_KEY
read -p "Azure Moderator Endpoint: " MODERATOR_ENDPOINT

echo ""
echo "🔐 Setting GitHub secrets..."

# Set secrets
gh secret set ACR_NAME -b "$ACR_NAME"
gh secret set ACR_LOGIN_SERVER -b "$ACR_LOGIN_SERVER"
gh secret set AKS_CLUSTER_NAME -b "studysphere-aks"
gh secret set AKS_RESOURCE_GROUP -b "studysphere-rg"
gh secret set ARM_SUBSCRIPTION_ID -b "$SUBSCRIPTION_ID"
gh secret set DATABASE_URL -b "postgresql://pgadmin:$DB_PASSWORD@$PG_FQDN:5432/studysphere?sslmode=require"
gh secret set DB_ADMIN_PASSWORD -b "$DB_PASSWORD"
gh secret set JWT_SECRET -b "$JWT_SECRET"
gh secret set GEMINI_API_KEY -b "$GEMINI_KEY"
gh secret set GEMINI_MODEL -b "gemini-2.0-flash-exp"
gh secret set AZURE_MODERATOR_KEY -b "$MODERATOR_KEY"
gh secret set AZURE_MODERATOR_ENDPOINT -b "$MODERATOR_ENDPOINT"

echo ""
echo "✅ Basic secrets set successfully!"
echo ""
echo "⚠️  IMPORTANT: You still need to set these manually:"
echo ""
echo "1. AZURE_CREDENTIALS - Full JSON from service principal"
echo "   Run: az ad sp create-for-rbac --name 'studysphere-github-actions' --role contributor --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/studysphere-rg --sdk-auth"
echo "   Then: gh secret set AZURE_CREDENTIALS < credentials.json"
echo ""
echo "2. ARM_CLIENT_ID - From AZURE_CREDENTIALS JSON"
echo "3. ARM_CLIENT_SECRET - From AZURE_CREDENTIALS JSON"
echo "4. ARM_TENANT_ID - From AZURE_CREDENTIALS JSON"
echo ""
echo "📖 See GITHUB_SETUP.md for detailed instructions"
echo ""

