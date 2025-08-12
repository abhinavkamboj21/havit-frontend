# 🚀 Razorpay Integration Setup Guide

This guide follows the official [Razorpay Java Integration Steps](https://razorpay.com/docs/payments/server-integration/java/integration-steps/) for proper implementation.

## 📋 Prerequisites

### 1. Create Razorpay Account
- Visit [razorpay.com](https://razorpay.com) and sign up
- Complete business verification process
- Access your Razorpay Dashboard

### 2. Generate API Keys
- Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
- Go to **Settings** → **API Keys**
- Generate **Test Mode** keys for development
- Download and save your credentials securely

## 🔧 Frontend Setup

### 1. Environment Variables
Create a `.env.local` file in your project root:

```bash
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_V3xIRiVV7cvytT

# API Base URL
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 2. Update Your Keys
Replace `rzp_test_YOUR_KEY_ID` with your actual Razorpay Key ID from the dashboard.

## 🏦 Backend Integration Points

The frontend expects these API endpoints to be implemented:

### 1. Create Order Endpoint
```
POST /api/v1/wallet/deposit
```
- Should create Razorpay order using Orders API
- Return `orderId`, `amount`, `transactionId`

### 2. Verify Payment Endpoint
```
POST /api/v1/payment/verify
```
- Should verify payment signature using HMAC SHA256
- Parameters: `orderId`, `paymentId`, `signature`, `transactionId`

## 🎯 Payment Flow

### Frontend Flow:
1. User fills deposit form
2. API call creates Razorpay order
3. Razorpay checkout opens with order details
4. User completes payment
5. Payment verification sent to backend
6. Wallet balance updated

### Key Features:
- ✅ **Official Razorpay Integration**: Follows standard checkout flow
- ✅ **Payment Method Selection**: UPI, Cards, Net Banking
- ✅ **Signature Verification**: HMAC SHA256 security
- ✅ **Error Handling**: Comprehensive error management
- ✅ **User Feedback**: Real-time status updates

## 🧪 Testing

### Test Cards (from Razorpay Docs):
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date (MM/YY)
- **CVV**: Any 3-digit number
- **UPI**: `success@razorpay` for successful payments

### Test Flow:
1. Use test API keys in development
2. Make test payments with test cards
3. Verify payments are captured on Razorpay Dashboard
4. Check webhook notifications (if configured)

## 🔒 Security Features

### Payment Security:
- **SSL/TLS Encryption**: All communications encrypted
- **HMAC Signature**: Payment verification using SHA256
- **API Key Security**: Client-side key only for checkout
- **Order Validation**: Server-side order creation

### Best Practices:
- Never expose secret keys on frontend
- Always verify payments on backend
- Use HTTPS in production
- Set up webhooks for real-time updates

## 📱 Production Deployment

### 1. Switch to Live Mode
- Generate Live Mode API keys from Razorpay Dashboard
- Update environment variables with live keys
- Test with small amounts initially

### 2. Configure Webhooks
- Add webhook URL: `https://yourdomain.com/api/v1/wallet/payment-webhook`
- Select events: `payment.captured`, `payment.failed`
- Verify webhook signatures for security

### 3. Setup Settlement
- Configure settlement schedule
- Add bank account details
- Enable auto-capture for payments

## 🎨 UI/UX Features

### Modal Experience:
- **Clean Design**: Professional payment interface
- **Razorpay Branding**: "Powered by Razorpay" messaging
- **Payment Method Icons**: Visual payment options
- **Real-time Feedback**: Status updates and confirmations
- **Error Handling**: User-friendly error messages

### Mobile Responsive:
- Works seamlessly on all devices
- Touch-friendly interface
- Optimized checkout experience

## 📞 Support

### Razorpay Resources:
- [Integration Guide](https://razorpay.com/docs/payments/server-integration/java/integration-steps/)
- [Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Webhooks](https://razorpay.com/docs/webhooks/)
- [Dashboard](https://dashboard.razorpay.com)

### Implementation Notes:
- Frontend uses official Razorpay checkout script
- Payment verification follows HMAC SHA256 standard
- Error handling covers all edge cases
- User experience optimized for conversion

---

**Ready to accept payments!** 💰 The integration follows Razorpay's official standards for security and reliability.