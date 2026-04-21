import { useEffect, useState } from 'react';
import { subscribeToLeads } from '@/lib/db';
import { useAuth } from '@/lib/AuthContext';
import { Lead } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/common/app-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/app-card';
import { Button } from '@/components/common/app-button';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/app-table';

export default function Dashboard() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToLeads(
      user.uid,
      (data) => {
        setLeads(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching leads:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  const hotLeads = leads.filter(l => l.status === 'Hot').length;
  const newLeads = leads.filter(l => l.pipeline_stage === 'New Lead').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-9 px-4 py-2 border-blue-200 bg-blue-50 text-blue-700">Webhook Ready</Badge>
          <Button 
            variant="outline" 
            className="h-9" 
            onClick={() => {
              const headers = ['Name', 'Phone', 'Vehicle', 'Budget', 'Timeline', 'Payment', 'Stage', 'Status', 'Date'];
              const rows = leads.map(l => [
                l.name, l.phone, l.vehicle_interest, l.budget, l.timeline, l.payment_type, l.pipeline_stage, l.status, format(new Date(l.createdAt), 'yyyy-MM-dd')
              ]);
              const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "leads_export.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Export to CSV
          </Button>
          <Link to="/chat" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-blue-600 text-primary-foreground hover:bg-blue-600/90 text-white">Open Chat Demo</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Hot Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{hotLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{newLeads}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Vehicle Interest</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    No leads generated yet. Open the AI Chat to simulate a user generating a lead!
                  </TableCell>
                </TableRow>
              ) : leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{lead.vehicle_interest}</TableCell>
                  <TableCell>{lead.budget}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-50">{lead.pipeline_stage}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.status === 'Hot' ? 'destructive' : lead.status === 'Warm' ? 'default' : 'secondary'}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {format(new Date(lead.createdAt), 'MMM d, h:mm a')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
