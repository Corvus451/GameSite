resource "aws_db_instance" "this" {
  identifier = var.identifier
  db_name = var.database_name
  allocated_storage = var.storage_size
  engine = "postgres"
  engine_version = "17.4"
  instance_class = "db.t4g.micro"
  username = var.db_username
  password = var.db_password
  skip_final_snapshot = true
  db_subnet_group_name = var.subnet_group_name
  vpc_security_group_ids = [var.security_group_id]
  multi_az = false //true if having errors
  publicly_accessible = false

}