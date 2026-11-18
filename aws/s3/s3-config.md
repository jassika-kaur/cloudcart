# CloudCart – Amazon S3 Product Media Storage Configuration

> **AWS Service:** Amazon Simple Storage Service (Amazon S3)  
> **Region:** `ap-south-1` (Mumbai)  
> **Bucket Name Pattern:** `cloudcart-media-<aws-account-id>-ap-south-1`  
> **Security Baseline:** Default Encryption Enabled (SSE-S3), Block Public Access Enabled

---

## 1. Bucket Purpose and Security Philosophy

CloudCart uses Amazon S3 to store all high-resolution product photography, category thumbnails, and user avatar uploads. 

By offloading static media files from local container filesystems to Amazon S3:
1. **Stateless Compute:** EC2 instances running Docker containers remain completely ephemeral and stateless. When Auto Scaling launches or terminates instances, no user product photos are lost.
2. **Durability & Availability:** Amazon S3 Standard provides 99.999999999% (11 9's) data durability and 99.99% availability.
3. **Least Privilege & No Hardcoded Keys:** Compute instances connect to S3 using the **EC2 IAM Instance Profile** (`CloudCart-EC2-Instance-Role`). No `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` credentials exist in `.env`, Dockerfiles, or Git.

---

## 2. Step-by-Step Creation via AWS Management Console

1. Navigate to the **Amazon S3 Console** in AWS Mumbai (`ap-south-1`).
2. Click **Create bucket**.
3. **Bucket name:** `cloudcart-media-<unique-id>-ap-south-1` (S3 bucket names must be globally unique across all AWS accounts).
4. **AWS Region:** Select `Asia Pacific (Mumbai) ap-south-1`.
5. **Block Public Access settings:**
   - Keep **Block all public access** checked (**RECOMMENDED**).
   - All 4 checkboxes enabled:
     - *Block public ACLs*
     - *Ignore public ACLs*
     - *Block public bucket policies*
     - *Restrict public buckets*
6. **Bucket Versioning:** Keep *Disabled* (or Enable if revision tracking is desired).
7. **Default Encryption:**
   - Encryption type: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**.
   - Bucket Key: **Enable** (reduces encryption request costs).
8. Click **Create bucket**.

---

## 3. S3 Cross-Origin Resource Sharing (CORS) Configuration

To permit web browsers on `http://localhost:3000` or production domains to display images fetched directly from S3, configure the bucket's CORS rules:

1. In the S3 Console, open your bucket and select the **Permissions** tab.
2. Scroll down to **Cross-origin resource sharing (CORS)** and click **Edit**.
3. Paste the following JSON configuration:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://*.cloudfront.net",
      "https://cloudcart.yourdomain.com"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 4. Secure Access Modes: Presigned URLs vs. CloudFront OAC

CloudCart supports two enterprise access patterns:

### Pattern A: Presigned URLs (Strict Private Storage)
- The S3 bucket remains 100% private with no public internet access.
- When an authenticated user requests an image, the backend calls `@aws-sdk/s3-request-presigner` to generate a cryptographic signature valid for 1 hour (`expiresIn: 3600`).
- **Endpoint:** `GET /api/products/presigned-url?key=products/12345.jpg`

### Pattern B: Amazon CloudFront CDN with Origin Access Control (OAC)
- An Amazon CloudFront distribution acts as a global caching edge layer in front of the S3 bucket.
- The S3 bucket policy grants read access strictly to the CloudFront distribution principal, maintaining strict private bucket status while caching images across AWS Edge locations in India (Mumbai, New Delhi, Bengaluru, Chennai, Hyderabad, Kolkata).

#### Example S3 Bucket Policy for CloudFront OAC:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::cloudcart-media-<account-id>-ap-south-1/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>"
        }
      }
    }
  ]
}
```
