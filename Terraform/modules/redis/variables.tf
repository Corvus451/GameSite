variable "redis_name" {
  type = string
}

variable "redis_subnet_ids" {
  type = list(string)
}

variable "redis_security_group_ids" {
  type = list(string)
}