# Backend configuration for Terraform state
# Using Azure Storage for remote state (required for CI/CD)

terraform {
  backend "azurerm" {
    resource_group_name  = "studysphere-rg"
    storage_account_name = "studyspheretfstate"
    container_name       = "tfstate"
    key                  = "production.tfstate"
  }
}
