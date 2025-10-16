variable "project_name" {
  type = string
  default = "tqs"
}

variable "region" {
  type = string
  default = "eu-central-1"
}

variable "subnet_ids" {
  type = list(string)
}

variable "vpc_id" {
  type = string
}

variable "subnet_private_ids" {
type = list(string)
}

variable "configure_kubectl" {
  type = bool
  default = true
}