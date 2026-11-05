import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LayoutDashboard, Save, RotateCcw } from 'lucide-react';

// Default widgets available for selection
const AVAILABLE_WIDGETS = [
  { id: 'metrics', labelKey: 'metrics' },
  { id: 'status_dist', labelKey: 'status_dist' },
  { id: 'policy_types', labelKey: 'policy_types' },
  { id: 'expiring', labelKey: 'expiring' },
  { id: 'trends', labelKey: 'trends' },
  { id: 'comparative', labelKey: 'comparative' },
  { id: 'advanced_metrics', labelKey: 'advanced_metrics' }
];

const DEFAULT_WIDGETS = ['metrics', 'status_dist', 'policy_types', 'expiring'];

const DashboardCustomization = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  
  const [prefRecordId, setPrefRecordId] = useState(null);
  const [selectedWidgets, setSelectedWidgets] = useState(DEFAULT_WIDGETS);
  const [themePref, setThemePref] = useState('auto');
  const [refreshInterval, setRefreshInterval] = useState(15);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetchPreferences();
  }, [currentUser]);

  const fetchPreferences = async () => {
    try {
      const records = await pb.collection('dashboard_preferences').getList(1, 1, {
        filter: `user_id="${currentUser.id}"`,
        $autoCancel: false
      });
      
      if (records.items.length > 0) {
        const pref = records.items[0];
        setPrefRecordId(pref.id);
        if (Array.isArray(pref.visible_widgets)) {
          setSelectedWidgets(pref.visible_widgets);
        }
        if (pref.theme_preference) setThemePref(pref.theme_preference);
        if (pref.refresh_interval) setRefreshInterval(pref.refresh_interval);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = {
        user_id: currentUser.id,
        visible_widgets: selectedWidgets,
        theme_preference: themePref,
        refresh_interval: refreshInterval
      };

      if (prefRecordId) {
        await pb.collection('dashboard_preferences').update(prefRecordId, data, { $autoCancel: false });
      } else {
        const newRecord = await pb.collection('dashboard_preferences').create(data, { $autoCancel: false });
        setPrefRecordId(newRecord.id);
      }
      
      toast.success(t('broker_dashboard.customization.save_success'));
      // Reload page to apply changes gracefully across module components
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedWidgets(DEFAULT_WIDGETS);
    setThemePref('auto');
    setRefreshInterval(15);
    toast.success(t('broker_dashboard.customization.reset_success'));
  };

  const toggleWidget = (id) => {
    setSelectedWidgets(prev => 
      prev.includes(id) 
        ? prev.filter(w => w !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Card className="shadow-sm border-border/50">
        <CardHeader className="bg-muted/30 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t('broker_dashboard.customization.title')}</CardTitle>
              <CardDescription>{t('broker_dashboard.customization.desc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          
          {/* Widget Selection */}
          <div>
            <h3 className="text-lg font-medium mb-4">Visible Widgets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AVAILABLE_WIDGETS.map(widget => (
                <div 
                  key={widget.id} 
                  className={`flex items-start space-x-3 p-4 border rounded-xl transition-colors cursor-pointer ${selectedWidgets.includes(widget.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50 border-border/60'}`}
                  onClick={() => toggleWidget(widget.id)}
                >
                  <Checkbox 
                    id={widget.id} 
                    checked={selectedWidgets.includes(widget.id)}
                    onCheckedChange={() => toggleWidget(widget.id)}
                    className="mt-0.5"
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor={widget.id} className="cursor-pointer font-medium">
                      {t(`broker_dashboard.customization.widgets.${widget.labelKey}`)}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* General Preferences */}
          <div>
            <h3 className="text-lg font-medium mb-4">General Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Theme Preference</Label>
                <Select value={themePref} onValueChange={setThemePref}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">System Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data Refresh Interval (Minutes)</Label>
                <Select value={refreshInterval.toString()} onValueChange={(val) => setRefreshInterval(Number(val))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {t('common.reset')}
            </Button>
            <Button onClick={handleSave} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? t('common.saving') : t('common.save')}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCustomization;