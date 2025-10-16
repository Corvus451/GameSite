variable "region" {
  type = string
  default = "eu-central-1"
}

variable "project_name" {
  type = string
  default = "gamesite"
}

variable "bastion_key_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type = string
}

variable "bastion_key_path" {
  type = string
}