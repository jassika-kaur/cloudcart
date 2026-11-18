# CloudCart – Complete AWS Deployment Walkthrough Guide

> **Region:** `ap-south-1` (Asia Pacific - Mumbai)  
> **Target Architecture:** Multi-AZ Production Deployment on Amazon Web Services (AWS)  
> **Images on Docker Hub:**  
> - Frontend: `jassikakaur/cloudcart-frontend:v1.0.0` (Host Port: 3000, Container Port: 80)  
> - Backend: `jassikakaur/cloudcart-backend:v1.0.0` (Host Port: 5000, Container Port: 5000)  
> **Database:** MongoDB Atlas (Cloud) or Containerized MongoDB on EC2

---

## 1. Prerequisites & Preparation

Before creating resources in AWS, ensure you have:
1. An active AWS Account with permissions to create VPC, EC2, S3, IAM, ALB, CloudWatch, and Lambda resources.
2. Verified Docker Hub images:
   - Run `docker pull jassikakaur/cloudcart-frontend:v1.0.0`
   - Run `docker pull jassikakaur/cloudcart-backend:v1.0.0`
3. A MongoDB database connection URI (either MongoDB Atlas Free Tier connection string or a MongoDB instance running on EC2).
4. AWS Region set to **Asia Pacific (Mumbai) `ap-south-1`** in the top navigation bar of the AWS Management Console.

---

## 2. Step 1: Create VPC & Network Infrastructure

Follow the detailed CIDR allocation in `cloudcart/aws/networking/architecture.md`:

1. Navigate to **VPC Console** > click **Create VPC**.
2. Select **VPC and more**:
   - **Name tag:** `VPC-CloudCart`
   - **IPv4 CIDR block:** `10.0.0.0/16`
   - **Number of Availability Zones:** `2` (Select `ap-south-1a` and `ap-south-1b`)
   - **Number of public subnets:** `2`
     - Public Subnet A: `10.0.1.0/24` (in `ap-south-1a`)
     - Public Subnet B: `10.0.2.0/24` (in `ap-south-1b`)
   - **Number of private subnets:** `2`
     - Private Subnet A: `10.0.10.0/24` (in `ap-south-1a`)
     - Private Subnet B: `10.0.20.0/24` (in `ap-south-1b`)
   - **NAT Gateways:** Select `1 per AZ` (for production high availability) or `1 in 1 AZ` (for budget optimization during college evaluation).
   - **VPC Endpoints:** None (or S3 Gateway Endpoint).
   - Click **Create VPC**.
3. Verify that the Internet Gateway (`IGW-CloudCart`) is attached and the Public Route Table has a route: `0.0.0.0/0 -> igw-...`.

---

## 3. Step 2: Configure Security Groups

Create three distinct Security Groups under **VPC** > **Security Groups**:

### Security Group 1: `ALB-SG` (Public Load Balancer)
- **Description:** Allow inbound public HTTP/HTTPS traffic
- **VPC:** `VPC-CloudCart`
- **Inbound Rules:**
  - HTTP | Port: 80 | Source: `0.0.0.0/0` | Description: "Public HTTP redirect"
  - HTTPS | Port: 443 | Source: `0.0.0.0/0` | Description: "Public secure traffic"
- **Outbound Rules:**
  - Allow all traffic or restrict to `EC2-App-SG` on ports 3000 and 5000.

### Security Group 2: `EC2-App-SG` (Private Application Instances)
- **Description:** Allow traffic exclusively from ALB and Bastion/SSM
- **VPC:** `VPC-CloudCart`
- **Inbound Rules:**
  - Custom TCP | Port: 3000 | Source: Select Security Group `ALB-SG` | Description: "Frontend from ALB"
  - Custom TCP | Port: 5000 | Source: Select Security Group `ALB-SG` | Description: "Backend API from ALB"
  - SSH (Optional) | Port: 22 | Source: `My IP` (Only your specific IP) | Description: "Admin SSH access"
- **Outbound Rules:**
  - All traffic (`0.0.0.0/0`) via NAT Gateway (for Docker Hub image pulls and outbound S3 API calls).

### Security Group 3: `MongoDB-SG` (Database Tier)
- **Description:** Strict private database access
- **VPC:** `VPC-CloudCart`
- **Inbound Rules:**
  - Custom TCP | Port: 27017 | Source: Select Security Group `EC2-App-SG` | Description: "MongoDB from App Tier only"
