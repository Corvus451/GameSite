variable "aws_account_id" {
  type = string
}

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

variable "session_token_secret" {
  type = string
  sensitive = true
}

variable "session_token_expire" {
  type = string
  sensitive = true
}

variable "refresh_token_secret" {
  type = string
  sensitive = true
}

variable "refresh_token_expire" {
  type = string
  sensitive = true
}

variable "github_runner_arn" {
  type = string
  sensitive = true
}

# variable "api_endpoint_prefix" {
#   type = string
# }

# variable "auth_enpoint_prefix" {
#   type = string
# }