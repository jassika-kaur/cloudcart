# 🚀 CloudCart – Infrastructure as Code (Terraform)

> **Cloud Provider:** Amazon Web Services (AWS)  
> **Region:** `ap-south-1` (Mumbai)  
> **Terraform Version:** `>= 1.5.0` (Validated on Terraform v1.15.8)  
> **Architecture:** Modular, Multi-AZ High Availability (`ap-south-1a`, `ap-south-1b`)  
> **Status:** `Success! The configuration is valid.`

---

## 1. Architectural Overview

This Terraform configuration completely provisions and manages the entire AWS cloud infrastructure for **CloudCart – Cloud-Native E-Commerce Platform**.

```text
                                  +------------------------------------------+
                                  |                 INTERNET                 |
                                  +------------------------------------------+
                                                       |
                                                       | HTTPS (443) / HTTP (80)
                                                       v
                                  +------------------------------------------+
                                  |      Internet Gateway (IGW-CloudCart)    |
                                  +------------------------------------------+
                                                       |
=======================================================|=======================================================
AWS VPC (10.0.0.0/16) - ap-south-1                     |
=======================================================|=======================================================
                                                       |
    +--------------------------------------------------+--------------------------------------------------+
    | Public Subnet A (10.0.1.0/24) [ap-south-1a]      | Public Subnet B (10.0.2.0/24) [ap-south-1b]      |
    |                                                  |                                                  |
    |   +----------------------------------------------------------------------------------------------+  |
    |   |               Application Load Balancer (ALB) - Dual-AZ (Security Group: ALB-SG)             |  |
    |   +----------------------------------------------------------------------------------------------+  |
    |                |                                                  |                                 |
    |                | (Forward Port 3000 / 5000)                       | (Forward Port 3000 / 5000)      |
    |   +--------------------------+                      +--------------------------+                    |
    |   | NAT Gateway A (EIP)      |                      | NAT Gateway B (Optional) |                    |
    |   +--------------------------+                      +--------------------------+                    |
    +----------------|--------------------------------------------------|---------------------------------+
                     |                                                  |
    -----------------|--------------------------------------------------|----------------------------------
    Private App Tier |                                                  |
    -----------------|--------------------------------------------------|----------------------------------
    +----------------v--------------------------------+ +---------------v--------------------------------+
    | Private Subnet A (10.0.10.0/24) [ap-south-1a]   | | Private Subnet B (10.0.20.0/24) [ap-south-1b]  |
    |                                                 | |                                                |
    |   +-----------------------------------------+   | |   +----------------------------------------+   |
    |   | EC2 Instance 1 (Auto Scaling Group)     |   | |   | EC2 Instance 2 (Auto Scaling Group)    |   |
    |   |  - Docker: Frontend (Port 3000)         |   | |   |  - Docker: Frontend (Port 3000)        |   |
    |   |  - Docker: Backend (Port 5000)          |   | |   |  - Docker: Backend (Port 5000)         |   |
    |   |  - CloudWatch Agent (RAM/Disk Telemetry)|   | |   |  - CloudWatch Agent (RAM/Disk Telemetry|   |
    |   +-----------------------------------------+   | |   +----------------------------------------+   |
    +-------------------------------------------------+ +------------------------------------------------+
                     |                                                  |
    +----------------v--------------------------------------------------v---------------------------------+
    | Serverless, Storage & Governance Modules:                                                           |
    |  - S3 Bucket (SSE-S3 AES-256, 100% Block Public Access, CORS for Pre-signed URLs)                    |
    |  - Serverless Lambda: Order Notification (SES HTML receipt dispatch)                               |
    |  - CloudWatch Alarms (CPU > 70%, Status Check Failed, RAM) + Unified Dashboard JSON                 |
    +-----------------------------------------------------------------------------------------------------+
```

---

## 2. Modular Structure

```text
cloudcart/terraform/
├── main.tf                    # Root orchestration of all modules
├── variables.tf               # Root input parameters & default values
├── outputs.tf                 # Root outputs (ALB DNS, VPC IDs, S3 ARNs)
├── versions.tf                # Terraform & AWS provider requirements
├── terraform.tfvars.example   # Sample production parameter configuration
│
└── modules/
    ├── vpc/                   # Multi-AZ VPC, IGW, NAT Gateways & Route Tables
    ├── security/              # ALB, EC2 App, and Database Security Groups
    ├── s3/                    # S3 bucket, Encryption, Public Access Block, CORS
    ├── iam/                   # EC2 Instance Profile, S3 & CloudWatch policies, Lambda role
    ├── alb/                   # Application Load Balancer, Target Groups, Path rules
    ├── asg/                   # AL2023 Launch Template (IMDSv2, gp3), ASG & Target Tracking
    ├── cloudwatch/            # CloudWatch Alarms, SNS alerts topic, Unified Dashboard
    └── lambda/                # Serverless order confirmation function & zip packager
```

---

## 3. Module Breakdown & Cloud Capabilities

| Module | Primary Resources | Key Capabilities |
| :--- | :--- | :--- |
| **`modules/vpc`** | `aws_vpc`, `aws_subnet`, `aws_internet_gateway`, `aws_nat_gateway`, `aws_route_table` | Strict segregation: Public Subnets (`10.0.1.0/24`, `10.0.2.0/24`) and Private Subnets (`10.0.10.0/24`, `10.0.20.0/24`) across `ap-south-1a` and `ap-south-1b`. Configurable single or multi NAT Gateway. |
| **`modules/security`** | `aws_security_group` (`alb`, `app`, `mongodb`) | Least privilege ingress: Port 80/443 open only on ALB; Ports 3000 & 5000 open only to ALB Security Group; Port 27017 open only to App Security Group. |
| **`modules/s3`** | `aws_s3_bucket`, `aws_s3_bucket_versioning`, `aws_s3_bucket_server_side_encryption_configuration`, `aws_s3_bucket_public_access_block`, `aws_s3_bucket_cors_configuration` | Secure object store for product photos with random suffix for global uniqueness, `AES256` encryption, zero public access, and CORS enabled for AWS SDK pre-signed URLs. |
| **`modules/iam`** | `aws_iam_role`, `aws_iam_instance_profile`, `aws_iam_policy` | Keyless authentication using IMDSv2 token architecture. EC2 profile grants least privilege S3 access, CloudWatch metric streaming, and AWS SSM Managed Session Manager access. |
| **`modules/alb`** | `aws_lb`, `aws_lb_target_group` (`frontend`, `backend`), `aws_lb_listener`, `aws_lb_listener_rule` | Layer 7 intelligent ingress: Frontend target group (`:3000`, `/`, HTTP 200) and Backend target group (`:5000`, `/api/health`, HTTP 200). Path-based routing rules: `/api/*`, `/uploads/*`, and `/health` route to backend; root `/` routes to React frontend. Fully configured for SSL/TLS (port 443) with HTTP-to-HTTPS (301) redirect. |
| **`modules/asg`** | `aws_launch_template`, `aws_autoscaling_group`, `aws_autoscaling_policy` | Multi-AZ auto-scaling cluster (Min: 1, Desired: 2, Max: 3) across `ap-south-1a` and `ap-south-1b` running Amazon Linux 2023 with gp3 encrypted EBS. `user_data` automatically bootstraps Docker (`--allowerasing`), creates `cloudcart-net`, runs MongoDB, pulls official Docker Hub images (`jassikakaur/cloudcart-frontend:v1.0.0` & `backend`), runs containers on ports 3000 & 5000, and seeds catalog data. Target tracking maintains CPU utilization at 70%. |
| **`modules/cloudwatch`**| `aws_sns_topic`, `aws_sns_topic_subscription`, `aws_cloudwatch_metric_alarm`, `aws_cloudwatch_dashboard` | High CPU (> 70%) alarm, Status Check Failed alarm, and full operational CloudWatch Dashboard JSON. |
| **`modules/lambda`** | `aws_lambda_function`, `data.archive_file` | Serverless order confirmation receipt generator (Node.js 20.x) packaged from `cloudcart/aws/lambda/order-notification/` and integrated with Amazon SES. |

---

## 4. Quickstart Deployment Guide

### Prerequisites
1. Installed **Terraform v1.5+** (`terraform version`).
2. Configured **AWS CLI** with valid credentials for `ap-south-1`:
   ```bash
   aws configure
   ```

### Step 1: Initialize Terraform
Initialize the working directory, download the AWS, Random, and Archive provider plugins, and load child modules:
```bash
cd cloudcart/terraform
terraform init
```

