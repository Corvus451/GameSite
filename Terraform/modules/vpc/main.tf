resource "aws_vpc" "this" {
    cidr_block = var.cidr_block
    enable_dns_support   = true
    enable_dns_hostnames = true

    tags = {
        Name = "${var.project_name}-vpc"
    }
}

resource "aws_subnet" "public" {
  vpc_id = aws_vpc.this.id
  cidr_block = "10.0.0.0/24"
  availability_zone = "${var.region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-subnet"
    "kubernetes.io/role/elb" = "1"
  }
}

# resource "aws_subnet" "public-a" {
#   vpc_id = aws_vpc.this.id
#   cidr_block = "10.0.1.0/24"
#   availability_zone = "${var.region}b"
#   map_public_ip_on_launch = true

#   tags = {
#     Name = "${var.project_name}-subnet"
#     "kubernetes.io/role/elb" = "1"
#   }
# }

resource "aws_subnet" "private" {
  vpc_id = aws_vpc.this.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "${var.region}b"

  tags = {
    Name = "${var.project_name}-subnet"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

resource "aws_subnet" "private-a" {
  vpc_id = aws_vpc.this.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "${var.region}a"

  tags = {
    Name = "${var.project_name}-subnet"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

resource "aws_subnet" "private-db" {
  vpc_id = aws_vpc.this.id
  cidr_block = "10.0.3.0/24"
  availability_zone = "${var.region}b"

  tags = {
    Name = "${var.project_name}-db-subnetb"
  }
}

resource "aws_subnet" "private-db-a" {
  vpc_id = aws_vpc.this.id
  cidr_block = "10.0.4.0/24"
  availability_zone = "${var.region}a"

  tags = {
    Name = "${var.project_name}-db-subneta"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

resource "aws_eip" "nat" {
  domain = "vpc"
  depends_on = [ aws_internet_gateway.this ]
}

resource "aws_nat_gateway" "this" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public.id
  depends_on    = [aws_internet_gateway.this]

  tags = {
    Name = "${var.project_name}-private-nat"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this.id
  }

  tags = {
    Name = "${var.project_name}-private-rt"
  }
}

resource "aws_route_table" "this" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "${var.project_name}-routetb"
  }
}

resource "aws_route_table_association" "private" {
  subnet_id = aws_subnet.private.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private-a" {
  subnet_id = aws_subnet.private-a.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private-db" {
  subnet_id = aws_subnet.private-db.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private-db-a" {
  subnet_id = aws_subnet.private-db-a.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "public" {
  subnet_id = aws_subnet.public.id
  route_table_id = aws_route_table.this.id
}

# resource "aws_route_table_association" "public-a" {
#   subnet_id = aws_subnet.public-a.id
#   route_table_id = aws_route_table.this.id
# }

resource "aws_db_subnet_group" "db" {
  name = "subnet_group_for_db"
  subnet_ids = [ aws_subnet.private-db.id, aws_subnet.private-db-a.id ]
}

resource "aws_security_group" "db" {
  vpc_id = aws_vpc.this.id
  name = "${var.project_name}-db-sec-group"

  ingress {
    from_port = 5432
    to_port = 5432
    protocol = "tcp"
    cidr_blocks = [aws_vpc.this.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "redis" {
  vpc_id = aws_vpc.this.id
  name = "${var.project_name}-redis-sec-group"

  ingress {
    from_port = 6379
    to_port = 6379
    protocol = "tcp"
    cidr_blocks = [aws_vpc.this.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}