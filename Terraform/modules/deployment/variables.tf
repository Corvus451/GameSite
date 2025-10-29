variable "port" {
  type = number
}

variable "svc_name" {
  type = string
}

variable "deployment_name" {
  type = string
}

variable "replica_count" {
  type = number
}

variable "image" {
type = string
}

variable "env_vars" {
  type = list(object({
    name = string
    value = string
  }))
}