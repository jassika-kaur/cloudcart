# 🛒 CloudCart – Cloud-Native E-Commerce Platform

> **College Major Project**  
> **Phase 1: Full-Stack MERN Architecture**  
> **Phase 2: Complete Docker Containerization & Observability**  
> **Phase 3: Advanced AWS Cloud Infrastructure & Deployment**  
> Built with React (Vite), Nginx, Node.js, Express.js, MongoDB, Docker, AWS (EC2, S3, VPC, ALB, ASG, CloudWatch, Lambda, SES, IAM), Prometheus, and Grafana.

---

## 🌟 Overview

**CloudCart** is an enterprise-grade, cloud-native e-commerce platform designed for speed, resilience, and horizontal scalability. Inspired by modern commercial architectures (Amazon, Shopify), CloudCart features:
- A responsive storefront for shoppers (browsing, real-time filtering, cart, wishlist, checkout, and tracking).
- An executive control center for administrators (business analytics, product CRUD, order fulfillment, and user moderation).
- Complete Docker containerization orchestrated via Docker Compose.
- Full observability with Prometheus scraping Node.js process and HTTP request metrics, visualized on automated Grafana dashboards.

---

## 🏗️ Technology Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM v7, Axios, Lucide Icons, Recharts |
| **Backend** | Node.js (LTS Alpine), Express.js, Mongoose, Multer |
| **Database** | MongoDB 7.0 (with persistent volume engine) |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs, Helmet, CORS, Express-Rate-Limit, Non-root containers |
| **Containerization** | Docker, Dockerfile (multi-stage builds), Docker Compose, Bridge Network, Named Volumes |
| **Web Server / Proxy** | Nginx Alpine (reverse proxy, Gzip compression, client-side SPA routing) |
| **Monitoring** | Prometheus v2.53 (`prom-client` custom telemetry), Grafana 11.1 |
| **Testing** | Jest, Supertest (100% passing automated test suite) |

---

## 📂 Project Architecture & Directory Layout

```text
cloudcart/
│
├── frontend/
│   ├── public/                   # Static icons & assets
│   ├── src/                      # React application source code
│   │   ├── components/           # UI components (common & admin)
│   │   ├── context/              # Auth, Cart, Wishlist, Toast state
│   │   ├── pages/                # Storefront & Admin views
│   │   └── services/api.js       # Axios client with JWT interceptor
│   ├── Dockerfile                # Multi-stage production build (Node + Nginx)
│   ├── .dockerignore             # Excludes node_modules, dist, .env
│   ├── nginx.conf                # Nginx reverse proxy & SPA routing
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/db.js              # MongoDB connection manager
│   ├── controllers/              # REST endpoint business logic
│   ├── middleware/               # Auth, Admin RBAC, Multer, Error, Metrics
│   ├── models/                   # Mongoose schemas (User, Product, Order, etc.)
│   ├── routes/                   # Express routers
│   ├── services/orderService.js  # Inventory & order calculation engine
│   ├── tests/api.test.js         # Jest + Supertest integration tests
│   ├── utils/seeder.js           # 32+ realistic products & demo accounts
│   ├── uploads/                  # User & admin uploaded media
│   ├── Dockerfile                # Hardened Node.js Alpine container
│   ├── .dockerignore             # Excludes node_modules, tests, data, .env
│   ├── package.json
│   └── server.js                 # Express server & /metrics endpoint
│
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml        # Prometheus scrape configurations
│   └── grafana/
│       └── provisioning/
│           ├── datasources/
│           │   └── datasource.yml # Auto-provisioned Prometheus datasource
│           └── dashboards/
│               ├── dashboard.yml  # Auto-provisioned dashboard provider
│               └── cloudcart-dashboard.json # Pre-built operational metrics
│
├── aws/                          # AWS Cloud Infrastructure Specifications
│   ├── alb/                      # Application Load Balancer & Path Routing
│   │   └── configuration.md
│   ├── autoscaling/              # EC2 Auto Scaling Group & Launch Template
│   │   └── configuration.md
│   ├── cloudwatch/               # Observability, Agent, Alarms & Dashboard
│   │   ├── alarms.md
│   │   ├── cloudwatch-agent-config.json
│   │   ├── dashboard.md
│   │   └── dashboard-config.json
│   ├── documentation/            # Deployment walkthrough & Cloud comparison
│   │   ├── aws-deployment-guide.md
│   │   └── aws-vs-azure-comparison.md
│   ├── ec2/                      # Host automation scripts
│   │   ├── deploy.sh             # Zero-downtime container pull & rollout
│   │   └── user-data.sh          # Cloud-init instance bootstrap
│   ├── iam/                      # IAM Roles, Instance Profiles & Policies
│   │   ├── iam-setup.md
│   │   └── policies/
│   │       ├── cloudwatch-agent-policy.json
│   │       ├── ec2-instance-role-policy.json
│   │       ├── lambda-order-notification-policy.json
│   │       └── s3-access-policy.json
│   ├── lambda/order-notification/# Serverless order confirmation engine
│   │   ├── index.js
│   │   ├── package.json
│   │   └── README.md
│   ├── networking/               # VPC, Multi-AZ Subnets & Security Groups
│   │   └── architecture.md
│   └── s3/                       # Media bucket security, CORS & Pre-signed URLs
│       └── s3-config.md
│
├── terraform/                    # Infrastructure as Code (Terraform v1.5+)
│   ├── main.tf                   # Root orchestration of all modules
│   ├── variables.tf              # Input parameters & default values
│   ├── outputs.tf                # ALB DNS, VPC, S3 ARNs & ASG names
│   ├── versions.tf               # Terraform & AWS provider requirements
│   ├── terraform.tfvars.example  # Sample production variables
│   ├── README.md                 # Complete Terraform deployment guide
│   └── modules/
│       ├── vpc/                  # Multi-AZ VPC, Subnets, IGW, NAT GW
│       ├── security/             # ALB, EC2 App, and Database Security Groups
│       ├── s3/                   # S3 Bucket, SSE-S3 AES-256, Public Block, CORS
│       ├── iam/                  # IMDSv2 EC2 Instance Profile, S3, CloudWatch
│       ├── alb/                  # Application Load Balancer & Target Groups
│       ├── asg/                  # AL2023 Launch Template, ASG & Target Tracking
│       ├── cloudwatch/           # Metric Alarms, SNS alerts & Dashboard
│       └── lambda/               # Serverless Order Notification Lambda
│
├── docker-compose.yml            # Multi-container orchestration specification
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git exclusions
└── README.md
```

