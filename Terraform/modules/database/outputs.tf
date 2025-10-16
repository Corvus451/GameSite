output "database_endpoint" {
  value = aws_db_instance.this.endpoint
}

output "database_address" {
  value = aws_db_instance.this.address
}

output "db_name" {
  value = aws_db_instance.this.db_name
}