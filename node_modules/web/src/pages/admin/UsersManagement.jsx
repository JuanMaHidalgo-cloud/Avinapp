import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const UsersManagement = () => {
  const { brokerId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (brokerId) fetchUsers();
  }, [brokerId, search]);

  const fetchUsers = async () => {
    try {
      const filter = `broker_id="${brokerId}"${search ? ` && (full_name~"${search}" || email~"${search}")` : ''}`;
      const records = await pb.collection('users').getList(1, 50, {
        filter,
        expand: 'role_id',
        sort: '-created',
        $autoCancel: false
      });
      setUsers(records.items);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    // We simulate active/inactive via a verified field or a custom status field if it existed.
    // Using emailVisibility or a custom field. Let's assume we toggle access by removing role or throwing error.
    // Since schema doesn't have a direct 'status' field, we'll use verified as a proxy for active/inactive.
    try {
      await pb.collection('users').update(user.id, { verified: !user.verified }, { $autoCancel: false });
      toast.success(`User ${!user.verified ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users & Access</h1>
            <p className="text-muted-foreground mt-1">Manage team members and client access</p>
          </div>
          <Button className="gap-2"><UserPlus className="h-4 w-4"/> Invite User</Button>
        </div>

        <Card className="shadow-sm mb-6">
          <CardContent className="p-4 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-9 bg-background"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.full_name || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.department || '-'}</TableCell>
                    <TableCell>
                      {user.verified ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                          <CheckCircle className="h-3 w-3"/> Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
                          <XCircle className="h-3 w-3"/> Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Details</DropdownMenuItem>
                          <DropdownMenuItem>Change Role</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(user)}>
                            {user.verified ? 'Deactivate' : 'Reactivate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default UsersManagement;