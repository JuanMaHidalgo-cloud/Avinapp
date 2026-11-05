import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SessionManagement = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const records = await pb.collection('user_sessions').getFullList({
        filter: `user_id="${currentUser.id}"`,
        sort: '-login_time',
        $autoCancel: false
      });
      setSessions(records);
    } catch (err) {
      console.error(err);
    }
  };

  const forceLogout = async (id) => {
    try {
      await pb.collection('user_sessions').update(id, { is_active: false, logout_time: new Date().toISOString() }, { $autoCancel: false });
      toast.success('Session terminated');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to terminate session');
    }
  };

  const getDeviceIcon = (type) => {
    if (type === 'mobile') return <Smartphone className="h-4 w-4" />;
    if (type === 'tablet') return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
            <p className="text-muted-foreground mt-1">Manage devices currently logged into your account</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device / Agent</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Login Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map(session => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md text-muted-foreground">
                          {getDeviceIcon(session.device_type)}
                        </div>
                        <div className="text-sm font-medium max-w-[200px] truncate" title={session.user_agent}>
                          {session.user_agent || 'Unknown Device'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{session.ip_address || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {session.login_time ? format(parseISO(session.login_time), 'MMM dd, HH:mm') : '-'}
                    </TableCell>
                    <TableCell>
                      {session.is_active ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Active Now</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground">Ended</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {session.is_active && (
                        <Button variant="ghost" size="sm" onClick={() => forceLogout(session.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                          <LogOut className="h-4 w-4" /> Revoke
                        </Button>
                      )}
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

export default SessionManagement;