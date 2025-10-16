resource "aws_eks_addon" "vpc_cni" {
  cluster_name = aws_eks_cluster.this.name
  addon_name   = "vpc-cni"
  # addon_version = "v1.20.1-eksbuild.3"
  resolve_conflicts_on_update = "PRESERVE"
}

resource "aws_eks_addon" "coredns" {
  cluster_name = aws_eks_cluster.this.name
  addon_name   = "coredns"
  depends_on = [ aws_eks_node_group.example ]
  # addon_version = "v1.10.1-eksbuild.38"
}

resource "aws_eks_addon" "kube_proxy" {
  cluster_name = aws_eks_cluster.this.name
  addon_name   = "kube-proxy"
  # addon_version = "v1.28.15-eksbuild.31"
}

resource "aws_eks_addon" "pod_identity_agent" {
  cluster_name      = aws_eks_cluster.this.name
  addon_name        = "eks-pod-identity-agent"
}