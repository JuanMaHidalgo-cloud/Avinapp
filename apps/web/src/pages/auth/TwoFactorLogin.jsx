import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const TwoFactorLogin = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    if (code.length === 6) {
      toast.success('Authentication successful');
      navigate('/dashboard');
    } else {
      toast.error('Invalid code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Enter the code from your authenticator app</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <Label className="sr-only">Authentication Code</Label>
              <Input 
                required 
                placeholder="000000" 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                maxLength={6} 
                className="text-center text-2xl tracking-widest h-14" 
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg">Verify</Button>
            <div className="text-center">
              <Button variant="link" type="button" className="text-muted-foreground">Use a backup code</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorLogin;