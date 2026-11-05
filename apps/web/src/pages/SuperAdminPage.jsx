import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { cn } from '@/lib/utils';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building2, Save, Loader2, UploadCloud, Edit2, RotateCcw, CheckCircle2, XCircle, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SuperAdminPage = () => {
  const { currentUser } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [brandings, setBrandings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  const [formData, setFormData] = useState({
    logo_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#8b5cf6',
    fileName: ''
  });

  // Dialog states
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [brokerToReset, setBrokerToReset] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [addFormErrors, setAddFormErrors] = useState({});
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchAgencies();
    }
  }, [currentUser]);

  const fetchAgencies = async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching all users...');

    try {
      // (1) Query pb.collection('brokers') directly
      const brokersRes = await pb.collection('brokers').getFullList({
        $autoCancel: false
      });

      // (2) Bypass the role filter to assign the raw response
      const filtered = brokersRes;

      console.log("Filtered agencies:", filtered);

      // (5) Query broker_branding to check status
      const brandingsRes = await pb.collection('broker_branding').getFullList({ $autoCancel: false });
      const brandingMap = {};
      brandingsRes.forEach(b => {
        if (b.broker_id) brandingMap[b.broker_id] = b;
      });

      // (4) Map filtered results to table format using broker fields
      const mappedAgencies = filtered.map(u => ({
        id: u.id,
        full_name: u.name || '',
        name: u.name || '',
        email: u.email || '',
        broker_id: u.broker_id || '',
        hasBranding: !!brandingMap[u.broker_id]
      }));

      // (7) Log final filtered agencies array
      console.log('Final agencies array:', mappedAgencies);

      // (6) Set agencies state with REAL data
      setAgencies(mappedAgencies);
      setBrandings(brandingMap);

    } catch (err) {
      console.error('Failed to fetch agencies:', err);
      setError('Error al cargar los datos de agencias. Por favor, verifica tu conexión.');
      toast.error('Error al cargar los datos de agencias.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrokerSelect = async (agency) => {
    if (!agency) return;
    const targetId = agency.broker_id || agency.id;
    
    setSelectedBrokerId(targetId);
    
    try {
        const existingBranding = brandings[targetId] || null;

      if (existingBranding) {
        setFormData({
          logo_url: existingBranding.logo_url || '',
          primary_color: existingBranding.primary_color || '#3b82f6',
          secondary_color: existingBranding.secondary_color || '#8b5cf6',
          fileName: existingBranding.logo_url ? 'Logo actual cargado' : ''
        });
      } else {
        setFormData({
          logo_url: '',
          primary_color: '#3b82f6',
          secondary_color: '#8b5cf6',
          fileName: ''
        });
      }
    } catch (error) {
      console.error("Error setting broker branding:", error);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('png') && !file.type.includes('jpeg') && !file.type.includes('jpg')) {
      toast.error("Solo se permiten archivos PNG o JPG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        logo_url: reader.result,
        fileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = async () => {
    if (!selectedBrokerId) return;

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(formData.primary_color) || !hexRegex.test(formData.secondary_color)) {
      toast.error('Formato de color HEX inválido. Use el formato #RRGGBB');
      return;
    }

    setSaving(true);
    try {
      const existingBranding = brandings[selectedBrokerId];
      const payload = {
        broker_id: selectedBrokerId,
        logo_url: formData.logo_url,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color
      };

      if (existingBranding?.id) {
        const updated = await pb.collection('broker_branding').update(existingBranding.id, payload, { $autoCancel: false });
        setBrandings(prev => ({ ...prev, [selectedBrokerId]: updated }));
      } else {
        const created = await pb.collection('broker_branding').create(payload, { $autoCancel: false });
        setBrandings(prev => ({ ...prev, [selectedBrokerId]: created }));
      }

      // Update the local agencies array to reflect the new branding status
      setAgencies(prev => prev.map(a =>
        a.broker_id === selectedBrokerId ? { ...a, hasBranding: true } : a
      ));

      toast.success('Configuración de agencia guardada exitosamente.');
      setFormData({ logo_url: '', primary_color: '#3b82f6', secondary_color: '#8b5cf6', fileName: '' });
      setSelectedBrokerId('');
    } catch (err) {
      console.error('Failed to save branding:', err);
      toast.error('Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  const confirmReset = (brokerId) => {
    setBrokerToReset(brokerId);
    setResetDialogOpen(true);
  };

  const handleResetBranding = async () => {
    if (!brokerToReset) return;

    try {
      const existingBranding = brandings[brokerToReset];
      if (existingBranding?.id) {
        await pb.collection('broker_branding').delete(existingBranding.id, { $autoCancel: false });

        const newBrandings = { ...brandings };
        delete newBrandings[brokerToReset];
        setBrandings(newBrandings);

        // Update the local agencies array to reflect the removed branding status
        setAgencies(prev => prev.map(a =>
          a.broker_id === brokerToReset ? { ...a, hasBranding: false } : a
        ));

        if (selectedBrokerId === brokerToReset) {
          setSelectedBrokerId('');
          setFormData({ logo_url: '', primary_color: '#3b82f6', secondary_color: '#8b5cf6', fileName: '' });
        }

        toast.success('Branding restablecido a los valores por defecto.');
      }
    } catch (err) {
      console.error('Failed to reset branding:', err);
      toast.error('Error al restablecer el branding.');
    } finally {
      setResetDialogOpen(false);
      setBrokerToReset(null);
    }
  };

  const validateAddForm = () => {
    const errors = {};
    if (!addFormData.name.trim()) errors.name = 'El nombre es requerido';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!addFormData.email.trim()) {
      errors.email = 'El correo es requerido';
    } else if (!emailRegex.test(addFormData.email)) {
      errors.email = 'Formato de correo inválido';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    if (!addFormData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (!passwordRegex.test(addFormData.password)) {
      errors.password = 'Mínimo 8 caracteres, una mayúscula, una minúscula y un número';
    }

    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkEmailExists = async (email) => {
    try {
      const result = await pb.collection('users').getList(1, 1, {
        filter: `email = "${email}"`,
        $autoCancel: false
      });
      return result.items.length > 0;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
  };

  const handleAddAgency = async () => {
    if (!validateAddForm()) return;
    if (emailError) return;

    setIsSubmitting(true);
    setEmailError('');

    try {
      const emailExists = await checkEmailExists(addFormData.email);

      if (emailExists) {
        setEmailError('Este email ya existe');
        setIsSubmitting(false);
        return;
      }

      const newBrokerId = 'brk_' + Math.random().toString(36).substr(2, 9);

      await pb.collection('users').create({
        email: addFormData.email,
        password: addFormData.password,
        passwordConfirm: addFormData.password,
        role: 'broker_admin',
        full_name: addFormData.name,
        broker_id: newBrokerId,
        role_id: 'broker_admin_role',
        emailVisibility: true
      }, { $autoCancel: false });

      toast.success('Nueva agencia registrada exitosamente');
      setIsAddModalOpen(false);
      setAddFormData({ name: '', email: '', password: '' });

      // Refresh table automatically
      fetchAgencies();

    } catch (err) {
      console.error('Failed to create agency:', err);
      if (err.status === 400) {
        setEmailError('Este email ya existe');
      } else {
        toast.error('Error al registrar la agencia. Intente nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">Acceso denegado. Solo Super Admin.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Panel de Administración de la Agencia - avinapp</title>
      </Helmet>

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          <main className="flex-1 p-6 lg:p-8 bg-muted/10 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">

              <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Panel de Administración de la Agencia - avinapp</h1>
                  <p className="text-muted-foreground mt-2 text-lg">
                    Gestión global de marca blanca, brokers y configuración multi-tenant.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={fetchAgencies} disabled={loading} className="gap-2">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>
                  <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4" />
                    Añadir Nueva Agencia
                  </Button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">

                {/* Form Section */}
                <div className="lg:col-span-1">
                  <Card className="shadow-md border-border/50 sticky top-6">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                      <CardTitle>Configuración de Marca Blanca</CardTitle>
                      <CardDescription>Personaliza la apariencia por agencia</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">

                      <div className="space-y-2">
                        <Label>Seleccionar Agencia (Broker) <span className="text-destructive">*</span></Label>
                        <Select value={selectedBrokerId} onValueChange={handleBrokerSelect} disabled={loading || agencies.length === 0}>
                          <SelectTrigger>
                            <SelectValue placeholder={loading ? "Cargando agencias..." : agencies.length === 0 ? "No hay agencias" : "Elige una agencia..."} />
                          </SelectTrigger>
                          <SelectContent>
                            {agencies.map(agency => (
                              <SelectItem key={agency.id} value={agency.broker_id}>
                                {agency.full_name || agency.name || 'Sin nombre'} ({agency.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className={`space-y-6 transition-opacity duration-300 ${!selectedBrokerId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <div className="space-y-3">
                          <Label>Logotipo de la Agencia</Label>
                          <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center relative hover:bg-muted/50 transition-colors cursor-pointer group bg-background">
                            <input
                              type="file"
                              accept="image/png, image/jpeg"
                              onChange={handleLogoUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              disabled={!selectedBrokerId}
                            />
                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium text-center">Haz clic o arrastra una imagen</span>
                            <span className="text-xs text-muted-foreground mt-1">PNG o JPG (Máx 5MB)</span>
                          </div>

                          {formData.fileName && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              {formData.fileName}
                            </p>
                          )}

                          {formData.logo_url && (
                            <div className="mt-4 p-4 bg-muted/50 rounded-xl flex items-center justify-center border h-24">
                              <img
                                src={formData.logo_url}
                                alt="Logo preview"
                                className="max-h-16 w-auto object-contain"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label>Color Primario (HEX)</Label>
                          <div className="flex gap-3">
                            <div className="relative rounded-lg overflow-hidden border shadow-sm h-10 w-12 shrink-0">
                              <input
                                type="color"
                                value={formData.primary_color}
                                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer"
                                disabled={!selectedBrokerId}
                              />
                            </div>
                            <Input
                              value={formData.primary_color}
                              onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                              className="flex-1 font-mono uppercase text-foreground"
                              placeholder="#000000"
                              disabled={!selectedBrokerId}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>Color Secundario (HEX)</Label>
                          <div className="flex gap-3">
                            <div className="relative rounded-lg overflow-hidden border shadow-sm h-10 w-12 shrink-0">
                              <input
                                type="color"
                                value={formData.secondary_color}
                                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer"
                                disabled={!selectedBrokerId}
                              />
                            </div>
                            <Input
                              value={formData.secondary_color}
                              onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                              className="flex-1 font-mono uppercase text-foreground"
                              placeholder="#000000"
                              disabled={!selectedBrokerId}
                            />
                          </div>
                        </div>

                        <Button
                          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={handleSaveBranding}
                          disabled={!selectedBrokerId || saving}
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Guardar Configuración de Agencia
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                </div>

                {/* Table Section */}
                <div className="lg:col-span-2">
                  <Card className="shadow-md border-border/50">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                      <CardTitle>Directorio de Agencias</CardTitle>
                      <CardDescription>Listado de todos los brokers registrados en el sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">

                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                          <p className="text-muted-foreground font-medium">Cargando agencias...</p>
                        </div>
                      ) : error ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                          <h3 className="text-lg font-medium">No se pudieron cargar las agencias</h3>
                          <p className="text-muted-foreground mt-2 mb-4">{error}</p>
                          <Button onClick={fetchAgencies} variant="outline" className="gap-2">
                            <RefreshCw className="h-4 w-4" /> Reintentar
                          </Button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b">
                              <tr>
                                <th className="px-6 py-4 font-medium">AGENCIA (BROKER)</th>
                                <th className="px-6 py-4 font-medium">EMAIL</th>
                                <th className="px-6 py-4 font-medium text-center">ESTADO DE MARCA BLANCA</th>
                                <th className="px-6 py-4 font-medium text-right">ACCIONES</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {agencies.map(agency => {
                                console.log('Rendering row:', agency);
                                return (
                                  <tr key={agency.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                          <Building2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-foreground">{agency.full_name || agency.name || 'Sin nombre'}</p>
                                          <p className="text-xs text-muted-foreground font-mono">{agency.broker_id}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                      {agency.email}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      {agency.hasBranding ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 border border-green-500/20">
                                          <CheckCircle2 className="h-3.5 w-3.5" /> Configurado
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
                                          <XCircle className="h-3.5 w-3.5" /> No Configurado
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                                          onClick={() => handleBrokerSelect(agency)}
                                        >
                                          <Edit2 className="h-4 w-4 mr-1.5" /> Editar
                                        </Button>
                                        {agency.hasBranding && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => confirmReset(agency.broker_id)}
                                          >
                                            <RotateCcw className="h-4 w-4 mr-1.5" /> Reset
                                          </Button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}

                              {(!loading && !error && agencies.length === 0) && (
                                <tr>
                                  <td colSpan="4" className="px-6 py-16 text-center">
                                    <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                    <p className="text-lg font-medium">No hay agencias registradas</p>
                                    <p className="text-muted-foreground mt-1">Registra una nueva agencia para comenzar.</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restablecer configuración a por defecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el logotipo y los colores personalizados de esta agencia. Volverá a usar la apariencia por defecto del sistema. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetBranding} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sí, restablecer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Agency Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir Nueva Agencia</DialogTitle>
            <DialogDescription>
              Registra un nuevo administrador de broker. Se generará un ID de broker automáticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={addFormErrors.name ? "text-destructive" : ""}>
                Nombre de la Agencia <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                className={cn("text-foreground", addFormErrors.name ? "border-destructive focus-visible:ring-destructive" : "")}
                placeholder="Ej. Seguros Globales"
              />
              {addFormErrors.name && <p className="text-xs text-destructive">{addFormErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={emailError || addFormErrors.email ? "text-destructive" : ""}>
                Correo Electrónico Administrador <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={addFormData.email}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, email: e.target.value });
                  setEmailError(''); // Clear explicit duplicate error on type
                  if (addFormErrors.email) {
                    setAddFormErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                className={cn("text-foreground", (emailError || addFormErrors.email) ? "border-destructive focus-visible:ring-destructive" : "")}
                placeholder="admin@agencia.com"
              />
              {(emailError || addFormErrors.email) && (
                <p className="text-xs text-destructive">{emailError || addFormErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={addFormErrors.password ? "text-destructive" : ""}>
                Contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={addFormData.password}
                onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                className={cn("text-foreground", addFormErrors.password ? "border-destructive focus-visible:ring-destructive" : "")}
                placeholder="••••••••"
              />
              {addFormErrors.password && <p className="text-xs text-destructive">{addFormErrors.password}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleAddAgency} disabled={isSubmitting || !!emailError} className="bg-primary text-primary-foreground gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Agencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuperAdminPage;