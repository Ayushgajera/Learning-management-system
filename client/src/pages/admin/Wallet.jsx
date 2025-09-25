import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiCreditCard, FiArrowUpCircle, FiArrowDownCircle, FiDownload, FiInfo, FiCopy, FiCalendar } from 'react-icons/fi';
import { toast, Toaster } from 'sonner';
// Aapke code me yeh import paths solve nahi ho pa rahe the, isliye ab hum mock data ka upyog kar rahe hain
// Taki code chal sake. Asli project mein, aapko in imports ko sahi se configure karna hoga.
import { useLoaduserQuery } from '@/features/api/authApi';
import { useWithdrawFromWalletMutation } from '@/features/api/paymentApi';


const MOCK_USER_DATA = {
    user: {
        walletBalance: 8499,
        walletTransactions: [
            { _id: '68a1b9cb75c9a2b8f81cc8a8', type: 'credit', amount: 499, courseId: '68a06179425be9665747d872', date: '2025-08-17T11:15:23.621Z' },
            { _id: '68a1baae75c9a2b8f81cc90e', type: 'credit', amount: 8000, courseId: '68a05372425be9665747d7ae', date: '2025-08-17T11:19:10.896Z' },
            { _id: 't2', type: 'payout', amount: 3000, date: '2025-08-10T15:30:00Z' },
            { _id: 't3', type: 'credit', amount: 1200, date: '2025-08-08T09:45:00Z' },
            { _id: 't4', type: 'credit', amount: 900, date: '2025-08-05T11:20:00Z' },
        ],
    },
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Sahayak Functions ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getMonthlyEarnings = (transactions, months) => {
  const earnings = {};
  const today = new Date();
  
  for (let i = 0; i < months; i++) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = monthDate.toLocaleString('en-US', { month: 'short' });
    earnings[monthName] = 0;
  }
  
  if (!transactions) return Object.keys(earnings).map(month => ({ month, earnings: 0 }));

  transactions
    .filter(t => t.type === 'credit')
    .forEach(t => {
      const transactionDate = new Date(t.date);
      const monthName = transactionDate.toLocaleString('en-US', { month: 'short' });
      if (earnings.hasOwnProperty(monthName)) {
        earnings[monthName] += t.amount;
      }
    });

  return Object.keys(earnings).map(month => ({
    month: month,
    earnings: earnings[month]
  }));
};

// --- Reusable Components ---
const StatCard = ({ label, value, icon, color, bgColor }) => (
    <motion.div
        className="relative bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className={`p-3 rounded-xl ${bgColor} text-white absolute top-6 right-6`}>
            {icon}
        </div>
        <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
        <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
    </motion.div>
);

const TransactionRow = ({ transaction }) => {
    const isCredit = transaction.type === 'credit';
    const amountColor = isCredit ? 'text-green-600' : 'text-red-600';
    const amountPrefix = isCredit ? '+' : '-';
    const icon = isCredit ? <FiArrowUpCircle className="w-5 h-5 text-green-500" /> : <FiArrowDownCircle className="w-5 h-5 text-red-500" />;

    return (
        <motion.div
            className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex-shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{transaction.description || `Transaction for Course ID: ${transaction.courseId}`}</p>
                <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
            </div>
            <div className={`text-sm font-semibold text-right ${amountColor}`}>
                {amountPrefix}{formatCurrency(transaction.amount)}
            </div>
        </motion.div>
    );
};

// --- Withdrawal Confirmation Modal ---
const WithdrawModal = ({ isOpen, onClose, onConfirm, balance }) => {
    const [withdrawAmount, setWithdrawAmount] = useState(balance);
    const [error, setError] = useState('');

    const handleConfirm = () => {
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (amount > balance) {
            setError('Withdrawal amount cannot exceed your balance.');
            return;
        }
        setError('');
        onConfirm(amount);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl space-y-4"
            >
                <h3 className="text-xl font-bold text-gray-900">Withdraw Funds</h3>
                <p className="text-gray-600">
                    Enter the amount you wish to withdraw from your current balance of 
                    <span className="font-semibold text-blue-600"> {formatCurrency(balance)}</span>.
                </p>
                
                <div className="space-y-2">
                    <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700">Withdrawal Amount</label>
                    <input
                        id="withdrawAmount"
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${error ? 'border-red-500' : 'border-gray-300'}`}
                        min="0"
                        max={balance}
                        step="0.01"
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <div className="flex justify-end space-x-3">
                    <motion.button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={error !== '' || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance}
                    >
                        Confirm Withdraw
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

// --- Main Component ---
export default function Wallet() {
    // Apne code mein API calls ke liye `useLoaduserQuery` aur `useWithdrawFromWalletMutation` ka upyog karein
    // Yahan hum inka abhinay kar rahe hain
    const { data: userData, isLoading: isUserLoading } = useLoaduserQuery();
    const [withdrawFromWallet, { isLoading: isWithdrawing }] = useWithdrawFromWalletMutation();

    const [monthlyEarningsData, setMonthlyEarningsData] = useState([]);
    const [timeframe, setTimeframe] = useState(6);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    
    const [currentBalance, setCurrentBalance] = useState(0);
    const [walletTransactions, setWalletTransactions] = useState([]);

    useEffect(() => {
        if (userData?.user) {
            setCurrentBalance(userData.user.walletBalance);
            setWalletTransactions(userData.user.walletTransactions);

            const earnings = getMonthlyEarnings(userData.user.walletTransactions, timeframe);
            setMonthlyEarningsData(earnings.reverse());
            toast.success("Wallet data loaded successfully!");
        }
    }, [userData, timeframe]);

    const handleWithdraw = () => {
      if (currentBalance > 0) {
        setIsWithdrawModalOpen(true);
      } else {
        toast.info("No balance to withdraw.");
      }
    };
    
    const handleConfirmWithdraw = async (amount) => {
        try {
            // Asli API call
            await withdrawFromWallet({ amount }).unwrap();
            
            // Yahan mock API call ka abhinay kiya gaya hai
            toast.info('Withdrawal request processing...');
            await sleep(1000); 
            
            // State ko update karein
            setCurrentBalance(currentBalance - amount);
            setWalletTransactions(prevTransactions => [{
                _id: `t-${Date.now()}`,
                type: 'payout',
                description: `Withdrawal of ${formatCurrency(amount)}`,
                amount: amount,
                date: new Date().toISOString()
            }, ...prevTransactions]);

            toast.success(`Payout of ${formatCurrency(amount)} requested successfully!`);
        } catch (error) {
            toast.error(error?.data?.message || 'Withdrawal failed. Please try again.');
        } finally {
            setIsWithdrawModalOpen(false);
        }
    };

    const handleDownloadReport = () => {
        if (!walletTransactions || walletTransactions.length === 0) {
            toast.error("No transactions to download.");
            return;
        }

        const createReportContent = () => {
            const totalEarnings = walletTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
            const totalPayouts = walletTransactions.filter(t => t.type === 'payout').reduce((sum, t) => sum + t.amount, 0);
            
            const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Financial Report</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { font-family: sans-serif; }
                        @media print {
                            body {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                        }
                    </style>
                </head>
                <body class="bg-gray-100 p-8">
                    <div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-xl border border-gray-200">
                        <header class="text-center mb-10">
                            <h1 class="text-3xl font-bold text-gray-800">Instructor Financial Report</h1>
                            <p class="text-gray-600 text-sm mt-2">Report generated on: ${formatDate(new Date().toISOString())}</p>
                        </header>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-10">
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <p class="text-sm text-gray-600">Current Balance</p>
                                <p class="text-2xl font-bold text-blue-600 mt-1">${formatCurrency(currentBalance)}</p>
                            </div>
                            <div class="bg-green-50 p-4 rounded-lg">
                                <p class="text-sm text-gray-600">Total Earnings</p>
                                <p class="text-2xl font-bold text-green-600 mt-1">${formatCurrency(totalEarnings)}</p>
                            </div>
                            <div class="bg-red-50 p-4 rounded-lg">
                                <p class="text-sm text-gray-600">Total Payouts</p>
                                <p class="text-2xl font-bold text-red-600 mt-1">${formatCurrency(totalPayouts)}</p>
                            </div>
                        </div>

                        <section class="mb-8">
                            <h2 class="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Transaction History</h2>
                            <div class="space-y-4">
                                ${walletTransactions.map(transaction => `
                                    <div class="flex items-center space-x-4 p-4 rounded-lg ${transaction.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}">
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-semibold text-gray-900 truncate">${transaction.description || `Transaction for Course ID: ${transaction.courseId}`}</p>
                                            <p class="text-xs text-gray-500">${formatDate(transaction.date)}</p>
                                        </div>
                                        <div class="text-sm font-semibold text-right ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}">
                                            ${transaction.type === 'credit' ? '+' : '-'}${formatCurrency(transaction.amount)}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                        
                        <footer class="text-center text-gray-500 text-xs mt-10">
                            <p>Generated by EduAdmin - Your Partner in Online Education.</p>
                        </footer>
                    </div>
                </body>
                </html>
            `;
            return htmlContent;
        };

        const htmlContent = createReportContent();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `Financial_Report_${formatDate(new Date().toISOString()).replace(/\s/g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success("Financial report downloaded successfully!");
    };

    if (isUserLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-gray-800">Loading wallet data...</h3>
                </div>
            </div>
        );
    }
    
    if (!userData?.user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
                <div className="text-center text-gray-500">
                    <FiInfo className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">No user data available.</p>
                </div>
            </div>
        );
    }
    
    const maxMonthlyEarnings = Math.max(...monthlyEarningsData.map(d => d.earnings)) || 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
            <Toaster position="bottom-right" richColors />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto space-y-8"
            >
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Wallet</h1>
                    <p className="text-gray-600 mt-1">Manage your earnings and transaction history.</p>
                </div>

                {/* Main Stats and Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        label="Current Balance"
                        value={formatCurrency(currentBalance)}
                        icon={<FiDollarSign className="w-6 h-6" />}
                        color="text-blue-600"
                        bgColor="bg-blue-500"
                    />
                    <StatCard
                        label="Payout Method"
                        value="Bank Account"
                        icon={<FiCreditCard className="w-6 h-6" />}
                        color="text-emerald-600"
                        bgColor="bg-emerald-500"
                    />
                    <div className="flex flex-col gap-4">
                        <motion.button
                            onClick={handleWithdraw}
                            className={`w-full px-6 py-4 font-semibold rounded-2xl shadow-lg transition-colors duration-200
                                ${currentBalance > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            whileHover={{ scale: currentBalance > 0 ? 1.05 : 1 }}
                            whileTap={{ scale: currentBalance > 0 ? 0.95 : 1 }}
                            disabled={currentBalance <= 0 || isWithdrawing}
                        >
                            {isWithdrawing ? 'Processing...' : 'Withdraw'}
                        </motion.button>
                        <motion.button
                            onClick={handleDownloadReport}
                            className="w-full px-6 py-4 bg-gray-100 text-gray-800 font-semibold rounded-2xl border border-gray-200 shadow-md hover:bg-gray-200 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="flex items-center justify-center">
                                <FiDownload className="w-5 h-5 mr-2" />
                                Download Report
                            </div>
                        </motion.button>
                    </div>
                </div>

                {/* Monthly Earnings Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <FiCalendar className="w-5 h-5 text-gray-600" />
                      <h2 className="text-xl font-bold text-gray-900">Monthly Earnings Summary</h2>
                    </div>
                    <select 
                      value={timeframe} 
                      onChange={(e) => setTimeframe(Number(e.target.value))} 
                      className="px-3 py-2 text-sm rounded-xl border border-gray-200"
                    >
                      <option value={3}>Last 3 Months</option>
                      <option value={6}>Last 6 Months</option>
                      <option value={12}>Last 12 Months</option>
                    </select>
                  </div>
                  <div className="w-full h-64 relative p-4">
                    <div className="absolute inset-0 grid grid-rows-5 -z-10">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="border-b border-gray-200 last:border-b-0"></div>
                      ))}
                    </div>
                    <div className="flex justify-between items-end h-full gap-2">
                      {monthlyEarningsData.map((data, index) => (
                        <motion.div
                          key={data.month}
                          initial={{ height: 0 }}
                          animate={{ height: `${(data.earnings / maxMonthlyEarnings) * 100}%` }}
                          transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                          className="w-12 sm:w-16 bg-gradient-to-b from-blue-400 to-blue-600 rounded-t-lg relative group"
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-center text-xs font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {formatCurrency(data.earnings)}
                          </div>
                          <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-xs text-gray-500 font-medium">
                            {data.month}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Transaction History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                        <span className="text-sm text-gray-500">Last 30 days</span>
                    </div>
                    <div className="space-y-2">
                        {walletTransactions && walletTransactions.length > 0 ? (
                            walletTransactions.map(transaction => (
                                <TransactionRow key={transaction._id} transaction={transaction} />
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <FiInfo className="w-16 h-16 mx-auto mb-4" />
                                <p className="text-lg font-medium">No transactions found.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Render the modal */}
                <AnimatePresence>
                  {isWithdrawModalOpen && (
                    <WithdrawModal
                      isOpen={isWithdrawModalOpen}
                      onClose={() => setIsWithdrawModalOpen(false)}
                      onConfirm={handleConfirmWithdraw}
                      balance={currentBalance}
                    />
                  )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
}
