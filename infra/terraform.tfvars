
project_name        = "studysphere"
environment         = "prod"
location            = "Korea Central"
resource_group_name = "studysphere-rg"

# PostgreSQL Configuration
db_admin_username = "pgadmin"
db_admin_password = "StudySphere@2024Secure!"

# Container Registry (must be globally unique, alphanumeric only)
acr_name = "studysphereacr"

# AKS Configuration
aks_cluster_name = "studysphere-aks"
aks_node_count   = 2

# Additional tags
tags = {
  Team        = "CloudComputing"
  CostCenter  = "Education"
  Location    = "Korea"
}

