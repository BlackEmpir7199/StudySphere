variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "studysphere"
}

variable "environment" {
  description = "Environment (dev, test, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "Korea Central"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "studysphere-rg"
}

variable "db_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "pgadmin"
  sensitive   = true
}

variable "db_admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}

variable "acr_name" {
  description = "Azure Container Registry name (must be globally unique)"
  type        = string
  default     = "studysphereacr"
}

variable "aks_cluster_name" {
  description = "AKS cluster name"
  type        = string
  default     = "studysphere-aks"
}

variable "aks_node_count" {
  description = "Number of nodes in the AKS default node pool"
  type        = number
  default     = 2
}

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}

