import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Smartphone, Mail } from 'lucide-react';

const TwoFactorManagement = () => {
  const { currentUser } = useAuth();
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    if (currentUser) fetchMethods();
  }, [currentUser]);

  const fetchMethods = async () => {
    try {
      const records = await pb.collection('user_2fa').getFullList({ filter: `user_id="${currentUser.id}"`, $autoCancel: false });
      setMethods(records);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisable = async (id) => {
    if (!window.confirm('Are you sure you want to disable this 2FA method? This reduces your account security.')) return;
    try {
      await pb.collection('user_2fa').delete(id, { $autoCancel: false });
      toast.success('2FA method disabled');
      fetchMethods();
    } catch (err) {
      toast.error('Failed to disable 2FA');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Two-Factor Authentication</h1>
          <p className="text-muted-foreground">Manage your account security methods</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {methods.length === 0 ? (
              <div className="text-center py-8 bg-muted/50 rounded-xl border border-dashed">
                <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">You don't have any 2FA methods configured.</p>
                <Button onClick={() => window.location.href = '/setup-2fa'}>Set Up 2FA</Button>
              </div>
            ) : (
              methods.map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {m.method === 'totp' ? <Smartphone className="h-5 w-5 text-primary" /> : <Mail className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{m.method === 'totp' ? 'Authenticator App' : m.method}</p>
                      <p className="text-sm text-muted-foreground">Added on {new Date(m.created).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>
                    <Button variant="ghost" className="text-destructive" onClick={() => handleDisable(m.id)}>Disable</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TwoFactorManagement;