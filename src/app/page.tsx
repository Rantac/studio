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


  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-secondary p-4 md:p-10">
      <Card className="w-full max-w-md space-y-4 bg-white shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-semibold">TaskFlow</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="forex">Forex Pips Calculator</TabsTrigger>
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
                  <div className="mb-4">
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
                  <div className="mb-4">
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
                  <div className="mb-4">
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
                  <div className="mb-4">
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
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