---

## 🐳 Docker Containerization and Deployment

### 1. Conceptual Foundations

- **Docker Architecture**: Client-Server architecture where the Docker CLI client communicates with the Docker Daemon (`dockerd`) to build, run, and manage containers.
- **Dockerfile**: A declarative blueprint containing a sequence of instructions (`FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `USER`, `CMD`) that produces a reproducible Docker image.
- **Docker Image**: An immutable, read-only package containing application binaries, libraries, runtimes, and configuration layers.
- **Docker Container**: A runnable, isolated instance of a Docker image executing in its own namespace and control group (cgroups) on the host operating system.
- **Docker Compose**: A declarative orchestration tool defined via YAML (`docker-compose.yml`) to define and manage multi-container applications, their networks, volumes, environment variables, and dependency health checks.
- **Docker Volumes**: Persistent data storage managed entirely by Docker, detached from container lifecycles to ensure databases, uploads, and monitoring indices persist across restarts.
- **Docker Networking**: An isolated user-defined software bridge network (`cloudcart-network`) providing internal DNS resolution and service discovery between containers (e.g., `backend` connects to `mongodb://mongodb:27017` rather than `localhost`).
- **Container Lifecycle**: The sequence of states a container traverses: `Created` ➔ `Running` ➔ `Paused` ➔ `Stopped` ➔ `Removed`.

---

### 2. Multi-Container Topography

```
                     +---------------------------------------+
                     |             Host Machine              |
                     +---------------------------------------+
                                        |
                 +----------------------+----------------------+
                 | (Port 3000)          | (Port 5000)          | (Port 3001)   | (Port 9090)
                 v                      v                      v               v
       +-------------------+  +-------------------+  +---------------+ +---------------+
       | cloudcart-frontend|  | cloudcart-backend |  |   cloudcart-  | |   cloudcart-  |
       |  (Nginx Alpine)   |  |  (Node 20 Alpine) |  |    grafana    | |   prometheus  |
       +-------------------+  +-------------------+  +---------------+ +---------------+
                 |                      |                      |               |
                 | Reverse Proxy (/api) | Mongoose Connection  | Scrapes       | Scrapes
                 +--------------------->| (Port 27017)         +-------------->| /metrics
                                        v                                      |
                              +-------------------+                            |
                              | cloudcart-mongodb |<---------------------------+
                              |   (Mongo 7.0)     |
                              +-------------------+
                                        |
                                        v
                            [cloudcart_mongodb_data]
                               (Named Volume)
```

---

### 3. Container Services Summary

| Service | Container Name | Image / Build | Internal Port | Host Port | Role |
|---|---|---|---|---|---|
| **frontend** | `cloudcart-frontend` | Multi-stage build (`nginx:1.27-alpine`) | 80 | **3000** | Serves static React bundle, reverse proxies `/api` and `/uploads` |
| **backend** | `cloudcart-backend` | Multi-stage build (`node:20-alpine`) | 5000 | **5000** | Express REST API, auth, business logic, `/metrics` |
| **mongodb** | `cloudcart-mongodb` | `mongo:7.0` | 27017 | Internal | Database engine with persistent storage |
| **prometheus** | `cloudcart-prometheus`| `prom/prometheus:v2.53.3` | 9090 | **9090** | Time-series scraper collecting Node.js and HTTP metrics |
| **grafana** | `cloudcart-grafana` | `grafana/grafana:11.1.0` | 3000 | **3001** | Visual dashboard displaying API latency, request rate & memory |

---

### 4. Running the Containerized Stack

Ensure Docker and Docker Compose are installed on your workstation.

#### Step 1: Clone Repository & Enter Directory
```bash
cd cloudcart
```

#### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

#### Step 3: Build and Launch All Services
Run a single command to build all images and start all 5 containers:
```bash
docker compose up --build -d
```

#### Step 4: Verify Running Containers
```bash
docker compose ps
```
You should see all 5 services running with `healthy` or `running` state:
- `cloudcart-mongodb` (healthy)
- `cloudcart-backend` (healthy)
- `cloudcart-frontend` (healthy)
- `cloudcart-prometheus` (running)
- `cloudcart-grafana` (running)

#### Step 5: Seed the Database Inside Docker
To populate the 32+ realistic products, categories, demo users, and analytics orders in the MongoDB container:
```bash
docker compose exec backend node utils/seeder.js
```

---

### 5. Accessing Local Endpoints

| Application / Service | Local URL | Credentials / Notes |
|---|---|---|
| **CloudCart Storefront** | [http://localhost:3000](http://localhost:3000) | Public customer storefront |
| **Admin Control Center** | [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard) | Requires login as `admin@cloudcart.com` |
| **Backend REST API** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | Healthcheck endpoint (`{"status":"OK"}`) |
| **Prometheus Metrics** | [http://localhost:5000/metrics](http://localhost:5000/metrics) | Raw Prometheus telemetry endpoint |
| **Prometheus Dashboard** | [http://localhost:9090](http://localhost:9090) | Target status: `http://localhost:9090/targets` |
| **Grafana Monitoring** | [http://localhost:3001](http://localhost:3001) | User: `admin` \| Password: `admin` |

---

### 6. Docker Lifecycle Commands Reference

```bash
# 1. View running containers
docker ps

# 2. View all containers (including stopped)
docker ps -a

# 3. View local Docker images
docker images

# 4. Tail real-time logs from backend service
docker logs -f cloudcart-backend

# 5. Tail logs from all orchestrated services
docker compose logs -f

# 6. Inspect container metadata & networking
docker inspect cloudcart-backend

# 7. Stop specific container
docker stop cloudcart-backend

# 8. Start specific container
docker start cloudcart-backend

# 9. Stop entire application stack
docker compose stop

# 10. Tear down containers, networks, keeping persistent volumes intact
docker compose down

# 11. Tear down containers and delete persistent database volumes (Clean Reset)
docker compose down -v

# 12. Prune unused images and build caches
docker system prune -f
```

---

### 7. Docker Hub Publishing Guide

To distribute your container images to Docker Hub:

#### Step 1: Login to Docker Hub
```bash
docker login -u <your_dockerhub_username>
```

#### Step 2: Build Images with Image Tags
```bash
# Set your Docker Hub username
DOCKER_USER="your_dockerhub_username"

# Build Backend Image
docker build -t ${DOCKER_USER}/cloudcart-backend:latest ./backend
docker build -t ${DOCKER_USER}/cloudcart-backend:v1.0.0 ./backend

# Build Frontend Image
docker build -t ${DOCKER_USER}/cloudcart-frontend:latest ./frontend
docker build -t ${DOCKER_USER}/cloudcart-frontend:v1.0.0 ./frontend
```

#### Step 3: Push Images to Docker Hub
```bash
# Push Backend
docker push ${DOCKER_USER}/cloudcart-backend:latest
docker push ${DOCKER_USER}/cloudcart-backend:v1.0.0

# Push Frontend
docker push ${DOCKER_USER}/cloudcart-frontend:latest
docker push ${DOCKER_USER}/cloudcart-frontend:v1.0.0
```

#### Step 4: Pull and Run on Any Cloud or Host Environment
```bash
# Pull from Docker Hub
docker pull ${DOCKER_USER}/cloudcart-backend:latest
docker pull ${DOCKER_USER}/cloudcart-frontend:latest

# Run independently
docker run -d --name cloudcart-backend -p 5000:5000 ${DOCKER_USER}/cloudcart-backend:latest
docker run -d --name cloudcart-frontend -p 3000:80 ${DOCKER_USER}/cloudcart-frontend:latest
```

---

### 8. Security Best Practices Implemented

- **Non-Root User Execution**: Backend runs under `USER node` instead of `root`, mitigating container breakout vulnerabilities.
- **Lightweight Alpine Images**: Uses `node:20-alpine` and `nginx:1.27-alpine` to maintain small attack surfaces ($< 150\text{MB}$ each).
- **Multi-Stage Builds**: Frontend source files, build dependencies, and compiler tools are discarded; only static production files remain in the final Nginx image.
- **Clean Secrets Segregation**: Zero hardcoded credentials in Dockerfiles or images; all secrets injected dynamically at runtime via `.env` or Compose environment parameters.
- **Strict Network Isolation**: MongoDB database is kept internal to the `cloudcart-network` bridge and not exposed to the public Internet.
- **Automated Healthchecks**: Built-in container health checks monitor process responsiveness and restart dead services automatically.

---

### 9. Verification & Troubleshooting

#### Verifying Database Persistence Across Restarts
1. Place an order or register a user in the UI at `http://localhost:3000`.
2. Stop the containers: `docker compose down`.
3. Restart the containers: `docker compose up -d`.
4. Refresh `http://localhost:3000/orders`: your orders and account data remain completely intact due to the `mongodb_data` named volume.

#### Common Troubleshooting Steps
- **Port Conflict (e.g., 5000 or 3000 already in use)**:
  Check for active local processes (`netstat -ano | findstr 5000` on Windows or `lsof -i :5000` on Linux) and terminate conflicting processes, or remap ports in `docker-compose.yml`.
- **Database Connection Failure**:
  Ensure the backend environment has `MONGO_URI=mongodb://mongodb:27017/cloudcart` rather than `localhost`.
- **Prometheus Target Down**:
  Visit `http://localhost:9090/targets` and verify `cloudcart-backend` reports `UP (1/1)`. Ensure `backend:5000` is reachable over `cloudcart-network`.

---

## ☁️ Phase 3: Advanced AWS Cloud Infrastructure & Deployment

### 1. Architectural Overview & Component Topology

CloudCart Phase 3 deploys the containerized application onto Amazon Web Services (AWS) using an enterprise-grade, Multi-AZ resilient cloud infrastructure in the **Mumbai (`ap-south-1`)** region.

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
==========================================================|==========================================================
AWS VPC (10.0.0.0/16) - ap-south-1                        |
==========================================================|==========================================================
                                                          |
    +-----------------------------------------------------+-----------------------------------------------------+
    | Public Subnet A (10.0.1.0/24) [ap-south-1a]         | Public Subnet B (10.0.2.0/24) [ap-south-1b]         |
    |                                                     |                                                     |
    |   +-------------------------------------------------------------------------------------------------+   |
    |   |                Application Load Balancer (ALB) - Dual-AZ (Security Group: ALB-SG)               |   |
    |   +-------------------------------------------------------------------------------------------------+   |
    |                |                                                     |                                  |
    |                | (Path: /* ➔ :3000 | /api/* ➔ :5000)                 | (Path: /* ➔ :3000 | /api/* ➔ :5000)
    |   +--------------------------+                          +--------------------------+                    |
    |   | NAT Gateway A (EIP-A)    |                          | NAT Gateway B (EIP-B)    |                    |
    |   +--------------------------+                          +--------------------------+                    |
    +----------------|-----------------------------------------------------|------------------------------------+
                     |                                                     |
    -----------------|-----------------------------------------------------|-------------------------------------
    Private App Tier |                                                     |
    -----------------|-----------------------------------------------------|-------------------------------------
    +----------------v-----------------------------------+  +--------------v------------------------------------+
    | Private Subnet A (10.0.10.0/24) [ap-south-1a]      |  | Private Subnet B (10.0.20.0/24) [ap-south-1b]     |
    |                                                    |  |                                                   |
    |   +--------------------------------------------+   |  |   +---------------------------------------------+ |
    |   | EC2 Instance 1 (Auto Scaling Group)        |   |  |   | EC2 Instance 2 (Auto Scaling Group)         | |
    |   |  - Docker Container: Frontend (Port 3000)  |   |  |   |  - Docker Container: Frontend (Port 3000)   | |
    |   |  - Docker Container: Backend (Port 5000)   |   |  |   |  - Docker Container: Backend (Port 5000)    | |
    |   |  - CloudWatch Agent (RAM/Disk Telemetry)   |   |  |   |  - CloudWatch Agent (RAM/Disk Telemetry)    | |
    |   +--------------------------------------------+   |  |   +---------------------------------------------+ |
    +----------------------------------------------------+  +---------------------------------------------------+
                     |                                                     |
    +----------------v-----------------------------------------------------v------------------------------------+
    | Serverless & Storage Integrations:                                                                        |
    |  - Amazon S3 Bucket: cloudcart-product-images-ap-south-1-major-project (SSE-S3 AES-256, Pre-signed URLs)   |
    |  - AWS Lambda: cloudcart-order-notification (Triggered on checkout ➔ Amazon SES HTML receipt dispatch)    |
    |  - Amazon CloudWatch: Unified Dashboard, System Alarms (CPU > 70%, StatusCheck, Mem > 85%) & CloudTrail   |
    +-----------------------------------------------------------------------------------------------------------+
```

---

### 2. AWS Services Implemented & Academic Syllabus Alignment

| AWS Service | Architectural Role in CloudCart | Major Project Syllabus Concept |
| :--- | :--- | :--- |
| **Amazon EC2** | Runs containerized Frontend and Backend application processes. Managed via Launch Template `LT-CloudCart-v1` and auto-bootstrapped via `user-data.sh`. | Elastic Compute, Virtualization & Guest OS Bootstrapping |
| **Amazon VPC** | Network boundary (`10.0.0.0/16`) isolating public load balancers from private compute instances. | Virtual Private Cloud, Subnetting & CIDR Design |
| **Security Groups** | Stateful Layer 4 virtual firewalls (`ALB-SG`, `EC2-App-SG`, `MongoDB-SG`) enforcing least privilege. | Defense-in-Depth & Zero-Trust Network Access Control |
| **Application Load Balancer** | Layer 7 entry point routing `/api/*` and `/uploads/*` to port 5000 and `/*` to port 3000 with TLS termination. | Content-Based Load Balancing & Reverse Proxying |
| **EC2 Auto Scaling** | Dynamically scales instances between 2 and 4 based on Target Tracking (Average CPU > 70%). | Horizontal Elasticity, High Availability & Fault Tolerance |
| **Amazon S3** | Durable object storage for product catalog images with server-side encryption (SSE-S3) and Pre-signed URLs. | Cloud Object Storage, Durability & Cryptographic Signatures |
| **AWS IAM** | Keyless instance profiles (`CloudCart-EC2-AppRole`) using IMDSv2 to grant EC2 least privilege access to S3 and CloudWatch. | Principle of Least Privilege & Machine Identity Governance |
| **Amazon CloudWatch** | Monitors hypervisor and custom OS metrics (RAM, Disk), triggers SNS alerts, and visualizes system health. | Cloud Telemetry, Observability & Automated Alerting |
| **AWS Lambda & SES** | Serverless event handler generating and delivering customer invoice receipts on successful checkout. | Serverless Computing (FaaS) & Transactional Messaging |
| **Amazon CloudTrail** | Immutable auditing trail logging every AWS control-plane API call for regulatory compliance. | Cloud Governance, Compliance & Security Auditing |

---

### 3. Deployed Docker Hub Artifacts

The deployment utilizes official production images pushed to Docker Hub:
- **Frontend Image:** `jassikakaur/cloudcart-frontend:v1.0.0` (Container port 80 ➔ Host port 3000 via Nginx)
- **Backend Image:** `jassikakaur/cloudcart-backend:v1.0.0` (Container port 5000 ➔ Host port 5000)

---

### 4. Automated EC2 Deployment & Rollout Scripts

- **`cloudcart/aws/ec2/deploy.sh`**: Production deployment script. Automatically detects package manager, enables Docker, sets up the dedicated `cloudcart-net` bridge, pulls latest Docker Hub images, gracefully stops older containers, spins up updated containers with health checks, and prunes dangling layers.
- **`cloudcart/aws/ec2/user-data.sh`**: Cloud-init bootstrap script for Amazon Linux 2023. Installs Docker, CloudWatch Agent, configures production `.env`, generates `deploy.sh`, and starts the container stack on first boot.

To run manual deployments on an EC2 instance:
```bash
chmod +x cloudcart/aws/ec2/deploy.sh
./cloudcart/aws/ec2/deploy.sh
```

---

### 5. S3 Media Storage & Pre-signed URL Architecture

CloudCart utilizes an AWS S3 bucket with strict zero-trust security:
- **Bucket Name:** `cloudcart-product-images-ap-south-1-major-project`
- **Region:** `ap-south-1` (Mumbai)
- **Public Access:** 100% Blocked (`BlockPublicAcls`, `IgnorePublicAcls`, `BlockPublicPolicy`, `RestrictPublicBuckets` set to `True`).
- **Encryption:** `AES256` Server-Side Encryption (`SSE-S3`).
- **Pre-signed URLs:** Client browsers upload and download images using time-limited URLs generated via `@aws-sdk/s3-request-presigner` (AWS Signature Version 4), ensuring product images are never exposed to the public Internet without authorization.

---

### 6. CloudWatch Observability & Operational Dashboard

- **Agent Configuration:** `cloudcart/aws/cloudwatch/cloudwatch-agent-config.json` collects memory (`mem_used_percent`) and root filesystem usage (`used_percent`) every 60 seconds.
- **Unified Dashboard:** `CloudCart-Production-Overview` monitors CPU, RAM, ALB request count, target response latency, and HTTP 2XX/4XX/5XX status code distributions.
- **System Alarms:** Configured in `cloudcart/aws/cloudwatch/alarms.md`:
  - `CloudCart-High-CPU-Utilization`: Average CPU $\ge 70\%$ for 10 minutes.
  - `CloudCart-EC2-StatusCheck-Failed`: Hypervisor or instance failure triggers automated EC2 recovery.
  - `CloudCart-High-Memory-Utilization`: RAM usage $\ge 85\%$ triggers warning before OOM events.

---

### 7. Serverless Order Notifications (AWS Lambda + SES)

- **Source Code:** `cloudcart/aws/lambda/order-notification/index.js`
- **Runtime:** Node.js 20.x (ESM)
- **Functionality:** Upon customer checkout, Lambda parses the order payload, dynamically builds a responsive HTML invoice, and dispatches it via Amazon SES.
- **Resilience:** Features built-in fallback simulation when operating within the AWS SES Sandbox mode.

---

### 8. Enterprise Platform Comparison: AWS vs. Microsoft Azure

A technical comparison between AWS and Microsoft Azure for college evaluation:

| Evaluation Dimension | Amazon Web Services (AWS Mumbai) | Microsoft Azure (Central/South India) |
| :--- | :--- | :--- |
| **Compute Primitive** | Amazon EC2 (Nitro hypervisor, AL2023, IMDSv2) | Azure Virtual Machines (Hyper-V / Azure Boost) |
| **Object Storage** | Amazon S3 (Bucket, SSE-S3, Pre-signed URLs) | Azure Blob Storage (Storage Account, SAS Tokens) |
| **Virtual Networking**| Amazon VPC (Public/Private Subnets, IGW, NAT GW) | Azure Virtual Network (VNets, Subnets, NAT GW) |
| **Traffic Routing** | Application Load Balancer (Layer 7 Path Rules) | Azure Application Gateway v2 (URL Path Maps) |
| **Elastic Scaling** | EC2 Auto Scaling Groups (Target Tracking CPU 70%)| Azure Virtual Machine Scale Sets (Autoscale Rules)|
| **Identity & Security**| AWS IAM (Roles, Policies, Instance Profiles) | Microsoft Entra ID & Azure RBAC Managed Identities |
| **Serverless Compute** | AWS Lambda (Firecracker MicroVMs, pay-per-call) | Azure Functions (Consumption Plan) |
| **Observability** | Amazon CloudWatch (Metrics, Alarms, Logs) | Azure Monitor & Log Analytics Workspaces |
| **Governance & Audit** | Amazon CloudTrail (Multi-region immutable trail)| Azure Activity Log & Defender for Cloud |
| **Academic Verdict** | **Selected for CloudCart** due to superior container performance, IMDSv2 security, and lower Linux compute latency. | Excellent for enterprise Windows/.NET workloads; higher base cost for Application Gateway. |

---

### 9. Complete Documentation Directory

Detailed implementation guides for each AWS component are located under `cloudcart/aws/`:
- **VPC & Subnets:** [`cloudcart/aws/networking/architecture.md`](file:///c:/Users/hp/OneDrive%20-%20Lovely%20Professional%20University/Desktop/jassaws/cloudcart/aws/networking/architecture.md)
- **S3 & Media Storage:** [`cloudcart/aws/s3/s3-config.md`](file:///c:/Users/hp/OneDrive%20-%20Lovely%20Professional%20University/Desktop/jassaws/cloudcart/aws/s3/s3-config.md)
- **IAM Policies & Roles:** [`cloudcart/aws/iam/iam-setup.md`](file:///c:/Users/hp/OneDrive%20-%20Lovely%20Professional%20University/Desktop/jassaws/cloudcart/aws/iam/iam-setup.md)
- **Application Load Balancer:** [`cloudcart/aws/alb/configuration.md`](file:///c:/Users/hp/OneDrive%20-%20Lovely%20Professional%20University/Desktop/jassaws/cloudcart/aws/alb/configuration.md)
- **Auto Scaling Group:** [`cloudcart/aws/autoscaling/configuration.md`](file:///c:/Users/hp/OneDrive%20-%20Lovely%20Professional%20University/Desktop/jassaws/cloudcart/aws/autoscaling/configuration.md)
- **CloudWatch & Alarms:** [`cloudcart/aws/cloudwatch/alarms.md`](file:///c:/Users/hp/OneDrive%20-%20Lovely%20Professional%20University/Desktop/jassaws/cloudcart/aws/cloudwatch/alarms.md)
- **Operational Dashboard:** [`cloudcart/aws/cloudwatch/dashboard.md`](file:///c:/Users/hp/OneDrive%20-%20Lovely%20Professional%20University/Desktop/jassaws/cloudcart/aws/cloudwatch/dashboard.md)
- **Serverless Lambda:** [`cloudcart/aws/lambda/order-notification/README.md`](file:///c:/Users/hp/OneDrive%20-%20Lovely%20Professional%20University/Desktop/jassaws/cloudcart/aws/lambda/order-notification/README.md)
- **AWS vs Azure Matrix:** [`cloudcart/aws/documentation/aws-vs-azure-comparison.md`](file:///c:/Users/hp/OneDrive%20-%20Lovely%20Professional%20University/Desktop/jassaws/cloudcart/aws/documentation/aws-vs-azure-comparison.md)
- **Step-by-Step Walkthrough:** [`cloudcart/aws/documentation/aws-deployment-guide.md`](file:///c:/Users/hp/OneDrive%20-%20Lovely%20Professional%20University/Desktop/jassaws/cloudcart/aws/documentation/aws-deployment-guide.md)

---

### 10. Automated Infrastructure as Code (Terraform)

CloudCart provides a modular **Terraform** configuration (tested and validated on Terraform v1.15.8) that deploys the entire AWS architecture with a single command.

- **Directory:** [`cloudcart/terraform/`](file:///c:/Users/hp/OneDrive%20-%20Lovely%20Professional%20University/Desktop/jassaws/cloudcart/terraform/)
- **Documentation:** [`cloudcart/terraform/README.md`](file:///c:/Users/hp/OneDrive%20-%20Lovely%20Professional%20University/Desktop/jassaws/cloudcart/terraform/README.md)
- **Validation Status:** `Success! The configuration is valid.`

#### Terraform Commands:
```bash
cd cloudcart/terraform

# 1. Initialize providers & modules
terraform init

# 2. Validate syntax and configuration integrity
terraform validate

# 3. Preview infrastructure plan
terraform plan

# 4. Provision cloud resources
terraform apply -auto-approve

# 5. Destroy resources after evaluation
terraform destroy -auto-approve
```

---

## 🚀 AWS Load Balancer & Auto Scaling (Production Phase)

### 1. High-Availability Architecture Overview

CloudCart utilizes an enterprise-grade, Multi-AZ compute and ingress architecture provisioned via modular Terraform in **Mumbai (`ap-south-1`)**:

```text
                                  +------------------------------------------+
                                  |              INTERNET TRAFFIC            |
                                  +------------------------------------------+
                                                       |
                                                       | HTTP (80) / HTTPS (443)
                                                       v
                                  +------------------------------------------+
                                  |   Application Load Balancer (CloudCart)  |
                                  |   DNS: cloudcart-production-alb-*.elb    |
                                  +------------------------------------------+
                                      |                                  |
               Path: `/`              |                                  |  Path: `/api/*`, `/health`
               (React / Vite SPA)     |                                  |  (Express REST API)
                                      v                                  v
                       +-----------------------------+    +-----------------------------+
                       |  Target Group: tg-frontend  |    |  Target Group: tg-backend   |
                       |  Port: 3000 | Health: `/`   |    |  Port: 5000 | Health: /api/h|
                       +-----------------------------+    +-----------------------------+
                                      |                                  |
                                      +-----------------+----------------+
                                                        |
                                       Forwarded over internal VPC SG
                                                        v
                 =======================================================================
                 Multi-AZ EC2 Auto Scaling Group (Min: 1, Desired: 2, Max: 3)
                 Private Subnet A (10.0.10.0/24)  &  Private Subnet B (10.0.20.0/24)
                 =======================================================================
                   +----------------------------------+  +----------------------------------+
                   | EC2 Instance 1 (ap-south-1a)     |  | EC2 Instance 2 (ap-south-1b)     |
                   |  - Docker: Frontend (Port 3000)  |  |  - Docker: Frontend (Port 3000)  |
                   |  - Docker: Backend (Port 5000)   |  |  - Docker: Backend (Port 5000)   |
                   |  - Docker: MongoDB 7.0 (:27017)  |  |  - Docker: MongoDB 7.0 (:27017)  |
                   +----------------------------------+  +----------------------------------+
```

### 2. Application Load Balancer (ALB) Configuration
- **Load Balancer Type:** Application (Layer 7).
- **Subnets:** Public subnets across `ap-south-1a` (`10.0.1.0/24`) and `ap-south-1b` (`10.0.2.0/24`).
- **Security Group:** `cloudcart-production-alb-sg` (Ingress: 80 & 443 from `0.0.0.0/0`).
- **Target Groups:**
  - **Frontend Target Group (`tg-frontend`):** Port `3000`, Protocol `HTTP`, Health check path `/`, Healthy threshold `2`, Interval `15s`, Timeout `5s`, Matcher `200`.
  - **Backend Target Group (`tg-backend`):** Port `5000`, Protocol `HTTP`, Health check path `/api/health`, Healthy threshold `2`, Unhealthy threshold `3`, Interval `15s`, Timeout `5s`, Matcher `200`.
- **Routing Rules:**
  - Path rule `priority 10`: Matches `/api/*`, `/uploads/*`, and `/health` $\rightarrow$ Forwards to `tg-backend`.
  - Default rule: Forwards all remaining traffic (`/`) $\rightarrow$ Forwards to `tg-frontend`.
- **Network Security:** Direct public access to instance ports 3000 and 5000 is blocked; only traffic originating from the ALB Security Group is permitted.

### 3. Auto Scaling Group (ASG) Workflow
- **Capacity Boundaries:**
  - Minimum Capacity: `1`
  - Desired Capacity: `2`
  - Maximum Capacity: `3`
- **Subnet Placement:** Distributed across private subnets `subnet-0e3ee0b37b195f21c` and `subnet-07885325162deddcb`.
- **Launch Template:** Amazon Linux 2023 (`al2023-ami-2023.*-kernel-6.12-x86_64`), `t3.small` instance type, IMDSv2 strictly enforced, and 30 GB gp3 encrypted EBS.
- **Automated Cloud-Init Bootstrap (`user_data`):**
  1. Installs Docker engine and dependencies cleanly using `dnf install -y docker jq --allowerasing`.
  2. Enables and starts the Docker daemon, adding `ec2-user` to the `docker` group.
  3. Creates dedicated bridge network `cloudcart-net`.
  4. Runs containerized MongoDB 7.0 with persistent storage and credentials.
  5. Pulls official container images: `jassikakaur/cloudcart-backend:v1.0.0` and `jassikakaur/cloudcart-frontend:v1.0.0`.
  6. Launches the Node.js backend container on port 5000 with IAM role metadata access.
  7. Launches the React/Vite/Nginx frontend container on port 3000.
  8. Automatically seeds 32 sample products and 6 categories via `npm run seed`.
- **Dynamic Scaling Policy:** Target tracking policy (`ASGAverageCPUUtilization`) maintaining average compute utilization at `70%`.

### 4. HTTPS & SSL/TLS Configuration
- **ACM Requirement:** Public SSL/TLS certificates issued by AWS Certificate Manager (ACM) require domain ownership validation (DNS or email) for a custom domain (e.g., `cloudcart.yourdomain.com`). ACM does not issue public certificates for default AWS subdomains (`*.elb.amazonaws.com`).
- **Production HTTPS Listener:** The Terraform ALB module includes a complete HTTPS listener on port 443 with modern cipher policy (`ELBSecurityPolicy-TLS13-1-2-2021-06`) and automatic HTTP-to-HTTPS (301) redirection, activated via:
  ```terraform
  enable_https        = true
  acm_certificate_arn = "arn:aws:acm:ap-south-1:103316336488:certificate/..."
  ```
- **Testing Ingress:** For academic testing without a custom domain, the ALB DNS name serves production HTTP traffic on port 80.

### 5. Live Verification & Testing Results

| Test Target | Tested Endpoint | Expected Result | Live Observed Result |
| :--- | :--- | :--- | :--- |
| **ALB Ingress** | `http://cloudcart-production-alb-1269005310.ap-south-1.elb.amazonaws.com/` | `HTTP 200 OK` | `HTTP 200 OK` (React SPA Title & Nginx Headers) |
| **Frontend Health** | Target Group `tg-frontend` (Port 3000) | `healthy` | `healthy` (`HTTP 200` on `/`) |
| **Backend API Health** | `http://.../api/health` | `HTTP 200 OK` | `{"status":"OK","service":"CloudCart REST API"}` |
| **Backend Target Group**| Target Group `tg-backend` (Port 5000) | `healthy` | `healthy` (`HTTP 200` on `/api/health`) |
| **Product Catalog API** | `http://.../api/products` | `HTTP 200 OK` | `{"success":true,"count":12,"totalProducts":32,...}` |
| **Auto Scaling Status** | ASG Desired 2, Min 1, Max 3 | Multi-AZ Active | EC2 compute nodes active in `ap-south-1a` & `ap-south-1b` |
