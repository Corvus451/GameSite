output "bastion_ip" {
  value = module.bastion.bastion_ip
}

output "redis_endpoint" {
  value = module.redis.redis_endpoint
}

output "auth_db_endpoint" {
  value = module.database-auth.database_endpoint
}