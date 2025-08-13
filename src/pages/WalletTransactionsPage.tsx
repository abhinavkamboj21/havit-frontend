import { useEffect, useState } from 'react';
import { walletAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface Transaction {
  id: string;
  amount: number;
  netAmount?: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'EARNING' | 'FORFEIT' | 'REFUND' | 'BONUS' | string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | string;
  timestamp?: string; // new backend field
  createdAt?: string; // legacy field
  description?: string;
  balanceAfter?: number;
  processingFee?: number;
  reference?: string;
  credit?: boolean;
  debit?: boolean;
}

const WalletTransactionsPage = () => {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await walletAPI.getTransactions({ page: 0, size: 20 });
        const list: Transaction[] = data?.data?.transactions || data?.transactions || [];
        setTransactions(list);
      } catch (e: any) {
        setError(e.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-morning-900">Wallet Transactions</h1>
        <p className="text-morning-600">Recent deposits, withdrawals, pledges and refunds</p>
      </div>

      {/* Current Balance */}
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 p-5 sm:p-6 text-white shadow-lg">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-white/80 mb-1 uppercase tracking-wider">Current Balance</p>
              <p className="text-2xl sm:text-3xl font-bold">{(user?.balance ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
            </div>
            <button
              onClick={async () => { try { await refreshUser(); } catch {} }}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-sm font-medium transition-all duration-200 border border-white/30"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="card">Loading transactions...</div>}
      {error && <div className="card text-error-600">{error}</div>}

      {!loading && !error && (
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="card">No transactions yet.</div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="card flex items-center justify-between">
                <div>
                  <div className="font-medium text-morning-900">
                    {t.type}
                  </div>
                  <div className="text-sm text-morning-600">
                    {new Date(t.timestamp || t.createdAt || '').toLocaleString()}
                    {t.reference ? ` · Ref: ${t.reference}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    t.debit ? 'text-error-600' : t.credit ? 'text-success-600' : (t.type === 'WITHDRAWAL' || t.type === 'FORFEIT') ? 'text-error-600' : 'text-success-600'
                  }`}>
                    {(t.debit || t.type === 'WITHDRAWAL' || t.type === 'FORFEIT') ? '-' : '+'}
                    ₹{Math.abs((t.netAmount ?? t.amount) || 0).toLocaleString()}
                  </div>
                  <div className={`text-xs ${t.status === 'SUCCESS' ? 'text-success-600' : t.status === 'FAILED' ? 'text-error-600' : 'text-morning-600'}`}>
                    {t.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default WalletTransactionsPage;

