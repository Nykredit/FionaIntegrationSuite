APPLICATION = "fiona-integration-suite"
VALUESTREAM = "wtmop"
ENVIRONMENT = "dev"

VNET_RG = "nyk-dev-gwc-shared-rg"
VNET_NAME = "nyk-dev-gwc-lzmop-vnet-02"

SNET_INBOUND_NAME  = "nyk-gwc-01-snet"
SNET_OUTBOUND_NAME = "nyk-gwc-02-snet"

RESOURCE_TAGS =  {
    creators    = "vnrs@nykredit.dk"
    createdBy   = "Terraform"
    "Appl number"     = "..."
    "Application"     = "Middle Office Products"
    "ES-BAID"         = "..."
    "ES-CMDB"         = "JN"
    "ES-Customer"     = "NK"
    "ES-Environment"  = "Dev"
    "ES-OperatedBy"   = "NK"
    "ES-Owner"        = "MIGU@nykredit.dk"
    "ES-ServiceClass" = "NotAvailable"
    "Environment"     = "Dev"
    "Main Contact"    = "vnrs@nykredit.dk"
    "Organization"    = "Nykredit Realkredit A/S"
    "Owner"           = "MIGU@nykredit.dk"
    "Team Ownership"  = "Middle Office Products"
}

ADDITIONAL_APP_SETTINGS = [
    {
      name  = "ENV",
      value = "dev"
    }
]

ACTION_GROUP_RECEIVER_NAME = "Middle Office Products"

ACTION_GROUP_RECEIVER_EMAIL = "vnrs@nykredit.dk"
