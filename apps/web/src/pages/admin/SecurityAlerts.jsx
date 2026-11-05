import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

const SecurityAlerts = () => {
  const { brokerId } = useAuth();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (brokerId) fetchAlerts();
  }, [brokerId]);

  const fetchAlerts = async () => {
    try {
      const records = await pb.collection('audit_logs').getList(1, 20, { 
        filter: `security_event=true`, 
        sort: '-created', 
        expand: 'user_id',
        $autoCancel: false 
      });
      setAlerts(records.items);
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskBadge = (level) => {
    switch(level) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'high': return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">High</Badge>;
      case 'medium': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Medium</Badge>;
      default: return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Alerts</h1>
            <p className="text-muted-foreground">Monitor suspicious activities and potential threats</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive"/> Recent Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Event Summary</TableHead>
                  <TableHead>User / IP</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm text-muted-foreground">{new Date(a.created).toLocaleString()}</TableCell>
                    <TableCell>{getRiskBadge(a.risk_level)}</TableCell>
                    <TableCell className="font-medium">{a.changes_summary || 'Suspicious Activity Detected'}</TableCell>
                    <TableCell className="text-sm">
                      <div>{a.expand?.user_id?.email || 'Unknown'}</div>
                      <div className="text-muted-foreground font-mono text-xs">{a.ip_address}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Investigate</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {alerts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <ShieldAlert className="h-8 w-8 mx-auto mb-3 opacity-20" />
                      No security alerts detected.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SecurityAlerts;