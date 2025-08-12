# SMS Verification - Temporarily Disabled

## Status
🟡 **DISABLED FOR DEPLOYMENT** - SMS verification is temporarily commented out for production deployment.

## What was changed
- `src/pages/OnboardingPage.tsx`: 
  - Commented out SMS verification requirement in `validateStep()`
  - Disabled "Next" button validation for unverified phone numbers
  - Replaced SMS verification UI with yellow notice banner
  - Original SMS verification code wrapped in `{false && ...}` condition

## When Twilio keys are ready

### 1. Update environment variables
Add to your hosting platform (Cloudflare Pages, Vercel, etc.):
```bash
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 2. Re-enable SMS verification in code
In `src/pages/OnboardingPage.tsx`:

**Step 1:** Uncomment validation in `validateStep()`:
```typescript
// Change this:
// TODO: Re-enable SMS verification when Twilio keys are ready
// if (!smsVerification.verified) {
//   setError('Please verify your phone number before proceeding');
//   return false;
// }

// To this:
if (!smsVerification.verified) {
  setError('Please verify your phone number before proceeding');
  return false;
}
```

**Step 2:** Re-enable button validation:
```typescript
// Change this:
disabled={isLoading}
className={`btn-primary ${currentStep === 1 ? 'w-full' : ''}`}

// To this:
disabled={isLoading || (currentStep === 1 && !smsVerification.verified)}
className={`btn-primary ${currentStep === 1 ? 'w-full' : ''} ${
  (currentStep === 1 && !smsVerification.verified) ? 'opacity-50 cursor-not-allowed' : ''
}`}
```

**Step 3:** Replace disabled UI with working SMS verification:
```typescript
// Change this:
{formData.phoneNumber && formData.phoneNumber.length >= 13 && (
  <div className="mt-4 space-y-3">
    {/* TODO: Re-enable SMS verification when Twilio keys are ready */}
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <p className="text-sm text-yellow-700">
        📱 Phone verification temporarily disabled. You can proceed without verification.
      </p>
    </div>
  </div>
)}

{/* COMMENTED OUT - Original SMS Verification UI */}
{false && formData.phoneNumber && formData.phoneNumber.length >= 13 && (
  // ... SMS UI code ...
)}

// To this:
{formData.phoneNumber && formData.phoneNumber.length >= 13 && (
  <div className="mt-4 space-y-3">
    // ... Original SMS UI code (remove the `false &&` condition) ...
  </div>
)}
```

**Step 4:** Uncomment helper text:
```typescript
// Uncomment:
{currentStep === 1 && !smsVerification.verified && formData.phoneNumber && (
  <p className="text-xs text-gray-500 mt-1 text-center">
    Please verify your phone number to continue
  </p>
)}
```

### 3. Test the flow
1. Enter phone number → "Send Verification Code" appears
2. Click send → Code input appears
3. Enter 6-digit code → "Verify Code" button
4. Successful verification → Green checkmark, "Next" button enabled

## Current behavior (disabled)
- Users see yellow notice: "Phone verification temporarily disabled"
- Phone number is still required (for backend storage)
- Users can proceed directly to Step 2 without verification
- No SMS API calls are made

## Backend compatibility
The backend SMS verification endpoints are already implemented and ready:
- `POST /auth/send-sms-verification`
- `POST /auth/verify-sms`

Just add your Twilio credentials to the backend environment when ready.