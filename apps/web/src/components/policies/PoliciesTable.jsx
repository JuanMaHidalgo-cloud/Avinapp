import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Search, Edit2, Trash2, ArrowUpDown, Shield, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import PolicyRegistrationForm from './PolicyRegistrationForm.jsx';
import PolicyDetailsModal from './PolicyDetailsModal.jsx';
import { isValidPolicyId, isValidPolicyRecord } from '@/lib/policyValidation.js';

const PoliciesTable = ({ refreshTrigger: parentRefreshTrigger }) => {
  const { currentUser } = useAuth();

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'created', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);

  const fetchPolicies = useCallback(async () => {
    if (!currentUser?.broker_id) return;

    setLoading(true);
    setFetchError(null);

    try {
      let filterStr = `broker_id="${currentUser.broker_id}"`;

      if (statusFilter !== 'all') {
        filterStr += ` && estado="${statusFilter}"`;
      }

      if (searchTerm) {
        filterStr += ` && (numero_poliza~"${searchTerm}" || nombre_asegurado~"${searchTerm}" || nombre_aseguradora~"${searchTerm}")`;
      }

      const sortStr = `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}`;

      const result = await pb.collection('polizas').getList(page, pageSize, {
        filter: filterStr,
        sort: sortStr,
        $autoCancel: false
      });

      // Filter out invalid policies before setting state
      const validPolicies = result.items.filter(policy => {
        if (!isValidPolicyRecord(policy)) {
          console.warn(`Filtered out invalid policy entry with ID: ${policy?.id || 'unknown'}`);
          return false;
        }
        return true;
      });

      setPolicies(validPolicies);
      setTotalItems(result.totalItems - (result.items.length - validPolicies.length));

    } catch (err) {
      console.error('Failed to fetch policies:', err);
      if (err.status === 404) {
        setFetchError('No se encontraron registros de pólizas.');
      } else {
        setFetchError('No se pudieron cargar los datos. Verifique su conexión y vuelva a intentarlo.');
        toast.error('Error al cargar la lista de pólizas');
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser?.broker_id, page, pageSize, statusFilter, sortConfig, searchTerm]);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      fetchPolicies();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchPolicies, parentRefreshTrigger, refreshTrigger]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRemoveInvalidPolicy = (invalidId) => {
    if (!invalidId) return;
    setPolicies(prev => prev.filter(p => p?.id !== invalidId));
    setTotalItems(prev => Math.max(0, prev - 1));
  };

  const verifyPolicyExists = async (policyId) => {
    if (!isValidPolicyId(policyId)) return false;
    try {
      await pb.collection('polizas').getOne(policyId, { $autoCancel: false, fields: 'id' });
      return true;
    } catch (error) {
      if (error.status === 404) {
        handleRemoveInvalidPolicy(policyId);
        toast.error('La póliza no existe o ha sido eliminada');
      }
      return false;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!policyToDelete?.id || !isValidPolicyId(policyToDelete.id)) {
      toast.error('Identificador de póliza inválido');
      setIsDeleteOpen(false);
      return;
    }

    try {
      await pb.collection('polizas').delete(policyToDelete.id, { $autoCancel: false });
      toast.success('Póliza eliminada exitosamente');

      setIsDeleteOpen(false);
      setPolicyToDelete(null);
      if (isViewOpen) setIsViewOpen(false);

      setRefreshTrigger(prev => prev + 1);

    } catch (err) {
      console.error('Delete failed:', err);
      if (err.status === 404) {
        toast.error('La póliza no existe o ya ha sido eliminada');
        setIsDeleteOpen(false);
        if (isViewOpen) setIsViewOpen(false);
        handleRemoveInvalidPolicy(policyToDelete.id);
      } else {
        toast.error('Error al eliminar la póliza');
      }
    }
  };

  const openViewModal = async (policy) => {
    if (!policy?.id || !isValidPolicyId(policy.id)) {
      toast.error('Identificador de póliza inválido');
      return;
    }
    // Verify it still exists before opening to prevent crashing/showing empty data
    const exists = await verifyPolicyExists(policy.id);
    if (!exists) return;

    setSelectedPolicy(policy);
    setIsViewOpen(true);
  };

  const openEditModal = async (policy) => {
    if (!policy?.id || !isValidPolicyId(policy.id)) {
      toast.error('Identificador de póliza inválido');
      return;
    }
    const exists = await verifyPolicyExists(policy.id);
    if (!exists) return;

    setSelectedPolicy(policy);
    if (isViewOpen) setIsViewOpen(false);
    setIsEditOpen(true);
  };

  const openDeleteModal = (policy) => {
    if (!policy?.id || !isValidPolicyId(policy.id)) {
      toast.error('Identificador de póliza inválido');
      return;
    }
    setPolicyToDelete(policy);
    setIsDeleteOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'activa': return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">Activa</Badge>;
      case 'vencida': return <Badge variant="destructive">Vencida</Badge>;
      case 'cancelada': return <Badge variant="secondary">Cancelada</Badge>;
      default: return <Badge variant="outline">{status || 'Desconocido'}</Badge>;
    }
  };

  if (fetchError && !loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-destructive/20 text-center shadow-sm">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">No se pudieron cargar las pólizas</h3>
        <p className="text-muted-foreground max-w-md mb-6 text-balance">{fetchError}</p>
        <Button onClick={() => setRefreshTrigger(prev => prev + 1)} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl shadow-sm border border-border/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por póliza o asegurado..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Activa">Activa</SelectItem>
              <SelectItem value="Vencida">Vencida</SelectItem>
              <SelectItem value="Cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            title="Actualizar lista"
            className="bg-background"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('numero_poliza')}>
                  <div className="flex items-center gap-1 font-semibold">Nº Póliza <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('nombre_asegurado')}>
                  <div className="flex items-center gap-1 font-semibold">Asegurado <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('nombre_aseguradora')}>
                  <div className="flex items-center gap-1 font-semibold">Aseguradora <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('tipo_poliza')}>
                  <div className="flex items-center gap-1 font-semibold">Tipo <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('monto_prima')}>
                  <div className="flex items-center gap-1 font-semibold">Prima <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('monto_cobertura')}>
                  <div className="flex items-center gap-1 font-semibold">Cobertura <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('fecha_vencimiento')}>
                  <div className="flex items-center gap-1 font-semibold">Vencimiento <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></div>
                </TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="text-right font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center text-muted-foreground">
                    <Shield className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No se encontraron pólizas registradas.</p>
                  </TableCell>
                </TableRow>
              ) : (
                policies.map((policy) => {
                  if (!policy?.id) return null;
                  return (
                    <TableRow key={policy.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm tracking-tight">{policy.numero_poliza || 'N/A'}</TableCell>
                      <TableCell className="font-medium text-foreground">{policy.nombre_asegurado || 'N/A'}</TableCell>
                      <TableCell>{policy.nombre_aseguradora || 'N/A'}</TableCell>
                      <TableCell>{policy.tipo_poliza || 'N/A'}</TableCell>
                      <TableCell>${policy.monto_prima?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</TableCell>
                      <TableCell>${policy.monto_cobertura?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</TableCell>
                      <TableCell>{policy.fecha_vencimiento ? format(new Date(policy.fecha_vencimiento), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(policy.estado)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openViewModal(policy)} aria-label="Ver Detalles" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(policy)} aria-label="Editar" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteModal(policy)} aria-label="Eliminar" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/10 gap-4">
          <div className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{policies.length}</span> de <span className="font-medium text-foreground">{totalItems}</span> pólizas
          </div>
          <div className="flex items-center gap-3">
            <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-8 w-[70px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="bg-background">Anterior</Button>
              <Button variant="outline" size="sm" disabled={page * pageSize >= totalItems} onClick={() => setPage(p => p + 1)} className="bg-background">Siguiente</Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none sm:rounded-2xl">
          <PolicyRegistrationForm
            initialData={selectedPolicy}
            onSuccess={() => { setIsEditOpen(false); setRefreshTrigger(prev => prev + 1); }}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <PolicyDetailsModal
        policyId={selectedPolicy?.id}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onInvalidPolicy={handleRemoveInvalidPolicy}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription className="text-balance pt-2">
              ¿Está seguro que desea eliminar la póliza <span className="font-mono text-foreground font-semibold">{policyToDelete?.numero_poliza || 'seleccionada'}</span>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Eliminar Póliza</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PoliciesTable;