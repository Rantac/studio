
'use client';

import {useState, useEffect, useRef} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Circle, Trash, Plus, Notebook, DollarSign, Calculator, LineChart } from 'lucide-react';
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
                try {
                    const permission = await Notification.requestPermission();
                    console.log(`Notification permission ${permission}.`);
                } catch (error) {
                    console.error("Error requesting notification permission:", error);
                }
            }
        }
    };
    
    useEffect(() => {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) setTasks(JSON.parse(storedTasks));
        const storedWaitingPrices = localStorage.getItem('waitingPrices');
        if (storedWaitingPrices) setWaitingPrices(JSON.parse(storedWaitingPrices));
        
        requestNotificationPermission();

        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => console.log('Service Worker registered with scope:', registration.scope))
                .catch(error => console.error('Service worker registration failed:', error));
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

      // Sort meetings to handle year rollover correctly
      const sortedMeetings = [...fomcMeetingDates].sort((a, b) => {
        const dateA = new Date(currentYear, getMonthIndex(a.month), a.startDay);
        const dateB = new Date(currentYear, getMonthIndex(b.month), b.startDay);
        return dateA.getTime() - dateB.getTime();
      });
      
      for (const meeting of sortedMeetings) {
        const meetingEndDate = new Date(currentYear, getMonthIndex(meeting.month), meeting.endDay, 23, 59, 59, 999);
        if (meetingEndDate >= today) {
          upcomingMeetingData = { ...meeting, year: currentYear };
          break; 
        }
      }

      if (!upcomingMeetingData && sortedMeetings.length > 0) {
        // If all meetings for the current year have passed, show the first meeting of the next year
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
        if (!cryptoEntry || !cryptoSL || !accountBalance) { setPositionSize(null); setCryptoRiskRewardRatio(null); return; }
        const entryP = parseFloat(cryptoEntry), slP = parseFloat(cryptoSL), accVal = parseFloat(accountBalance);
        const riskPctVal = riskPercentage ? parseFloat(riskPercentage) / 100 : null;

        if (isNaN(entryP) || isNaN(slP) || isNaN(accVal) || (riskPercentage && isNaN(riskPctVal!))) {
            setPositionSize(null); setCryptoRiskRewardRatio(null); return;
        }
        if (riskPctVal !== null) {
            const riskAmount = accVal * riskPctVal;
            const priceDiffSL = Math.abs(entryP - slP);
            setPositionSize(priceDiffSL > 0 ? riskAmount / priceDiffSL : null);
        } else { setPositionSize(null); }

        if (cryptoTP) {
            const tpP = parseFloat(cryptoTP);
            if (!isNaN(tpP)) {
                const risk = Math.abs(entryP - slP);
                const reward = Math.abs(tpP - entryP);
                setCryptoRiskRewardRatio(risk > 0 ? reward / risk : null);
            } else { setCryptoRiskRewardRatio(null); }
        } else { setCryptoRiskRewardRatio(null); }
    };
    useEffect(calculateCryptoValues, [cryptoEntry, cryptoSL, cryptoTP, riskPercentage, accountBalance]);
    
    useEffect(() => {
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
                
                const coinsToUpdate = ["BTC", "ETH", "BNB", "SOL", "TON", "LTC", "XRP", "XLM", "LINK"];
                const newPrices = { ...coinPrices };
                coinsToUpdate.forEach(symbol => {
                    const coinData = result.data.coins.find((c: any) => c.symbol === symbol);
                    newPrices[symbol] = coinData ? parseFloat(coinData.price) : null;
                    if (!coinData) console.warn(`${symbol} price not found.`);
                });
                setCoinPrices(newPrices);
            } catch (e: any) { console.error("Market Price Fetch API Error:", e); setError(e.message);
            } finally { setLoading(false); }
        };
        fetchMarketData();
        const intervalId = setInterval(fetchMarketData, 20 * 60 * 1000); // 20 minutes
        return () => clearInterval(intervalId);
    }, []);

    const sendNotification = (coin: string, price: number) => {
        const notificationTitle = 'Price Alert!';
        const notificationOptions: NotificationOptions = {
            body: `${coin} is within your waiting price range at $${price.toFixed(2)}`,
            icon: '/favicon.ico', // Ensure you have a favicon.ico in your public folder
        };
        console.log("Attempting to send notification...");

        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                console.log("Notification permission granted.");
                if (isMobile() && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    console.log("Mobile device detected. Using Service Worker for notification.");
                    navigator.serviceWorker.ready.then(registration => {
                        console.log("Service Worker is ready. Attempting to show notification.");
                        registration.showNotification(notificationTitle, notificationOptions)
                            .then(() => console.log('Notification sent via Service Worker.'))
                            .catch(err => console.error('Service Worker notification error:', err));
                    }).catch(swReadyError => console.error("Service Worker ready error:", swReadyError));
                } else {
                    console.log("Desktop or no SW. Using Notification API.");
                    try {
                        new Notification(notificationTitle, notificationOptions);
                        console.log('Notification sent via Notification API.');
                    } catch (err) { console.error('Notification API error:', err); }
                }
            } else { console.warn('Notification permission not granted.'); }
        } else { console.warn('Notifications not supported.'); }
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
        { id: 'crypto', label: 'Crypto', icon: Calculator },
        { id: 'market', label: 'Market', icon: LineChart },
    ];

    return (
        <main className="flex flex-col h-screen bg-background">
            <header className="p-4 border-b border-border bg-card shadow-sm">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <h1 className="text-2xl font-bold text-foreground">PX</h1>
                    {fomcDateString && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{fomcDateString}</span>
                    )}
                </div>
            </header>

            <div className="flex-grow overflow-y-auto p-4 pb-[76px]"> {/* Padding bottom for nav bar */}
                <div className="w-full max-w-md mx-auto">
                    {activeTab === 'epic-notes' && (
                        <Card className="shadow-subtle rounded-lg">
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center mt-1 space-x-2">
                                    <Input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Add a new task..."
                                        value={newTaskDescription}
                                        onChange={(e) => setNewTaskDescription(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="flex-grow bg-input text-foreground placeholder:text-muted-foreground rounded-lg border-border focus:ring-ring focus:border-ring shadow-subtle"
                                    />
                                    <Button
                                        onClick={handleAddTask}
                                        className="bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white rounded-lg"
                                        size="icon"
                                        aria-label="Add task"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="divide-y divide-border">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="flex items-center justify-between py-3 hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center">
                                                <Button variant="ghost" size="icon" className="mr-2 rounded-full h-8 w-8 hover:bg-accent/10" onClick={() => handleCompleteTask(task.id)}>
                                                    {task.completed ? <Check className="h-5 w-5 text-accent"/> : <Circle className="h-5 w-5 text-muted-foreground"/>}
                                                </Button>
                                                <span className={cn('text-base text-foreground', task.completed && 'line-through text-muted-foreground')}>
                                                    {task.description}
                                                </span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/10 rounded-full" onClick={() => handleDeleteTask(task.id)}>
                                                <Trash className="h-4 w-4 text-accent"/>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'pips' && (
                        <Card className="shadow-subtle rounded-lg">
                            <CardContent className="p-4 space-y-4">
                                <div className="grid gap-4">
                                    <div>
                                        <label htmlFor="stopLoss" className="block text-sm font-medium text-muted-foreground mb-1">Stop Loss</label>
                                        <Input type="number" id="stopLoss" className="bg-input text-foreground placeholder:text-muted-foreground rounded-lg border-border focus:ring-ring focus:border-ring shadow-subtle" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="entry" className="block text-sm font-medium text-muted-foreground mb-1">Entry</label>
                                        <Input type="number" id="entry" className="bg-input text-foreground placeholder:text-muted-foreground rounded-lg border-border focus:ring-ring focus:border-ring shadow-subtle" value={entry} onChange={(e) => setEntry(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="takeProfit" className="block text-sm font-medium text-muted-foreground mb-1">Take Profit</label>
                                        <Input type="number" id="takeProfit" className="bg-input text-foreground placeholder:text-muted-foreground rounded-lg border-border focus:ring-ring focus:border-ring shadow-subtle" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="decimalPlaces" className="block text-sm font-medium text-muted-foreground mb-1">Decimal Places</label>
                                        <select id="decimalPlaces" className="mt-1 block w-full rounded-lg border-border bg-input text-foreground shadow-subtle focus:border-ring focus:ring-ring sm:text-sm p-2.5" value={decimalPlaces} onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}>
                                            {[1,2,3,4,5].map(dp => <option key={dp} value={dp}>{dp}</option>)}
                                        </select>
                                    </div>
                                    {pipsOfRisk !== null && pipsOfReward !== null && riskRewardRatio !== null && (
                                        <div className="space-y-1 mt-3 p-3 bg-secondary/50 rounded-lg shadow-sm">
                                            <p className="text-lg font-semibold text-[#8E44AD]">Result:</p>
                                            <p className="text-foreground">Pips of Risk: <span className="font-medium text-primary">{pipsOfRisk.toFixed(2)}</span></p>
                                            <p className="text-foreground">Pips of Reward: <span className="font-medium text-primary">{pipsOfReward.toFixed(2)}</span></p>
                                            <p className="text-foreground">Risk/Reward Ratio: <span className="font-medium text-primary">{riskRewardRatio.toFixed(2)}</span></p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'crypto' && (
                        <Card className="shadow-subtle rounded-lg">
                            <CardContent className="p-4 space-y-4">
                                <div className="grid gap-4">
                                    <div>
                                        <label htmlFor="accountBalance" className="block text-sm font-medium text-muted-foreground mb-1">Account Balance</label>
                                        <Input type="number" id="accountBalance" className="bg-input text-foreground placeholder:text-muted-foreground rounded-lg border-border focus:ring-ring focus:border-ring shadow-subtle" value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="cryptoEntry" className="block text-sm font-medium text-muted-foreground mb-1">Entry Price</label>
                                        <Input type="number" id="cryptoEntry" className="bg-input text-foreground placeholder:text-muted-foreground rounded-lg border-border focus:ring-ring focus:border-ring shadow-subtle" value={cryptoEntry} onChange={(e) => setCryptoEntry(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="cryptoSL" className="block text-sm font-medium text-muted-foreground mb-1">Stop Loss</label>
                                        <Input type="number" id="cryptoSL" className="bg-input text-foreground placeholder:text-muted-foreground rounded-lg border-border focus:ring-ring focus:border-ring shadow-subtle" value={cryptoSL} onChange={(e) => setCryptoSL(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="cryptoTP" className="block text-sm font-medium text-muted-foreground mb-1">Take Profit</label>
                                        <Input type="number" id="cryptoTP" className="bg-input text-foreground placeholder:text-muted-foreground rounded-lg border-border focus:ring-ring focus:border-ring shadow-subtle" value={cryptoTP} onChange={(e) => setCryptoTP(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="riskPercentage" className="block text-sm font-medium text-muted-foreground mb-1">Risk Percentage</label>
                                        <Input type="number" id="riskPercentage" className="bg-input text-foreground placeholder:text-muted-foreground rounded-lg border-border focus:ring-ring focus:border-ring shadow-subtle" value={riskPercentage} onChange={(e) => setRiskPercentage(e.target.value)} />
                                    </div>
                                    {(positionSize !== null || cryptoRiskRewardRatio !== null) && (
                                        <div className="space-y-1 mt-3 p-3 bg-secondary/50 rounded-lg shadow-sm">
                                            <p className="text-lg font-semibold text-[#8E44AD]">Result:</p>
                                            {positionSize !== null && <p className="text-foreground">Position Size: <span className="font-medium text-primary">{positionSize.toFixed(4)}</span></p>}
                                            {cryptoRiskRewardRatio !== null && <p className="text-foreground">Risk/Reward Ratio: <span className="font-medium text-primary">{cryptoRiskRewardRatio.toFixed(2)}</span></p>}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'market' && (
                        <div className="space-y-4">
                            {loading && <p className="text-center text-muted-foreground">Loading market data...</p>}
                            {error && <p className="text-center text-destructive">{error}</p>}
                            <div className="grid grid-cols-1 gap-y-4">
                                {Object.keys(coinPrices).map((coinSymbol) => (
                                    <div key={coinSymbol} className="space-y-2 pb-2">
                                        <p className="text-lg text-foreground font-normal px-3 pt-2">{coinSymbol}: <span className="text-primary">{coinPrices[coinSymbol] !== null ? `$${coinPrices[coinSymbol]!.toFixed(2)}` : 'Loading...'}</span></p>
                                        <Card className="mx-3">
                                            <CardContent className="p-3 space-y-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Waiting Price (e.g., 20000-21000)"
                                                    className="bg-input text-foreground placeholder:text-muted-foreground rounded-lg border-border focus:ring-ring focus:border-ring shadow-subtle"
                                                    value={waitingPrices[coinSymbol] || ''}
                                                    onChange={(e) => setWaitingPrices(prev => ({...prev, [coinSymbol]: e.target.value}))}
                                                />
                                                {waitingPrices[coinSymbol] && coinPrices[coinSymbol] && (
                                                    <p className="mt-1 text-sm text-foreground">Status: <span className={cn(
                                                        getStatus(coinSymbol) === 'Within' ? 'text-accent' : 
                                                        getStatus(coinSymbol) === 'Above' || getStatus(coinSymbol) === 'Below' ? 'text-destructive' : 'text-muted-foreground'
                                                    )}>{getStatus(coinSymbol)}</span></p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 flex justify-around bg-card border-t border-border shadow-md">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as ActiveView)}
                        className={cn(
                            "flex flex-col items-center justify-center flex-1 p-2 text-xs hover:bg-muted/30 transition-colors",
                            activeTab === item.id ? "text-primary font-medium border-t-2 border-primary" : "text-muted-foreground"
                        )}
                        style={{ minHeight: '60px' }} 
                    >
                        <item.icon className={cn("h-5 w-5 mb-0.5", activeTab === item.id ? "text-primary" : "text-muted-foreground")} />
                        {item.label}
                    </button>
                ))}
            </nav>
        </main>
    );

    