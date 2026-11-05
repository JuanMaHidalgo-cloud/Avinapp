import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { KeyRound, Plus, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const APIManagement = () => {
  const { brokerId } = useAuth();
  const [keys, setKeys] = useState([]);

  useEffect(() => {
    if (brokerId) fetchKeys();
  }, [brokerId]);

  const fetchKeys = async () => {
    try {
      const records = await pb.collection('api_keys').getFullList({
        filter: `broker_id="${brokerId}"`,
        sort: '-created',
        $autoCancel: false
      });
      setKeys(records);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      await pb.collection('api_keys').create({
        api_key_id: 'KEY_' + Date.now(),
        broker_id: brokerId,
        key_name: 'New Integration Key',
        api_key: 'sk_live_' + crypto.randomUUID().replace(/-/g, ''),
        api_secret: crypto.randomUUID(),
        is_active: true
      }, { $autoCancel: false });
      toast.success('API Key generated');
      fetchKeys();
    } catch (err) {
      toast.error('Failed to create key');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this API key permanently? Integrations using it will fail.')) return;
    try {
      await pb.collection('api_keys').delete(id, { $autoCancel: false });
      toast.success('Key deleted');
      fetchKeys();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const maskKey = (key) => {
    if (!key) return '';
    return key.slice(0, 8) + '••••••••••••' + key.slice(-4);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground mt-1">Manage API credentials for external integrations</p>
          </div>
          <Button onClick={handleCreate} className="gap-2"><Plus className="h-4 w-4"/> Generate New Key</Button>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map(k => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-primary" /> {k.key_name}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {maskKey(k.api_key)}
                    </TableCell>
                    <TableCell>
                      {k.is_active ? <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge> : <Badge>Inactive</Badge>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">Never</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => {navigator.clipboard.writeText(k.api_key); toast.success('Copied!');}}>
                        <Copy className="h-4 w-4"/>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(k.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {keys.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No API keys found.</TableCell>
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

export default APIManagement;