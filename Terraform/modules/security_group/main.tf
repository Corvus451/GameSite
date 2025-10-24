resource "aws_security_group" "this" {
  vpc_id = var.vpc_id
  name = var.name

  ingress {
    from_port = var.port
    to_port = var.port
    protocol = "tcp"
    cidr_blocks = [ var.cidr_block ]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}