- **Outbound Rules:** None (or standard responses).

---

## 4. Step 3: Create S3 Media Bucket

Follow the complete bucket specifications in `cloudcart/aws/s3/s3-config.md`:

1. Navigate to **S3** > click **Create bucket**.
2. **Bucket name:** `cloudcart-product-images-ap-south-1-major-project` (or unique name).
3. **Region:** `Asia Pacific (Mumbai) ap-south-1`.
4. **Block Public Access settings:** **Keep all 4 checkmarks ENABLED** (Block *all* public access).
5. **Bucket Versioning:** Enable.
6. **Default encryption:** Server-side encryption with Amazon S3 managed keys (`SSE-S3`), Bucket Key: Enable.
7. Click **Create bucket**.
8. Select the created bucket > **Permissions** tab > scroll down to **Cross-origin resource sharing (CORS)**:
   - Click **Edit** and paste the JSON CORS policy from `cloudcart/aws/s3/s3-config.md`. Click **Save changes**.

---

## 5. Step 4: Configure IAM Roles & Policies

Follow the specifications in `cloudcart/aws/iam/iam-setup.md`:

1. Navigate to **IAM** > **Policies** > click **Create policy**.
   - Paste `cloudcart/aws/iam/policies/s3-access-policy.json` (update bucket name if changed). Name it `CloudCart-S3-Access-Policy`.
2. Click **Create policy** again:
   - Paste `cloudcart/aws/iam/policies/cloudwatch-agent-policy.json`. Name it `CloudCart-CloudWatch-Agent-Policy`.
3. Navigate to **IAM** > **Roles** > click **Create role**.
   - Trusted entity: **AWS service** > **EC2**.
   - Attach policies:
     - `CloudCart-S3-Access-Policy`
     - `CloudCart-CloudWatch-Agent-Policy`
     - `AmazonSSMManagedInstanceCore` (AWS Managed)
   - Role name: `CloudCart-EC2-AppRole`.
   - Click **Create role**. AWS automatically generates the Instance Profile with the same name.

---

## 6. Step 5: Configure Application Load Balancer & Target Groups

Follow specifications in `cloudcart/aws/alb/configuration.md`:

1. Navigate to **EC2** > **Target Groups** > click **Create target group**.
   - Target type: **Instances**.
   - Target group name: `TG-CloudCart-Frontend`.
   - Protocol: `HTTP`, Port: `3000`, VPC: `VPC-CloudCart`.
   - Health check path: `/`. Healthy threshold: 2, Timeout: 5s, Interval: 15s. Click **Create target group**.
2. Create second Target Group:
   - Target group name: `TG-CloudCart-Backend`.
   - Protocol: `HTTP`, Port: `5000`, VPC: `VPC-CloudCart`.
   - Health check path: `/health`. Healthy threshold: 2, Timeout: 5s, Interval: 15s. Click **Create target group**.
3. Navigate to **EC2** > **Load Balancers** > click **Create load balancer** > select **Application Load Balancer**.
   - Name: `ALB-CloudCart`. Scheme: **Internet-facing**, IP: **IPv4**.
   - VPC: `VPC-CloudCart`. Subnets: Select `Public Subnet A` and `Public Subnet B`.
   - Security groups: Select `ALB-SG`.
   - Listeners:
     - Add HTTP (80): Action -> Redirect to HTTPS (443).
     - Add HTTPS (443): Default Action -> Forward to `TG-CloudCart-Frontend`. Select ACM Certificate.
   - Click **Create load balancer**.
4. In the HTTPS (443) listener rules, add a path-based forwarding rule:
   - IF Path is `/api/*` OR `/uploads/*` ➔ THEN Forward to `TG-CloudCart-Backend`.

---

## 7. Step 6: Create Launch Template & Auto Scaling Group

Follow specifications in `cloudcart/aws/autoscaling/configuration.md`:

