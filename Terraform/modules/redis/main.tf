resource "aws_elasticache_serverless_cache" "this" {
  engine = "redis"
  name   = var.redis_name
  description              = "redis cache"
  major_engine_version     = "7"
  security_group_ids       = var.redis_security_group_ids
  subnet_ids               = var.redis_subnet_ids
  user_group_id = null
}