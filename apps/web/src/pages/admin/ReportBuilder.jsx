import React, { useState } from 'react';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { BarChart3, Save, Play } from 'lucide-react';

const ReportBuilder = () => {
  const [config, setConfig] = useState({ name: '', source: '', chartType: 'bar' });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Custom report configuration saved');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Custom Report Builder</h1>
            <p className="text-muted-foreground">Design and schedule custom analytics reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><Play className="h-4 w-4"/> Preview</Button>
            <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4"/> Save Report</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Report Name</Label>
                <Input value={config.name} onChange={e => setConfig({...config, name: e.target.value})} placeholder="e.g., Q3 Claims Analysis" />
              </div>
              <div className="space-y-2">
                <Label>Data Source</Label>
                <Select value={config.source} onValueChange={v => setConfig({...config, source: v})}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reimbursements">Reimbursements</SelectItem>
                    <SelectItem value="policies">Policies</SelectItem>
                    <SelectItem value="clients">Clients</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visualization</Label>
                <Select value={config.chartType} onValueChange={v => setConfig({...config, chartType: v})}>
                  <SelectTrigger><SelectValue placeholder="Select chart type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="table">Data Table Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
              <BarChart3 className="h-16 w-16 mb-4 opacity-20" />
              <p>Select a data source and configure columns to see a preview</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReportBuilder;