# CloudCart – Serverless Order Notification Service (AWS Lambda + SES)

> **Runtime:** Node.js 20.x (ESM)  
> **AWS Service:** AWS Lambda & Amazon Simple Email Service (SES)  
> **Region:** `ap-south-1` (Mumbai)  
> **IAM Role:** `CloudCart-Lambda-OrderNotificationRole`

---

## 1. Architecture & Execution Flow

When a customer successfully completes checkout on CloudCart, the backend triggers this serverless function asynchronously. This decouples long-running email delivery operations from user checkout response times.

```
[ Customer Checkout ]
        |
        v
[ CloudCart Backend API: POST /api/orders ]
        |
        | (Asynchronous Event / Direct Lambda Invoke / SQS)
        v
[ AWS Lambda: cloudcart-order-notification ]
        |
        +---> Renders Branded HTML Receipt (Invoice, Items, Pricing, Delivery Address)
        |
        v
[ Amazon SES: SendEmail ]
        |
        +---> Delivers Transactional Email to Customer Inbox
        |
        +---> Emits Structured Execution Telemetry to CloudWatch Logs
```

---

## 2. Event Payload Schema

The Lambda handler accepts direct payloads or SQS batches formatted as follows:

```json
{
  "orderId": "ORD-2026-89412",
  "customerName": "Rohan Sharma",
  "customerEmail": "customer@cloudcart.com",
  "totalAmount": 14999,
  "paymentMethod": "Credit Card",
  "createdAt": "2026-03-15T10:30:00.000Z",
  "shippingAddress": {
    "address": "402, High Street Park",
    "city": "Mumbai",
    "postalCode": "400001",
    "country": "India"
  },
  "items": [
    {
      "name": "Wireless Noise Cancelling Headphones",
      "quantity": 1,
      "price": 9999,
      "variant": "Midnight Black"
    },
    {
      "name": "Fast Wireless Charging Dock 15W",
      "quantity": 1,
      "price": 5000,
      "variant": "Standard"
    }
  ]
}
```

---

## 3. Deployment Instructions via AWS Console

1. **Package Function Code:**
   In your local terminal:
   ```bash
   cd cloudcart/aws/lambda/order-notification
   npm install --production
   zip -r order-notification.zip index.js package.json node_modules/
   ```

2. **Create Lambda Function in AWS Console:**
   - Navigate to **AWS Lambda** in `ap-south-1`.
   - Click **Create function** > **Author from scratch**.
   - **Function name:** `cloudcart-order-notification`.
   - **Runtime:** `Node.js 20.x`.
   - **Architecture:** `x86_64`.
   - **Execution role:** Select *Use an existing role* > select `CloudCart-Lambda-OrderNotificationRole`.
   - Click **Create function**.

3. **Upload Code:**
   - Under the **Code** tab, click **Upload from** > select `.zip file` > upload `order-notification.zip`.

4. **Environment Variables:**
   - Under **Configuration** > **Environment variables**, configure:
     - `AWS_REGION`: `ap-south-1`
     - `SENDER_EMAIL`: `orders@cloudcart.yourdomain.com` (or verified email address in SES)

5. **Amazon SES Verification:**
   - Navigate to **Amazon Simple Email Service (SES)** in Mumbai (`ap-south-1`).
   - Under **Verified identities**, verify your sender domain or email address.
   - *Note on SES Sandbox:* While in the AWS SES Sandbox, destination email addresses must also be verified identities before AWS SES allows delivery. The Lambda function handles sandbox restrictions gracefully with simulated fallback logging.
