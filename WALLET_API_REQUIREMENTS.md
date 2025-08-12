# 💰 Wallet Management API Requirements

## Overview
This document outlines the required backend APIs for implementing wallet functionality in the Hav-It wake-up challenge application. Users need to add funds to their wallet to create challenges and withdraw their winnings.

---

## 🔐 Authentication
All wallet APIs require JWT authentication via `Authorization: Bearer <token>` header.

---

## 📋 Core Wallet APIs

### 1. Get Wallet Balance
**Endpoint:** `GET /api/wallet/balance`

**Description:** Retrieve current user wallet balance

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 1500.00,
    "currency": "INR",
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "WALLET_NOT_FOUND",
    "message": "User wallet not found"
  }
}
```

---

### 2. Add Funds (Deposit)
**Endpoint:** `POST /api/wallet/deposit`

**Description:** Initiate deposit to user wallet

**Request Body:**
```json
{
  "amount": 500.00,
  "paymentMethod": "UPI|CARD|NET_BANKING",
  "paymentDetails": {
    "upiId": "user@paytm",           // Required for UPI
    "cardToken": "encrypted_token",   // Required for CARD
    "bankCode": "HDFC"               // Required for NET_BANKING
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "TXN_123456789",
    "amount": 500.00,
    "status": "PENDING",
    "paymentGatewayUrl": "https://razorpay.com/checkout/...",
    "orderId": "order_xyz123",
    "estimatedCompletionTime": "2024-01-15T10:35:00Z"
  }
}
```

**Validation Rules:**
- Minimum amount: ₹10
- Maximum amount: ₹1,00,000
- Amount must be positive number
- Valid payment method required

---

### 3. Withdraw Funds
**Endpoint:** `POST /api/wallet/withdraw`

**Description:** Initiate withdrawal from user wallet

**Request Body:**
```json
{
  "amount": 300.00,
  "withdrawalMethod": "BANK_TRANSFER|UPI",
  "bankDetails": {
    "accountNumber": "1234567890",
    "ifscCode": "HDFC0001234",
    "accountHolderName": "John Doe",
    "bankName": "HDFC Bank"
  },
  "upiId": "user@paytm"  // Required only for UPI withdrawal
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "WTH_987654321",
    "amount": 300.00,
    "status": "PENDING",
    "estimatedCompletionTime": "2024-01-16T10:30:00Z",
    "processingFee": 5.00,
    "netAmount": 295.00
  }
}
```

**Validation Rules:**
- Minimum withdrawal: ₹100
- Maximum withdrawal: ₹25,000 per day
- Sufficient balance required
- Valid bank details for BANK_TRANSFER
- Valid UPI ID for UPI withdrawal

---

### 4. Validate Withdrawal Request
**Endpoint:** `POST /api/wallet/withdraw/validate`

**Description:** Validate withdrawal request before processing

**Request Body:**
```json
{
  "amount": 300.00,
  "withdrawalMethod": "BANK_TRANSFER"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "minimumAmount": 100.00,
    "maximumAmount": 25000.00,
    "availableBalance": 1500.00,
    "processingFee": 5.00,
    "estimatedTime": "24-48 hours",
    "dailyLimitRemaining": 20000.00,
    "errors": []
  }
}
```

**Error Response (Validation Failed):**
```json
{
  "success": false,
  "data": {
    "isValid": false,
    "errors": [
      "Insufficient balance",
      "Amount below minimum limit",
      "Daily withdrawal limit exceeded"
    ]
  }
}
```

---

## 📊 Transaction Management APIs

### 5. Get Transaction History
**Endpoint:** `GET /api/wallet/transactions`

**Query Parameters:**
- `page` (int, default: 0): Page number
- `size` (int, default: 10): Items per page
- `type` (string, optional): Filter by type (ALL|DEPOSIT|WITHDRAWAL|EARNING|FORFEIT)
- `startDate` (string, optional): Start date (YYYY-MM-DD)
- `endDate` (string, optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "TXN_123456",
        "type": "DEPOSIT|WITHDRAWAL|EARNING|FORFEIT",
        "amount": 500.00,
        "status": "SUCCESS|PENDING|FAILED|PROCESSING",
        "timestamp": "2024-01-15T10:30:00Z",
        "description": "Challenge win bonus",
        "balanceAfter": 1500.00,
        "processingFee": 0.00,
        "netAmount": 500.00,
        "reference": "order_xyz123"
      }
    ],
    "pagination": {
      "totalElements": 25,
      "totalPages": 3,
      "currentPage": 0,
      "pageSize": 10
    }
  }
}
```

