import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { format, parseISO, addDays, addWeeks, addMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ScheduledReports = () => {
  const { brokerId } = useAuth();
  const { t } = useLanguage();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    frequency: 'weekly',
    send_day: '1',
    recipients: '',
    report_type: 'summary',
    is_active: true
  });

  useEffect(() => {
    fetchReports();
  }, [brokerId]);

  const fetchReports = async () => {
    if (!brokerId) return;
    try {
      const data = await pb.collection('scheduled_reports').getList(1, 50, {
        filter: `broker_id="${brokerId}"`,
        sort: '-created',
        $autoCancel: false
      });
      setReports(data.items);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    }
  };

  const calculateNextSend = (frequency, sendDay) => {
    const today = new Date();
    const dayValue = Number(sendDay) || 1;
    let nextSend = new Date(today);

    if (frequency === 'weekly') {
      // sendDay is 0 (Sun) to 6 (Sat)
      const currentDay = nextSend.getDay();
      const diff = dayValue - currentDay;
      if (diff <= 0) nextSend = addDays(nextSend, diff + 7);
      else nextSend = addDays(nextSend, diff);
    } else if (frequency === 'monthly') {
      // sendDay is 1-31
      if (today.getDate() >= dayValue) {
        nextSend = addMonths(nextSend, 1);
      }
      nextSend.setDate(Math.min(dayValue, new Date(nextSend.getFullYear(), nextSend.getMonth() + 1, 0).getDate()));
    } else if (frequency === 'biweekly') {
      nextSend = addWeeks(nextSend, 2);
    }
    return nextSend.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const emailsArray = formData.recipients.split(',').map(e => e.trim()).filter(e => e);
      const payload = {
        broker_id: brokerId,
        name: formData.name,
        frequency: formData.frequency,
        send_day: Number(formData.send_day),
        recipients: emailsArray,
        report_type: formData.report_type,
        is_active: formData.is_active,
        next_send: calculateNextSend(formData.frequency, formData.send_day)
      };

      if (formData.id) {
        await pb.collection('scheduled_reports').update(formData.id, payload, { $autoCancel: false });
      } else {
        await pb.collection('scheduled_reports').create(payload, { $autoCancel: false });
      }

      toast.success(t('broker_dashboard.scheduled_reports.save_success'));
      resetForm();
      fetchReports();
    } catch (err) {
      console.error('Error saving scheduled report', err);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled report?')) return;
    try {
      await pb.collection('scheduled_reports').delete(id, { $autoCancel: false });
      toast.success(t('common.success'));
      fetchReports();
    } catch (err) {
      console.error('Error deleting report', err);
      toast.error(t('common.error'));
    }
  };

  const handleEdit = (report) => {
    setFormData({
      id: report.id,
      name: report.name,
      frequency: report.frequency,
      send_day: report.send_day.toString(),
      recipients: Array.isArray(report.recipients) ? report.recipients.join(', ') : '',
      report_type: report.report_type,
      is_active: report.is_active
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      frequency: 'weekly',
      send_day: '1',
      recipients: '',
      report_type: 'summary',
      is_active: true
    });
    setIsEditing(false);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <Card className="shadow-sm border-border/50 sticky top-24">
          <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              {isEditing ? 'Edit Report' : t('broker_dashboard.scheduled_reports.new_report')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('broker_dashboard.scheduled_reports.form.name')}</Label>
                <Input 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('broker_dashboard.scheduled_reports.form.frequency')}</Label>
                <Select value={formData.frequency} onValueChange={v => setFormData({...formData, frequency: v})}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">{t('broker_dashboard.scheduled_reports.form.weekly')}</SelectItem>
                    <SelectItem value="biweekly">{t('broker_dashboard.scheduled_reports.form.biweekly')}</SelectItem>
                    <SelectItem value="monthly">{t('broker_dashboard.scheduled_reports.form.monthly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('broker_dashboard.scheduled_reports.form.send_day')}</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="31" 
                  required 
                  value={formData.send_day}
                  onChange={e => setFormData({...formData, send_day: e.target.value})}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('broker_dashboard.scheduled_reports.form.report_type')}</Label>
                <Select value={formData.report_type} onValueChange={v => setFormData({...formData, report_type: v})}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">{t('broker_dashboard.scheduled_reports.form.summary')}</SelectItem>
                    <SelectItem value="detailed">{t('broker_dashboard.scheduled_reports.form.detailed')}</SelectItem>
                    <SelectItem value="custom">{t('broker_dashboard.scheduled_reports.form.custom')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('broker_dashboard.scheduled_reports.form.recipients')}</Label>
                <Input 
                  required 
                  placeholder="email1@ex.com, email2@ex.com"
                  value={formData.recipients}
                  onChange={e => setFormData({...formData, recipients: e.target.value})}
                  className="bg-background"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2 pb-2">
                <Switch 
                  id="is_active" 
                  checked={formData.is_active}
                  onCheckedChange={v => setFormData({...formData, is_active: v})}
                />
                <Label htmlFor="is_active">{t('broker_dashboard.scheduled_reports.form.is_active')}</Label>
              </div>

              <div className="flex gap-2 pt-2">
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    {t('common.cancel')}
                  </Button>
                )}
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? t('common.saving') : (isEditing ? t('common.save') : t('common.add'))}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2">
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>{t('broker_dashboard.scheduled_reports.title')}</CardTitle>
            <CardDescription>{t('broker_dashboard.scheduled_reports.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>{t('broker_dashboard.scheduled_reports.table.name')}</TableHead>
                    <TableHead>{t('broker_dashboard.scheduled_reports.table.frequency')}</TableHead>
                    <TableHead>{t('broker_dashboard.scheduled_reports.table.next_send')}</TableHead>
                    <TableHead>{t('broker_dashboard.scheduled_reports.table.status')}</TableHead>
                    <TableHead className="text-right">{t('broker_dashboard.scheduled_reports.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No scheduled reports created yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="capitalize">{r.frequency}</TableCell>
                        <TableCell>
                          {r.next_send ? format(parseISO(r.next_send), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {r.is_active ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(r)} className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScheduledReports;