import React, { useState } from 'react';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { KeyRound, CheckCircle2, XCircle } from 'lucide-react';

const PasswordPolicy = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const reqs = [
    { label: 'At least 12 characters', met: password.length >= 12 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) }
  ];

  const strength = reqs.filter(r => r.met).length * 20;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (strength < 100) {
      toast.error('Password does not meet all requirements');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    setPassword('');
    setConfirm('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Password & Security</h1>
          <p className="text-muted-foreground">Manage your authentication credentials</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Ensure your account stays secure by using a strong password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" required />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                <Progress value={strength} className="h-2 mt-2" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>

              <div className="bg-muted p-4 rounded-xl space-y-2">
                <p className="text-sm font-medium mb-3">Password Requirements:</p>
                {reqs.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {r.met ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    <span className={r.met ? 'text-foreground' : 'text-muted-foreground'}>{r.label}</span>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full">Update Password</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PasswordPolicy;