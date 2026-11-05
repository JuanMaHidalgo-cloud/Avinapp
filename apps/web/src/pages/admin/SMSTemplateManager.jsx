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
import { MessageSquare, Plus, Edit2, Trash2, Play } from 'lucide-react';

const SMSTemplateManager = () => {
  const { brokerId } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', message: '' });

  useEffect(() => {
    if (brokerId) fetchTemplates();
  }, [brokerId]);

  const fetchTemplates = async () => {
    try {
      const records = await pb.collection('sms_templates').getFullList({ filter: `broker_id="${brokerId}"`, $autoCancel: false });
      setTemplates(records);
    } catch (err) {
      toast.error('Failed to load SMS templates');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        broker_id: brokerId,
        template_id: formData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
        character_count: formData.message.length,
        is_active: true
      };
      if (formData.id) {
        await pb.collection('sms_templates').update(formData.id, payload, { $autoCancel: false });
        toast.success('Template updated');
      } else {
        await pb.collection('sms_templates').create(payload, { $autoCancel: false });
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
      await pb.collection('sms_templates').delete(id, { $autoCancel: false });
      toast.success('Template deleted');
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SMS Templates</h1>
            <p className="text-muted-foreground">Manage text message communications</p>
          </div>
          <Button onClick={() => { setFormData({ id: null, name: '', message: '' }); setIsEditing(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New SMS Template
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Message Preview</TableHead>
                <TableHead>Length</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary"/> {t.name}</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-xs">{t.message}</TableCell>
                  <TableCell>
                    <Badge variant={t.character_count > 160 ? 'destructive' : 'secondary'}>{t.character_count}/160</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => { setFormData(t); setIsEditing(true); }}><Edit2 className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader><DialogTitle>{formData.id ? 'Edit SMS Template' : 'New SMS Template'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Message Body</Label>
                  <span className={`text-xs ${formData.message.length > 160 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                    {formData.message.length} / 160 chars
                  </span>
                </div>
                <Textarea required className="min-h-[100px]" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
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

export default SMSTemplateManager;