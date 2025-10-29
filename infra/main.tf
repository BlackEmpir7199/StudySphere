terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  # Using local state for simplicity
  # For production, configure remote backend in Azure Storage
}

provider "azurerm" {
  features {}
}

# Resource Group (imported - already exists)
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = "southindia"

  tags = {}
  
  lifecycle {
    ignore_changes = [tags, location]
  }
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "studysphere-postgres"
  resource_group_name    = azurerm_resource_group.main.name
  location               = "Korea Central"
  version                = "15"
  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password
  zone                   = "1"
  
  storage_mb = 32768
  sku_name   = "B_Standard_B1ms"

  backup_retention_days        = 7
  geo_redundant_backup_enabled = false

  tags = {}
  
  lifecycle {
    ignore_changes = [
      zone,
      tags
    ]
  }
}

# PostgreSQL Firewall Rule - Allow Azure Services
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}


resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_all" {
  name             = "AllowAll_2025-10-10_20-1-54"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "255.255.255.255"
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "studysphere" {
  name      = "studysphere"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "UTF8"
}

# Azure Container Registry
resource "azurerm_container_registry" "main" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.main.name
  location            = "koreacentral"
  sku                 = "Standard"
  admin_enabled       = true

  tags = {}
  
  lifecycle {
    ignore_changes = [tags]
  }
}

# Azure Kubernetes Service
resource "azurerm_kubernetes_cluster" "main" {
  name                = var.aks_cluster_name
  location            = "koreacentral"
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "studyspher-studysphere-rg-ca898a"
  kubernetes_version  = "1.32"

  default_node_pool {
    name       = "nodepool1"
    node_count = var.aks_node_count
    vm_size    = "Standard_B2s"
    
    upgrade_settings {
      max_surge = "10%"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
    service_cidr      = "10.0.0.0/16"
    dns_service_ip    = "10.0.0.10"
  }
  
  linux_profile {
    admin_username = "azureuser"
    ssh_key {
      key_data = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCbwTJc5LNJUjL8UWvtwn6doZhzMK77VhfaEY/t8pANk3tYSB/RTcDC/QZA7+mMsTUgHPCtauyFOCOkWzhDuoq8OKKZ1FQm2D7GkSGygxYQSObMS+Wzg1oVdBo6fGnOxXME+N1PNR3N7xZr4iOoARDA/yhS/6yYsoAfJIqtpSPVnElU/j33IC8QPxFB2X/ZBkNvXp3LChn98smDvp5K9gmzZVCFeUpHsl7mjneFmK/LdUcXKRLvlUTItc0Y2fP0/JIboQcKQuUcjzYwWsCMTVfBSWfeQTcYjfG0z1ktyciYHX0BFJLSZvX/wEvIgO7QTCoqpBqyy8DAZeq0kvYT/DCx"
    }
  }

  tags = {}
  
  lifecycle {
    ignore_changes = [
      tags,
      default_node_pool[0].node_count,
      kubernetes_version
    ]
  }
}

# Role Assignment - Allow AKS to pull from ACR (already exists, will import)
resource "azurerm_role_assignment" "aks_acr_pull" {
  principal_id                     = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.main.id
  skip_service_principal_aad_check = true
  
  lifecycle {
    ignore_changes = all
  }
}

# Log Analytics Workspace for AKS monitoring
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.project_name}-logs-${var.environment}"
  location            = "koreacentral"
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = {
    Environment = var.environment
    Project     = "StudySphere"
  }
}

