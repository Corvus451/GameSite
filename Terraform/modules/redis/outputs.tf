output "redis_address" {
  value = aws_elasticache_serverless_cache.this.endpoint[0].address
}