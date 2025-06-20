variable "VALUESTREAM" {
}
variable "APPLICATION" {
}

variable "ENVIRONMENT" {
}

variable "user_upn" {
    type = set(string)
    default = []
}

variable "REGION" {
  type = string
  default = "swedencentral"
}

variable "VNET_RG" {
}

variable "VNET_NAME" {
}

variable "SNET_INBOUND_NAME" {
}

variable "SNET_OUTBOUND_NAME" {
}

variable "SNET_OUTBOUND_WEBAPP_NAME" {
    
}

variable "RESOURCE_TAGS" {
  type = map(string)
}

variable "ADDITIONAL_APP_SETTINGS" {
  description = "Enviroment variables for the Function App"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "ACTION_GROUP_RECEIVER_NAME" {
}

variable "ACTION_GROUP_RECEIVER_EMAIL" {
}