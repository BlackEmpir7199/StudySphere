# StudySphere Terraform Variables
# Copy this to terraform.tfvars and update with your values

project_name        = "studysphere"
environment         = "production"
location            = "Korea Central"
resource_group_name = "studysphere-rg"

# Database Configuration
db_admin_username = "pgadmin"
# db_admin_password = "SET_THIS_IN_ENVIRONMENT_OR_TERRAFORM_CLOUD" # Use TF_VAR_db_admin_password environment variable

# Container Registry (must be globally unique)
acr_name = "studysphereacr"

# AKS Configuration
aks_cluster_name = "studysphere-aks"
aks_node_count   = 2

# Additional tags
tags = {
  Project     = "StudySphere"
  ManagedBy   = "Terraform"
  Team        = "CloudComputing"
  Environment = "Production"
}
