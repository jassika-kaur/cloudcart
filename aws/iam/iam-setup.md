# CloudCart – AWS Identity & Access Management (IAM) Configuration

> **Security Principle:** Principle of Least Privilege (PoLP)  
> **AWS Region:** `ap-south-1` (Mumbai)  
> **Evaluation Reference:** Enterprise IAM Architecture & Cloud Security Governance

---

## 1. Overview of IAM Identities

CloudCart avoids the dangerous practice of hardcoding AWS IAM User access keys (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) inside server code or container images. Instead, temporary, rotatable credentials are provided through **IAM Roles** and the **EC2 Instance Metadata Service (IMDSv2)**.

```
+-----------------------------------------------------------------------------------+
|                                  IAM Hierarchy                                    |
+-----------------------------------------------------------------------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
        v                                                                   v
+-------------------------------+                         +-----------------------------------+
|  Role: CloudCart-EC2-AppRole  |                         | Role: CloudCart-Lambda-ExecRole   |
|  (Assumed by ec2.amazonaws.com|                         | (Assumed by lambda.amazonaws.com) |
+-------------------------------+                         +-----------------------------------+
        |                                                                   |
        +---> Policy: CloudCart-S3-Policy                                   +---> AWSLambdaBasicExecutionRole
        +---> Policy: CloudCart-CloudWatch-Policy                           +---> Policy: CloudCart-SES-SendEmail
        |
        v
+---------------------------------------+
| Instance Profile:                     |
| CloudCart-EC2-Instance-Profile        |
| Attached to EC2 ASG Instances         |
+---------------------------------------+
```

---

## 2. IAM Role 1: EC2 Application Instance Role

### Purpose
Allows the Docker containers running on the EC2 instances to interact securely with AWS S3 (for product image uploads and pre-signed download URLs) and CloudWatch (for sending system metrics and container logs).

### Component Details
1. **Role Name:** `CloudCart-EC2-AppRole`
2. **Trust Relationship (`ec2-instance-role-policy.json`):**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": { "Service": "ec2.amazonaws.com" },
         "Action": "sts:AssumeRole"
       }
     ]
   }
   ```
3. **Attached Policies:**
   - **`CloudCart-S3-Access-Policy`** (defined in `policies/s3-access-policy.json`): Grants `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, and `s3:ListBucket` strictly scoped to bucket `cloudcart-product-images-ap-south-1-major-project`. Explicitly denies unencrypted HTTP requests (`aws:SecureTransport: false`).
   - **`CloudCart-CloudWatch-Agent-Policy`** (defined in `policies/cloudwatch-agent-policy.json`): Grants permission to stream metrics (`PutMetricData`) and logs to CloudWatch Log Group `/aws/ec2/cloudcart/*`.
   - **`AmazonSSMManagedInstanceCore`** (AWS Managed Policy): Enables AWS Systems Manager Session Manager access so engineers can securely open a web shell into instances in private subnets without opening port 22 or managing SSH key pairs.

4. **EC2 Instance Profile:**
   - **Instance Profile Name:** `CloudCart-EC2-Instance-Profile`
   - Must be assigned during Launch Template creation and attached to the EC2 instances.

---

## 3. IAM Role 2: Serverless Lambda Execution Role

### Purpose
Grants AWS Lambda the necessary permissions to process order creation events, log execution details to CloudWatch, and dispatch transactional order confirmation receipts to customers using Amazon Simple Email Service (SES).

### Component Details
1. **Role Name:** `CloudCart-Lambda-OrderNotificationRole`
2. **Trust Relationship:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": { "Service": "lambda.amazonaws.com" },
         "Action": "sts:AssumeRole"
       }
     ]
   }
   ```
3. **Attached Policies:**
   - `cloudcart/aws/iam/policies/lambda-order-notification-policy.json`: Permits `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` for `/aws/lambda/cloudcart-order-notification`, and `ses:SendEmail`/`ses:SendRawEmail`.

---

## 4. Step-by-Step AWS Management Console Setup

### Step 4.1: Create Custom S3 Access Policy
1. Navigate to **IAM** > **Policies** > click **Create policy**.
2. Select the **JSON** tab and paste the contents of `cloudcart/aws/iam/policies/s3-access-policy.json`.
3. Click **Next**, name the policy `CloudCart-S3-Access-Policy`, and click **Create policy**.

### Step 4.2: Create CloudWatch Agent Policy
1. In **IAM** > **Policies** > click **Create policy**.
2. Select the **JSON** tab and paste the contents of `cloudcart/aws/iam/policies/cloudwatch-agent-policy.json`.
3. Click **Next**, name the policy `CloudCart-CloudWatch-Agent-Policy`, and click **Create policy**.

### Step 4.3: Create EC2 Application IAM Role
1. Navigate to **IAM** > **Roles** > click **Create role**.
2. Select **AWS service** as the Trusted entity type and select **EC2** as the Use case.
3. In the Permissions search box, select:
   - `CloudCart-S3-Access-Policy`
   - `CloudCart-CloudWatch-Agent-Policy`
   - `AmazonSSMManagedInstanceCore`
4. Set Role Name to: `CloudCart-EC2-AppRole`.
5. Review and click **Create role**. AWS automatically creates the corresponding Instance Profile with the same name.

### Step 4.4: Create Lambda Notification Role
1. Navigate to **IAM** > **Roles** > click **Create role**.
2. Select **AWS service** > **Lambda**.
3. Create inline or managed policy from `cloudcart/aws/iam/policies/lambda-order-notification-policy.json`.
4. Set Role Name to: `CloudCart-Lambda-OrderNotificationRole` and click **Create role**.

---

## 5. Security & Audit Verification
- **IMDSv2 Enforcement:** Ensure all EC2 instances require IMDSv2 (Token-based metadata access with Hop Limit = 1) to protect against SSRF credential theft.
- **Audit Logging:** Every AssumeRole and S3 access call is tracked in **AWS CloudTrail** for enterprise compliance and auditing.
