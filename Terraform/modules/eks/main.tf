resource "aws_eks_cluster" "this" {
  name = "${var.project_name}-cluster"
  

  # access_config {
  #   authentication_mode = "API"
  #   # bootstrap_cluster_creator_admin_permissions = true
  # }

  role_arn = aws_iam_role.cluster.arn
  version  = "1.33"

#   bootstrap_self_managed_addons = false

  vpc_config {
    # endpoint_private_access = true
    # endpoint_public_access  = true

    subnet_ids = var.subnet_ids

  }


  depends_on = [
    aws_iam_role_policy_attachment.cluster_AmazonEKSClusterPolicy,
    aws_iam_role_policy_attachment.eks_service_policy
  ]
}

resource "aws_iam_role" "cluster" {
  name = "${var.project_name}-eks-cluster-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      },
    ]
  })
}

resource "terraform_data" "configure_kubectl" {
  count = var.configure_kubectl ? 1 : 0
  depends_on = [aws_eks_cluster.this]

  provisioner "local-exec" {
    command = <<EOT
      aws eks update-kubeconfig --region ${var.region} --name ${aws_eks_cluster.this.name}
    EOT
  }
}