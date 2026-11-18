# CloudCart – Amazon CloudWatch Monitoring & CloudTrail Auditing

> **Target Region:** `ap-south-1` (Mumbai)  
> **Monitoring Scope:** EC2 Compute Instances, Application Load Balancer, S3 Storage, Custom OS Metrics, and CloudTrail Governance  
> **Alerting Channel:** Amazon SNS Topic (`CloudCart-Ops-Alerts-Topic`)

---

## 1. CloudWatch Monitoring Architecture

Amazon CloudWatch delivers comprehensive observability across all layers of the CloudCart production stack.

```
+-----------------------------------------------------------------------------------+
|                            CloudWatch Observability                                |
+-----------------------------------------------------------------------------------+
        ^                               ^                               ^
        |                               |                               |
        | [Hypervisor Metrics]          | [Custom OS Metrics]           | [L7 Request Metrics]
        | - CPUUtilization              | - mem_used_percent            | - TargetResponseTime
        | - StatusCheckFailed           | - disk_used_percent           | - HTTPCode_Target_5XX
        | - NetworkIn / Out             | - /var/log/user-data.log      | - UnHealthyHostCount
        |                               |                               |
+-------------------+           +-------------------+           +-------------------+
|  EC2 Instances    |           | CloudWatch Agent  |           | Application Load  |
|  (Auto Scaling)   |           | (Running on AL2023|           | Balancer (ALB)    |
+-------------------+           +-------------------+           +-------------------+
        |                                                               |
        +-------------------------------+-------------------------------+
                                        |
                                        v
                    +---------------------------------------+
                    | CloudWatch Alarms & Threshold Engines |
                    +---------------------------------------+
                                        |
                                        v
                    +---------------------------------------+
                    | Amazon SNS: CloudCart-Ops-Alerts      |
                    | (Instant Email / SMS Notifications)   |
                    +---------------------------------------+
```

---

## 2. CloudWatch Alarms Specification

### Alarm 1: `CloudCart-High-CPU-Utilization`
- **Metric Name:** `CPUUtilization`
- **Namespace:** `AWS/EC2`
- **Dimension:** `AutoScalingGroupName = ASG-CloudCart`
- **Statistic:** `Average`
- **Period:** `300 seconds (5 minutes)`
- **Evaluation Periods:** `2 consecutive periods` (Datapoints to alarm: 2)
- **Threshold:** `>= 70%`
- **Alarm Description:** Triggers when cluster-wide CPU utilization exceeds 70% for 10 minutes, indicating high shopping traffic or computationally heavy API requests.
- **Action:** Publish to SNS Topic `CloudCart-Ops-Alerts-Topic`.

### Alarm 2: `CloudCart-EC2-StatusCheck-Failed`
- **Metric Name:** `StatusCheckFailed`
- **Namespace:** `AWS/EC2`
- **Dimension:** `AutoScalingGroupName = ASG-CloudCart`
- **Statistic:** `Maximum`
- **Period:** `60 seconds (1 minute)`
- **Evaluation Periods:** `1 period`
- **Threshold:** `>= 1`
- **Alarm Description:** Triggers immediately when either an underlying hardware host issue or OS kernel failure prevents an EC2 instance from responding.
- **Action:**
  - Publish to SNS Topic `CloudCart-Ops-Alerts-Topic`.
  - EC2 Auto-Recovery Action: Automatically reboot or recover instance to a healthy physical host.

### Alarm 3: `CloudCart-High-Memory-Utilization` (Custom OS Metric)
- **Metric Name:** `mem_used_percent`
- **Namespace:** `CloudCart/SystemMetrics`
- **Dimension:** `AutoScalingGroupName = ASG-CloudCart`
- **Statistic:** `Average`
- **Period:** `300 seconds (5 minutes)`
- **Evaluation Periods:** `2 consecutive periods`
- **Threshold:** `>= 85%`
- **Alarm Description:** Warns the DevOps team before an Out-Of-Memory (OOM) killer event kills Node.js backend processes or Nginx containers.
- **Action:** Publish to SNS Topic `CloudCart-Ops-Alerts-Topic`.

### Alarm 4: `CloudCart-ALB-Target-5XX-Errors`
- **Metric Name:** `HTTPCode_Target_5XX_Count`
- **Namespace:** `AWS/ApplicationELB`
- **Dimension:** `LoadBalancer = app/ALB-CloudCart/...`
- **Statistic:** `Sum`
- **Period:** `60 seconds (1 minute)`
- **Evaluation Periods:** `1 period`
- **Threshold:** `>= 10 errors`
- **Alarm Description:** Detects unhandled backend crashes, database timeout disconnections, or syntax faults returning HTTP 500/502/503.
- **Action:** High Priority SNS Notification (`CloudCart-Ops-Alerts-Topic`).

### Alarm 5: `CloudCart-Unhealthy-Host-Count`
- **Metric Name:** `UnHealthyHostCount`
- **Namespace:** `AWS/ApplicationELB`
- **Dimension:** `TargetGroup = targetgroup/TG-CloudCart-Backend/...`
- **Statistic:** `Maximum`
- **Period:** `60 seconds (1 minute)`
- **Evaluation Periods:** `2 consecutive periods`
- **Threshold:** `>= 1`
- **Alarm Description:** Triggers when an instance in the backend target group fails the `/health` check.
- **Action:** Publish to SNS Topic `CloudCart-Ops-Alerts-Topic`.

---

## 3. Amazon Simple Notification Service (SNS) Setup

### SNS Topic Configuration
- **Type:** Standard
- **Name:** `CloudCart-Ops-Alerts-Topic`
- **Display Name:** `CloudCart-Alerts`
- **Encryption:** AWS KMS Server-Side Encryption (`alias/aws/sns`)

### SNS Subscription
- **Protocol:** Email
- **Endpoint:** `devops-team@cloudcart.internal` (or student/evaluator email)
- **Status:** Requires email confirmation click within 3 days.

---

## 4. Amazon CloudTrail Governance & Security Auditing

### Purpose
Amazon CloudTrail records every AWS API call made via the AWS Management Console, AWS CLI, and AWS SDKs, providing compliance, risk auditing, and governance across all CloudCart resources.

### Trail Configuration (`CloudCart-Security-Audit-Trail`)
- **Trail Name:** `CloudCart-Security-Audit-Trail`
- **Apply to all regions:** **Yes** (Captures any global or unauthorized region activity)
- **Storage Location:** S3 Bucket `cloudcart-cloudtrail-logs-ap-south-1-major-project`
- **Log File Validation:** **Enabled** (Uses SHA-256 hashing and RSA signatures to detect any tampering with audit logs)
- **KMS Encryption:** **Enabled** (Server-side encryption using KMS CMK)
- **CloudWatch Logs Integration:** Streamed to Log Group `/aws/cloudtrail/cloudcart-governance` for real-time alerting.

### Monitored Critical Security Events:
1. `ConsoleLogin` without Multi-Factor Authentication (MFA).
2. `AuthorizeSecurityGroupIngress` opening port 22 or 27017 to `0.0.0.0/0`.
3. `DeleteBucket` or `PutBucketPolicy` on S3 product asset storage.
4. `AttachRolePolicy` or `CreateUser` attempting unauthorized privilege escalation.
