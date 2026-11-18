# CloudCart – AWS VPC & Network Architecture Specification

> **Target Region:** `ap-south-1` (Asia Pacific - Mumbai)  
> **CIDR Block:** `10.0.0.0/16` (65,536 available IPv4 addresses)  
> **High Availability:** Multi-AZ deployment across `ap-south-1a` and `ap-south-1b`

---

## 1. Architectural Overview & Component Communication Diagram

The CloudCart cloud architecture employs a multi-tier, zero-trust network model that strictly segregates public-facing ingress components from sensitive compute and database workloads.

```
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
=========================================================|=========================================================
AWS VPC (10.0.0.0/16) - ap-south-1                       |
=========================================================|=========================================================
                                                         |
    +----------------------------------------------------+----------------------------------------------------+
    | Public Subnet A (10.0.1.0/24) [ap-south-1a]        | Public Subnet B (10.0.2.0/24) [ap-south-1b]        |
    |                                                    |                                                    |
    |   +------------------------------------------------------------------------------------------------+   |
    |   |                Application Load Balancer (ALB) - Dual-AZ (Security Group: ALB-SG)              |   |
    |   +------------------------------------------------------------------------------------------------+   |
    |                |                                                    |                                  |
    |                | (Forward Port 3000 / 5000)                         | (Forward Port 3000 / 5000)       |
    |   +--------------------------+                         +--------------------------+                    |
    |   | NAT Gateway A (EIP-A)    |                         | NAT Gateway B (EIP-B)    |                    |
    |   +--------------------------+                         +--------------------------+                    |
    +----------------|---------------------------------------------------|-----------------------------------+
                     |                                                   |
    -----------------|---------------------------------------------------|------------------------------------
    Private App Tier |                                                   |
    -----------------|---------------------------------------------------|------------------------------------
    +----------------v-----------------------------------+ +-------------v-----------------------------------+
    | Private Subnet A (10.0.10.0/24) [ap-south-1a]      | | Private Subnet B (10.0.20.0/24) [ap-south-1b]   |
    |                                                    | |                                                 |
    |   +--------------------------------------------+   | |   +-----------------------------------------+   |
    |   | EC2 Instance 1 (Auto Scaling Group)        |   | |   | EC2 Instance 2 (Auto Scaling Group)     |   |
    |   |  - Docker Container: Frontend (Port 3000)  |   | |   |  - Docker Container: Frontend (Port 3000)|   |
    |   |  - Docker Container: Backend (Port 5000)   |   | |   |  - Docker Container: Backend (Port 5000) |   |
    |   |  - Security Group: EC2-App-SG              |   | |   |  - Security Group: EC2-App-SG           |   |
    |   |  - IAM Role: CloudCart-EC2-Instance-Role   |   | |   |  - IAM Role: CloudCart-EC2-Instance-Role|   |
    |   +--------------------------------------------+   | |   +-----------------------------------------+   |
    |                          |                         | |                          |                      |
    +--------------------------|-------------------------+ +--------------------------|----------------------+
                               |                                                      |
    ---------------------------|------------------------------------------------------|-----------------------
    Database & Storage Tier    |                                                      |
    ---------------------------|------------------------------------------------------|-----------------------
                               |                                                      |
                               +--------------------------+---------------------------+
                                                          |
                               +--------------------------+---------------------------+
                               |                                                      |
                               v (TLS Port 27017)                                     v (HTTPS Port 443)
                 +---------------------------+                          +---------------------------+
                 |       MongoDB Atlas       |                          |         Amazon S3         |
                 | (Dedicated Cloud Cluster) |                          | (Product Media Bucket)    |
                 | - Whitelisted VPC CIDR    |                          | - Encrypted at Rest       |
                 | - SCRAM-SHA-256 Auth      |                          | - VPC Endpoint / HTTPS    |
                 +---------------------------+                          +---------------------------+
```

---

## 2. Subnet Layout & IP Addressing Table

| Subnet Identifier | Availability Zone | CIDR Block | Route Table Association | Primary Resources Hosted |
|---|---|---|---|---|
| `Public-Subnet-1A` | `ap-south-1a` | `10.0.1.0/24` | `Public-Route-Table` (IGW) | Application Load Balancer node A, NAT Gateway A |
| `Public-Subnet-1B` | `ap-south-1b` | `10.0.2.0/24` | `Public-Route-Table` (IGW) | Application Load Balancer node B, NAT Gateway B |
| `Private-App-Subnet-1A` | `ap-south-1a` | `10.0.10.0/24` | `Private-Route-Table-A` (NAT-A) | EC2 Docker Application Server (ASG Instance 1) |
| `Private-App-Subnet-1B` | `ap-south-1b` | `10.0.20.0/24` | `Private-Route-Table-B` (NAT-B) | EC2 Docker Application Server (ASG Instance 2) |
| `Private-DB-Subnet-1A` | `ap-south-1a` | `10.0.30.0/24` | `Database-Route-Table` (Local only) | Database failover / Containerized MongoDB |
| `Private-DB-Subnet-1B` | `ap-south-1b` | `10.0.40.0/24` | `Database-Route-Table` (Local only) | Database replication / Containerized MongoDB |

---

## 3. Public vs. Private Subnet Security Mechanics

### How Public Subnets Work
1. **Direct Route to IGW:** Any subnet whose route table points default outbound traffic (`0.0.0.0/0`) to an **Internet Gateway (IGW)** is a public subnet.
2. **Public IP Assignment:** Instances in this subnet receive public IPv4 addresses, allowing bi-directional internet communication.
3. **Role in CloudCart:** Only the **Application Load Balancer (ALB)** and **NAT Gateways** reside in public subnets. No application code or database containers execute in public subnets.

### How Private Subnets Work
1. **Isolated Routing:** The route table for a private subnet does **NOT** have a direct route to the Internet Gateway.
2. **Outbound-Only via NAT:** When application EC2 instances need to pull Docker Hub images (`docker pull`), install operating system patches, or connect to MongoDB Atlas, traffic routes through an internal **NAT Gateway** in the public subnet.
3. **Inbound Protection:** External internet hosts cannot directly address, ping, or scan instances in private subnets, completely neutralizing automated internet bots and port-scanning exploits.

---

## 4. Security Group Rule Specifications

Security Groups act as stateful virtual firewalls at the instance and load balancer level.

### A. Load Balancer Security Group (`ALB-SG`)
| Direction | Type | Protocol | Port Range | Source / Destination | Purpose |
|---|---|---|---|---|---|
| **Ingress** | HTTP | TCP | `80` | `0.0.0.0/0` | Public HTTP user access (auto-redirected to HTTPS) |
| **Ingress** | HTTPS | TCP | `443` | `0.0.0.0/0` | Public secure customer shopping traffic |
| **Egress** | Custom TCP | TCP | `3000` | `sg-EC2-App-SG` | Forward customer UI requests to Nginx containers |
| **Egress** | Custom TCP | TCP | `5000` | `sg-EC2-App-SG` | Forward API requests to Express containers |

### B. Application EC2 Security Group (`EC2-App-SG`)
| Direction | Type | Protocol | Port Range | Source / Destination | Purpose |
|---|---|---|---|---|---|
| **Ingress** | Custom TCP | TCP | `3000` | `sg-ALB-SG` | Allow Nginx traffic strictly from Load Balancer |
| **Ingress** | Custom TCP | TCP | `5000` | `sg-ALB-SG` | Allow API traffic strictly from Load Balancer |
| **Ingress** | SSH | TCP | `22` | `YOUR_ADMIN_IP/32` | Bastion or restricted administrative terminal access |
| **Egress** | HTTPS | TCP | `443` | `0.0.0.0/0` | Pull Docker Hub images, AWS S3 API, AWS Secrets Manager |
| **Egress** | MongoDB | TCP | `27017` | `sg-MongoDB-SG` / Atlas CIDR | Database queries and transaction writes |

### C. Database Security Group (`MongoDB-SG`)
| Direction | Type | Protocol | Port Range | Source / Destination | Purpose |
|---|---|---|---|---|---|
| **Ingress** | Custom TCP | TCP | `27017` | `sg-EC2-App-SG` | Allow database connections strictly from App EC2 |
| **Egress** | None | - | - | - | Block all outbound traffic from database tier |

---

## 5. Single-Instance vs. Multi-Instance Production Architecture

### Single-Instance Deployment (Development / Budget Phase)
- **Topology:** A single EC2 instance in a public subnet with an Elastic IP running all Docker containers (`frontend`, `backend`, `mongodb`, `prometheus`, `grafana`).
- **Limitations:**
  1. **Single Point of Failure (SPOF):** If the instance crashes, undergoes AWS hardware maintenance, or runs out of RAM, the entire e-commerce store goes offline.
  2. **Security Compromise:** The compute host must accept direct inbound traffic from the internet, increasing attack exposure.
  3. **No Elastic Scaling:** Cannot handle sudden seasonal traffic spikes (e.g., Black Friday / Diwali flash sales).

### Multi-Instance Production Deployment (CloudCart Production Standard)
- **Topology:** An internet-facing **Application Load Balancer** distributing load across an **Auto Scaling Group** spanning two Availability Zones in private subnets, backed by **MongoDB Atlas** and **Amazon S3**.
- **Resilience:**
  1. **High Availability (HA):** Survives full data-center availability zone outages without customer-facing disruption.
  2. **Zero-Downtime Rolling Updates:** Deploy updated Docker images one instance at a time without dropping connections.
  3. **Elastic Cost Optimization:** Scales out during peak hours and scales down during low-traffic periods automatically.
