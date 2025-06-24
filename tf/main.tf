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
# NO WEBAPPP - NOT YET AT LEAST
# data "azurerm_subnet" "snet-webapp-outbound" {
#   name                 = var.SNET_OUTBOUND_WEBAPP_NAME
#   virtual_network_name = data.azurerm_virtual_network.vnet.name
#   resource_group_name  = data.azurerm_resource_group.networkrg.name
# }


### AZURE FUNCTIONS APP ###
module "Storage_Account_func" {
  source = "github.com/Nykredit/wte-infrastructure-modules/azure/storage/storage-account?ref=0.0.2"
  storage_account_name = replace("${var.VALUESTREAM}-${var.APPLICATION}-${var.ENVIRONMENT}-sa", "-", "")
  resource_group_name = azurerm_resource_group.main_resource_group.name
  region = var.REGION

  #defaults
  inbound_subnet_id = data.azurerm_subnet.snet-inbound.id
  outbound_subnet_id = data.azurerm_subnet.snet-outbound.id
  resource_tags = var.RESOURCE_TAGS

}


module "function-app-service-plan" {
  source              = "github.com/Nykredit/wte-infrastructure-modules.git//azure/compute/function-app-service-plan?ref=0.0.6"
  name                = "${var.VALUESTREAM}-${var.APPLICATION}-${var.ENVIRONMENT}-sp"
  resource_group_name = azurerm_resource_group.main_resource_group.name

  #defaults
  resource_tags = data.azurerm_resource_group.networkrg.tags
  depends_on = [azurerm_resource_group.main_resource_group]
}

module "functions" {
  source = "github.com/Nykredit/wte-infrastructure-modules/azure/compute/flex-function?ref=0.0.6"
  name = "${var.VALUESTREAM}-${var.APPLICATION}-${var.ENVIRONMENT}-func"
  resource_group_name = azurerm_resource_group.main_resource_group.name
  region = var.REGION

  # setting up environment variables for the function app
  additional_app_settings = var.ADDITIONAL_APP_SETTINGS

  # Defaults
  function_app_service_plan_id = module.function-app-service-plan.function_app_service_plan_id
  storage_account_name = module.Storage_Account_func.storage_account_name
  inbound_subnet_id = data.azurerm_subnet.snet-inbound.id
  outbound_subnet_id = data.azurerm_subnet.snet-outbound.id
  resource_tags = var.RESOURCE_TAGS
  application_insights_connection_string = module.Application_Insights.application_insights_connection_string

  depends_on = [module.Storage_Account_func]
}



