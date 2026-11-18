import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'no-reply@cloudcart.com';
const sesClient = new SESClient({ region: AWS_REGION });

/**
 * Formats currency values in Indian Rupees (INR)
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

/**
 * Builds responsive, professional HTML email template for CloudCart receipts
 */
function buildHtmlReceipt(order) {
  const {
    orderId = 'CC-ORD-UNKNOWN',
    customerName = 'Valued Customer',
    items = [],
    totalAmount = 0,
    shippingAddress = {},
    paymentMethod = 'Online Payment',
    createdAt = new Date().toISOString()
  } = order;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsRows = items.map(item => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
        <strong>${item.name || 'CloudCart Product'}</strong>
        ${item.variant ? `<br/><span style="font-size: 12px; color: #64748b;">${item.variant}</span>` : ''}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569; text-align: center;">
        ${item.quantity || 1}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; text-align: right; font-weight: 600;">
        ${formatCurrency(item.price * (item.quantity || 1))}
      </td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - CloudCart</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
      <!-- Header -->
      <tr style="background: linear-gradient(135deg, #1e3a8a 0%, #4338ca 100%);">
        <td style="padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">CloudCart</h1>
          <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 14px;">Cloud-Native E-Commerce Platform</p>
        </td>
      </tr>

      <!-- Order Confirmed Banner -->
      <tr>
        <td style="padding: 24px; text-align: center; border-bottom: 1px solid #e2e8f0;">
          <div style="display: inline-block; background-color: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 13px; margin-bottom: 12px;">
            Order Successfully Placed
          </div>
          <h2 style="margin: 0; font-size: 20px; color: #0f172a;">Thank you, ${customerName}!</h2>
          <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">We're preparing your order. Your invoice and tracking details are below.</p>
        </td>
      </tr>

      <!-- Order Metadata -->
      <tr>
        <td style="padding: 20px 24px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size: 13px; color: #64748b;">Order Number:</td>
              <td style="font-size: 13px; font-weight: 700; color: #0f172a; text-align: right;">#${orderId}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-top: 6px;">Date & Time:</td>
              <td style="font-size: 13px; color: #334155; text-align: right; padding-top: 6px;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #64748b; padding-top: 6px;">Payment Method:</td>
              <td style="font-size: 13px; color: #334155; text-align: right; padding-top: 6px;">${paymentMethod}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Items Table -->
      <tr>
        <td style="padding: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 10px 16px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Item</th>
                <th style="padding: 10px 16px; text-align: center; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Qty</th>
                <th style="padding: 10px 16px; text-align: right; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px; font-size: 15px; font-weight: 700; color: #0f172a; text-align: right;">Grand Total:</td>
                <td style="padding: 16px; font-size: 16px; font-weight: 800; color: #2563eb; text-align: right;">${formatCurrency(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </td>
      </tr>

      <!-- Shipping Info -->
      <tr>
        <td style="padding: 20px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Delivery Address</h3>
          <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.5;">
            ${shippingAddress.address || 'Address on file'}<br/>
            ${shippingAddress.city ? `${shippingAddress.city}, ` : ''}${shippingAddress.postalCode || ''}<br/>
            ${shippingAddress.country || 'India'}
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #ffffff; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 6px 0;">This is an automated transactional receipt generated by CloudCart AWS Serverless Stack.</p>
          <p style="margin: 0;">CloudCart E-Commerce &bull; Hosted on AWS Multi-AZ Mumbai (ap-south-1)</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Main AWS Lambda Handler
 */
export async function handler(event, context) {
  console.log('CloudCart Order Notification Lambda triggered:', JSON.stringify({ requestId: context?.awsRequestId }));

  let orders = [];

  // Parse payload depending on invocation type (Direct HTTP / SQS / EventBridge)
  if (event.Records && Array.isArray(event.Records)) {
    // SQS / SNS Event Records
    orders = event.Records.map(record => {
      try {
        return typeof record.body === 'string' ? JSON.parse(record.body) : record.body;
      } catch (err) {
        console.error('Failed to parse SQS record body:', err);
        return null;
      }
    }).filter(Boolean);
  } else if (event.body) {
    // API Gateway or Lambda Function URL
    try {
      const parsed = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      orders = [parsed];
    } catch (err) {
      console.error('Failed to parse event body:', err);
      orders = [event];
    }
  } else {
    // Direct invocation payload
    orders = [event];
  }

  const results = [];

  for (const order of orders) {
    const orderId = order.orderId || order._id || `ORD-${Date.now()}`;
    const recipientEmail = order.customerEmail || order.userEmail || order.email;

    console.log(`Processing notification for Order ID: ${orderId}, Recipient: ${recipientEmail || 'N/A'}`);

    if (!recipientEmail) {
      console.warn(`Skipping email dispatch: No valid recipient email provided for order ${orderId}`);
      results.push({ orderId, status: 'SKIPPED_NO_RECIPIENT' });
      continue;
    }

    const htmlBody = buildHtmlReceipt(order);
    const subject = `Order Confirmation #${orderId} - CloudCart`;

    const emailParams = {
      Source: SENDER_EMAIL,
      Destination: {
        ToAddresses: [recipientEmail]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `Thank you for your order #${orderId} at CloudCart. Total: ${formatCurrency(order.totalAmount)}. We are preparing your shipment!`,
            Charset: 'UTF-8'
          }
        }
      }
    };

    try {
      console.log(`Attempting Amazon SES SendEmailCommand to ${recipientEmail}...`);
      const sesResponse = await sesClient.send(new SendEmailCommand(emailParams));
      console.log(`SES email dispatched successfully. MessageId: ${sesResponse.MessageId}`);
      results.push({
        orderId,
        status: 'SENT',
        messageId: sesResponse.MessageId,
        recipient: recipientEmail
      });
    } catch (sesError) {
      console.error(`Amazon SES SendEmail failed (Sandbox / Unverified sender or receiver):`, sesError.message);
      // Fallback: in development or SES sandbox mode, log transaction details without crashing
      results.push({
        orderId,
        status: 'SES_SANDBOX_SIMULATED',
        error: sesError.message,
        recipient: recipientEmail
      });
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'CloudCart order notifications processed successfully.',
      processedCount: results.length,
      results
    })
  };
}
