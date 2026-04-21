import React, { useEffect, useState } from 'react';
import { subscribeToTasks, createTask, updateTaskStatus, deleteTask, subscribeToLeads } from '@/lib/db';
import { useAuth } from '@/lib/AuthContext';
import { Task, Lead } from '@/types';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/app-card';
import { Button } from '@/components/common/app-button';
import { Input } from '@/components/common/app-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/app-select';
import { CheckCircle2, Circle, Trash2, UserCircle2 } from 'lucide-react';
import { Badge } from '@/components/common/app-badge';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // New task form state
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    
    let tasksLoaded = false;
    let leadsLoaded = false;

    const checkLoading = () => {
      if (tasksLoaded && leadsLoaded) setLoading(false);
    };

    const unsubTasks = subscribeToTasks(
      user.uid,
      (data) => {
        setTasks(data);
        tasksLoaded = true;
        checkLoading();
      },
      (err) => console.error(err)
    );

    const unsubLeads = subscribeToLeads(
      user.uid,
      (data) => {
        setLeads(data);
        leadsLoaded = true;
        checkLoading();
      },
      (err) => console.error(err)
    );

    return () => {
      unsubTasks();
      unsubLeads();
    };
  }, [user]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTaskText.trim()) return;

    await createTask({
      userId: user.uid,
      leadId: selectedLeadId || 'general',
      text: newTaskText.trim(),
      status: 'Pending',
      createdAt: Date.now()
    }, user);

    setNewTaskText('');
  };

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await updateTaskStatus(task.id!, newStatus, user);
  };

  if (loading) return <div>Loading tasks...</div>;

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
      </div>

      <Card className="shadow-sm border-0 ring-1 ring-gray-200">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-lg">Add New Task</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="What needs to be done?"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-[250px]">
              <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Associate with lead..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Task (No Lead)</SelectItem>
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id!}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={!newTaskText.trim()}>Add Task</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card className="shadow-sm border-0 ring-1 ring-gray-200">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg flex items-center justify-between">
              Pending Tasks
              <Badge variant="secondary">{pendingTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending tasks</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {pendingTasks.map(task => {
                  const lead = leads.find(l => l.id === task.leadId);
                  return (
                    <li key={task.id} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors group">
                      <button onClick={() => toggleTask(task)} className="text-gray-300 hover:text-blue-600 mt-0.5 transition-colors">
                        <Circle className="h-5 w-5" />
                      </button>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-gray-900">{task.text}</p>
                        {lead && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <UserCircle2 className="h-3.5 w-3.5" />
                            <span>{lead.name} • {lead.pipeline_stage}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <span className="text-xs text-gray-400">{format(task.createdAt, 'MMM d')}</span>
                        <button onClick={() => deleteTask(task.id!, user)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card className="shadow-sm border-0 ring-1 ring-gray-200 opacity-60">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg flex items-center justify-between">
              Completed Tasks
              <Badge variant="secondary">{completedTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             {completedTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No completed tasks yet</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {completedTasks.slice(0, 10).map(task => {
                  const lead = leads.find(l => l.id === task.leadId);
                  return (
                    <li key={task.id} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors group">
                      <button onClick={() => toggleTask(task)} className="text-green-500 hover:text-gray-400 mt-0.5 transition-colors">
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <div className="flex-1 space-y-1">
                        <p className="text-gray-500 line-through">{task.text}</p>
                        {lead && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <UserCircle2 className="h-3.5 w-3.5" />
                            <span>{lead.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <span className="text-xs text-gray-300">{format(task.createdAt, 'MMM d')}</span>
                        <button onClick={() => deleteTask(task.id!, user)} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
