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

resource "aws_ecr_repository" "ecr_auth" {
  name = "authserver"
}

resource "aws_ecr_repository" "ecr_api" {
  name = "apiserver"
}

resource "aws_ecr_repository" "ecr_game" {
  name = "gameserver"
}

resource "terraform_data" "push-images" {
  depends_on = [ aws_ecr_repository.ecr_api, aws_ecr_repository.ecr_auth, aws_ecr_repository.ecr_game]
   provisioner "local-exec" {
    command = <<EOT
    aws ecr get-login-password --region ${var.region} | docker login --username AWS --password-stdin ${var.aws_account_id}.dkr.ecr.${var.region}.amazonaws.com
    docker build -t apiserver:latest ../APIServer
    docker tag apiserver:latest ${var.aws_account_id}.dkr.ecr.${var.region}.amazonaws.com/apiserver:latest
    docker push ${var.aws_account_id}.dkr.ecr.${var.region}.amazonaws.com/apiserver:latest
    docker build -t authserver:latest ../AuthServer
    docker tag authserver:latest ${var.aws_account_id}.dkr.ecr.${var.region}.amazonaws.com/authserver:latest
    docker push ${var.aws_account_id}.dkr.ecr.${var.region}.amazonaws.com/authserver:latest
    docker build -t gameserver:latest ../GameServer
    docker tag gameserver:latest ${var.aws_account_id}.dkr.ecr.${var.region}.amazonaws.com/gameserver:latest
    docker push ${var.aws_account_id}.dkr.ecr.${var.region}.amazonaws.com/gameserver:latest
    EOT
  }
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

resource "terraform_data" "sql-init" {
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

module "sg-redis" {
  source = "./modules/security_group"
  vpc_id = module.vpc.vpc_id
  name = "redis-sg"
  port = 6379
  cidr_block = module.vpc.cidr_block
}

module "redis" {
  source = "./modules/redis"
  depends_on = [ module.sg-redis ]
  redis_name = "${var.project_name}rediscache"
  redis_subnet_ids = [ module.vpc.subnet_private_id, module.vpc.subnet_private_a_id ]
  redis_security_group_ids = [ module.sg-redis.security_group_id ]
}

module "auth-deployment" {
  depends_on = [ module.database-auth, module.eks ]
  source = "./modules/deployment"
  port = 3001
  svc_name = "authsvc"
  deployment_name = "authserver"
  replica_count = 3
  image = aws_ecr_repository.ecr_auth.repository_url
  env_vars = [
  {
    name = "SERVER_PORT"
    value = "3001"
  },
  {
    name = "PGUSER"
    value = "postgres"
  },
  {
    name = "PGPASSWORD"
    value = var.db_password
  },
  {
    name = "PGHOST"
    value = module.database-auth.database_address
  },
  {
    name = "PGPORT"
    value = "5432"
  },
  {
    name = "PG_DATABASE"
    value = "auth"
  },
  {
    name = "ENDPOINT_PREFIX"
    value = "/api/auth_v1"
  },
  {
    name = "JWT_SESSION_SECRET"
    value = var.session_token_secret
  },
  {
    name = "JWT_REFRESH_SECRET"
    value = var.refresh_token_secret
  },
  {
    name = "JWT_SESSION_EXPIRES_IN"
    value = var.session_token_expire
  },
  {
    name = "JWT_REFRESH_EXPIRES_IN"
    value = var.refresh_token_expire
  },
  ]
}

module "api-deployment" {
  source = "./modules/deployment"
  depends_on = [ module.eks, module.redis, module.auth-deployment ]
  port = 3000
  svc_name = "apisvc"
  deployment_name = "apiserver"
  replica_count = 3
  image = aws_ecr_repository.ecr_api.repository_url
  env_vars = [ 
    {
      name = "SERVER_PORT"
      value = "3000"
    },
    {
      name = "ENDPOINT_PREFIX"
      value = "/api"
    },
    {
      name = "AUTH_ENDPOINT"
      value = "/api/auth_v1"
    },
    {
      name = "AUTH_HOST"
      value = "http://authsvc:3001"
    },
    {
      name = "REDIS_PORT"
      value = "6379"
    },
    {
      name = "REDIS_HOST"
      value = module.redis.redis_endpoint.address
    },
   ]
}

module "game-deployment" {
  source = "./modules/deployment"
  depends_on = [ module.eks, module.redis, module.auth-deployment ]
  port = 3333
  svc_name = "gamesvc"
  deployment_name = "gameserver"
  replica_count = 3
  image = aws_ecr_repository.ecr_game.repository_url
  env_vars = [ 
    {
      name = "SERVER_PORT"
      value = "3333"
    },
    {
      name = "AUTH_ENDPOINT"
      value = "/api/auth_v1"
    },
    {
      name = "AUTH_HOST"
      value = "http://authsvc:3001"
    },
    {
      name = "REDIS_PORT"
      value = "6379"
    },
    {
      name = "REDIS_HOST"
      value = module.redis.redis_endpoint.address
    },
   ]
}

resource "kubernetes_ingress_v1" "ingress" {
  metadata {
    name      = "${var.project_name}-ingress"
    namespace = "default"
    annotations = {
      "kubernetes.io/ingress.class"               = "alb"
      "alb.ingress.kubernetes.io/scheme"          = "internet-facing"
      "alb.ingress.kubernetes.io/target-type"     = "instance"
    #   "alb.ingress.kubernetes.io/target-group-attributes" = "stickiness.enabled=true,stickiness.lb_cookie.duration_seconds=86400"
    }
  }
  spec {
    rule {
      http {
        path {
          path      = "/api"
          path_type = "Prefix"
          backend {
            service {
              name = module.api-deployment.svc_name
              port {
                number = 3000
              }
            }
          }
        }
        path {
          path = "/api/auth_v1"
          path_type = "Prefix"
          backend {
            service {
              name = module.auth-deployment.svc_name
            port {
              number = 3001
            }
            }
          }
        }
        path {
          path      = "/game"
          path_type = "Prefix"
          backend {
            service {
              name = module.game-deployment.svc_name
              port {
                number = 3333
              }
            }
          }
        }
      }
    }
  }
  depends_on = [module.eks, module.api-deployment, module.auth-deployment, module.game-deployment]
}

