<a id="readme-top"></a>
<div align="center">
  <h1 align="center">Game Site Project</h1>
</div>

## About The Project

![Product Name Screen Shot][product-screenshot]

This is a scalable web application written to run in AWS EKS.
Users can create accounts Then they can create game rooms to play and chat with each other.

The applications is separated into `microservices` and runs in a `Kubernetes cluster`. Resources are created with `Terraform`. Automations are written with `Github actions` for the microservices, so on updating a microservice, it will be automatically deployed.

### Technologies used:

 * [![aws][aws]][aws-url]


 * [![kubernetes][kubernetes]][kubernetes-url]

 * [![docker][docker]][docker-url]

 * [![terraform][terraform]][terraform-url]

 * [![express][express]][express-url]

 * [![nginx][nginx]][nginx-url]

 * [![redis][redis]][redis-url]

 * [![psql][psql]][psql-url]

 * [![react][react]][react-url]

 * [![github][github]][github-url]


## Dependencies

* AWS cli
* Docker
* Kubectl
* Terraform
* npm

## Prerequisites

- AWS IAM user with sufficient permissions to:
- - VPC
- - EC2
- - EKS
- - ECR
- - RDS
- - ElastiCache
- An S3 Bucket for the Terraform state file.

## How to deploy

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
2. Delete the ECR images created by terraform, from the AWS console, or with aws cli:
    ```sh
    aws ecr delete-repository --repository-name <repository name> --force
    ```
3. Run terraform destroy and type yes to wipe the resources
    ```sh
    terraform destroy
    ```
Now The project is deleted from AWS.
<p align="right"><a href="#readme-top">back to top</a></p>

[product-screenshot]: images/gamesite.JPG

[aws-url]: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
[aws]: https://img.shields.io/badge/aws-black?style=for-the-badge&logo=amazonwebservice
[kubernetes]: https://img.shields.io/badge/kubernetes-black?style=for-the-badge&logo=kubernetes
[kubernetes-url]: https://kubernetes.io/docs/tutorials/kubernetes-basics/
[docker]: https://img.shields.io/badge/docker-black?style=for-the-badge&logo=docker
[docker-url]: https://www.docker.com/get-started/
[terraform]: https://img.shields.io/badge/terraform-black?style=for-the-badge&logo=terraform
[terraform-url]: https://developer.hashicorp.com/terraform
[express]: https://img.shields.io/badge/express.js-black?style=for-the-badge&logo=express
[express-url]: https://expressjs.com/
[nginx]: https://img.shields.io/badge/nginx-black?style=for-the-badge&logo=nginx
[nginx-url]: https://nginx.org/en/
[redis]: https://img.shields.io/badge/redis-black?style=for-the-badge&logo=redis
[redis-url]: https://redis.io/
[psql]: https://img.shields.io/badge/PostgreSQL-black?style=for-the-badge&logo=postgresql
[psql-url]: https://www.postgresql.org/
[react]: https://img.shields.io/badge/React-black?style=for-the-badge&logo=react
[react-url]: https://react.dev/
[github]: https://img.shields.io/badge/github%20actions-black?style=for-the-badge&logo=github
[github-url]: https://github.com/features/actions