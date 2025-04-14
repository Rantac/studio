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
    const [btcPrice, setBtcPrice] = useState<number | null>(null);


  useEffect(() => {
    // Load tasks from local storage on component mount
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
    // Save tasks to local storage whenever the tasks state changes
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

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
                const url = 'https://coinranking1.p.rapidapi.com/stats?referenceCurrencyUuid=yhjMzLPhuIDl';
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
                setMarketData(result.data);
            } catch (e: any) {
                setError(e.message);
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();
    }, []);

    // Market Price API
    useEffect(() => {
        const fetchBtcPrice = async () => {
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
                if (btc) {
                    setBtcPrice(parseFloat(btc.price));
                } else {
                    setError('Bitcoin price not found');
                }
            } catch (e: any) {
                setError(e.message);
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchBtcPrice();
        const intervalId = setInterval(fetchBtcPrice, 3600000); // Fetch every 1 hour

        return () => clearInterval(intervalId); // Clean up interval on unmount
    }, []);


  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-secondary p-4 md:p-10">
      <Card className="w-full max-w-md space-y-4 bg-white shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-semibold">TaskFlow</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="forex">Forex Pips Calculator</TabsTrigger>
                <TabsTrigger value="crypto">Crypto Position Sizing</TabsTrigger>
                <TabsTrigger value="market">Market Price</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="space-y-4">
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
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteTask(task.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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
              </div>
            </TabsContent>
            <TabsContent value="forex" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <div className="mb-4 grid grid-cols-1 gap-2">
                    <label htmlFor="stopLoss" className="block text-sm font-medium text-gray-700">
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
                    <label htmlFor="takeProfit" className="block text-sm font-medium text-gray-700">
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
                    <label htmlFor="decimalPlaces" className="block text-sm font-medium text-gray-700">
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
              <TabsContent value="crypto" className="space-y-4">
                  <div className="grid gap-4">
                      <div className="space-y-2">
                          <div className="mb-4 grid grid-cols-1 gap-2">
                              <label htmlFor="accountBalance" className="block text-sm font-medium text-gray-700">
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
                              <label htmlFor="cryptoEntry" className="block text-sm font-medium text-gray-700">
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
                              <label htmlFor="cryptoSL" className="block text-sm font-medium text-gray-700">
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
                              <label htmlFor="cryptoTP" className="block text-sm font-medium text-gray-700">
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
                              <label htmlFor="riskPercentage" className="block text-sm font-medium text-gray-700">
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
               <TabsContent value="market" className="space-y-4">
                    {loading && <p>Loading market data...</p>}
                    {error && <p className="text-red-500">Error: {error}</p>}
                    {btcPrice !== null ? (
                        <div className="grid gap-4">
                            <p>Bitcoin Price: ${btcPrice.toFixed(2)}</p>
                        </div>
                    ) : (
                        <p>Loading Bitcoin price...</p>
                    )}
                </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}

