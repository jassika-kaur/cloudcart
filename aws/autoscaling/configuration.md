# CloudCart – EC2 Auto Scaling Group (ASG) Configuration Specification

> **Target Region:** `ap-south-1` (Mumbai)  
> **Subnet Placement:** Private Subnet A (`10.0.10.0/24`) & Private Subnet B (`10.0.20.0/24`)  
> **Target Group Attachments:** `TG-CloudCart-Frontend` (Port 3000), `TG-CloudCart-Backend` (Port 5000)  
> **Scaling Metric:** Target Tracking on Average CPU Utilization (70%)

---

## 1. Architectural Concept: Elasticity & High Availability

In a traditional on-premise infrastructure, capacity planning is fixed, leading to either costly over-provisioning during idle hours or catastrophic outages during flash sale events. In AWS, the **Auto Scaling Group (ASG)** dynamically provisions and terminates EC2 instances in response to actual real-time application load.

```
                    Traffic Ingress via ALB (ap-south-1a & ap-south-1b)
                                        |
       +--------------------------------+--------------------------------+
       |                                                                 |
       v (Load < 70% CPU: Baseline)                                       v (Load > 70% CPU: Flash Sale)
+-----------------------------+                                   +-----------------------------+
|    ASG Desired Capacity: 2  |                                   |    ASG Scales Out to: 4     |
| [EC2 Instance 1 (AZ-1a)]    |                                   | [EC2 Instance 1 (AZ-1a)]    |
| [EC2 Instance 2 (AZ-1b)]    |                                   | [EC2 Instance 2 (AZ-1b)]    |
+-----------------------------+                                   | [EC2 Instance 3 (AZ-1a)]    |
       |                                                          | [EC2 Instance 4 (AZ-1b)]    |
       |                                                          +-----------------------------+
       v                                                                         |
  CloudWatch Target Tracking Alarm ----------------------------------------------+
  (Scale-out when Avg CPU > 70% for 3 mins; Scale-in when Avg CPU < 40%)
```

---

## 2. Core Concepts: Horizontal vs. Vertical Scaling

| Dimension | Horizontal Scaling (Scaling Out / In) | Vertical Scaling (Scaling Up / Down) |
| :--- | :--- | :--- |
| **Definition** | Adding or removing more instances of the same size (e.g., going from 2 to 4 `t3.small` nodes). | Increasing or decreasing instance horsepower (e.g., resizing `t3.small` to `m5.xlarge`). |
| **CloudCart Choice** | **Adopted for CloudCart.** Application is stateless (JWT auth + S3 images + external DB), enabling seamless load distribution. | Not adopted. Requires instance restarts (causing downtime) and hits hard physical machine boundaries. |
| **Downtime** | **Zero downtime.** ALB smoothly drains connections from terminating instances and warms up new ones. | **Requires maintenance window** and instance restart. |
| **Cost Efficiency** | High. Automatically contracts capacity during night hours to minimize AWS bill. | Lower. Continues paying high flat rates regardless of fluctuations. |

---

## 3. EC2 Launch Template Specification (`LT-CloudCart-v1`)

The Launch Template defines the exact software blueprint used whenever ASG provisions a new instance.

- **Launch Template Name:** `LT-CloudCart-v1`
- **Template Version Description:** `Production Amazon Linux 2023 with CloudCart Container Stack`
- **AMI ID:** `Amazon Linux 2023 AMI` (`al2023-ami-*-kernel-6.1-x86_64`)
- **Instance Type:** `t3.small` (2 vCPU, 2 GB RAM; suitable for production containerized workloads. Note: `t2.micro` can be selected for Free Tier testing).
- **Key Pair:** *Proceed without a key pair* (Recommended for zero-trust security; instances are managed using AWS Systems Manager Session Manager).
- **Network Settings:**
  - **Subnet:** *Do not include in launch template* (ASG selects subnets).
  - **Auto-assign Public IP:** **Disable** (Instances reside exclusively in private subnets).
  - **Security Group:** `EC2-App-SG` (Allows port 3000 and 5000 only from `ALB-SG`).
