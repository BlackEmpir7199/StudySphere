#!/bin/bash

# StudySphere Deployment Script
# Deploys application to Azure Kubernetes Service

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         StudySphere Deployment to AKS                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed"
    echo "Install from: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed"
    echo "Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login to Azure
echo "Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "Not logged in to Azure. Logging in..."
    az login
fi

SUBSCRIPTION=$(az account show --query name -o tsv)
echo "✅ Using Azure subscription: $SUBSCRIPTION"

# Get AKS credentials
echo ""
echo "Getting AKS credentials..."
AKS_CLUSTER_NAME=${AKS_CLUSTER_NAME:-studysphere-aks}
AKS_RESOURCE_GROUP=${AKS_RESOURCE_GROUP:-studysphere-rg}

az aks get-credentials --resource-group $AKS_RESOURCE_GROUP --name $AKS_CLUSTER_NAME --overwrite-existing
echo "✅ AKS credentials configured"

# Select namespace
echo ""
echo "Select deployment environment:"
echo "  1) development"
echo "  2) testing"
echo "  3) production"
read -p "Enter choice (1-3): " ENV_CHOICE

case $ENV_CHOICE in
    1)
        NAMESPACE="development"
        ;;
    2)
        NAMESPACE="testing"
        ;;
    3)
        NAMESPACE="production"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo "Deploying to namespace: $NAMESPACE"

# Create namespace if it doesn't exist
echo ""
echo "Creating namespace if not exists..."
kubectl apply -f k8s/namespaces.yaml

# Create secrets
echo ""
echo "Creating Kubernetes secrets..."
read -p "Enter DATABASE_URL: " DATABASE_URL
read -p "Enter JWT_SECRET: " JWT_SECRET
read -p "Enter AZURE_OPENAI_KEY: " AZURE_OPENAI_KEY
read -p "Enter AZURE_OPENAI_ENDPOINT: " AZURE_OPENAI_ENDPOINT
read -p "Enter AZURE_MODERATOR_KEY: " AZURE_MODERATOR_KEY
read -p "Enter AZURE_MODERATOR_ENDPOINT: " AZURE_MODERATOR_ENDPOINT

kubectl create secret generic azure-secrets \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=AZURE_OPENAI_KEY="$AZURE_OPENAI_KEY" \
  --from-literal=AZURE_OPENAI_ENDPOINT="$AZURE_OPENAI_ENDPOINT" \
  --from-literal=AZURE_MODERATOR_KEY="$AZURE_MODERATOR_KEY" \
  --from-literal=AZURE_MODERATOR_ENDPOINT="$AZURE_MODERATOR_ENDPOINT" \
  --from-literal=REDIS_URL="redis://redis:6379" \
  --from-literal=CORS_ORIGIN="https://$NAMESPACE.studysphere.example.com" \
  -n $NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ Secrets created"

# Update namespace in manifests
echo ""
echo "Updating namespace in manifests..."
for file in k8s/deployments/*.yaml; do
    sed -i.bak "s/namespace: production/namespace: $NAMESPACE/g" $file
    rm -f $file.bak
done

for file in k8s/services/*.yaml; do
    sed -i.bak "s/namespace: production/namespace: $NAMESPACE/g" $file
    rm -f $file.bak
done

# Deploy to Kubernetes
echo ""
echo "Deploying services..."
kubectl apply -f k8s/deployments/ -n $NAMESPACE
kubectl apply -f k8s/services/ -n $NAMESPACE

if [ "$NAMESPACE" = "production" ]; then
    echo "Deploying ingress and HPA..."
    kubectl apply -f k8s/ingress.yaml -n $NAMESPACE
    kubectl apply -f k8s/hpa.yaml -n $NAMESPACE
fi

# Verify deployment
echo ""
echo "Verifying deployments..."
kubectl rollout status deployment/auth-service -n $NAMESPACE
kubectl rollout status deployment/user-service -n $NAMESPACE
kubectl rollout status deployment/group-service -n $NAMESPACE
kubectl rollout status deployment/chat-service -n $NAMESPACE
kubectl rollout status deployment/frontend -n $NAMESPACE

# Show pod status
echo ""
echo "Pod status:"
kubectl get pods -n $NAMESPACE

# Show service status
echo ""
echo "Service status:"
kubectl get services -n $NAMESPACE

# Get external IP (if LoadBalancer)
echo ""
echo "Waiting for LoadBalancer IP..."
EXTERNAL_IP=""
while [ -z $EXTERNAL_IP ]; do
    EXTERNAL_IP=$(kubectl get service frontend -n $NAMESPACE --template="{{range .status.loadBalancer.ingress}}{{.ip}}{{end}}")
    [ -z "$EXTERNAL_IP" ] && sleep 5
done

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         Deployment Complete! 🚀                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Application URL: http://$EXTERNAL_IP"
echo "Namespace: $NAMESPACE"
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/auth-service -n $NAMESPACE"
echo ""
echo "To scale deployment:"
echo "  kubectl scale deployment/auth-service --replicas=5 -n $NAMESPACE"
echo ""
echo "To rollback:"
echo "  kubectl rollout undo deployment/auth-service -n $NAMESPACE"
echo ""