### Step 2: Validate Configuration
Check that all HCL syntax, resource attributes, and module interfaces are valid:
```bash
terraform validate
```
*Expected Output:* `Success! The configuration is valid.`

### Step 3: Review Execution Plan
Generate an execution plan to preview all resources that Terraform will create in your AWS account:
```bash
terraform plan
```

### Step 4: Provision the Cloud Infrastructure
Apply the execution plan to provision the complete CloudCart stack:
```bash
terraform apply
```
*Type `yes` when prompted.*

Once completed, Terraform outputs the public ALB DNS name:
```text
Outputs:
alb_dns_name = "cloudcart-production-alb-1269005310.ap-south-1.elb.amazonaws.com"
s3_bucket_name = "cloudcart-product-images-production-cf4d3801"
asg_name = "cloudcart-production-asg-20261118060854821500000009"
```

---

## 5. Load Balancer, Target Groups & Auto Scaling Configuration

### Application Load Balancer (ALB)
- **ALB DNS:** `cloudcart-production-alb-1269005310.ap-south-1.elb.amazonaws.com`
- **Frontend Target Group (`tg-frontend`):** Port 3000, Protocol HTTP, Path `/`, Matcher 200.
- **Backend Target Group (`tg-backend`):** Port 5000, Protocol HTTP, Path `/api/health`, Matcher 200.
- **Path Routing Rules:**
  - `/api/*`, `/uploads/*`, `/health` $\rightarrow$ Forwarded to `tg-backend` (Port 5000).
  - Default (`/`) $\rightarrow$ Forwarded to `tg-frontend` (Port 3000).
- **Security:** EC2 instances are in private subnets with strict security groups allowing traffic on ports 3000 and 5000 **only** from the ALB security group.

### Auto Scaling Group (ASG)
- **Capacity Configuration:**
  - Minimum: `1`
  - Desired: `2`
  - Maximum: `3`
- **Multi-AZ Resilience:** Spanning Private Subnets in `ap-south-1a` and `ap-south-1b`.
- **Scaling Policy:** Dynamic Target Tracking scaling at `70%` average CPU utilization.
- **Cloud-Init Bootstrapping (`user_data`):**
  - Installs Docker using `dnf install -y docker jq --allowerasing` (avoiding AL2023 curl conflicts).
  - Starts containerized MongoDB 7.0 on `cloudcart-net`.
  - Pulls and runs `jassikakaur/cloudcart-backend:v1.0.0` (port 5000) and `jassikakaur/cloudcart-frontend:v1.0.0` (port 3000 $\rightarrow$ 80).
  - Automatically seeds database with 32 sample products and 6 categories on first boot.

### HTTPS & Certificate Manager (ACM) Setup
- **Domain Prerequisite:** AWS Certificate Manager (ACM) issues public certificates only for custom domain names with DNS or email validation. Default AWS domains (`*.elb.amazonaws.com`) cannot receive public ACM certificates.
- **Configuration:** When a custom domain is available, update `terraform.tfvars`:
  ```terraform
  enable_https        = true
  acm_certificate_arn = "arn:aws:acm:ap-south-1:103316336488:certificate/<id>"
  ```
  Terraform will configure the port 443 HTTPS listener with `ELBSecurityPolicy-TLS13-1-2-2021-06` and 301 HTTP-to-HTTPS redirect.

### Live Testing & Verification Results
- **Frontend Storefront:** `curl -i http://cloudcart-production-alb-1269005310.ap-south-1.elb.amazonaws.com/` $\rightarrow$ `HTTP 200 OK`
- **Backend API Health:** `curl -i http://cloudcart-production-alb-1269005310.ap-south-1.elb.amazonaws.com/api/health` $\rightarrow$ `HTTP 200 OK`
- **Product Catalog:** `curl -i http://cloudcart-production-alb-1269005310.ap-south-1.elb.amazonaws.com/api/products` $\rightarrow$ `HTTP 200 OK` (32 products)
- **Target Groups Status:** Both Frontend (3000) and Backend (5000) target groups report `healthy`.

---

## 6. Teardown & Cost Cleanup

To destroy all provisioned AWS resources and avoid ongoing billing:
```bash
terraform destroy
```
*Type `yes` when prompted to confirm resource deletion.*