- **Storage (Volumes):**
  - **Volume 1 (Root):** 30 GiB, General Purpose SSD (`gp3`), IOPS: 3000, Throughput: 125 MB/s, Encrypted: Yes (`aws/ebs`).
- **Advanced Details:**
  - **IAM Instance Profile:** `CloudCart-EC2-Instance-Profile`
  - **Metadata Version:** **IMDSv2 (Token required, Hop limit: 1)**
  - **User Data:** Embed the full contents of `cloudcart/aws/ec2/user-data.sh`.

---

## 4. Auto Scaling Group Configuration (`ASG-CloudCart`)

- **Name:** `ASG-CloudCart`
- **Launch Template:** `LT-CloudCart-v1` (Version: Latest)
- **VPC:** `VPC-CloudCart` (`10.0.0.0/16`)
- **Subnets:**
  - `Private Subnet A` (`10.0.10.0/24`) in `ap-south-1a`
  - `Private Subnet B` (`10.0.20.0/24`) in `ap-south-1b`
- **Load Balancing:**
  - **Attach to an existing load balancer:** Yes
  - **Target Groups:**
    - `TG-CloudCart-Frontend` (Port 3000)
    - `TG-CloudCart-Backend` (Port 5000)
- **Health Checks:**
  - **Turn on Elastic Load Balancing (ELB) health checks:** **Checked**
  - **Health check grace period:** `300 seconds` (Allows Docker images to pull and containers to start before evaluating health status).
- **Group Size & Scaling Limits:**
  - **Minimum capacity:** `2` (Guarantees multi-AZ redundancy at all times)
  - **Desired capacity:** `2`
  - **Maximum capacity:** `4` (Restricts cost burst ceiling during traffic surges)

---

## 5. Dynamic Scaling Policy: Target Tracking

- **Policy Name:** `CloudCart-TargetTracking-CPU70`
- **Metric Type:** `ASGAverageCPUUtilization`
- **Target Value:** `70.0%`
- **Instance Warm-up:** `180 seconds`
- **Disable Scale-in:** `False` (Enables automated downsizing when traffic subsides)

### Operational Mechanics:
1. **Scale-Out Trigger:** When traffic causes average CPU across all running instances to exceed 70% for 3 consecutive minutes, ASG launches 1 or 2 new EC2 instances in the underutilized Availability Zone.
2. **Registration:** Newly launched instances run `user-data.sh`, pull `jassikakaur/cloudcart-frontend:v1.0.0` and `jassikakaur/cloudcart-backend:v1.0.0`, pass health checks on `/health` and `/`, and ALB immediately begins routing customer traffic to them.
3. **Scale-In Trigger:** When flash sale traffic decreases and CPU drops below 40%, ASG marks the oldest instance for termination, drains active in-flight HTTP connections through ALB deregistration delay (30 seconds), and terminates the instance safely without dropping requests.

---

## 6. AWS Console Deployment Steps

1. Go to **EC2** > **Launch Templates** > **Create launch template**.
   - Input the settings defined in Section 3 and paste `cloudcart/aws/ec2/user-data.sh` into **User data**. Click **Create launch template**.
2. Go to **EC2** > **Auto Scaling Groups** > **Create Auto Scaling group**.
   - Name: `ASG-CloudCart`. Select `LT-CloudCart-v1`.
   - Network: Select `VPC-CloudCart` and both private subnets (`Private Subnet A` & `Private Subnet B`).
   - Load balancing: Attach to existing target groups `TG-CloudCart-Frontend` and `TG-CloudCart-Backend`. Check **Elastic Load Balancing health checks** with a 300s grace period.
   - Group size: Min: 2, Desired: 2, Max: 4.
   - Scaling policies: Select **Target tracking scaling policy**, metric **Average CPU utilization**, Target value **70**.
   - Review and click **Create Auto Scaling group**.
3. Verification: Within 3-5 minutes, two EC2 instances will transition from `Pending` to `InService` in EC2 Console, and Target Groups will show both instances as `healthy`.
