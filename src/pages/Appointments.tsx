import React, { useEffect, useState } from 'react';
import { subscribeToAppointments, createAppointment, deleteAppointment, updateAppointmentStatus } from '@/lib/db';
import { useAuth } from '@/lib/AuthContext';
import { Appointment, AppointmentStatus } from '@/types';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (!user) return;
    return subscribeToAppointments(
      user.uid,
      (data) => {
        setAppointments(data);
        setLoading(false);
      },
      (err) => console.error(err)
    );
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !date || !time) return;

    // Create a precise timestamp from input type="date" and "time"
    const dateTimeString = `${date}T${time}`;
    const timestamp = new Date(dateTimeString).getTime();

    await createAppointment({
      userId: user.uid,
      title,
      date: timestamp,
      status: 'Scheduled',
      createdAt: Date.now()
    }, user);

    setTitle('');
    setDate('');
    setTime('');
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    await updateAppointmentStatus(id, newStatus, user);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>

      <Card className="shadow-sm border-0 ring-1 ring-gray-200">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-lg">Schedule New Appointment</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title / Topic</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g., Vehicle Test Drive" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
            <div className="md:col-span-4 flex justify-end mt-2">
              <Button type="submit" disabled={!title || !date || !time}>Schedule Appointment</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 border border-dashed rounded-lg bg-white">
            No appointments scheduled
          </div>
        ) : (
          appointments.map(appt => (
            <Card key={appt.id} className="shadow-sm border-0 ring-1 ring-gray-200 hover:ring-blue-300 transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-gray-900 leading-tight">{appt.title}</h3>
                  <Badge variant={appt.status === 'Scheduled' ? 'default' : appt.status === 'Completed' ? 'secondary' : 'destructive'} 
                         className={appt.status === 'Completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                    {appt.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>{format(appt.date, 'EEEE, MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>{format(appt.date, 'h:mm a')}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t flex justify-between items-center gap-2">
                  <Select value={appt.status} onValueChange={(val) => handleStatusChange(appt.id!, val as AppointmentStatus)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="ghost" size="icon" onClick={() => deleteAppointment(appt.id!, user)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
