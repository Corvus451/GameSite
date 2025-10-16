data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "bastion" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  subnet_id              = var.subnet_public_id
  vpc_security_group_ids = [aws_security_group.bastion.id]
  key_name               = var.bastion_key_name
  associate_public_ip_address = true

  user_data = var.user_data

  tags = {
    Name = "${var.project_name}-bastion"
  }
}

resource "aws_security_group" "bastion" {
  vpc_id = var.vpc_id
  name = "bastion"

  ingress {
    from_port = 0
    to_port = 22
    protocol = "tcp"
    cidr_blocks = [ "0.0.0.0/0" ]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [ "0.0.0.0/0" ]
  }

  tags = {
    Name = "${var.project_name}-bastion"
  }
}