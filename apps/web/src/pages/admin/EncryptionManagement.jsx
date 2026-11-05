import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Lock, RefreshCw, ShieldAlert } from 'lucide-react';

const EncryptionManagement = () => {
  const { brokerId } = useAuth();
  const [keys, setKeys] = useState([]);

  useEffect(() => {
    if (brokerId) fetchKeys();
  }, [brokerId]);

  const fetchKeys = async () => {
    try {
      const records = await pb.collection('encryption_keys').getFullList({ filter: `broker_id="${brokerId}"`, sort: '-created', $autoCancel: false });
      setKeys(records);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRotate = async () => {
    if (!window.confirm('Are you sure you want to rotate the master encryption key? This process may take a few minutes.')) return;
    try {
      await pb.collection('encryption_keys').create({
        key_id: 'KEY_' + Date.now(),
        broker_id: brokerId,
        key_name: 'Master Key v' + (keys.length + 1),
        key_version: keys.length + 1,
        is_active: true,
        rotated_at: new Date().toISOString()
      }, { $autoCancel: false });
      
      // Deactivate old keys
      for (const key of keys) {
        if (key.is_active) {
          await pb.collection('encryption_keys').update(key.id, { is_active: false }, { $autoCancel: false });
        }
      }
      
      toast.success('Encryption key rotated successfully');
      fetchKeys();
    } catch (err) {
      toast.error('Failed to rotate key');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Encryption</h1>
            <p className="text-muted-foreground">Manage cryptographic keys for sensitive data</p>
          </div>
          <Button onClick={handleRotate} className="gap-2"><RefreshCw className="h-4 w-4"/> Rotate Master Key</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full"><Lock className="h-6 w-6 text-primary"/></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Encryption Status</p>
                <p className="text-2xl font-bold text-primary">AES-256-GCM</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full"><ShieldAlert className="h-6 w-6 text-muted-foreground"/></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Encrypted Fields</p>
                <p className="text-2xl font-bold">14 Fields</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Key History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created / Rotated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map(k => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium font-mono text-sm">{k.key_name}</TableCell>
                    <TableCell>v{k.key_version}</TableCell>
                    <TableCell>
                      {k.is_active ? <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge> : <Badge variant="secondary">Archived</Badge>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(k.created).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {keys.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No keys found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EncryptionManagement;