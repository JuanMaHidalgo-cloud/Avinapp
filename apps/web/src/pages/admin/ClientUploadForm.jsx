import React, { useState } from 'react';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UploadCloud, Users } from 'lucide-react';

const ClientUploadForm = () => {
  const [file, setFile] = useState(null);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }
    toast.success('Client import started.');
    setFile(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Client Import</h1>
          <p className="text-muted-foreground">Upload multiple client records via CSV</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="border-2 border-dashed rounded-xl p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-1">Drag and drop your CSV file here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                <Input type="file" accept=".csv" className="hidden" id="client-file-upload" onChange={e => setFile(e.target.files[0])} />
                <Button type="button" variant="outline" onClick={() => document.getElementById('client-file-upload').click()}>
                  Select File
                </Button>
                {file && <p className="mt-4 text-sm font-medium text-primary">{file.name}</p>}
              </div>
              <div className="flex justify-between items-center">
                <Button type="button" variant="link" className="text-muted-foreground">Download Template</Button>
                <Button type="submit" disabled={!file}>Start Import</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClientUploadForm;