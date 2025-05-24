
'use client';

import {useState, useEffect, useRef} from 'react';
import { Button } from '@/components/ui/button';
import { Check, Circle, Trash, Notebook, DollarSign, Bitcoin, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";

interface Task {
    id: string;
    description: string;
    completed: boolean;
}

interface FomcMeeting {
  month: string;
  startDay: number;
  endDay: number;
}

const fomcMeetingDates: FomcMeeting[] = [
  { month: 'Jan', startDay: 28, endDay: 29 },
  { month: 'Mar', startDay: 18, endDay: 19 },
  { month: 'May', startDay: 6, endDay: 7 },
  { month: 'Jun', startDay: 17, endDay: 18 },
  { month: 'Jul', startDay: 29, endDay: 30 },
  { month: 'Sep', startDay: 16, endDay: 17 },
  { month: 'Oct', startDay: 28, endDay: 29 },
  { month: 'Dec', startDay: 9, endDay: 10 },
];

function getMonthIndex(monthName: string): number {
  const monthMap: {[key: string]: number} = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  return monthMap[monthName.slice(0,3)];
}

type ActiveView = 'epic-notes' | 'pips' | 'crypto' | 'market';

export default function Home() {
    const [activeTab, setActiveTab] = useState<ActiveView>('epic-notes');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const {toast} = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const [fomcDateString, setFomcDateString] = useState('');

    const [stopLoss, setStopLoss] = useState('');
    const [entry, setEntry] = useState('');
    const [takeProfit, setTakeProfit] = useState('');
    const [decimalPlaces, setDecimalPlaces] = useState(5);
    const [pipsOfRisk, setPipsOfRisk] = useState<number | null>(null);
    const [pipsOfReward, setPipsOfReward] = useState<number | null>(null);
    const [riskRewardRatio, setRiskRewardRatio] = useState<number | null>(null);

    const [cryptoEntry, setCryptoEntry] = useState('');
    const [cryptoSL, setCryptoSL] = useState('');
    const [cryptoTP, setCryptoTP] = useState('');
    const [riskPercentage, setRiskPercentage] = useState('');
    const [positionSize, setPositionSize] = useState<number | null>(null);
    const [accountBalance, setAccountBalance] = useState('');
    const [cryptoRiskRewardRatio, setCryptoRiskRewardRatio] = useState<number | null>(null);

    const [marketData, setMarketData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [coinPrices, setCoinPrices] = useState<{ [key: string]: number | null }>({
        BTC: null, ETH: null, BNB: null, SOL: null, TON: null, LTC: null, XRP: null, XLM: null, LINK: null,
    });
    const [waitingPrices, setWaitingPrices] = useState<{ [key: string]: string | null }>({
        BTC: null, ETH: null, BNB: null, SOL: null, TON: null, LTC: null, XRP: null, XLM: null, LINK: null,
    });
    
    const isMobile = () => {
        if (typeof window === 'undefined') return false;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const requestNotificationPermission = async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                console.log("Requesting notification permission...");
                try {
                    const permission = await Notification.requestPermission();
                    console.log(`Notification permission ${permission}.`);
                } catch (error) {
                    console.error("Error requesting notification permission:", error);
                }
            } else if (Notification.permission === 'granted') {
                console.log("Notification permission already granted.");
            } else {
                console.warn("Notification permission denied.");
            }
        } else {
            console.warn("Notifications not supported in this browser.");
        }
    };
    
    useEffect(() => {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) setTasks(JSON.parse(storedTasks));
        const storedWaitingPrices = localStorage.getItem('waitingPrices');
        if (storedWaitingPrices) setWaitingPrices(JSON.parse(storedWaitingPrices));
        
        requestNotificationPermission();

        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => console.log('Service Worker registered with scope:', registration.scope))
                .catch(error => {
                    console.error('Service worker registration failed:', error);
                });
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('waitingPrices', JSON.stringify(waitingPrices));
    }, [tasks, waitingPrices]);
    
    useEffect(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      const currentYear = today.getFullYear();
      let upcomingMeetingData: { month: string; startDay: number; endDay: number; year: number } | null = null;

      const sortedMeetings = [...fomcMeetingDates].sort((a, b) => {
        const dateA = new Date(currentYear, getMonthIndex(a.month), a.startDay);
        const dateB = new Date(currentYear, getMonthIndex(b.month), b.startDay);
        return dateA.getTime() - dateB.getTime();
      });
      
      for (const meeting of sortedMeetings) {
        const meetingStartDate = new Date(currentYear, getMonthIndex(meeting.month), meeting.startDay);
        const meetingEndDate = new Date(currentYear, getMonthIndex(meeting.month), meeting.endDay, 23, 59, 59, 999);
        
        if (today <= meetingEndDate) {
            upcomingMeetingData = { ...meeting, year: currentYear };
            break;
        }
      }

      if (!upcomingMeetingData && sortedMeetings.length > 0) {
        upcomingMeetingData = { ...sortedMeetings[0], year: currentYear + 1 };
      }

      if (upcomingMeetingData) {
        setFomcDateString(`FOMC: ${upcomingMeetingData.month} ${upcomingMeetingData.startDay}-${upcomingMeetingData.endDay}`);
      } else {
        setFomcDateString('FOMC: TBD');
      }
    }, []);

    const handleAddTask = async () => {
        if (newTaskDescription.trim() !== '') {
            const newTask: Task = { id: Date.now().toString(), description: newTaskDescription, completed: false };
            setTasks([...tasks, newTask]);
            setNewTaskDescription('');
            inputRef.current?.focus();
            toast({ title: 'Task Added!', description: 'Your task has been successfully added.' });
        } else {
            toast({ title: 'Error', description: 'Task description cannot be empty.', variant: 'destructive' });
        }
    };

    const handleCompleteTask = (id: string) => setTasks(tasks.map(task => task.id === id ? {...task, completed: !task.completed} : task));
    const handleDeleteTask = (id: string) => setTasks(tasks.filter(task => task.id !== id));
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => event.key === 'Enter' && handleAddTask();

    const calculatePips = () => {
        if (!stopLoss || !entry || !takeProfit) { setPipsOfRisk(null); setPipsOfReward(null); setRiskRewardRatio(null); return; }
        const sl = parseFloat(stopLoss), e = parseFloat(entry), tp = parseFloat(takeProfit);
        if (isNaN(sl) || isNaN(e) || isNaN(tp)) { setPipsOfRisk(null); setPipsOfReward(null); setRiskRewardRatio(null); return; }
        const risk = Math.abs(e - sl) * Math.pow(10, decimalPlaces);
        const reward = Math.abs(tp - e) * Math.pow(10, decimalPlaces);
        setPipsOfRisk(risk); setPipsOfReward(reward); setRiskRewardRatio(risk > 0 ? reward / risk : 0);
    };
    useEffect(calculatePips, [stopLoss, entry, takeProfit, decimalPlaces]);

    const calculateCryptoValues = () => {
        const entryP = parseFloat(cryptoEntry);
        const slP = parseFloat(cryptoSL);
        const accVal = parseFloat(accountBalance);
        const riskPctVal = riskPercentage ? parseFloat(riskPercentage) / 100 : null;
        const tpP = cryptoTP ? parseFloat(cryptoTP) : null;
    
        if (isNaN(entryP) || isNaN(slP)) {
             setPositionSize(null); 
             setCryptoRiskRewardRatio(null);
             return;
        }

        if (!isNaN(accVal) && riskPctVal !== null && riskPctVal > 0) {
            const riskAmount = accVal * riskPctVal;
            const priceDiffSL = Math.abs(entryP - slP);
            setPositionSize(priceDiffSL > 0 ? riskAmount / priceDiffSL : null);
        } else {
            setPositionSize(null);
        }
    
        if (tpP !== null && !isNaN(tpP)) {
            const risk = Math.abs(entryP - slP);
            const reward = Math.abs(tpP - entryP);
            setCryptoRiskRewardRatio(risk > 0 ? reward / risk : null);
        } else {
            setCryptoRiskRewardRatio(null);
        }
    };
    useEffect(calculateCryptoValues, [cryptoEntry, cryptoSL, cryptoTP, riskPercentage, accountBalance]);
    
    const fetchMarketData = async () => {
        setLoading(true); setError(null);
        try {
            const url = 'https://coinranking1.p.rapidapi.com/coins?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h&tiers=1&orderBy=marketCap&orderDirection=desc&limit=50&offset=0';
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': 'f0ad4a4797msh17ff46665ba9c66p1e5399jsnd422cb1c94df',
                    'x-rapidapi-host': 'coinranking1.p.rapidapi.com'
                }
            };
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            
            const coinsToUpdate = Object.keys(coinPrices);
            const newPrices = { ...coinPrices };
            coinsToUpdate.forEach(symbol => {
                const coinData = result.data.coins.find((c: any) => c.symbol === symbol);
                newPrices[symbol] = coinData ? parseFloat(coinData.price) : null;
                 if (!coinData) console.warn(`${symbol} price not found.`);
            });
            setCoinPrices(newPrices);
        } catch (e: any) { 
            console.error("Market Price Fetch API Error:", e); 
            setError(e.message);
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchMarketData();
        const intervalId = setInterval(fetchMarketData, 20 * 60 * 1000); 
        return () => clearInterval(intervalId);
    }, []);

    const sendNotification = (coin: string, price: number) => {
        const notificationTitle = 'Price Alert!';
        const notificationOptions: NotificationOptions = {
            body: `${coin} is within your waiting price range at $${price.toFixed(2)}`,
            icon: '/icon-192x192.png', 
        };
        console.log("Attempting to send notification for:", coin, price);

        if (typeof window !== 'undefined' && 'Notification' in window) {
             console.log("Notification API available. Permission:", Notification.permission);
            if (Notification.permission === 'granted') {
                 console.log("Permission granted.");
                if (isMobile() && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    console.log("Mobile device & SW active. Using Service Worker for notification.");
                    navigator.serviceWorker.ready.then(registration => {
                        console.log("Service Worker is ready. Attempting to show notification via SW for", coin);
                        registration.showNotification(notificationTitle, notificationOptions)
                            .then(() => console.log('Notification sent via Service Worker for', coin))
                            .catch(err => { 
                                console.error('Service Worker notification error for', coin, ':', err);
                                console.log("Falling back to Notification API for mobile due to SW error for", coin);
                                try {
                                    new Notification(notificationTitle, notificationOptions);
                                    console.log('Notification sent via Notification API on mobile (fallback) for', coin);
                                } catch (fallbackErr) {
                                    console.error('Mobile fallback Notification API error for', coin, ':', fallbackErr);
                                }
                            });
                    }).catch(swReadyError => {
                        console.error("Service Worker ready error for", coin, ":", swReadyError);
                        console.log("Falling back to Notification API for mobile due to SW ready error for", coin);
                         try {
                            new Notification(notificationTitle, notificationOptions);
                            console.log('Notification sent via Notification API on mobile (fallback SW ready error) for', coin);
                        } catch (fallbackErr) {
                            console.error('Mobile fallback SW ready Notification API error for', coin, ':', fallbackErr);
                        }
                    });
                } else {
                    console.log("Desktop or no SW controller. Using Notification API directly for", coin);
                    try {
                        new Notification(notificationTitle, notificationOptions);
                        console.log('Notification sent via Notification API for', coin);
                    } catch (err) {
                        console.error('Desktop Notification API error for', coin, ':', err);
                    }
                }
            } else {
                console.warn('Notification permission not granted. Please enable notifications in your browser settings.');
                requestNotificationPermission(); 
            }
        } else {
            console.warn('Notifications not supported in this environment.');
        }
    };
    
    useEffect(() => {
        Object.keys(coinPrices).forEach(coin => {
            const marketPrice = coinPrices[coin];
            const waitingPriceRange = waitingPrices[coin];
            if (marketPrice && waitingPriceRange) {
                const [lowStr, highStr] = waitingPriceRange.split('-').map(s => s.trim());
                const low = parseFloat(lowStr), high = parseFloat(highStr);
                if (!isNaN(low) && !isNaN(high) && marketPrice >= low && marketPrice <= high) {
                    sendNotification(coin, marketPrice);
                }
            }
        });
    }, [coinPrices, waitingPrices]);

    const getStatus = (coin: string) => {
        const marketPrice = coinPrices[coin];
        const waitingPriceRange = waitingPrices[coin];
        if (!marketPrice || !waitingPriceRange) return null;
        const [lowStr, highStr] = waitingPriceRange.split('-').map(s => s.trim());
        const low = parseFloat(lowStr), high = parseFloat(highStr);
        if (isNaN(low) || isNaN(high)) return 'Invalid range';
        if (marketPrice > high) return 'Above';
        if (marketPrice < low) return 'Below';
        return 'Within';
    };
    
    const navItems = [
        { id: 'epic-notes', label: 'Epic Notes', icon: Notebook },
        { id: 'pips', label: 'Pips', icon: DollarSign },
        { id: 'crypto', label: 'Crypto', icon: Bitcoin },
        { id: 'market', label: 'Market', icon: LineChart },
    ];
    
    const inputClassName = "form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141414] focus:outline-0 focus:ring-0 border border-[#e0e0e0] bg-white focus:border-[#e0e0e0] h-14 placeholder:text-[#757575] p-[15px] text-base font-normal leading-normal";
    const labelClassName = "block text-sm font-medium text-[#141414] mb-1";


    return (
        <main className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden">
            <div>
                <header className="flex items-center bg-white p-4 pb-2 justify-between">
                    <h1 className="text-[#141414] text-lg font-bold leading-tight tracking-[-0.015em] flex-1">PX</h1>
                    {fomcDateString && (
                        <div className="flex w-auto items-center justify-end">
                           <p className="text-[#757575] text-sm font-bold leading-normal tracking-[0.015em] shrink-0 whitespace-nowrap">{fomcDateString}</p>
                        </div>
                    )}
                </header>

                <div className="flex-grow overflow-y-auto p-4 pb-[76px]">
                    <div className="w-full max-w-md mx-auto">
                        {activeTab === 'epic-notes' && (
                            <div className="space-y-4">
                                 <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-0 py-3">
                                    <label className="flex flex-col min-w-40 flex-1">
                                        <Input
                                            ref={inputRef}
                                            type="text"
                                            placeholder="Add a new task..."
                                            value={newTaskDescription}
                                            onChange={(e) => setNewTaskDescription(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className={inputClassName}
                                        />
                                    </label>
                                </div>
                                <div className="divide-y divide-[#e0e0e0]">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="flex items-center justify-between py-3">
                                            <div className="flex items-center">
                                                <Button variant="ghost" size="icon" className="mr-2 rounded-full h-8 w-8 hover:bg-gray-100" onClick={() => handleCompleteTask(task.id)}>
                                                    {task.completed ? <Check className="h-5 w-5 text-green-500"/> : <Circle className="h-5 w-5 text-[#757575]"/>}
                                                </Button>
                                                <span className={cn('text-base', task.completed ? 'line-through text-[#757575]' : 'text-[#141414]')}>
                                                    {task.description}
                                                </span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full" onClick={() => handleDeleteTask(task.id)}>
                                                <Trash className="h-4 w-4 text-red-500"/>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'pips' && (
                            <div className="space-y-4 pt-3">
                                <div>
                                    <label htmlFor="stopLoss" className={labelClassName}>Stop Loss</label>
                                    <Input type="number" id="stopLoss" className={inputClassName} value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="entry" className={labelClassName}>Entry</label>
                                    <Input type="number" id="entry" className={inputClassName} value={entry} onChange={(e) => setEntry(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="takeProfit" className={labelClassName}>Take Profit</label>
                                    <Input type="number" id="takeProfit" className={inputClassName} value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="decimalPlaces" className={labelClassName}>Decimal Places</label>
                                    <select id="decimalPlaces" className={cn(inputClassName, "p-[15px] h-14")} value={decimalPlaces} onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}>
                                        {[1,2,3,4,5].map(dp => <option key={dp} value={dp}>{dp}</option>)}
                                    </select>
                                </div>
                                {pipsOfRisk !== null && pipsOfReward !== null && riskRewardRatio !== null && (
                                    <div className="space-y-1 mt-3 p-3 bg-gray-50 rounded-xl border border-[#e0e0e0]">
                                        <p className="text-lg font-semibold text-[#141414]">Result:</p>
                                        <p className="text-[#141414]">Pips of Risk: <span className="font-medium">{pipsOfRisk.toFixed(2)}</span></p>
                                        <p className="text-[#141414]">Pips of Reward: <span className="font-medium">{pipsOfReward.toFixed(2)}</span></p>
                                        <p className="text-[#141414]">Risk/Reward Ratio: <span className="font-medium">{riskRewardRatio.toFixed(2)}</span></p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'crypto' && (
                             <div className="space-y-4 pt-3">
                                <div>
                                    <label htmlFor="accountBalance" className={labelClassName}>Account Balance</label>
                                    <Input type="number" id="accountBalance" className={inputClassName} value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="cryptoEntry" className={labelClassName}>Entry Price</label>
                                    <Input type="number" id="cryptoEntry" className={inputClassName} value={cryptoEntry} onChange={(e) => setCryptoEntry(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="cryptoSL" className={labelClassName}>Stop Loss</label>
                                    <Input type="number" id="cryptoSL" className={inputClassName} value={cryptoSL} onChange={(e) => setCryptoSL(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="cryptoTP" className={labelClassName}>Take Profit</label>
                                    <Input type="number" id="cryptoTP" className={inputClassName} value={cryptoTP} onChange={(e) => setCryptoTP(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="riskPercentage" className={labelClassName}>Risk Percentage</label>
                                    <Input type="number" id="riskPercentage" className={inputClassName} value={riskPercentage} onChange={(e) => setRiskPercentage(e.target.value)} />
                                </div>
                                {(positionSize !== null || cryptoRiskRewardRatio !== null) && (
                                    <div className="space-y-1 mt-3 p-3 bg-gray-50 rounded-xl border border-[#e0e0e0]">
                                        <p className="text-lg font-semibold text-[#141414]">Result:</p>
                                        {positionSize !== null && <p className="text-[#141414]">Position Size: <span className="font-medium">{positionSize.toFixed(4)}</span></p>}
                                        {cryptoRiskRewardRatio !== null && <p className="text-[#141414]">Risk/Reward Ratio: <span className="font-medium">{cryptoRiskRewardRatio.toFixed(2)}</span></p>}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'market' && (
                            <div className="space-y-2 pt-3">
                                {loading && <p className="text-center text-[#757575]">Loading market data...</p>}
                                {error && <p className="text-center text-red-500">{error}</p>}
                                <div className="grid grid-cols-1 gap-y-2">
                                    {Object.keys(coinPrices).map((coinSymbol) => (
                                        <div key={coinSymbol} className="space-y-2 pb-2">
                                            <p className="text-base text-[#141414] px-0 pt-2">
                                                {coinSymbol}: <span className="font-medium">{coinPrices[coinSymbol] !== null ? `$${coinPrices[coinSymbol]!.toFixed(2)}` : 'Loading...'}</span>
                                            </p>
                                            <div className="space-y-2">
                                                <Input
                                                    type="text"
                                                    className={inputClassName}
                                                    value={waitingPrices[coinSymbol] || ''}
                                                    onChange={(e) => setWaitingPrices(prev => ({...prev, [coinSymbol]: e.target.value}))}
                                                />
                                                {waitingPrices[coinSymbol] && coinPrices[coinSymbol] && (
                                                    <p className="text-sm text-[#141414]">Status: <span className={cn(
                                                        getStatus(coinSymbol) === 'Within' ? 'text-green-500' : 
                                                        getStatus(coinSymbol) === 'Above' || getStatus(coinSymbol) === 'Below' ? 'text-red-500' : 'text-[#757575]'
                                                    )}>{getStatus(coinSymbol)}</span></p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div>
              <div className="flex gap-2 border-t border-[#f2f2f2] bg-white px-4 pb-3 pt-2">
                  {navItems.map(item => (
                      <button // Changed from <a> to <button> for semantic correctness
                          key={item.id}
                          onClick={() => setActiveTab(item.id as ActiveView)}
                          className={cn(
                              "flex flex-1 flex-col items-center justify-end gap-1 rounded-full py-1", // Added py-1 for a bit of vertical padding in the button
                              activeTab === item.id ? "text-[#141414]" : "text-[#757575]"
                          )}
                          aria-current={activeTab === item.id ? "page" : undefined}
                      >
                          <div className={cn("flex h-8 w-8 items-center justify-center", // Ensured icon container fixed size
                            activeTab === item.id ? "text-[#141414]" : "text-[#757575]")}>
                              <item.icon className="h-6 w-6" /> {/* Standardized icon size */}
                          </div>
                          {/* Removed text label as per visual example if icons are sufficient, or add small text below if needed */}
                          {/* <span className="text-xs">{item.label}</span> */}
                      </button>
                  ))}
              </div>
              <div className="h-5 bg-white"></div> {/* Safe area padding for bottom */}
            </div>
        </main>
    );
}