1. Navigate to **EC2** > **Launch Templates** > click **Create launch template**.
   - Template name: `LT-CloudCart-v1`.
   - AMI: **Amazon Linux 2023 AMI** (x86_64).
   - Instance type: `t3.small` (or `t3.medium`).
   - Key pair: *Proceed without a key pair*.
   - Security groups: Select `EC2-App-SG`.
   - Advanced details:
     - IAM instance profile: Select `CloudCart-EC2-AppRole`.
     - Metadata accessible: Enabled, IMDSv2: **Required**, Hop limit: 1.
     - **User data:** Open `cloudcart/aws/ec2/user-data.sh` and paste its entire content. Update `MONGO_URI` with your connection string.
   - Click **Create launch template**.
2. Navigate to **EC2** > **Auto Scaling Groups** > click **Create Auto Scaling group**.
   - Name: `ASG-CloudCart`.
   - Launch template: `LT-CloudCart-v1`.
   - VPC: `VPC-CloudCart`. Subnets: Select `Private Subnet A` and `Private Subnet B`.
   - Load balancing: Check **Attach to an existing load balancer** > select Target Groups `TG-CloudCart-Frontend` and `TG-CloudCart-Backend`.
   - Health checks: Check **Turn on Elastic Load Balancing health checks**. Grace period: `300 seconds`.
   - Capacity: Desired: `2`, Minimum: `2`, Maximum: `4`.
   - Scaling policies: Select **Target tracking scaling policy** > Metric: `Average CPU utilization` > Target: `70%`.
   - Click **Create Auto Scaling group**.

---

## 8. Step 7: Setup CloudWatch Alarms & Dashboard

1. Navigate to **CloudWatch** > **Dashboards** > click **Create dashboard**.
   - Name: `CloudCart-Production-Overview`.
   - Open Actions > **View/edit source** > paste the JSON from `cloudcart/aws/cloudwatch/dashboard-config.json` > click **Save**.
2. Navigate to **CloudWatch** > **Alarms** > click **Create alarm**:
   - Create Alarms for CPU > 70%, Status Check Failed, and Memory > 85% as specified in `cloudcart/aws/cloudwatch/alarms.md`.
   - Attach actions to notify SNS topic `CloudCart-Ops-Alerts-Topic`.

---

## 9. Step 8: Deploy Serverless Order Notification Lambda

1. Package and deploy the Lambda function as described in `cloudcart/aws/lambda/order-notification/README.md`.
2. Assign the IAM execution role `CloudCart-Lambda-OrderNotificationRole`.
3. Verify sender email in Amazon SES (`ap-south-1`).

---

## 10. End-to-End Verification & Testing

Once ASG instances pass health checks:
1. Copy the **DNS Name** of `ALB-CloudCart` from the EC2 Load Balancers console (e.g., `ALB-CloudCart-123456789.ap-south-1.elb.amazonaws.com`).
2. Open your web browser and navigate to: `http://<ALB-DNS-NAME>`.
   - Verify that you are redirected to HTTPS (or served the frontend directly).
   - Verify CloudCart homepage renders with products, banners, and categories.
3. Test Backend API:
   - Navigate to `http://<ALB-DNS-NAME>/health` or `http://<ALB-DNS-NAME>/api/products`.
   - Verify that JSON catalog data is returned with HTTP 200 OK.
4. Test User Authentication & Checkout:
   - Register a new account or log in with `customer@cloudcart.com` / `Customer@123`.
   - Add items to the shopping cart and complete the checkout workflow.
5. Test Product Image Upload (Admin):
   - Log in as `admin@cloudcart.com` / `Admin@123`.
   - Open Admin Dashboard > Add Product > Upload an image.
   - Verify image uploads to S3 bucket `cloudcart-product-images-ap-south-1-major-project`.
6. Verify Telemetry:
   - Open the CloudWatch dashboard `CloudCart-Production-Overview` and confirm active CPU, RAM, and request metrics are graphing.

---

## 11. Cost Teardown & Cleanup Checklist (Post-Evaluation)

To avoid incurring ongoing AWS charges after the project demonstration:
1. Delete the Auto Scaling Group (`ASG-CloudCart`) — this automatically terminates the EC2 instances.
2. Delete the Application Load Balancer (`ALB-CloudCart`) and the two Target Groups.
3. Release any allocated Elastic IPs (EIPs) associated with NAT Gateways.
4. Delete the NAT Gateways.
5. Empty and delete the S3 buckets (`cloudcart-product-images-...`).
6. Delete the Lambda function and CloudWatch Alarms.
7. Delete the VPC (`VPC-CloudCart`).
