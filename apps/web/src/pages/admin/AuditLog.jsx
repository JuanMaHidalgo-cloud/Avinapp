import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Database, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const records = await pb.collection('audit_logs').getList(1, 50, {
        sort: '-timestamp',
        expand: 'user_id',
        $autoCancel: false
      });
      setLogs(records.items);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Audit Log</h1>
            <p className="text-muted-foreground mt-1">Comprehensive trail of database changes</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Collection</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {log.timestamp ? format(parseISO(log.timestamp), 'MMM dd, HH:mm:ss') : '-'}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {log.expand?.user_id?.email || 'System'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.action === 'delete' ? 'destructive' : 'secondary'} className="capitalize">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {log.collection_name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.changes_summary || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>View Diff</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No audit logs found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedLog && (
          <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Change Details ({selectedLog.action})</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Previous Values</h4>
                  <pre className="text-xs overflow-auto max-h-[300px]">
                    {JSON.stringify(selectedLog.old_values || {}, null, 2)}
                  </pre>
                </div>
                <div className="border rounded-lg p-4 bg-primary/5 border-primary/20">
                  <h4 className="font-semibold mb-2 text-sm text-primary">New Values</h4>
                  <pre className="text-xs overflow-auto max-h-[300px]">
                    {JSON.stringify(selectedLog.new_values || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AuditLog;