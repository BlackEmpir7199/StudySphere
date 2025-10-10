# Import configuration for existing Azure resources
# This file helps import your manually created resources into Terraform

# Note: Run these commands to import existing resources:
# terraform import azurerm_resource_group.main /subscriptions/ca898a6e-77b0-4099-a290-72ed7f0406a2/resourceGroups/studysphere-rg
# terraform import azurerm_postgresql_flexible_server.main /subscriptions/ca898a6e-77b0-4099-a290-72ed7f0406a2/resourceGroups/studysphere-rg/providers/Microsoft.DBforPostgreSQL/flexibleServers/studysphere-postgres
# terraform import azurerm_postgresql_flexible_server_database.studysphere /subscriptions/ca898a6e-77b0-4099-a290-72ed7f0406a2/resourceGroups/studysphere-rg/providers/Microsoft.DBforPostgreSQL/flexibleServers/studysphere-postgres/databases/studysphere
# terraform import azurerm_postgresql_flexible_server_firewall_rule.allow_all /subscriptions/ca898a6e-77b0-4099-a290-72ed7f0406a2/resourceGroups/studysphere-rg/providers/Microsoft.DBforPostgreSQL/flexibleServers/studysphere-postgres/firewallRules/AllowAll_2025-10-10_20-1-54
# terraform import azurerm_container_registry.main /subscriptions/ca898a6e-77b0-4099-a290-72ed7f0406a2/resourceGroups/studysphere-rg/providers/Microsoft.ContainerRegistry/registries/studysphereacr
# terraform import azurerm_kubernetes_cluster.main /subscriptions/ca898a6e-77b0-4099-a290-72ed7f0406a2/resourceGroups/studysphere-rg/providers/Microsoft.ContainerService/managedClusters/studysphere-aks

