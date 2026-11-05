import React from 'react';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', claims: 4000 },
  { name: 'Feb', claims: 3000 },
  { name: 'Mar', claims: 2000 },
  { name: 'Apr', claims: 2780 },
  { name: 'May', claims: 1890 },
  { name: 'Jun', claims: 2390 },
];

const ReportViewer = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Monthly Claims Overview</h1>
            <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><Share2 className="h-4 w-4"/> Share</Button>
            <Button className="gap-2"><Download className="h-4 w-4"/> Export PDF</Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Claims Volume Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}} />
                  <Bar dataKey="claims" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReportViewer;