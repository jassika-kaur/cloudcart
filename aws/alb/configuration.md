# CloudCart – Application Load Balancer (ALB) Configuration Specification

> **Target Region:** `ap-south-1` (Mumbai)  
> **Placement:** Public Subnet A (`10.0.1.0/24`) & Public Subnet B (`10.0.2.0/24`)  
> **Scheme:** Internet-Facing, IPv4  
> **Security Group:** `ALB-SG`

---

## 1. Architectural Role

The Application Load Balancer (ALB) functions as the single public entry point for CloudCart, operating at Layer 7 (Application Layer) of the OSI model. It distributes incoming web traffic across redundant EC2 instances running inside private subnets across multiple Availability Zones (`ap-south-1a` and `ap-south-1b`).

```
                                    [ CLIENT BROWSER / MOBILE APP ]
                                                  |
                                                  | HTTPS (443) / HTTP (80)
                                                  v
                      +--------------------------------------------------------+
                      |       Application Load Balancer (Dual-AZ: 1a / 1b)     |
                      |                 Security Group: ALB-SG                 |
                      +--------------------------------------------------------+
                                                  |
                        +-------------------------+-------------------------+
                        |                                                   |
      Path: /* (Default) |                                 Path: /api/* or   |
                        v                                       /uploads/*  v
       +---------------------------------+                 +---------------------------------+
       |   Target Group: TG-Frontend     |                 |    Target Group: TG-Backend     |
       |   Protocol: HTTP, Port: 3000    |                 |    Protocol: HTTP, Port: 5000   |
       |   Health Check: / (HTTP 200)    |                 |    Health Check: /health (200)  |
       +---------------------------------+                 +---------------------------------+
                        |                                                   |
         +--------------+--------------+                     +--------------+--------------+
         |                             |                     |                             |
         v                             v                     v                             v
+------------------+          +------------------+  +------------------+          +------------------+
| EC2 Instance 1   |          | EC2 Instance 2   |  | EC2 Instance 1   |          | EC2 Instance 2   |
| Frontend :3000   |          | Frontend :3000   |  | Backend  :5000   |          | Backend  :5000   |
+------------------+          +------------------+  +------------------+          +------------------+
```

---

## 2. Target Group Definitions

### Target Group 1: `TG-CloudCart-Frontend`
- **Target Type:** Instances
- **Protocol:** HTTP
- **Port:** 3000
- **VPC:** `VPC-CloudCart` (`10.0.0.0/16`)
- **Protocol Version:** HTTP/1.1
- **Health Check Configuration:**
  - **Protocol:** HTTP
  - **Path:** `/`
  - **Port:** Traffic port (3000)
  - **Healthy threshold:** 2 consecutive successes
  - **Unhealthy threshold:** 2 consecutive failures
  - **Timeout:** 5 seconds
  - **Interval:** 15 seconds
  - **Success code:** 200

### Target Group 2: `TG-CloudCart-Backend`
- **Target Type:** Instances
- **Protocol:** HTTP
- **Port:** 5000
- **VPC:** `VPC-CloudCart` (`10.0.0.0/16`)
- **Protocol Version:** HTTP/1.1
- **Health Check Configuration:**
  - **Protocol:** HTTP
  - **Path:** `/health`
  - **Port:** Traffic port (5000)
  - **Healthy threshold:** 2 consecutive successes
  - **Unhealthy threshold:** 3 consecutive failures
  - **Timeout:** 5 seconds
  - **Interval:** 15 seconds
  - **Success code:** 200

---

## 3. Listeners & Intelligent Path-Based Routing Rules

### Listener 1: HTTP (Port 80) – Automatic SSL Redirect
Forces all non-secure HTTP traffic to upgrade immediately to encrypted HTTPS.
- **Protocol:** HTTP
- **Port:** 80
- **Default Action:** **Redirect**
  - **Protocol:** HTTPS
  - **Port:** 443
  - **Status code:** `301 - Permanently moved`

### Listener 2: HTTPS (Port 443) – Production Ingress
Terminates TLS/SSL and distributes requests based on URL path patterns.
- **Protocol:** HTTPS
- **Port:** 443
- **Security Policy:** `ELBSecurityPolicy-TLS13-1-2-2021-06` (Supports TLS 1.3 and TLS 1.2 with secure cipher suites)
- **Default SSL/TLS Certificate:** Issued by AWS Certificate Manager (ACM)
- **Rules Hierarchy:**

| Priority | Rule Name | Condition (IF) | Action (THEN) | Explanation |
| :--- | :--- | :--- | :--- | :--- |
| **Rule 1** | API & Uploads Routing | Path pattern is `/api/*` OR `/uploads/*` | **Forward to:** `TG-CloudCart-Backend` | Directs all RESTful API calls and uploaded media retrieval to the Express backend cluster. |
| **Default** | Frontend Single Page App | Default rule (all unmatched paths: `/*`) | **Forward to:** `TG-CloudCart-Frontend` | Directs page navigation, HTML, JavaScript bundles, and static assets to the Nginx frontend cluster. |

---

## 4. SSL/TLS Certificate Integration (AWS Certificate Manager - ACM)

1. **Domain Request:** Request a public wildcard certificate (e.g., `cloudcart.yourdomain.com` and `*.cloudcart.yourdomain.com`) in ACM in `ap-south-1`.
2. **Validation:** Use **DNS validation** by creating CNAME records in Route 53 or your DNS provider.
3. **Automatic Renewal:** AWS ACM manages automatic renewal at 60 days before expiration at zero additional cost.
4. **End-to-End Security:** The ALB decrypts incoming HTTPS traffic from clients, inspects paths, and forwards requests internally over the private VPC subnet to EC2 instances.

---

## 5. Security Group Requirements (`ALB-SG`)

| Type | Protocol | Port Range | Source / Destination | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Inbound** | TCP | 80 | `0.0.0.0/0` (Anywhere) | Allow public HTTP for 301 redirection |
| **Inbound** | TCP | 443 | `0.0.0.0/0` (Anywhere) | Allow public secure HTTPS traffic |
| **Outbound** | TCP | 3000 | `EC2-App-SG` (ID: `sg-app...`) | Forward client requests to frontend containers |
| **Outbound** | TCP | 5000 | `EC2-App-SG` (ID: `sg-app...`) | Forward API requests to backend containers |

---

## 6. Step-by-Step AWS Management Console Deployment

1. **Open AWS Console** and navigate to **EC2** > **Target Groups** (under *Load Balancing*).
   - Click **Create target group**.
   - Select **Instances**, name it `TG-CloudCart-Frontend`, set Port `3000`, VPC `VPC-CloudCart`. Set Health check path to `/`. Click **Create target group**.
   - Repeat for `TG-CloudCart-Backend`, setting Port `5000` and Health check path to `/health`.
2. Navigate to **EC2** > **Load Balancers** > click **Create load balancer**.
   - Select **Application Load Balancer** > **Create**.
   - Name: `ALB-CloudCart`.
   - Scheme: **Internet-facing**, IP address type: **IPv4**.
   - VPC: Select `VPC-CloudCart`.
   - Subnets: Select `Public Subnet A (ap-south-1a)` and `Public Subnet B (ap-south-1b)`.
   - Security groups: Select `ALB-SG`.
3. **Configure Listeners:**
   - Add listener on **HTTP (80)**: Action -> Redirect to HTTPS 443.
   - Add listener on **HTTPS (443)**: Default action -> Forward to `TG-CloudCart-Frontend`. Select ACM Certificate.
4. **Add Path-Based Rule on HTTPS (443):**
   - Click **View/edit rules** on HTTPS listener.
   - Click **+ Add rule**.
   - Name: `Backend-API-Rule`.
   - Condition: **Path** is `/api/*` and `/uploads/*`.
   - Action: **Forward to** `TG-CloudCart-Backend`.
   - Save the rule.
5. Verification: Once EC2 instances register with Target Groups and pass health checks, the ALB DNS name will resolve and serve CloudCart.
