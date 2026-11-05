import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, MessageCircle } from 'lucide-react';

const NotificationCenter = () => {
  const { brokerId } = useAuth();
  const [logs, setLogs] = useState({ email: [], sms: [], whatsapp: [] });

  useEffect(() => {
    if (brokerId) fetchAllLogs();
  }, [brokerId]);

  const fetchAllLogs = async () => {
    try {
      const [emailRes, smsRes, waRes] = await Promise.all([
        pb.collection('email_logs').getList(1, 20, { filter: `broker_id="${brokerId}"`, sort: '-created', $autoCancel: false }),
        pb.collection('sms_logs').getList(1, 20, { filter: `broker_id="${brokerId}"`, sort: '-created', $autoCancel: false }),
        pb.collection('whatsapp_logs').getList(1, 20, { filter: `broker_id="${brokerId}"`, sort: '-created', $autoCancel: false })
      ]);
      setLogs({ email: emailRes.items, sms: smsRes.items, whatsapp: waRes.items });
    } catch (err) {
      console.error(err);
    }
  };

  const renderTable = (data, type) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Recipient</TableHead>
          <TableHead>Content</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(item => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.recipient_email || item.recipient_phone}</TableCell>
            <TableCell className="text-muted-foreground truncate max-w-[200px]">{item.subject || item.message}</TableCell>
            <TableCell><Badge variant="outline">{item.status}</Badge></TableCell>
            <TableCell className="text-sm text-muted-foreground">{new Date(item.created).toLocaleString()}</TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No logs found.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Unified Notification Center</h1>
            <p className="text-muted-foreground">Monitor all outbound communications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Email Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{logs.email.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{logs.sms.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">WhatsApp Sent</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{logs.whatsapp.length}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="email">
              <TabsList className="mb-4">
                <TabsTrigger value="email">Email Logs</TabsTrigger>
                <TabsTrigger value="sms">SMS Logs</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp Logs</TabsTrigger>
              </TabsList>
              <TabsContent value="email">{renderTable(logs.email, 'email')}</TabsContent>
              <TabsContent value="sms">{renderTable(logs.sms, 'sms')}</TabsContent>
              <TabsContent value="whatsapp">{renderTable(logs.whatsapp, 'whatsapp')}</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NotificationCenter;