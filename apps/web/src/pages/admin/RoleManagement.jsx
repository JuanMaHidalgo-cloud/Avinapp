import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Edit2, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const RoleManagement = () => {
  const { brokerId } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', description: '', permissions: [] });

  useEffect(() => {
    if (brokerId) {
      fetchRolesAndPermissions();
    }
  }, [brokerId]);

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        pb.collection('roles').getFullList({ filter: `broker_id="${brokerId}"`, $autoCancel: false }),
        pb.collection('permissions').getFullList({ sort: 'category,name', $autoCancel: false })
      ]);
      setRoles(rolesRes);
      setPermissions(permsRes);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load roles data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        broker_id: brokerId,
        role_id: formData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4),
        is_custom: true
      };

      if (formData.id) {
        await pb.collection('roles').update(formData.id, payload, { $autoCancel: false });
        toast.success('Role updated successfully');
      } else {
        await pb.collection('roles').create(payload, { $autoCancel: false });
        toast.success('Role created successfully');
      }
      setIsEditing(false);
      fetchRolesAndPermissions();
    } catch (err) {
      toast.error(err.message || 'Failed to save role');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await pb.collection('roles').delete(id, { $autoCancel: false });
      toast.success('Role deleted');
      fetchRolesAndPermissions();
    } catch (err) {
      toast.error('Cannot delete system role or role in use');
    }
  };

  const togglePermission = (permId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', description: '', permissions: [] });
    setIsEditing(true);
  };

  const editRole = (role) => {
    setFormData({
      id: role.id,
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setIsEditing(true);
  };

  // Group permissions by category
  const groupedPerms = permissions.reduce((acc, perm) => {
    const cat = perm.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(perm);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground mt-1">Manage broker roles and granular permissions</p>
          </div>
          {!isEditing && (
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" /> New Role
            </Button>
          )}
        </div>

        {isEditing ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{formData.id ? 'Edit Role' : 'Create Custom Role'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role Name</label>
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(groupedPerms).map(([category, perms]) => (
                      <div key={category} className="p-4 border rounded-xl bg-card">
                        <h4 className="font-semibold capitalize mb-3 text-primary">{category}</h4>
                        <div className="space-y-2">
                          {perms.map(perm => (
                            <label key={perm.id} className="flex items-start gap-2 cursor-pointer group">
                              <input 
                                type="checkbox" 
                                className="mt-1 rounded border-border"
                                checked={formData.permissions.includes(perm.permission_id)}
                                onChange={() => togglePermission(perm.permission_id)}
                              />
                              <div>
                                <p className="text-sm font-medium group-hover:text-primary transition-colors">{perm.name}</p>
                                <p className="text-xs text-muted-foreground">{perm.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit">Save Role</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map(role => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" /> {role.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{role.description}</TableCell>
                      <TableCell>{role.permissions?.length || 0} permissions</TableCell>
                      <TableCell>
                        {role.is_custom ? <Badge variant="outline">Custom</Badge> : <Badge>System</Badge>}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => editRole(role)}><Edit2 className="h-4 w-4" /></Button>
                        {role.is_custom && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RoleManagement;