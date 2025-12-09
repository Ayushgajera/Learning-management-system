import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiDollarSign,
    FiCreditCard,
    FiArrowUpCircle,
    FiArrowDownCircle,
    FiDownload,
    FiInfo,
    FiCopy,
    FiCalendar,
    FiTrendingUp,
    FiShield,
    FiClock
} from 'react-icons/fi';
import { toast, Toaster } from 'sonner';
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
const formatCurrency = (amount = 0) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(amount || 0);

const formatNumber = (value = 0) => new Intl.NumberFormat('en-US').format(value || 0);

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
const StatCard = ({ label, value, meta, icon: Icon, accent }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-lg dark:border-white/10 dark:bg-slate-900/60"
    >
        <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-br ${accent} hover:opacity-10`} />
        <div className="relative flex items-start justify-between">
            <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{value}</p>
                {meta && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{meta}</p>}
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 text-slate-700 dark:bg-slate-800/70 dark:text-white">
                <Icon className="w-5 h-5" />
            </div>
        </div>
    </motion.div>
);

const InsightCard = ({ title, value, meta, icon }) => (
    <div className="rounded-2xl border border-slate-100 bg-white/70 px-5 py-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800/80 text-indigo-500 dark:text-indigo-300">
                {icon}
            </div>
            <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
        {meta && <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{meta}</p>}
    </div>
);

const TransactionRow = ({ transaction }) => {
    const isCredit = transaction.type === 'credit';
        const amountColor = isCredit ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300';
        const amountPrefix = isCredit ? '+' : '-';
        const icon = isCredit
            ? <FiArrowUpCircle className="w-5 h-5 text-emerald-500" />
            : <FiArrowDownCircle className="w-5 h-5 text-rose-500" />;

    return (
        <motion.div
                        className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 dark:border-white/10 dark:bg-slate-900/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex-shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {transaction.description || `Transaction for Course ID: ${transaction.courseId}`}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(transaction.date)}</p>
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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/95 p-6 shadow-2xl dark:bg-slate-900"
            >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Withdraw Funds</h3>
                <p className="text-slate-600 dark:text-slate-300">
                    Enter the amount you wish to withdraw from your current balance of 
                    <span className="font-semibold text-indigo-600 dark:text-indigo-300"> {formatCurrency(balance)}</span>.
                </p>
                
                <div className="space-y-2">
                    <label htmlFor="withdrawAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Withdrawal Amount</label>
                    <input
                        id="withdrawAmount"
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className={`w-full rounded-xl border px-4 py-2 text-slate-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                        min="0"
                        max={balance}
                        step="0.01"
                    />
                    {error && <p className="text-sm text-rose-500">{error}</p>}
                </div>

                <div className="flex justify-end space-x-3">
                    <motion.button
                        onClick={onClose}
                        className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        onClick={handleConfirm}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
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
                        toast.success('Wallet data loaded successfully!');
                }
        }, [userData, timeframe]);

        const creditTransactions = useMemo(() => walletTransactions.filter(txn => txn.type === 'credit'), [walletTransactions]);
        const payoutTransactions = useMemo(() => walletTransactions.filter(txn => txn.type === 'payout'), [walletTransactions]);

        const totalCredits = useMemo(() => creditTransactions.reduce((sum, txn) => sum + (txn.amount || 0), 0), [creditTransactions]);
        const totalPayouts = useMemo(() => payoutTransactions.reduce((sum, txn) => sum + (txn.amount || 0), 0), [payoutTransactions]);
        const avgCreditValue = useMemo(() => (creditTransactions.length ? totalCredits / creditTransactions.length : 0), [creditTransactions, totalCredits]);

        const lastPayoutDate = payoutTransactions[0]?.date ? new Date(payoutTransactions[0].date) : null;
        const nextPayoutDate = lastPayoutDate ? new Date(lastPayoutDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null;

        const latestMonth = monthlyEarningsData[monthlyEarningsData.length - 1]?.earnings || 0;
        const previousMonth = monthlyEarningsData[monthlyEarningsData.length - 2]?.earnings || 0;
        const monthDelta = previousMonth ? (((latestMonth - previousMonth) / previousMonth) * 100).toFixed(1) : null;

        const payoutProgress = Math.min(100, (currentBalance / 10000) * 100);

        const insightCards = [
            {
                title: 'Lifetime Credits',
                value: formatCurrency(totalCredits),
                meta: `${formatNumber(creditTransactions.length)} deposits captured`,
                icon: <FiArrowUpCircle className="w-4 h-4" />,
            },
            {
                title: 'Total Payouts',
                value: formatCurrency(totalPayouts),
                meta: `${formatNumber(payoutTransactions.length)} transfers processed`,
                icon: <FiArrowDownCircle className="w-4 h-4" />,
            },
            {
                title: 'Avg. Credit Size',
                value: formatCurrency(avgCreditValue || 0),
                meta: 'Per enrollment sale',
                icon: <FiTrendingUp className="w-4 h-4" />,
            }
        ];

        const summaryCards = [
            {
                label: 'Current Balance',
                value: formatCurrency(currentBalance),
                meta: monthDelta ? `${monthDelta}% vs last month` : 'Awaiting first payout',
                icon: FiDollarSign,
                accent: 'from-indigo-500 to-blue-500'
            },
            {
                label: 'Available Payout Method',
                value: 'Primary bank account',
                meta: 'Backed by SecurePay',
                icon: FiCreditCard,
                accent: 'from-emerald-500 to-green-500'
            }
        ];

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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-500 rounded-full mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Loading wallet data...</h3>
                </div>
            </div>
        );
    }
    
    if (!userData?.user) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
                <div className="text-center text-slate-500 dark:text-slate-400">
                    <FiInfo className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">No user data available.</p>
                </div>
            </div>
        );
    }
    
    const maxMonthlyEarnings = Math.max(...monthlyEarningsData.map(d => d.earnings)) || 1;

    return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8 text-slate-900 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
            <Toaster position="bottom-right" richColors />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto space-y-8"
            >
                        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-900 via-indigo-800 to-blue-700 p-8 text-white shadow-2xl dark:border-white/10"
                            >
                                <div className="absolute inset-0 opacity-30">
                                    <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                                    <div className="absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl" />
                                </div>
                                <div className="relative flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Wallet cockpit</p>
                                        <h1 className="mt-2 text-4xl font-semibold leading-tight">{formatCurrency(currentBalance)}</h1>
                                        <p className="text-white/70">Available to deploy</p>
                                    </div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(userData?.user?._id || '')}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/80 transition hover:border-white/60"
                                    >
                                        Copy wallet ID
                                    </button>
                                </div>
                                <div className="relative mt-6 flex flex-wrap items-center gap-3 text-sm">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1">
                                        {monthDelta ? `${monthDelta}% vs last month` : 'Building history'}
                                    </span>
                                    {lastPayoutDate && (
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-white/80">
                                            Last payout {formatDate(lastPayoutDate)}
                                        </span>
                                    )}
                                    {nextPayoutDate && (
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-white/80">
                                            Next unlock {formatDate(nextPayoutDate)}
                                        </span>
                                    )}
                                </div>
                                <div className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {insightCards.map(card => (
                                        <div key={card.title} className="min-w-0 rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                                            <p className="text-xs uppercase tracking-wide text-white/70">{card.title}</p>
                                            <p className="text-lg font-semibold leading-snug break-words">{card.value}</p>
                                            <p className="mt-2 flex items-center gap-1 text-xs text-white/70">
                                                {card.icon}
                                                {card.meta}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            <div className="space-y-4">
                                <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-slate-900/70">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Balance snapshot</h3>
                                        <span className="text-xs uppercase tracking-wider text-slate-500">Realtime</span>
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {summaryCards.map(card => (
                                            <StatCard key={card.label} {...card} />
                                        ))}
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-xl dark:border-white/10 dark:bg-slate-900/70">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Quick actions</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Move funds or export detailed ledger</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <FiClock className="w-4 h-4" />
                                            Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <motion.button
                                            onClick={handleWithdraw}
                                            className={`rounded-2xl px-6 py-4 text-left text-lg font-semibold shadow-lg transition ${currentBalance > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
                                            whileHover={{ scale: currentBalance > 0 ? 1.02 : 1 }}
                                            whileTap={{ scale: currentBalance > 0 ? 0.98 : 1 }}
                                            disabled={currentBalance <= 0 || isWithdrawing}
                                        >
                                            {isWithdrawing ? 'Processing payout...' : 'Withdraw to bank'}
                                            <p className="text-sm font-normal opacity-80">Instant transfer with 0% fee</p>
                                        </motion.button>
                                        <motion.button
                                            onClick={handleDownloadReport}
                                            className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-4 text-left text-lg font-semibold text-slate-700 shadow-lg transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/20 dark:bg-slate-900/60 dark:text-white"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Download full report
                                            <p className="mt-1 flex items-center gap-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                                                <FiDownload className="w-4 h-4" />Export detailed ledger
                                            </p>
                                        </motion.button>
                                    </div>
                                    <div className="mt-5 grid gap-4 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                                            <p className="text-xs uppercase tracking-wide text-slate-500">Last payout</p>
                                            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{lastPayoutDate ? formatDate(lastPayoutDate) : 'Not yet processed'}</p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                                            <p className="text-xs uppercase tracking-wide text-slate-500">Next estimation</p>
                                            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{nextPayoutDate ? formatDate(nextPayoutDate) : 'Once threshold met'}</p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10 sm:col-span-2">
                                            <p className="text-xs uppercase tracking-wide text-slate-500">Wallet ID</p>
                                            <p className="mt-1 break-all text-base font-semibold text-slate-900 dark:text-white">{userData?.user?._id || '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                                <div className="grid gap-6 lg:grid-cols-3">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-xl dark:border-white/10 dark:bg-slate-900/60"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-2xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                                                    <FiCalendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Monthly earnings </h2>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Keep an eye on momentum</p>
                                                </div>
                                            </div>
                                            <select
                                                value={timeframe}
                                                onChange={(e) => setTimeframe(Number(e.target.value))}
                                                className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/10"
                                            >
                                                <option value={3}>Last 3 months</option>
                                                <option value={6}>Last 6 months</option>
                                                <option value={12}>Last 12 months</option>
                                            </select>
                                        </div>
                                        <div className="relative mt-8 h-72">
                                            <div className="absolute inset-0 grid grid-rows-5 text-slate-200 dark:text-slate-800">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={`grid-${i}`} className="border-b last:border-b-0" />
                                                ))}
                                            </div>
                                            <div className="relative flex h-full items-end gap-3">
                                                {monthlyEarningsData.length ? monthlyEarningsData.map((data, index) => (
                                                    <motion.div
                                                        key={`${data.month}-${index}`}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${(data.earnings / maxMonthlyEarnings) * 100}%` }}
                                                        transition={{ delay: index * 0.05, type: 'spring', stiffness: 120 }}
                                                        className="flex-1 rounded-t-2xl bg-gradient-to-t from-indigo-400 via-indigo-500 to-violet-500 relative group"
                                                    >
                                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow opacity-0 group-hover:opacity-100 dark:bg-slate-800 dark:text-white">
                                                            {formatCurrency(data.earnings)}
                                                        </div>
                                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                            {data.month}
                                                        </div>
                                                    </motion.div>
                                                )) : (
                                                    <div className="flex w-full items-center justify-center text-slate-400 dark:text-slate-500">
                                                        Uploading revenue data...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-xl dark:border-white/10 dark:bg-slate-900/60"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                                                <FiShield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Payout readiness</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Track availability towards next transfer</p>
                                            </div>
                                        </div>
                                        <div className="mt-6">
                                            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                                                <span>Progress</span>
                                                <span>{payoutProgress.toFixed(0)}%</span>
                                            </div>
                                            <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${payoutProgress}%` }} />
                                            </div>
                                        </div>
                                        <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center justify-between">
                                                <span>Last payout</span>
                                                <span>{lastPayoutDate ? formatDate(lastPayoutDate) : 'Not yet processed'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Est. next payout</span>
                                                <span>{nextPayoutDate ? formatDate(nextPayoutDate) : 'Once threshold met'}</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
                                            <p className="font-medium text-slate-900 dark:text-white">Wallet ID</p>
                                            <p className="mt-1 text-slate-500 dark:text-slate-400 break-all">{userData?.user?._id || '—'}</p>
                                        </div>
                                    </motion.div>
                                </div>

                                <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-xl dark:border-white/10 dark:bg-slate-900/60"
                                >
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                                <div>
                                                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Transaction journal</h2>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Real-time ledger of credit inflows and payouts</p>
                                                </div>
                                                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:text-slate-300">
                                                        <FiClock className="w-4 h-4" /> Updated live
                                                </span>
                                        </div>
                                        <div className="space-y-3">
                                                {walletTransactions && walletTransactions.length > 0 ? (
                                                        walletTransactions.map(transaction => (
                                                                <TransactionRow key={transaction._id} transaction={transaction} />
                                                        ))
                                                ) : (
                                                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-slate-500 dark:border-white/10 dark:text-slate-400">
                                                                <FiInfo className="w-10 h-10 mb-3" />
                                                                <p className="text-base font-medium">No transactions found.</p>
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
