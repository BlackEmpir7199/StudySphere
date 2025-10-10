#!/bin/bash

# Terraform destroy script for StudySphere infrastructure
# WARNING: This will delete all Azure resources

set -e

echo "===================="
echo "StudySphere Infrastructure Destruction"
echo "===================="
echo ""
echo "WARNING: This will destroy all Azure resources!"
echo ""
read -p "Are you absolutely sure? Type 'destroy' to confirm: " CONFIRM

if [ "$CONFIRM" != "destroy" ]; then
    echo "Destruction cancelled"
    exit 0
fi

echo ""
echo "Planning destruction..."
terraform plan -destroy -out=tfplan-destroy

echo ""
read -p "Review the plan above. Continue with destruction? (yes/no): " CONFIRM2

if [ "$CONFIRM2" = "yes" ]; then
    echo ""
    echo "Destroying infrastructure..."
    terraform apply tfplan-destroy
    
    echo ""
    echo "===================="
    echo "Destruction Complete!"
    echo "===================="
else
    echo "Destruction cancelled"
fi

# Clean up plan file
rm -f tfplan-destroy