---

### 6. Get Transaction Details
**Endpoint:** `GET /api/wallet/transactions/{transactionId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "TXN_123456",
    "type": "WITHDRAWAL",
    "amount": 300.00,
    "status": "SUCCESS",
    "timestamp": "2024-01-15T10:30:00Z",
    "description": "Withdrawal to bank account",
    "balanceAfter": 1200.00,
    "processingFee": 5.00,
    "netAmount": 295.00,
    "paymentDetails": {
      "method": "BANK_TRANSFER",
      "accountNumber": "****7890",
      "ifscCode": "HDFC0001234",
      "bankName": "HDFC Bank"
    },
    "timeline": [
      {
        "status": "INITIATED",
        "timestamp": "2024-01-15T10:30:00Z",
        "description": "Withdrawal request submitted"
      },
      {
        "status": "PROCESSING",
        "timestamp": "2024-01-15T11:00:00Z",
        "description": "Payment being processed"
      },
      {
        "status": "SUCCESS",
        "timestamp": "2024-01-16T09:00:00Z",
        "description": "Amount credited to bank account"
      }
    ]
  }
}
```

---

## ⚙️ Configuration APIs

### 7. Get Payment Methods & Limits
**Endpoint:** `GET /api/wallet/payment-methods`

**Response:**
```json
{
  "success": true,
  "data": {
    "deposit": [
      {
        "method": "UPI",
        "enabled": true,
        "displayName": "UPI",
        "minimumAmount": 10.00,
        "maximumAmount": 100000.00,
        "processingFee": 0.00,
        "processingTime": "Instant"
      },
      {
        "method": "CARD",
        "enabled": true,
        "displayName": "Credit/Debit Card",
        "minimumAmount": 50.00,
        "maximumAmount": 50000.00,
        "processingFee": "2.5%",
        "processingTime": "Instant"
      },
      {
        "method": "NET_BANKING",
        "enabled": true,
        "displayName": "Net Banking",
        "minimumAmount": 100.00,
        "maximumAmount": 200000.00,
        "processingFee": "1%",
        "processingTime": "5-10 minutes"
      }
    ],
    "withdrawal": [
      {
        "method": "BANK_TRANSFER",
        "enabled": true,
        "displayName": "Bank Transfer",
        "minimumAmount": 100.00,
        "maximumAmount": 25000.00,
        "dailyLimit": 50000.00,
        "processingFee": 5.00,
        "processingTime": "24-48 hours"
      },
      {
        "method": "UPI",
        "enabled": true,
        "displayName": "UPI Transfer",
        "minimumAmount": 10.00,
        "maximumAmount": 50000.00,
        "dailyLimit": 100000.00,
        "processingFee": 2.00,
        "processingTime": "Instant"
      }
    ]
  }
}
```

---

## 🎯 Challenge Integration APIs

### 8. Get Earnings Summary
**Endpoint:** `GET /api/wallet/earnings`

