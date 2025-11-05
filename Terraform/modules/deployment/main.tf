resource "kubernetes_deployment_v1" "this" {
  metadata {
    name = var.deployment_name
    labels = {
      app = var.deployment_name
    }
  }

  spec {
    replicas = var.replica_count

    selector {
      match_labels = {
        app = var.deployment_name
      }
    }

    template {
      metadata {
        labels = {
          app = var.deployment_name
        }
      }

      spec {
        container {
          image = var.image
          name  = var.deployment_name

          resources {
            limits = {
              cpu    = "1000m"
              memory = "512Mi"
            }
            requests = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }

          dynamic "env" {
            for_each = var.env_vars
            content {
              name = env.value.name
              value = env.value.value
            }
          }

        #   env {
        #     name = "PGUSER"
        #     value = var.env_db_username
        #   }

          port {
            container_port = var.port
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = var.probe_port
            }

            initial_delay_seconds = 10
            period_seconds        = 10
            timeout_seconds       = 5 
            failure_threshold     = 3 
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "this" {
  metadata {
    name = var.svc_name
  }
  spec {
    selector = {
      app = kubernetes_deployment_v1.this.metadata[0].labels.app
    }

    port {
      port        = var.port
      target_port = var.port
    #   node_port   = 30080
    }

    type = "NodePort"
  }
}