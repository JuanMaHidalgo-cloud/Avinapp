import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const UserActivityLog = () => {
  const { brokerId } = useAuth();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [brokerId]);

  const fetchLogs = async () => {
    try {
      // Need to filter by users that belong to this broker
      // Pocketbase join query simulation or relying on backend
      const records = await pb.collection('user_activity').getList(1, 50, {
        sort: '-timestamp',
        expand: 'user_id',
        $autoCancel: false
      });
      
      // Filter client-side for safety if rules don't strictly isolate yet
      const filtered = records.items.filter(log => log.expand?.user_id?.broker_id === brokerId);
      setLogs(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'login': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'logout': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      case 'create_record': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'delete_record': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
            <p className="text-muted-foreground mt-1">Timeline of user actions and events</p>
          </div>
          <Button variant="outline" className="gap-2 bg-background"><Download className="h-4 w-4"/> Export</Button>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {log.timestamp ? format(parseISO(log.timestamp), 'MMM dd, yyyy HH:mm:ss') : '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.expand?.user_id?.email || log.user_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${getActionColor(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.resource_type ? `${log.resource_type} (${log.resource_id?.slice(0,6)})` : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {log.ip_address || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default UserActivityLog;