module "vpc" {
  source = "./modules/vpc"
  project_name = var.project_name
  region = var.region
  cidr_block = "10.0.0.0/16"
}

module "eks" {
  source = "./modules/eks"
  vpc_id = module.vpc.vpc_id
  project_name = var.project_name
  region = var.region
  subnet_ids = module.vpc.subnet_ids
  subnet_private_ids = module.vpc.subnet_private_ids
  configure_kubectl = true
}

module "bastion" {
  source = "./modules/bastion"
  vpc_id = module.vpc.vpc_id
  subnet_public_id = module.vpc.subnet_public_id
  bastion_key_name = var.bastion_key_name
  project_name = var.project_name

  user_data = <<-EOF
              #!/bin/bash
              sudo apt update
              sudo apt install -y postgresql-client redis-tools
              EOF
}

module "database-auth" {
  source = "./modules/database"
  identifier = "${var.project_name}-database-auth"
  storage_size = 5
  db_username = var.db_username
  db_password = var.db_password
  database_name = "auth"
  subnet_group_name = module.vpc.subnet_group_db_name
  security_group_id = module.vpc.security_group_db_id
}

resource "terraform_data" "sql_init" {
  depends_on = [ module.bastion, module.database-auth]
  
  connection {
    type = "ssh"
    host = module.bastion.bastion_ip
    user = "ubuntu"
    private_key = file(var.bastion_key_path)
  }

  provisioner "file" {
    source = "../Database/auth_init.sql"
    destination = "/home/ubuntu/init.sql"
  }

  provisioner "remote-exec" {
    inline = [
       "PGPASSWORD=${var.db_password} psql -h ${module.database-auth.database_address} -U ${var.db_username} -d auth -f /home/ubuntu/init.sql",
    ]
  }
}

module "sg_redis" {
  source = "./modules/security_group"
  vpc_id = module.vpc.vpc_id
  name = "redis-sg"
  port = 6379
  cidr_block = module.vpc.cidr_block
}

module "redis" {
  source = "./modules/redis"
  redis_name = "${var.project_name}rediscache"
  redis_subnet_ids = [ module.vpc.subnet_private_id, module.vpc.subnet_private_a_id ]
  redis_security_group_ids = [ module.sg_redis.security_group_id ]
}

