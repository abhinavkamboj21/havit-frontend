import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { walletAPI } from '../utils/api';
import { 
  ArrowLeft, 
  IndianRupee, 
  Smartphone, 
  Building, 
  CheckCircle, 
  AlertCircle,
  ArrowRight 
} from 'lucide-react';

interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
}

interface WithdrawalFormData {
  amount: number;
  withdrawalMethod: 'UPI' | 'BANK';
  upiId: string;
  bankDetails: BankDetails;
}

const WithdrawalPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'amount' | 'method' | 'details' | 'confirm' | 'success'>('amount');
  const [formData, setFormData] = useState<WithdrawalFormData>({
    amount: 0,
    withdrawalMethod: 'UPI',
    upiId: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: ''
    }
  });
  
  const [, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionResult, setTransactionResult] = useState<any>(null);

  const validateWithdrawal = async (amount: number, method: string) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Validating withdrawal:', { amount, method });
      const response = await walletAPI.validateWithdrawal(amount, method);
      console.log('📋 Validation response:', response);
      
      if (response.success && response.data.valid) {
        console.log('✅ Validation successful');
        setValidation(response.data);
        return true;
      } else {
        console.log('❌ Validation failed:', response);
        setError(response.data?.errors?.join(', ') || response.message || 'Withdrawal validation failed');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Withdrawal validation error:', error);
      setError(error.message || 'Validation failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const processWithdrawal = async () => {
    try {
      setLoading(true);
      setError('');
      
      const withdrawalData = {
        amount: formData.amount,
        withdrawalMethod: formData.withdrawalMethod,
        ...(formData.withdrawalMethod === 'UPI' 
          ? { upiId: formData.upiId }
          : { bankDetails: formData.bankDetails }
        )
      };
      
      console.log('💸 Processing withdrawal:', withdrawalData);
      const response = await walletAPI.processWithdrawal(withdrawalData);
      
      if (response.success) {
        setTransactionResult(response.data);
        setStep('success');
        
        // Refresh user data to update balance
        await refreshUser();
      } else {
        setError(response.error || 'Withdrawal failed. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Withdrawal processing failed:', error);
      setError(error.message || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount < 100) {
      setError('Minimum withdrawal amount is ₹100');
      return;
    }
    
    if (formData.amount > 25000) {
      setError('Maximum withdrawal amount is ₹25,000');
      return;
    }
    
    if (formData.amount > (user?.balance || 0)) {
      setError('Insufficient balance');
      return;
    }
    
    console.log('🚀 Proceeding with withdrawal validation...');
    const isValid = await validateWithdrawal(formData.amount, formData.withdrawalMethod);
    console.log('🔍 Validation result:', isValid);
    
    if (isValid) {
      console.log('✅ Moving to method step');
      setStep('method');
    } else {
      console.log('❌ Validation failed, staying on amount step');
      // Error should already be set by validateWithdrawal function
    }
  };

  const handleMethodSelect = (method: 'UPI' | 'BANK') => {
    setFormData(prev => ({ ...prev, withdrawalMethod: method }));
    setStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.withdrawalMethod === 'UPI') {
      if (!formData.upiId.trim()) {
        setError('Please enter a valid UPI ID');
        return;
      }
    } else {
      const { accountNumber, ifscCode, accountHolderName, bankName } = formData.bankDetails;
      if (!accountNumber || !ifscCode || !accountHolderName || !bankName) {
        setError('Please fill in all bank details');
        return;
      }
    }
    
    setError('');
    setStep('confirm');
  };

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 icon-chip rounded-full flex items-center justify-center mx-auto mb-4">
          <IndianRupee className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-morning-900 mb-2">Withdraw Funds</h2>
        <p className="text-morning-600">Enter the amount you want to withdraw</p>
      </div>

      <div className="bg-gradient-to-r from-cyan-50 to-morning-50 rounded-lg p-4">
        <div className="text-center">
          <p className="text-sm text-morning-600 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-morning-900">₹{user?.balance?.toLocaleString() || '0'}</p>
        </div>
      </div>

      <form onSubmit={handleAmountSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-morning-700 mb-2">
            Withdrawal Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-morning-500">₹</span>
            <input
              type="number"
              min="100"
              max="25000"
              step="1"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              className="input-field w-full pl-8"
              placeholder="Enter amount"
              required
            />
          </div>
          <p className="mt-1 text-xs text-morning-500">
            Minimum: ₹100 • Maximum: ₹25,000
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !formData.amount}
          className="btn-primary w-full"
        >
          {loading ? 'Validating...' : 'Continue'}
        </button>
      </form>
    </div>
  );

  const renderMethodStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-morning-900 mb-2">Select Withdrawal Method</h3>
        <p className="text-morning-600">Choose how you want to receive your funds</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleMethodSelect('UPI')}
          className="w-full p-4 border-2 border-morning-200 rounded-lg hover:border-cyan-300 hover:bg-cyan-50 transition-all duration-200 text-left"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-morning-900">UPI Transfer</h4>
              <p className="text-sm text-morning-600">Instant transfer • Processing fee: ₹2</p>
            </div>
            <ArrowRight className="w-5 h-5 text-morning-400" />
          </div>
        </button>

        <button
          onClick={() => handleMethodSelect('BANK')}
          className="w-full p-4 border-2 border-morning-200 rounded-lg hover:border-cyan-300 hover:bg-cyan-50 transition-all duration-200 text-left"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-morning-900">Bank Transfer</h4>
              <p className="text-sm text-morning-600">Direct to bank • Processing fee: ₹5</p>
            </div>
            <ArrowRight className="w-5 h-5 text-morning-400" />
          </div>
        </button>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-morning-900 mb-2">
          {formData.withdrawalMethod === 'UPI' ? 'UPI Details' : 'Bank Details'}
        </h3>
        <p className="text-morning-600">
          {formData.withdrawalMethod === 'UPI' 
            ? 'Enter your UPI ID to receive the funds'
            : 'Enter your bank account details'
          }
        </p>
      </div>

      <form onSubmit={handleDetailsSubmit} className="space-y-4">
        {formData.withdrawalMethod === 'UPI' ? (
          <div>
            <label className="block text-sm font-medium text-morning-700 mb-2">
              UPI ID
            </label>
            <input
              type="text"
              value={formData.upiId}
              onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
              className="input-field w-full"
              placeholder="your-name@upi"
              required
            />
            <p className="mt-1 text-xs text-morning-500">
              Example: yourname@paytm, yourname@googlepay
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-morning-700 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                value={formData.bankDetails.accountHolderName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, accountHolderName: e.target.value }
                }))}
                className="input-field w-full"
                placeholder="Enter account holder name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-morning-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={formData.bankDetails.accountNumber}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
                }))}
                className="input-field w-full"
                placeholder="Enter account number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-morning-700 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                value={formData.bankDetails.ifscCode}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, ifscCode: e.target.value.toUpperCase() }
                }))}
                className="input-field w-full"
                placeholder="HDFC0001234"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-morning-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bankDetails.bankName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, bankName: e.target.value }
                }))}
                className="input-field w-full"
                placeholder="Enter bank name"
                required
              />
            </div>
          </>
        )}

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button type="submit" className="btn-primary w-full">
          Continue
        </button>
      </form>
    </div>
  );

  const renderConfirmStep = () => {
    const processingFee = formData.withdrawalMethod === 'UPI' ? 2 : 5;
    const netAmount = formData.amount - processingFee;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-morning-900 mb-2">Confirm Withdrawal</h3>
          <p className="text-morning-600">Please review your withdrawal details</p>
        </div>

        <div className="bg-morning-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-morning-600">Withdrawal Amount:</span>
            <span className="font-semibold text-morning-900">₹{formData.amount}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-morning-600">Processing Fee:</span>
            <span className="font-semibold text-morning-900">₹{processingFee}</span>
          </div>
          
          <hr className="border-morning-200" />
          
          <div className="flex justify-between">
            <span className="text-morning-600 font-medium">Net Amount:</span>
            <span className="font-bold text-green-600 text-lg">₹{netAmount}</span>
          </div>
        </div>

        <div className="bg-cyan-50 rounded-lg p-4">
          <h4 className="font-medium text-morning-900 mb-2">
            {formData.withdrawalMethod === 'UPI' ? 'UPI Details' : 'Bank Details'}
          </h4>
          
          {formData.withdrawalMethod === 'UPI' ? (
            <p className="text-morning-700">{formData.upiId}</p>
          ) : (
            <div className="space-y-1 text-sm text-morning-700">
              <p><strong>Account Holder:</strong> {formData.bankDetails.accountHolderName}</p>
              <p><strong>Account Number:</strong> {formData.bankDetails.accountNumber}</p>
              <p><strong>IFSC Code:</strong> {formData.bankDetails.ifscCode}</p>
              <p><strong>Bank Name:</strong> {formData.bankDetails.bankName}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={processWithdrawal}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Processing Withdrawal...' : 'Confirm Withdrawal'}
        </button>
      </div>
    );
  };

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-morning-900 mb-2">
          Withdrawal Successful! 🎉
        </h2>
        <p className="text-morning-600">
          Your withdrawal has been processed successfully
        </p>
      </div>

      {transactionResult && (
        <div className="bg-green-50 rounded-lg p-4 text-left">
          <h4 className="font-medium text-morning-900 mb-3">Transaction Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-morning-600">Transaction ID:</span>
              <span className="font-mono text-morning-900">{transactionResult.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-morning-600">Amount:</span>
              <span className="font-semibold text-morning-900">₹{transactionResult.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-morning-600">Processing Fee:</span>
              <span className="font-semibold text-morning-900">₹{transactionResult.processingFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-morning-600">Net Amount:</span>
              <span className="font-bold text-green-600">₹{transactionResult.netAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-morning-600">Status:</span>
              <span className="font-semibold text-green-600">{transactionResult.status}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary w-full"
        >
          Back to Dashboard
        </button>
        
        <button
          onClick={() => {
            setStep('amount');
            setFormData({
              amount: 0,
              withdrawalMethod: 'UPI',
              upiId: '',
              bankDetails: { accountNumber: '', ifscCode: '', accountHolderName: '', bankName: '' }
            });
            setError('');
            setTransactionResult(null);
          }}
          className="btn-outline w-full"
        >
          Make Another Withdrawal
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-morning-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        
        {/* Header with back button */}
        {step !== 'success' && (
          <div className="flex items-center mb-6">
            <button
              onClick={() => {
                if (step === 'amount') {
                  navigate('/dashboard');
                } else if (step === 'method') {
                  setStep('amount');
                } else if (step === 'details') {
                  setStep('method');
                } else if (step === 'confirm') {
                  setStep('details');
                }
              }}
              className="flex items-center space-x-2 text-morning-600 hover:text-morning-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        )}

        {/* Progress indicator */}
        {step !== 'success' && (
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${step === 'amount' ? 'bg-cyan-500' : 'bg-cyan-200'}`}></div>
              <div className={`w-8 h-1 ${['method', 'details', 'confirm'].includes(step) ? 'bg-cyan-500' : 'bg-cyan-200'}`}></div>
              <div className={`w-3 h-3 rounded-full ${['method', 'details', 'confirm'].includes(step) ? 'bg-cyan-500' : 'bg-cyan-200'}`}></div>
              <div className={`w-8 h-1 ${['details', 'confirm'].includes(step) ? 'bg-cyan-500' : 'bg-cyan-200'}`}></div>
              <div className={`w-3 h-3 rounded-full ${['details', 'confirm'].includes(step) ? 'bg-cyan-500' : 'bg-cyan-200'}`}></div>
              <div className={`w-8 h-1 ${step === 'confirm' ? 'bg-cyan-500' : 'bg-cyan-200'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step === 'confirm' ? 'bg-cyan-500' : 'bg-cyan-200'}`}></div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {step === 'amount' && renderAmountStep()}
          {step === 'method' && renderMethodStep()}
          {step === 'details' && renderDetailsStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalPage;