import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';

const BulkImportManager = () => {
  const { brokerId } = useAuth();
  const [imports, setImports] = useState([]);

  useEffect(() => {
    if (brokerId) fetchImports();
  }, [brokerId]);

  const fetchImports = async () => {
    try {
      const records = await pb.collection('bulk_imports').getList(1, 20, { filter: `broker_id="${brokerId}"`, sort: '-created', $autoCancel: false });
      setImports(records.items);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import History</h1>
          <p className="text-muted-foreground">Track the status of bulk data imports</p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records (Success/Fail)</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map(imp => (
                  <TableRow key={imp.id}>
                    <TableCell className="font-medium flex items-center gap-2"><Database className="h-4 w-4 text-muted-foreground"/> {imp.file_name}</TableCell>
                    <TableCell className="capitalize">{imp.import_type}</TableCell>
                    <TableCell><Badge variant="outline">{imp.status}</Badge></TableCell>
                    <TableCell>{imp.total_records} ({imp.successful_records}/{imp.failed_records})</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(imp.created).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {imports.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No import history found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BulkImportManager;