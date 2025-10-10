#!/bin/bash

# Terraform apply script for StudySphere infrastructure
# This script provisions all Azure resources

set -e

echo "===================="
echo "StudySphere Infrastructure Deployment"
echo "===================="

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Error: Azure CLI is not installed"
    echo "Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "Error: Terraform is not installed"
    echo "Install from: https://www.terraform.io/downloads"
    exit 1
fi

# Check if logged in to Azure
echo "Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "Not logged in to Azure. Logging in..."
    az login
fi

# Show current subscription
SUBSCRIPTION=$(az account show --query name -o tsv)
echo "Using Azure subscription: $SUBSCRIPTION"

# Create backend storage if it doesn't exist
echo ""
echo "Setting up Terraform backend storage..."
az group create --name terraform-state-rg --location "East US" --output none 2>/dev/null || true
az storage account create --name tfstudysphere --resource-group terraform-state-rg --location "East US" --sku Standard_LRS --output none 2>/dev/null || true
az storage container create --name tfstate --account-name tfstudysphere --output none 2>/dev/null || true
echo "Backend storage ready"

# Initialize Terraform
echo ""
echo "Initializing Terraform..."
terraform init

# Validate configuration
echo ""
echo "Validating Terraform configuration..."
terraform validate

# Plan deployment
echo ""
echo "Planning infrastructure changes..."
terraform plan -out=tfplan

# Ask for confirmation
echo ""
read -p "Do you want to apply these changes? (yes/no): " CONFIRM

if [ "$CONFIRM" = "yes" ]; then
    echo ""
    echo "Applying infrastructure changes..."
    terraform apply tfplan
    
    echo ""
    echo "===================="
    echo "Deployment Complete!"
    echo "===================="
    echo ""
    echo "To get AKS credentials, run:"
    echo "az aks get-credentials --resource-group studysphere-rg --name studysphere-aks"
    echo ""
    echo "To view outputs, run:"
    echo "terraform output"
else
    echo "Deployment cancelled"
    rm -f tfplan
    exit 0
fi

# Clean up plan file
rm -f tfplan

echo ""
echo "Infrastructure is ready!"

