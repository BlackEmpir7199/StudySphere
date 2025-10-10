# This file configures the Terraform backend for remote state storage in Azure
# 
# Before running terraform init, create the backend storage:
#
# az group create --name terraform-state-rg --location "East US"
# az storage account create --name tfstudysphere --resource-group terraform-state-rg --location "East US" --sku Standard_LRS
# az storage container create --name tfstate --account-name tfstudysphere
#
# Then initialize:
# terraform init
#
# Backend configuration is defined in main.tf

