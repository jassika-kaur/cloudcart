# CloudCart – Amazon CloudWatch Unified Operational Dashboard

> **Dashboard Name:** `CloudCart-Production-Overview`  
> **AWS Region:** `ap-south-1` (Mumbai)  
> **Refresh Rate:** 1 Minute Automatic Refresh  
> **Configuration Source:** `cloudcart/aws/cloudwatch/dashboard-config.json`

---

## 1. Dashboard Layout & Operational Metrics

The CloudWatch Dashboard consolidates high-frequency telemetry from Compute, Load Balancing, Custom OS Agents, and Object Storage into a single operational pane.

| Widget Title | Source Namespace | Primary Metrics Displayed | Purpose & Normal Operating Range |
| :--- | :--- | :--- | :--- |
| **EC2 Cluster CPU Utilization (%)** | `AWS/EC2` | `CPUUtilization` (Average & Maximum across `ASG-CloudCart`) | Tracks processing load across the auto-scaling cluster. Normal: 15% - 50%. High: > 70% (triggers ASG scale-out). |
| **EC2 Cluster Memory Utilization (%)** | `CloudCart/SystemMetrics` | `mem_used_percent` (Collected via CloudWatch Agent) | Prevents Out-Of-Memory (OOM) fatal process termination in Node.js backend. Normal: 40% - 65%. Critical: > 85%. |
| **ALB Total Requests & Target Latency** | `AWS/ApplicationELB` | `RequestCount` (Sum), `TargetResponseTime` (Avg) | Evaluates shopping traffic volume and backend API response speed. Target: < 150 ms per request. |
| **ALB Status Code Breakdown** | `AWS/ApplicationELB` | `HTTPCode_Target_2XX`, `4XX`, `5XX` (Stacked) | Visualizes HTTP status ratio. 5XX errors should strictly remain at 0; surges trigger alarms. |
| **Backend Target Group Health State** | `AWS/ApplicationELB` | `HealthyHostCount`, `UnHealthyHostCount` | Verifies active instances responding to `/health` probes. Normal: Healthy >= 2, Unhealthy = 0. |
| **S3 Bucket Size & Media Objects** | `AWS/S3` | `BucketSizeBytes`, `NumberOfObjects` | Tracks growth of product catalog images, disk capacity usage, and media uploads. |

---

## 2. Deploying Dashboard via AWS CLI

To deploy or update this dashboard using the AWS Command Line Interface:

```bash
aws cloudwatch put-dashboard \
    --region ap-south-1 \
    --dashboard-name "CloudCart-Production-Overview" \
    --dashboard-body file://cloudcart/aws/cloudwatch/dashboard-config.json
```

---

## 3. Creating the Dashboard Manually in AWS Console

1. Navigate to **CloudWatch** in the AWS Management Console (`ap-south-1`).
2. In the navigation sidebar, click **Dashboards** > click **Create dashboard**.
3. Enter Dashboard name: `CloudCart-Production-Overview`.
4. Click **Actions** in the top-right corner of the dashboard builder, select **View/edit source**.
5. Paste the contents of `cloudcart/aws/cloudwatch/dashboard-config.json` directly into the JSON editor.
6. Click **Update** and then **Save dashboard**.
