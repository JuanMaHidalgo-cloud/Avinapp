import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Webhook, Plus, Settings2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const WebhookManagement = () => {
  const { brokerId } = useAuth();
  const [webhooks, setWebhooks] = useState([]);

  useEffect(() => {
    if (brokerId) fetchWebhooks();
  }, [brokerId]);

  const fetchWebhooks = async () => {
    try {
      const records = await pb.collection('webhooks').getFullList({
        filter: `broker_id="${brokerId}"`,
        sort: '-created',
        $autoCancel: false
      });
      setWebhooks(records);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
            <p className="text-muted-foreground mt-1">Configure real-time event notifications</p>
          </div>
          <Button className="gap-2"><Plus className="h-4 w-4"/> Add Webhook</Button>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Target URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map(wh => (
                  <TableRow key={wh.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Webhook className="h-4 w-4 text-primary" /> {wh.event_type}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                      {wh.target_url}
                    </TableCell>
                    <TableCell>
                      {wh.is_active ? <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge> : <Badge>Disabled</Badge>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">None</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon"><Settings2 className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {webhooks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No webhooks configured.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default WebhookManagement;