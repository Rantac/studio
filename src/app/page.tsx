'use client';

import {useState, useEffect, useRef} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Check, Circle, Trash} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useToast} from '@/hooks/use-toast';
import {Input} from '@/components/ui/input';

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

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-secondary p-4 md:p-10">
      <Card className="w-full max-w-md space-y-4 bg-white shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-semibold">TaskFlow</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
        </CardContent>
      </Card>
    </main>
  );
}
