<div align="center">
  <h1 align="center">Game Site Project</h1>
</div>

## About The Project

![Product Name Screen Shot][product-screenshot]

This is a scalable web application written to run in AWS EKS.
Users can create accounts Then they can create game rooms to play and chat with each other.

Currently only the lobby and chat system is implemented, but a game system for multiple turn based game is planned to be done in the future.

### Technologies used:

* AWS
* Kubernetes
* Docker
* Terraform
* Express JS
* Websocket
* nginx
* Redis
* React
* PostgreSQL

## Dependencies

* AWS CLI
* Docker
* KubeCTL
* Terraform
* npm

## Usage

1. cd into the `Terraform` directory
2. Make a `secret.auto.tfvars` file from `secret.auto.tfvars.template`
    ```sh
    cp secret.auto.tfvars.template secret.auto.tfvars
    ```
3. Fill the file with the correct values
4. Initialize the terraform file
    ```sh
    terraform init
    ```
5. Run terraform apply and then type yes
    ```sh
    terraform apply
    ```
6. After terraform finished creating the resources, get the website endpoint:
    ```sh
    kubectl get ingress
    ```
    You can use the endpoint to access the website.

### Deleting the infrastructure

1. Delete every resource in kubernetes
    ```sh
    kubectl delete all --all
    ```
    get the ingress name and delete it as well
    ```sh
    kubectl get ingress
    kubectl delete ingress <ingress name>
    ```
2. Delete the ECR images created by terraform
3. Run terraform destroy and type yes to wipe the resources
    ```sh
    terraform destroy
    ```
Now The project is deleted from AWS.

[product-screenshot]: images/gamesite.JPG