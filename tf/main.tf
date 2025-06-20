#################################
# Resource group creation
#################################
resource "azurerm_resource_group" "main_resource_group" {
  name     = "${var.VALUESTREAM}-${var.APPLICATION}"
  location = var.REGION


  tags = data.azurerm_resource_group.networkrg.tags
  lifecycle {
    ignore_changes = [
      tags["var.resource_tags"],
      tags["ES-UniqueID"]
    ]
  }
}

module "Application_Insights" {
  source = "github.com/Nykredit/wte-infrastructure-modules/azure/monitoring/application-insights?ref=0.0.1"
  name = "${var.VALUESTREAM}-${var.APPLICATION}"
  resource_group_name = azurerm_resource_group.main_resource_group.name

  #defaults
  resource_tags = data.azurerm_resource_group.networkrg.tags
}

#################################
# Data sources
#################################

# looking for resource group like nyk-dev-gwc-shared-rg for looking up vnet and subnets
data "azurerm_resource_group" "networkrg" {
  name = var.VNET_RG
}

# looking for vnet like nyk-gwc-scdme-vnet-01 for looking up subnets within
data "azurerm_virtual_network" "vnet" {
  name = var.VNET_NAME
  resource_group_name = data.azurerm_resource_group.networkrg.name
}

# looking for subnet like nyk-gwc-01-snet for private endpoint deployments
data "azurerm_subnet" "snet-inbound" {
  name                 = var.SNET_INBOUND_NAME
  virtual_network_name = data.azurerm_virtual_network.vnet.name
  resource_group_name  = data.azurerm_resource_group.networkrg.name
}

# looking for subnet like nyk-gwc-02-snet for vnet delegation deployments
data "azurerm_subnet" "snet-outbound" {
  name                 = var.SNET_OUTBOUND_NAME
  virtual_network_name = data.azurerm_virtual_network.vnet.name
  resource_group_name  = data.azurerm_resource_group.networkrg.name
}

# looking for subnet like nyk-gwc-03-snet for vnet delegation deployments
data "azurerm_subnet" "snet-webapp-outbound" {
  name                 = var.SNET_OUTBOUND_WEBAPP_NAME
  virtual_network_name = data.azurerm_virtual_network.vnet.name
  resource_group_name  = data.azurerm_resource_group.networkrg.name
}