import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Mail, Plus, Edit2, Trash2, Play } from 'lucide-react';

const EmailTemplateManager = () => {
  const { brokerId } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', subject: '', body: '' });

  useEffect(() => {
    if (brokerId) {
      fetchTemplates();
      fetchLogs();
    }
  }, [brokerId]);

  const fetchTemplates = async () => {
    try {
      const records = await pb.collection('email_templates').getFullList({ filter: `broker_id="${brokerId}"`, $autoCancel: false });
      setTemplates(records);
    } catch (err) {
      toast.error('Failed to load templates');
    }
  };

  const fetchLogs = async () => {
    try {
      const records = await pb.collection('email_logs').getList(1, 10, { filter: `broker_id="${brokerId}"`, sort: '-created', $autoCancel: false });
      setLogs(records.items);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        broker_id: brokerId,
        template_id: formData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
        is_active: true
      };
      if (formData.id) {
        await pb.collection('email_templates').update(formData.id, payload, { $autoCancel: false });
        toast.success('Template updated');
      } else {
        await pb.collection('email_templates').create(payload, { $autoCancel: false });
        toast.success('Template created');
      }
      setIsEditing(false);
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to save template');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete template?')) return;
    try {
      await pb.collection('email_templates').delete(id, { $autoCancel: false });
      toast.success('Template deleted');
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleTestSend = async (template) => {
    toast.success(`Test email sent for ${template.name}`);
    // In a real app, this would call a backend endpoint or PocketBase hook
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
            <p className="text-muted-foreground">Manage automated email communications</p>
          </div>
          <Button onClick={() => { setFormData({ id: null, name: '', subject: '', body: '' }); setIsEditing(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Template
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium flex items-center gap-2"><Mail className="h-4 w-4 text-primary"/> {t.name}</TableCell>
                  <TableCell className="text-muted-foreground">{t.subject}</TableCell>
                  <TableCell><Badge variant={t.is_active ? 'default' : 'secondary'}>{t.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleTestSend(t)}><Play className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setFormData(t); setIsEditing(true); }}><Edit2 className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Email Logs</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>{l.recipient_email}</TableCell>
                    <TableCell className="text-muted-foreground">{l.subject}</TableCell>
                    <TableCell><Badge variant="outline">{l.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(l.created).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{formData.id ? 'Edit Template' : 'New Template'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>HTML Body</Label>
                <p className="text-xs text-muted-foreground">Available variables: {'{{client_name}}, {{policy_number}}, {{coverage_amount}}'}</p>
                <Textarea required className="min-h-[200px] font-mono text-sm" value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit">Save Template</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default EmailTemplateManager;