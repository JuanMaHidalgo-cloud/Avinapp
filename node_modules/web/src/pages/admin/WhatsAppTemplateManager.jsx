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
import { MessageCircle, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

const WhatsAppTemplateManager = () => {
  const { brokerId } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', message: '', media_url: '' });

  useEffect(() => {
    if (brokerId) fetchTemplates();
  }, [brokerId]);

  const fetchTemplates = async () => {
    try {
      const records = await pb.collection('whatsapp_templates').getFullList({ filter: `broker_id="${brokerId}"`, $autoCancel: false });
      setTemplates(records);
    } catch (err) {
      toast.error('Failed to load WhatsApp templates');
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
        await pb.collection('whatsapp_templates').update(formData.id, payload, { $autoCancel: false });
        toast.success('Template updated');
      } else {
        await pb.collection('whatsapp_templates').create(payload, { $autoCancel: false });
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
      await pb.collection('whatsapp_templates').delete(id, { $autoCancel: false });
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
            <h1 className="text-3xl font-bold tracking-tight">WhatsApp Templates</h1>
            <p className="text-muted-foreground">Manage rich media WhatsApp messages</p>
          </div>
          <Button onClick={() => { setFormData({ id: null, name: '', message: '', media_url: '' }); setIsEditing(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New WhatsApp Template
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Message Preview</TableHead>
                <TableHead>Media</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium flex items-center gap-2"><MessageCircle className="h-4 w-4 text-green-500"/> {t.name}</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-xs">{t.message}</TableCell>
                  <TableCell>
                    {t.media_url ? <Badge variant="outline" className="gap-1"><ImageIcon className="h-3 w-3"/> Attached</Badge> : <span className="text-muted-foreground text-sm">None</span>}
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
            <DialogHeader><DialogTitle>{formData.id ? 'Edit WhatsApp Template' : 'New WhatsApp Template'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Message Body</Label>
                <Textarea required className="min-h-[100px]" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Media URL (Optional)</Label>
                <Input placeholder="https://example.com/image.jpg" value={formData.media_url} onChange={e => setFormData({...formData, media_url: e.target.value})} />
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

export default WhatsAppTemplateManager;