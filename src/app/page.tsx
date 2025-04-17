'use client';

import {useState, useEffect, useRef} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Check, Circle, Trash} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useToast} from '@/hooks/use-toast';
import {Input} from '@/components/ui/input';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';

interface Task {
    id: string;
    description: string;
    completed: boolean;
    suggestedSchedule: string;
}

export default function Home() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const {toast} = useToast();
    const inputRef = useRef<HTMLInputElement>(null);

    // Forex Calculator State
    const [stopLoss, setStopLoss] = useState('');
    const [entry, setEntry] = useState('');
    const [takeProfit, setTakeProfit] = useState('');
    const [decimalPlaces, setDecimalPlaces] = useState(5); // Default to 5 decimal places
    const [pipsOfRisk, setPipsOfRisk] = useState<number | null>(null);
    const [pipsOfReward, setPipsOfReward] = useState<number | null>(null);
    const [riskRewardRatio, setRiskRewardRatio] = useState<number | null>(null);

    // Crypto Position Sizing Calculator State
    const [cryptoEntry, setCryptoEntry] = useState('');
    const [cryptoSL, setCryptoSL] = useState('');
    const [cryptoTP, setCryptoTP] = useState('');
    const [riskPercentage, setRiskPercentage] = useState('');
    const [positionSize, setPositionSize] = useState<number | null>(null);
    const [accountBalance, setAccountBalance] = useState('');

    // Market Price State
    const [marketData, setMarketData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [coinPrices, setCoinPrices] = useState<{
        BTC: number | null;
        ETH: number | null;
        BNB: number | null;
        SOL: number | null;
        TON: number | null;
    }>({
        BTC: null,
        ETH: null,
        BNB: null,
        SOL: null,
        TON: null,
    });

    const [waitingPrices, setWaitingPrices] = useState<{
        BTC: string | null;
        ETH: string | null;
        BNB: string | null;
        SOL: string | null;
        TON: string | null;
    }>({
        BTC: null,
        ETH: null,
        BNB: null,
        SOL: null,
        TON: null,
    });

    const getStatus = (coin: string) => {
        const marketPrice = coinPrices[coin as keyof typeof coinPrices] || 0;
        const waitingPrice = waitingPrices[coin as keyof typeof waitingPrices] || '';

        if (!marketPrice || !waitingPrice) return null;

        // Extract low and high prices from the waiting price string
        const [lowStr, highStr] = waitingPrice.split('-').map(s => s.trim());

        const low = parseFloat(lowStr);
        const high = parseFloat(highStr);

        if (isNaN(low) || isNaN(high)) return 'Invalid range';

        if (marketPrice > high) {
            return 'Above';
        } else if (marketPrice < low) {
            return 'Below';
        } else {
            return 'Within';
        }
    };


    useEffect(() => {
        // Load tasks from local storage on component mount
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        }

        // Load waiting prices from local storage on component mount
        const storedWaitingPrices = localStorage.getItem('waitingPrices');
        if (storedWaitingPrices) {
            setWaitingPrices(JSON.parse(storedWaitingPrices));
        }

        requestNotificationPermission();
    }, []);

    useEffect(() => {
        // Save tasks to local storage whenever the tasks state changes
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Save waiting prices to local storage whenever the waitingPrices state changes
        localStorage.setItem('waitingPrices', JSON.stringify(waitingPrices));
    }, [tasks, waitingPrices]);

    const handleAddTask = async () => {
        if (newTaskDescription.trim() !== '') {
            try {
                const newTask: Task = {
                    id: Date.now().toString(),
                    description: newTaskDescription,
                    completed: false,
                    suggestedSchedule: '',
                };
                setTasks([...tasks, newTask]);
                setNewTaskDescription('');
                inputRef.current?.focus(); // Refocus on the input field
                toast({
                    title: 'Task Added!',
                    description: 'Your task has been successfully added to the list.',
                });
            } catch (error: any) {
                toast({
                    title: 'Error adding task',
                    description: error.message,
                    variant: 'destructive',
                });
            }
        } else {
            toast({
                title: 'Error',
                description: 'Task description cannot be empty.',
                variant: 'destructive',
            });
        }
    };

    const handleCompleteTask = (id: string) => {
        setTasks(
            tasks.map((task) =>
                task.id === id ? {...task, completed: !task.completed} : task
            )
        );
    };

    const handleDeleteTask = (id: string) => {
        setTasks(tasks.filter((task) => task.id !== id));
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleAddTask();
        }
    };

    // Forex calculations
    const calculatePips = () => {
        if (!stopLoss || !entry || !takeProfit) {
            setPipsOfRisk(null);
            setPipsOfReward(null);
            setRiskRewardRatio(null);
            return;
        }

        const stopLossValue = parseFloat(stopLoss);
        const entryValue = parseFloat(entry);
        const takeProfitValue = parseFloat(takeProfit);

        if (isNaN(stopLossValue) || isNaN(entryValue) || isNaN(takeProfitValue)) {
            setPipsOfRisk(null);
            setPipsOfReward(null);
            setRiskRewardRatio(null);
            return;
        }

        const risk = Math.abs(entryValue - stopLossValue) * Math.pow(10, decimalPlaces);
        const reward = Math.abs(takeProfitValue - entryValue) * Math.pow(10, decimalPlaces);
        const ratio = risk > 0 ? reward / risk : 0;

        setPipsOfRisk(risk);
        setPipsOfReward(reward);
        setRiskRewardRatio(ratio);
    };

    useEffect(() => {
        calculatePips();
    }, [stopLoss, entry, takeProfit, decimalPlaces]);

    // Crypto Position Sizing Calculation
    const calculatePositionSize = () => {
        if (!cryptoEntry || !cryptoSL || !riskPercentage || !accountBalance) {
            setPositionSize(null);
            return;
        }

        const entryPrice = parseFloat(cryptoEntry);
        const stopLossPrice = parseFloat(cryptoSL);
        const riskPct = parseFloat(riskPercentage) / 100; // Convert percentage to decimal
        const accountValue = parseFloat(accountBalance);

        if (isNaN(entryPrice) || isNaN(stopLossPrice) || isNaN(riskPct) || isNaN(accountValue)) {
            setPositionSize(null);
            return;
        }

        const riskAmount = accountValue * riskPct;
        const priceDifference = Math.abs(entryPrice - stopLossPrice);

        const calculatedPositionSize = riskAmount / priceDifference;

        setPositionSize(calculatedPositionSize);
    };

    useEffect(() => {
        calculatePositionSize();
    }, [cryptoEntry, cryptoSL, riskPercentage, accountBalance]);

    // Market Price API
    useEffect(() => {
        const fetchMarketData = async () => {
            setLoading(true);
            setError(null);
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
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                // Find Bitcoin's price
                const btc = result.data.coins.find((coin: any) => coin.symbol === 'BTC');
                const eth = result.data.coins.find((coin: any) => coin.symbol === 'ETH');
                const bnb = result.data.coins.find((coin: any) => coin.symbol === 'BNB');
                const sol = result.data.coins.find((coin: any) => coin.symbol === 'SOL');
                const ton = result.data.coins.find((coin: any) => coin.symbol === 'TON');

                if (btc) {
                    setCoinPrices(prev => ({...prev, BTC: parseFloat(btc.price)}));
                } else {
                    setError('Bitcoin price not found');
                }
                if (eth) {
                    setCoinPrices(prev => ({...prev, ETH: parseFloat(eth.price)}));
                } else {
                    setError('Ethereum price not found');
                }
                if (bnb) {
                    setCoinPrices(prev => ({...prev, BNB: parseFloat(bnb.price)}));
                } else {
                    setError('Binance Coin price not found');
                }
                if (sol) {
                    setCoinPrices(prev => ({...prev, SOL: parseFloat(sol.price)}));
                } else {
                    setError('Solana price not found');
                }
                if (ton) {
                    setCoinPrices(prev => ({...prev, TON: parseFloat(ton.price)}));
                } else {
                    setError('Toncoin price not found');
                }
            } catch (e: any) {
                setError(e.message);
                console.error("Market Price Fetch Error:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();
        const intervalId = setInterval(fetchMarketData, 3600000); // Fetch every 1 hour

        return () => clearInterval(intervalId); // Clean up interval on unmount
    }, []);

    useEffect(() => {
        const checkWaitingPrices = () => {
            if (Notification.permission === 'granted') {
                Object.keys(coinPrices).forEach((coin: string) => {
                    const marketPrice = coinPrices[coin as keyof typeof coinPrices];
                    const waitingPrice = waitingPrices[coin as keyof typeof waitingPrices];

                    if (marketPrice && waitingPrice) {
                        const [lowStr, highStr] = waitingPrice.split('-').map(s => s.trim());
                        const low = parseFloat(lowStr);
                        const high = parseFloat(highStr);

                        if (!isNaN(low) && !isNaN(high) && marketPrice >= low && marketPrice <= high) {
                            sendNotification(coin, marketPrice);
                        }
                    }
                });
            }
        };

        checkWaitingPrices();
    }, [coinPrices, waitingPrices]);

    const requestNotificationPermission = async () => {
        if (typeof window !== 'undefined') {
            if (Notification.permission === 'default') {
                try {
                    const permission = await Notification.requestPermission();
                    console.log(`Notification permission ${permission}.`);
                } catch (error) {
                    console.error("Error requesting notification permission:", error);
                }
            } else if (Notification.permission === 'granted') {
                console.log("Notification permission granted.");
            }

             // Register service worker for mobile devices
             if ('serviceWorker' in navigator) {
                try {
                    // Ensure the service worker file is in the public directory
                    const registration = await navigator.serviceWorker.register('/service-worker.js');
                    console.log('Service worker registered successfully:', registration);
                } catch (error) {
                    console.error('Service worker registration failed:', error);
                }
            }
        }
    };

    const sendNotification = (coin: string, price: number) => {
        if (typeof window !== 'undefined') {
            console.log("sendNotification called"); // Log: Function called
            console.log("Navigator userAgent:", navigator.userAgent); // Log: User agent

            if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile')) {
                console.log("Mobile device detected, attempting Service Worker notification"); // Log: Mobile check

                // Mobile: Use Service Worker
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    console.log("Service Worker is active, sending message"); // Log: SW active
                    navigator.serviceWorker.controller.postMessage({
                        type: 'PRICE_ALERT',
                        payload: {
                            coin,
                            price,
                        },
                    });
                    console.log("Message posted to Service Worker"); // Log: Message posted
                } else {
                    console.log("Service Worker not available, attempting registration"); // Log: SW not available
                    navigator.serviceWorker.register('/service-worker.js')
                        .then(registration => {
                            console.log('Service worker registered successfully:', registration);
                            registration.showNotification('Price Alert!', {
                                body: `${coin} is within your waiting price range at $${price.toFixed(2)}`,
                                icon: '/favicon.ico',
                            });
                        })
                        .catch(error => {
                            console.error('Service worker registration failed:', error);
                        });
                }
            } else {
                console.log("Desktop device detected, attempting Browser Notification API"); // Log: Desktop check
                // Web: Use Browser Notifications API
                if (Notification.permission === 'granted') {
                    console.log("Notification permission is granted, sending notification"); // Log: Perm granted
                    new Notification('Price Alert!', {
                        body: `${coin} is within your waiting price range at $${price.toFixed(2)}`,
                        icon: '/favicon.ico',
                    });
                    console.log("Browser notification sent"); // Log: Notification sent
                } else {
                    console.log("Notification permission not granted"); // Log: Perm not granted
                }
            }
        }
    };


    return (
        <main className="flex flex-col items-center justify-start min-h-screen bg-secondary p-4 md:p-10">
            <Card className="w-full max-w-md space-y-4 bg-white shadow-md rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xl font-semibold">TaskFlow</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="Epic Notes" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="Epic Notes">Epic Notes</TabsTrigger>
                            <TabsTrigger value="Pips">Pips</TabsTrigger>
                            <TabsTrigger value="Crypto">Crypto</TabsTrigger>
                            <TabsTrigger value="Market">Market</TabsTrigger>
                        </TabsList>
                        <TabsContent value="Epic Notes" className="space-y-4">
                            <div className="divide-y divide-gray-200">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="mr-2 rounded-full h-8 w-8"
                                                onClick={() => handleCompleteTask(task.id)}
                                            >
                                                {task.completed ? (
                                                    <Check className="h-4 w-4 text-primary"/>
                                                ) : (
                                                    <Circle className="h-4 w-4 text-gray-400"/>
                                                )}
                                            </Button>
                                            <span
                                                className={cn(
                                                    'text-sm',
                                                    task.completed && 'line-through text-gray-400'
                                                )}
                                            >
                                        {task.description}
                                    </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8"
                                                    onClick={() => handleDeleteTask(task.id)}>
                                                <Trash className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                            </div>
                            <div className="flex items-center p-4">
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Add a new task..."
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="mr-2 flex-grow"
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="Pips" className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <div className="mb-4 grid grid-cols-1 gap-2">
                                        <label htmlFor="stopLoss"
                                               className="block text-sm font-medium text-gray-700">
                                            Stop Loss
                                        </label>
                                        <Input
                                            type="number"
                                            id="stopLoss"
                                            className="mt-1"
                                            value={stopLoss}
                                            onChange={(e) => setStopLoss(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-4 grid grid-cols-1 gap-2">
                                        <label htmlFor="entry" className="block text-sm font-medium text-gray-700">
                                            Entry
                                        </label>
                                        <Input
                                            type="number"
                                            id="entry"
                                            className="mt-1"
                                            value={entry}
                                            onChange={(e) => setEntry(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-4 grid grid-cols-1 gap-2">
                                        <label htmlFor="takeProfit"
                                               className="block text-sm font-medium text-gray-700">
                                            Take Profit
                                        </label>
                                        <Input
                                            type="number"
                                            id="takeProfit"
                                            className="mt-1"
                                            value={takeProfit}
                                            onChange={(e) => setTakeProfit(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-4 grid grid-cols-1 gap-2">
                                        <label htmlFor="decimalPlaces"
                                               className="block text-sm font-medium text-gray-700">
                                            Decimal Places
                                        </label>
                                        <select
                                            id="decimalPlaces"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={decimalPlaces}
                                            onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                                        >
                                            <option value={1}>1</option>
                                            <option value={2}>2</option>
                                            <option value={3}>3</option>
                                            <option value={4}>4</option>
                                            <option value={5}>5</option>
                                        </select>
                                    </div>
                                </div>
                                {pipsOfRisk !== null && pipsOfReward !== null && riskRewardRatio !== null && (
                                    <div className="space-y-2">
                                        <p className="text-green-500">Result:</p>
                                        <p>Pips of Risk: {pipsOfRisk.toFixed(2)}</p>
                                        <p>Pips of Reward: {pipsOfReward.toFixed(2)}</p>
                                        <p>Risk/Reward Ratio: {riskRewardRatio.toFixed(2)}</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="Crypto" className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <div className="mb-4 grid grid-cols-1 gap-2">
                                        <label htmlFor="accountBalance"
                                               className="block text-sm font-medium text-gray-700">
                                            Account Balance
                                        </label>
                                        <Input
                                            type="number"
                                            id="accountBalance"
                                            className="mt-1"
                                            value={accountBalance}
                                            onChange={(e) => setAccountBalance(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-4 grid grid-cols-1 gap-2">
                                        <label htmlFor="cryptoEntry"
                                               className="block text-sm font-medium text-gray-700">
                                            Entry Price
                                        </label>
                                        <Input
                                            type="number"
                                            id="cryptoEntry"
                                            className="mt-1"
                                            value={cryptoEntry}
                                            onChange={(e) => setCryptoEntry(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-4 grid grid-cols-1 gap-2">
                                        <label htmlFor="cryptoSL"
                                               className="block text-sm font-medium text-gray-700">
                                            Stop Loss
                                        </label>
                                        <Input
                                            type="number"
                                            id="cryptoSL"
                                            className="mt-1"
                                            value={cryptoSL}
                                            onChange={(e) => setCryptoSL(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-4 grid grid-cols-1 gap-2">
                                        <label htmlFor="cryptoTP"
                                               className="block text-sm font-medium text-gray-700">
                                            Take Profit (Optional)
                                        </label>
                                        <Input
                                            type="number"
                                            id="cryptoTP"
                                            className="mt-1"
                                            value={cryptoTP}
                                            onChange={(e) => setCryptoTP(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-4 grid grid-cols-1 gap-2">
                                        <label htmlFor="riskPercentage"
                                               className="block text-sm font-medium text-gray-700">
                                            Risk Percentage
                                        </label>
                                        <Input
                                            type="number"
                                            id="riskPercentage"
                                            className="mt-1"
                                            value={riskPercentage}
                                            onChange={(e) => setRiskPercentage(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {positionSize !== null && (
                                    <div className="space-y-2">
                                        <p className="text-green-500">Result:</p>
                                        <p>Position Size: {positionSize.toFixed(4)}</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="Market" className="space-y-4">
                            {loading && <p>Loading market data...</p>}
                            {error && <p className="text-red-500">Error: {error}</p>}
                            <div className="grid gap-4">
                                <div>
                                    <p>BTC: {coinPrices.BTC !== null ? `$${coinPrices.BTC.toFixed(2)}` : 'Loading...'}</p>
                                    <Input
                                        type="text"
                                        placeholder="Waiting Price (e.g., 20000-21000)"
                                        value={waitingPrices.BTC || ''}
                                        onChange={(e) => setWaitingPrices(prev => ({...prev, BTC: e.target.value}))}
                                    />
                                    {waitingPrices.BTC && coinPrices.BTC && (
                                        <p>Status: {getStatus('BTC')}</p>
                                    )}
                                </div>
                                <div>
                                    <p>ETH: {coinPrices.ETH !== null ? `$${coinPrices.ETH.toFixed(2)}` : 'Loading...'}</p>
                                    <Input
                                        type="text"
                                        placeholder="Waiting Price (e.g., 1500-1600)"
                                        value={waitingPrices.ETH || ''}
                                        onChange={(e) => setWaitingPrices(prev => ({...prev, ETH: e.target.value}))}
                                    />
                                    {waitingPrices.ETH && coinPrices.ETH && (
                                        <p>Status: {getStatus('ETH')}</p>
                                    )}
                                </div>
                                <div>
                                    <p>BNB: {coinPrices.BNB !== null ? `$${coinPrices.BNB.toFixed(2)}` : 'Loading...'}</p>
                                    <Input
                                        type="text"
                                        placeholder="Waiting Price (e.g., 250-260)"
                                        value={waitingPrices.BNB || ''}
                                        onChange={(e) => setWaitingPrices(prev => ({...prev, BNB: e.target.value}))}
                                    />
                                    {waitingPrices.BNB && coinPrices.BNB && (
                                        <p>Status: {getStatus('BNB')}</p>
                                    )}
                                </div>
                                <div>
                                    <p>SOL: {coinPrices.SOL !== null ? `$${coinPrices.SOL.toFixed(2)}` : 'Loading...'}</p>
                                    <Input
                                        type="text"
                                        placeholder="Waiting Price (e.g., 20-21)"
                                        value={waitingPrices.SOL || ''}
                                        onChange={(e) => setWaitingPrices(prev => ({...prev, SOL: e.target.value}))}
                                    />
                                    {waitingPrices.SOL && coinPrices.SOL && (
                                        <p>Status: {getStatus('SOL')}</p>
                                    )}
                                </div>
                                <div>
                                    <p>TON: {coinPrices.TON !== null ? `$${coinPrices.TON.toFixed(2)}` : 'Loading...'}</p>
                                    <Input
                                        type="text"
                                        placeholder="Waiting Price (e.g., 2-2.1)"
                                        value={waitingPrices.TON || ''}
                                        onChange={(e) => setWaitingPrices(prev => ({...prev, TON: e.target.value}))}
                                    />
                                    {waitingPrices.TON && coinPrices.TON && (
                                        <p>Status: {getStatus('TON')}</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </main>
    );
}