**Query Parameters:**
- `startDate` (string, optional): Start date (YYYY-MM-DD)
- `endDate` (string, optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEarnings": 2500.00,
      "totalForfeits": 500.00,
      "netEarnings": 2000.00,
      "totalChallenges": 15,
      "successfulChallenges": 12,
      "successRate": 80.0
    },
    "monthlyBreakdown": [
      {
        "month": "2024-01",
        "earnings": 800.00,
        "forfeits": 200.00,
        "net": 600.00
      }
    ],
    "recentEarnings": [
      {
        "challengeId": 123,
        "date": "2024-01-15",
        "type": "EARNING",
        "amount": 100.00,
        "description": "Wake up challenge completed successfully"
      },
      {
        "challengeId": 124,
        "date": "2024-01-14",
        "type": "FORFEIT",
        "amount": -50.00,
        "description": "Failed to wake up on time"
      }
    ]
  }
}
```

---

## 🔔 Webhook & Notifications

### 9. Payment Gateway Webhook
**Endpoint:** `POST /api/wallet/payment-webhook`

**Description:** Webhook to receive payment status updates from payment gateway

**Request Body:**
```json
{
  "event": "payment.success|payment.failed",
  "orderId": "order_xyz123",
  "transactionId": "TXN_123456",
  "amount": 500.00,
  "status": "SUCCESS|FAILED",
  "timestamp": "2024-01-15T10:30:00Z",
  "signature": "payment_gateway_signature"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

### 10. Get Wallet Notifications
**Endpoint:** `GET /api/wallet/notifications`

**Query Parameters:**
- `page` (int, default: 0): Page number
- `size` (int, default: 20): Items per page
- `unreadOnly` (boolean, default: false): Only unread notifications

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "NOTIF_123",
        "type": "DEPOSIT_SUCCESS|WITHDRAWAL_PENDING|WITHDRAWAL_SUCCESS|WITHDRAWAL_FAILED|LOW_BALANCE|EARNING_CREDIT",
        "title": "Withdrawal Successful",
        "message": "Your withdrawal of ₹300 has been processed successfully",
        "timestamp": "2024-01-15T10:30:00Z",
        "read": false,
        "actionRequired": false,
        "relatedTransactionId": "WTH_987654321"
      }
    ],
    "unreadCount": 3,
    "pagination": {
      "totalElements": 15,
      "totalPages": 1,
      "currentPage": 0
    }
  }
}
```

---

### 11. Mark Notification as Read
**Endpoint:** `PUT /api/wallet/notifications/{notificationId}/read`

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 🛡️ Security Requirements

### Rate Limiting
- **Deposit:** 10 requests per hour per user
- **Withdrawal:** 5 requests per hour per user
- **Balance Check:** 100 requests per hour per user

### Data Encryption
- All sensitive data (account numbers, UPI IDs) should be encrypted at rest
- PCI DSS compliance for card transactions
- Secure storage of bank details

### Audit Logging
- Log all wallet transactions with user ID, IP address, timestamp
- Track all balance changes with complete audit trail
- Monitor suspicious transaction patterns

---

## 💾 Database Schema Suggestions

### Wallet Table
```sql
CREATE TABLE wallets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Transactions Table
```sql
CREATE TABLE wallet_transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('DEPOSIT', 'WITHDRAWAL', 'EARNING', 'FORFEIT') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED') NOT NULL,
    payment_method VARCHAR(50),
    reference_id VARCHAR(100),
    description TEXT,
    processing_fee DECIMAL(10,2) DEFAULT 0.00,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_transactions (user_id, created_at),
    INDEX idx_status (status),
    INDEX idx_type (type)
);
```

---

## 🧪 Testing Requirements

### Test Scenarios
1. **Successful deposit flow**
2. **Failed payment handling**
3. **Insufficient balance withdrawal**
4. **Daily limit validation**
5. **Invalid bank details**
6. **Webhook verification**
7. **Concurrent transaction handling**

### Mock Payment Gateway
Provide sandbox/test endpoints for:
- Successful payment simulation
- Failed payment simulation
- Pending payment simulation

---

## 🚀 Implementation Priority

### Phase 1 (MVP)
1. Get wallet balance
2. Add funds (UPI only)
3. Basic transaction history
4. Withdrawal validation

### Phase 2
1. Withdraw funds
2. Multiple payment methods
3. Transaction details
4. Notifications

### Phase 3
1. Advanced filtering
2. Earnings analytics
3. Rate limiting
4. Enhanced security

---

## 📞 Frontend Integration Notes

The frontend will integrate these APIs using:
- **React modals** for add funds/withdraw flows
- **Real-time balance updates** after transactions
- **Transaction history** display in user dashboard
- **Payment gateway integration** (Razorpay/Stripe)
- **Error handling** with user-friendly messages

---

## ❓ Questions for Backend Team

1. Which payment gateway will you integrate? (Razorpay/Stripe/Other)
2. What are the preferred transaction ID formats?
3. Do you need any additional webhook endpoints?
4. What are the compliance requirements for financial data?
5. Should we implement real-time notifications (WebSocket/SSE)?
6. What are the preferred error response formats?

---

**Document Version:** 1.0  
**Last Updated:** January 2024  
**Contact:** Frontend Team