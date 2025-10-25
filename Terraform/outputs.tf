output "bastion_ip" {
  value = module.bastion.bastion_ip
}

output "redis_address" {
  value = module.redis.redis_address
}

output "auth_db_endpoint" {
  value = module.database-auth.database_endpoint
}