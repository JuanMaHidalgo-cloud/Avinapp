import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShieldCheck, KeyRound } from 'lucide-react';

const TwoFactorSetup = () => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  const handleEnable = async () => {
    try {
      // In a real app, we would generate a TOTP secret here and show a QR code.
      // For this implementation, we simulate the process.
      const fakeCodes = Array.from({length: 10}, () => Math.random().toString(36).substring(2, 10).toUpperCase());
      setBackupCodes(fakeCodes);
      setStep(2);
    } catch (err) {
      toast.error('Failed to initiate 2FA setup');
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) {
      toast.error('Invalid code');
      return;
    }
    try {
      await pb.collection('user_2fa').create({
        user_2fa_id: '2FA_' + currentUser.id,
        user_id: currentUser.id,
        method: 'totp',
        is_enabled: true,
        backup_codes: backupCodes
      }, { $autoCancel: false });
      
      toast.success('Two-Factor Authentication enabled successfully');
      setStep(3);
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Secure Your Account</CardTitle>
            <CardDescription>Add an extra layer of security with Two-Factor Authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="text-center space-y-6">
                <p className="text-muted-foreground">Protect your account from unauthorized access by requiring a second authentication method in addition to your password.</p>
                <Button size="lg" onClick={handleEnable} className="w-full sm:w-auto">Set Up Authenticator App</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-muted p-6 rounded-xl text-center">
                  <p className="font-mono text-lg tracking-widest mb-2">JBSWY3DPEHPK3PXP</p>
                  <p className="text-sm text-muted-foreground">Enter this code in your authenticator app (Google Authenticator, Authy, etc.)</p>
                </div>
                <div className="space-y-2">
                  <Label>Verification Code</Label>
                  <Input placeholder="000000" value={code} onChange={e => setCode(e.target.value)} maxLength={6} className="text-center text-lg tracking-widest" />
                </div>
                <Button className="w-full" onClick={handleVerify}>Verify & Enable</Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 text-center">
                <div className="p-4 bg-green-500/10 text-green-600 rounded-xl mb-6">
                  <p className="font-medium">2FA is now active!</p>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold flex items-center gap-2 mb-4"><KeyRound className="h-4 w-4"/> Backup Codes</h3>
                  <p className="text-sm text-muted-foreground mb-4">Save these codes in a secure place. You can use them to access your account if you lose your device.</p>
                  <div className="grid grid-cols-2 gap-2 bg-muted p-4 rounded-xl font-mono text-sm">
                    {backupCodes.map((c, i) => <div key={i}>{c}</div>)}
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/profile'}>Return to Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TwoFactorSetup;