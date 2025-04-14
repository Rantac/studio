
'use client';

import {useState, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Check, Circle, GripVertical, Plus} from 'lucide-react';
import {cn} from '@/lib/utils';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '@/components/ui/alert-dialog';
import {useToast} from '@/hooks/use-toast';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {ScrollArea} from '@/components/ui/scroll-area';
import {suggestSchedule} from '@/ai/flows/smart-schedule';

interface Task {
  id: string;
  description: string;
  completed: boolean;
  category: string;
  suggestedSchedule: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const {toast} = useToast();

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
        const scheduleSuggestion = await suggestSchedule({
          taskDescription: newTaskDescription,
        });

        const newTask: Task = {
          id: Date.now().toString(),
          description: newTaskDescription,
          completed: false,
          category: selectedCategory,
          suggestedSchedule: scheduleSuggestion.suggestedSchedule,
        };
        setTasks([...tasks, newTask]);
        setNewTaskDescription('');
        setSelectedCategory('General');
        setIsCreateTaskOpen(false);
        toast({
          title: 'Task Added!',
          description: 'Your task has been successfully added to the list.',
        });
      } catch (error: any) {
        toast({
          title: 'Error suggesting schedule',
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

  const handleCategoryChange = (id: string, category: string) => {
    setTasks(
      tasks.map((task) => (task.id === id ? {...task, category} : task))
    );
  };

  const categoryColors: {[category: string]: string} = {
    General: 'bg-gray-100',
    Work: 'bg-red-100',
    Personal: 'bg-blue-100',
    Shopping: 'bg-green-100',
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-secondary p-4 md:p-10">
      <Card className="w-full max-w-md space-y-4 bg-white shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-semibold">TaskFlow</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Task</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter the task description and select a category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    onValueChange={(value) => setSelectedCategory(value)}
                    defaultValue="General"
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddTask}>
                  Add
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px] w-full">
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
                      <div>
                        <small className="text-teal-500">
                          {task.suggestedSchedule}
                        </small>
                      </div>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={task.category}
                      onValueChange={(value) =>
                        handleCategoryChange(task.id, value)
                      }
                    >
                      <SelectTrigger className="w-[120px] h-8 text-sm">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Shopping">Shopping</SelectItem>
                      </SelectContent>
                    </Select>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <GripVertical className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the task from your list.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </main>
  );
}
