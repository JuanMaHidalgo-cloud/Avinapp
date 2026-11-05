import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const LoadModule = () => {
  const auth = useAuth();
  const brokerId = auth.currentUser?.broker_id;
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [recentpolizas, setRecentpolizas] = useState([]);
  const [searchClient, setSearchClient] = useState('');

  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientSuggestionsOpen, setIsClientSuggestionsOpen] = useState(false);
  const clientDropdownRef = useRef(null);

  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editClientForm, setEditClientForm] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    estado_provincia: '',
    codigo_postal: '',
    estado_civil: '',
    numero_identificacion: '',
    fecha_nacimiento: ''
  });

  const [editPolicyForm, setEditPolicyForm] = useState({
    numero_poliza: '',
    tipo_poliza: 'Auto',
    monto_prima: '',
    nombre_aseguradora: '',
    tipo_cobertura_medica: 'Individual',
    beneficiarios_cobertura: '',
    beneficiarios_indemnizacion: '',
    fecha_inicio: '',
    fecha_vencimiento: ''
  });

  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isEditPolicyModalOpen, setIsEditPolicyModalOpen] = useState(false);

  const [clientForm, setClientForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    ciudad: '',
    estado_provincia: '',
    codigo_postal: '',
    estado_civil: '',
    numero_identificacion: '',
    fecha_nacimiento: ''
  });

  const [policyForm, setPolicyForm] = useState({
    user_id: '',
    policy_number: '',
    insurance_type: '',
    coverage_amount: '',
    start_date: '',
    end_date: '',
    pdf_file: null,
    aseguradora: '',
    tipo_cobertura_medica: '',
    beneficiarios_cobertura: '',
    beneficiarios_indemnizacion: '',
    marca_vehiculo: '',
    modelo_vehiculo: '',
    placa_vehiculo: '',
    anio_vehiculo: '',
    chasis_vehiculo: ''
  });

  useEffect(() => {
    fetchClients();
    fetchRecentpolizas();

    const handleClickOutside = (event) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
        setIsClientSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [brokerId]);

  const fetchClients = async () => {
    if (!brokerId) return;
    try {
      const clientsData = await pb.collection('asegurados').getFullList({
        filter: `broker_id = "${brokerId}"`,
        sort: '-created',
        $autoCancel: false
      });
      setClients(clientsData);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  };

  const fetchRecentpolizas = async () => {
    if (!brokerId) return;
    try {
      const polizasData = await pb.collection('polizas').getList(1, 10, {
        filter: `broker_id="${brokerId}"`,
        sort: '-created',
        expand: 'user_id,asegurado_id',
        $autoCancel: false
      });
      setRecentpolizas(polizasData.items);
    } catch (err) {
      console.error('Error fetching recent polizas:', err);
      setRecentpolizas([]);
    }
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tempPassword = crypto.randomUUID().slice(0, 12) + 'Aa1!';

      const newUser = await pb.collection('users').create({
        ...clientForm,
        password: tempPassword,
        passwordConfirm: tempPassword,
        broker_id: brokerId,
        role: 'client',
        role_id: 'dml2t7ke1s4tnhl',
      }, { $autoCancel: false });

      const isoDob = clientForm.fecha_nacimiento ? new Date(clientForm.fecha_nacimiento + 'T00:00:00').toISOString() : '';

      await pb.collection('asegurados').create({
        nombre_completo: clientForm.full_name,
        email: clientForm.email,
        telefono: clientForm.phone,
        direccion: clientForm.address,
        ciudad: clientForm.ciudad,
        estado_provincia: clientForm.estado_provincia,
        codigo_postal: clientForm.codigo_postal,
        estado_civil: clientForm.estado_civil,
        numero_identificacion: clientForm.numero_identificacion,
        fecha_nacimiento: isoDob,
        broker_id: brokerId,
        asegurado_id: newUser.id,
      }, { $autoCancel: false });

      toast.success(t('broker_dashboard.load.client_success'));
      setClientForm({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        ciudad: '',
        estado_provincia: '',
        codigo_postal: '',
        estado_civil: '',
        numero_identificacion: '',
        fecha_nacimiento: ''
      });
      await fetchClients();
    } catch (err) {
      console.error(err);
      toast.error("Error al crear el cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    setLoading(true);
    try {
      const isoDob = editClientForm.fecha_nacimiento ? new Date(editClientForm.fecha_nacimiento + 'T00:00:00').toISOString() : '';

      await pb.collection('asegurados').update(selectedClient.id, {
        nombre_completo: editClientForm.nombre_completo,
        email: editClientForm.email,
        telefono: editClientForm.telefono,
        direccion: editClientForm.direccion,
        ciudad: editClientForm.ciudad,
        estado_provincia: editClientForm.estado_provincia,
        codigo_postal: editClientForm.codigo_postal,
        estado_civil: editClientForm.estado_civil,
        numero_identificacion: editClientForm.numero_identificacion,
        fecha_nacimiento: isoDob,
      }, { $autoCancel: false });

      toast.success("Cliente actualizado exitosamente");
      setIsEditModalOpen(false);
      await fetchClients();
      await fetchRecentpolizas();
    } catch (err) {
      console.error("Error al actualizar cliente:", err);
      toast.error("Error al actualizar el cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    if (!selectedPolicy) return;
    setLoading(true);
    try {
      const payload = {
        numero_poliza: editPolicyForm.numero_poliza,
        poliza_id: editPolicyForm.numero_poliza,
        tipo_poliza: editPolicyForm.tipo_poliza,
        insurance_type: editPolicyForm.tipo_poliza,
        monto_prima: Number(editPolicyForm.monto_prima) || 0,
        nombre_aseguradora: editPolicyForm.nombre_aseguradora,
        tipo_cobertura_medica: editPolicyForm.tipo_cobertura_medica,
        beneficiarios_cobertura: editPolicyForm.beneficiarios_cobertura,
        beneficiarios_indemnizacion: editPolicyForm.beneficiarios_indemnizacion,
      };

      if (editPolicyForm.fecha_inicio) {
        const isoStart = new Date(editPolicyForm.fecha_inicio + 'T00:00:00').toISOString();
        payload.fecha_inicio = isoStart;
        payload.start_date = isoStart;
        payload.fecha_creacion = isoStart;
      }

      if (editPolicyForm.fecha_vencimiento) {
        const isoEnd = new Date(editPolicyForm.fecha_vencimiento + 'T00:00:00').toISOString();
        payload.fecha_vencimiento = isoEnd;
        payload.end_date = isoEnd;
      }

      const updated = await pb.collection('polizas').update(selectedPolicy.id, payload, {
        expand: 'user_id,asegurado_id',
        $autoCancel: false
      });

      setRecentpolizas(prev => prev.map(item => item.id === selectedPolicy.id ? updated : item));

      toast.success("Póliza actualizada exitosamente");
      setIsEditPolicyModalOpen(false);
      await fetchRecentpolizas();
    } catch (err) {
      console.error("ERROR CRUCIAL EN POCKETBASE:", err);
      toast.error("Error al actualizar la póliza");
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    if (!policyForm.user_id) {
      toast.error(t('broker_dashboard.load.select_client'));
      return;
    }
    setLoading(true);
    try {
      const targetClient = clients.find(c => c.id === policyForm.user_id);
      const selectedClientName = targetClient?.nombre_completo || "Cliente Seleccionado";
      const selectedClientIdent = targetClient?.numero_identificacion || "N/A";

      const isoStart = policyForm.start_date ? new Date(policyForm.start_date + 'T00:00:00').toISOString() : '';
      const isoEnd = policyForm.end_date ? new Date(policyForm.end_date + 'T00:00:00').toISOString() : '';

      const formData = new FormData();
      formData.append('user_id', policyForm.user_id);
      formData.append('asegurado_id', policyForm.user_id);
      formData.append('broker_id', brokerId);
      formData.append('numero_poliza', policyForm.policy_number);
      formData.append('poliza_id', policyForm.policy_number);
      formData.append('tipo_poliza', policyForm.insurance_type);
      formData.append('insurance_type', policyForm.insurance_type);
      formData.append('monto_prima', Number(policyForm.coverage_amount) || 0);
      formData.append('fecha_inicio', isoStart);
      formData.append('start_date', isoStart);
      formData.append('fecha_creacion', isoStart);
      formData.append('fecha_vencimiento', isoEnd);
      formData.append('end_date', isoEnd);
      formData.append('nombre_asegurado', selectedClientName);
      formData.append('nombre_aseguradora', policyForm.aseguradora);
      formData.append('numero_identificacion', selectedClientIdent);
      formData.append('tipo_cobertura_medica', policyForm.tipo_cobertura_medica);
      formData.append('beneficiarios_cobertura', policyForm.beneficiarios_cobertura);
      formData.append('beneficiarios_indemnizacion', policyForm.beneficiarios_indemnizacion);
      formData.append('marca_vehiculo', policyForm.marca_vehiculo);
      formData.append('modelo_vehiculo', policyForm.modelo_vehiculo);
      formData.append('placa_vehiculo', policyForm.placa_vehiculo);
      formData.append('anio_vehiculo', policyForm.anio_vehiculo);
      formData.append('chasis_vehiculo', policyForm.chasis_vehiculo);
      formData.append('status', 'active');
      formData.append('estado', 'Activa');

      if (policyForm.pdf_file) {
        formData.append('pdf_file', policyForm.pdf_file);
      }

      await pb.collection('polizas').create(formData, {
        expand: 'user_id,asegurado_id',
        $autoCancel: false
      });

      toast.success(t('broker_dashboard.load.policy_success'));

      setPolicyForm({
        user_id: '',
        policy_number: '',
        insurance_type: '',
        coverage_amount: '',
        start_date: '',
        end_date: '',
        pdf_file: null,
        aseguradora: '',
        tipo_cobertura_medica: '',
        beneficiarios_cobertura: '',
        beneficiarios_indemnizacion: '',
        marca_vehiculo: '',
        modelo_vehiculo: '',
        placa_vehiculo: '',
        anio_vehiculo: '',
        chasis_vehiculo: ''
      });
      setClientSearchQuery('');
      await fetchRecentpolizas();
    } catch (err) {
      console.error(err);
      toast.error(t('broker_dashboard.load.policy_error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c =>
    c.nombre_completo?.toLowerCase().includes(searchClient.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchClient.toLowerCase())
  );

  const matchingPolicyClients = clients.filter(c =>
    c.nombre_completo?.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.numero_identificacion?.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('broker_dashboard.load.new_client')}</CardTitle>
            <CardDescription>{t('broker_dashboard.load.client_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('broker_dashboard.load.full_name')}</Label>
                <Input
                  required
                  value={clientForm.full_name}
                  onChange={(e) => setClientForm({ ...clientForm, full_name: e.target.value })}
                  className="text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('broker_dashboard.load.email')}</Label>
                <Input
                  type="email"
                  required
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('broker_dashboard.load.phone')}</Label>
                <Input
                  type="tel"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('broker_dashboard.load.address')}</Label>
                <Input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="text-foreground"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input
                    type="text"
                    value={clientForm.ciudad}
                    onChange={(e) => setClientForm({ ...clientForm, ciudad: e.target.value })}
                    className="text-foreground"
                    placeholder="Ej: Quito"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Input
                    type="text"
                    value={clientForm.estado_provincia}
                    onChange={(e) => setClientForm({ ...clientForm, estado_provincia: e.target.value })}
                    className="text-foreground"
                    placeholder="Ej: Pichincha"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cód. Postal</Label>
                  <Input
                    type="text"
                    value={clientForm.codigo_postal}
                    onChange={(e) => setClientForm({ ...clientForm, codigo_postal: e.target.value })}
                    className="text-foreground"
                    placeholder="000001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado Civil</Label>
                  <Select
                    value={clientForm.estado_civil}
                    onValueChange={(val) => setClientForm({ ...clientForm, estado_civil: val })}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                      <SelectItem value="Casado/a">Casado/a</SelectItem>
                      <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                      <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                      <SelectItem value="Unión Libre">Unión Libre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Identificación (Cédula/RUC)</Label>
                  <Input
                    required
                    value={clientForm.numero_identificacion}
                    onChange={(e) => setClientForm({ ...clientForm, numero_identificacion: e.target.value })}
                    className="text-foreground"
                    placeholder="Ej: 1725097545"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fecha de Nacimiento</Label>
                <Input
                  type="date"
                  value={clientForm.fecha_nacimiento}
                  onChange={(e) => setClientForm({ ...clientForm, fecha_nacimiento: e.target.value })}
                  className="text-foreground"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.saving') : t('broker_dashboard.load.create_client')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('broker_dashboard.load.policy_upload')}</CardTitle>
            <CardDescription>{t('broker_dashboard.load.policy_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePolicySubmit} className="space-y-4">
              <div className="space-y-2 relative" ref={clientDropdownRef}>
                <Label>{t('broker_dashboard.load.select_client')}</Label>
                <Input
                  type="text"
                  placeholder="Escribe el nombre o cédula del asegurado..."
                  value={clientSearchQuery}
                  onChange={(e) => {
                    setClientSearchQuery(e.target.value);
                    setIsClientSuggestionsOpen(true);
                    if (!e.target.value) {
                      setPolicyForm({ ...policyForm, user_id: '' });
                    }
                  }}
                  onFocus={() => setIsClientSuggestionsOpen(true)}
                  className="text-foreground"
                />
                {isClientSuggestionsOpen && clientSearchQuery.trim() !== '' && (
                  <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-y-auto">
                    {matchingPolicyClients.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">No se encontraron asegurados</div>
                    ) : (
                      matchingPolicyClients.map(c => (
                        <div
                          key={c.id}
                          className="p-2.5 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b last:border-b-0"
                          onClick={() => {
                            setPolicyForm({ ...policyForm, user_id: c.id });
                            setClientSearchQuery(c.nombre_completo);
                            setIsClientSuggestionsOpen(false);
                          }}
                        >
                          <p className="font-medium">{c.nombre_completo}</p>
                          <p className="text-xs text-muted-foreground">Cédula/RUC: {c.numero_identificacion || 'N/A'}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('broker_dashboard.load.policy_number')}</Label>
                  <Input
                    required
                    value={policyForm.policy_number}
                    onChange={(e) => setPolicyForm({ ...policyForm, policy_number: e.target.value })}
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('broker_dashboard.load.insurance_type')}</Label>
                  <Select value={policyForm.insurance_type} onValueChange={(val) => setPolicyForm({ ...policyForm, insurance_type: val })}>
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Auto">{t('broker_dashboard.load.types.auto')}</SelectItem>
                      <SelectItem value="Salud">{t('broker_dashboard.load.types.health')}</SelectItem>
                      <SelectItem value="Hogar">{t('broker_dashboard.load.types.home')}</SelectItem>
                      <SelectItem value="Vida">{t('broker_dashboard.load.types.life')}</SelectItem>
                      <SelectItem value="Responsabilidad Civil">{t('broker_dashboard.load.types.liability')}</SelectItem>
                      <SelectItem value="Otros">{t('broker_dashboard.load.types.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('broker_dashboard.load.coverage_amount')}</Label>
                  <Input
                    type="number"
                    value={policyForm.coverage_amount || ''}
                    onChange={(e) => setPolicyForm({ ...policyForm, coverage_amount: e.target.value })}
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aseguradora</Label>
                  <Input
                    value={policyForm.aseguradora}
                    onChange={(e) => setPolicyForm({ ...policyForm, aseguradora: e.target.value })}
                    className="text-foreground"
                    placeholder="Nombre de la aseguradora"
                  />
                </div>
              </div>

              {(policyForm.insurance_type === 'Salud' || policyForm.insurance_type === 'Vida') && (
                <>
                  <div className="space-y-2">
                    <Label>Tipo Cobertura Médica</Label>
                    <Select value={policyForm.tipo_cobertura_medica} onValueChange={(val) => setPolicyForm({ ...policyForm, tipo_cobertura_medica: val })}>
                      <SelectTrigger className="text-foreground">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Familiar">Familiar</SelectItem>
                        <SelectItem value="Colectiva">Colectiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Beneficiarios de Cobertura</Label>
                    <Input
                      value={policyForm.beneficiarios_cobertura}
                      onChange={(e) => setPolicyForm({ ...policyForm, beneficiarios_cobertura: e.target.value })}
                      className="text-foreground"
                      placeholder="Ej: Emanuel Hidalgo, Elena Hidalgo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beneficiarios de Indemnización</Label>
                    <Input
                      value={policyForm.beneficiarios_indemnizacion}
                      onChange={(e) => setPolicyForm({ ...policyForm, beneficiarios_indemnizacion: e.target.value })}
                      className="text-foreground"
                      placeholder="Ej: Herederos legales"
                    />
                  </div>
                </>
              )}

              {policyForm.insurance_type === 'Auto' && (
                <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                  <p className="font-medium text-sm text-foreground">Detalles del Vehículo</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Marca</Label>
                      <Input
                        value={policyForm.marca_vehiculo}
                        onChange={(e) => setPolicyForm({ ...policyForm, marca_vehiculo: e.target.value })}
                        className="text-foreground"
                        placeholder="Ej: Chevrolet"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Input
                        value={policyForm.modelo_vehiculo}
                        onChange={(e) => setPolicyForm({ ...policyForm, modelo_vehiculo: e.target.value })}
                        className="text-foreground"
                        placeholder="Ej: Aveo"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label>Placa</Label>
                      <Input
                        value={policyForm.placa_vehiculo}
                        onChange={(e) => setPolicyForm({ ...policyForm, placa_vehiculo: e.target.value })}
                        className="text-foreground"
                        placeholder="ABC-1234"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Año</Label>
                      <Input
                        type="number"
                        value={policyForm.anio_vehiculo}
                        onChange={(e) => setPolicyForm({ ...policyForm, anio_vehiculo: e.target.value })}
                        className="text-foreground"
                        placeholder="2022"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Chasis</Label>
                      <Input
                        value={policyForm.chasis_vehiculo}
                        onChange={(e) => setPolicyForm({ ...policyForm, chasis_vehiculo: e.target.value })}
                        className="text-foreground"
                        placeholder="Nro Chasis"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('broker_dashboard.load.start_date')}</Label>
                  <Input
                    type="date"
                    value={policyForm.start_date}
                    onChange={(e) => setPolicyForm({ ...policyForm, start_date: e.target.value })}
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('broker_dashboard.load.end_date')}</Label>
                  <Input
                    type="date"
                    value={policyForm.end_date}
                    onChange={(e) => setPolicyForm({ ...policyForm, end_date: e.target.value })}
                    className="text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('broker_dashboard.load.pdf_upload')}</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPolicyForm({ ...policyForm, pdf_file: e.target.files[0] || null })}
                  className="text-foreground"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.saving') : t('broker_dashboard.load.upload_policy')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('broker_dashboard.load.recent_clients')}</CardTitle>
            <div className="mt-2">
              <Input
                placeholder={t('broker_dashboard.load.search_clients')}
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                className="max-w-sm text-foreground"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredClients.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('broker_dashboard.load.no_clients')}</p>
              ) : (
                filteredClients.slice(0, 10).map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">{c.nombre_completo || 'Sin nombre'}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedClient(c);
                        const dobVal = c.fecha_nacimiento || '';
                        setEditClientForm({
                          nombre_completo: c.nombre_completo || '',
                          email: c.email || '',
                          telefono: c.telefono || '',
                          direccion: c.direccion || '',
                          ciudad: c.ciudad || '',
                          estado_provincia: c.estado_provincia || '',
                          codigo_postal: c.codigo_postal || '',
                          estado_civil: c.estado_civil || '',
                          numero_identificacion: c.numero_identificacion || '',
                          fecha_nacimiento: dobVal ? dobVal.substring(0, 10) : ''
                        });
                        setIsEditModalOpen(true);
                      }}
                    >
                      {t('common.edit')}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('broker_dashboard.load.recent_polizas')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentpolizas.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('broker_dashboard.load.no_polizas')}</p>
              ) : (
                recentpolizas.map(p => {
                  const clientName = p.expand?.asegurado_id?.nombre_completo || p.expand?.user_id?.nombre_completo || p.expand?.user_id?.full_name || p.nombre_asegurado || 'Sin cliente asignado';
                  return (
                    <div key={p.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 rounded-lg border bg-card gap-2">
                      <div>
                        <p className="font-medium">{p.numero_poliza} - {p.tipo_poliza || p.insurance_type}</p>
                        <p className="text-xs text-muted-foreground">{clientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${Number(p.monto_prima || 0).toLocaleString()}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 -mr-2"
                          onClick={() => {
                            setSelectedPolicy(p);
                            const startVal = p.fecha_inicio || p.fecha_creacion || p.start_date || '';
                            const endVal = p.fecha_vencimiento || p.end_date || '';
                            setEditPolicyForm({
                              numero_poliza: p.numero_poliza || '',
                              tipo_poliza: p.tipo_poliza || p.insurance_type || '',
                              monto_prima: p.monto_prima || '',
                              nombre_aseguradora: p.nombre_aseguradora || '',
                              tipo_cobertura_medica: p.tipo_cobertura_medica || '',
                              beneficiarios_cobertura: p.beneficiarios_cobertura || '',
                              beneficiarios_indemnizacion: p.beneficiarios_indemnizacion || '',
                              fecha_inicio: startVal ? startVal.substring(0, 10) : '',
                              fecha_vencimiento: endVal ? endVal.substring(0, 10) : ''
                            });
                            setIsEditPolicyModalOpen(true);
                          }}
                        >
                          {t('common.edit')}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-lg border max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Editar Cliente</h3>
            <form onSubmit={handleUpdateClient} className="space-y-4">
              <div>
                <Label>Nombre completo</Label>
                <Input
                  required
                  value={editClientForm.nombre_completo}
                  onChange={(e) => setEditClientForm({ ...editClientForm, nombre_completo: e.target.value })}
                  className="mt-1 text-foreground"
                />
              </div>
              <div>
                <Label>Correo electrónico</Label>
                <Input
                  type="email"
                  required
                  value={editClientForm.email}
                  onChange={(e) => setEditClientForm({ ...editClientForm, email: e.target.value })}
                  className="mt-1 text-foreground"
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={editClientForm.telefono}
                  onChange={(e) => setEditClientForm({ ...editClientForm, telefono: e.target.value })}
                  className="mt-1 text-foreground"
                />
              </div>
              <div>
                <Label>Dirección</Label>
                <Input
                  value={editClientForm.direccion}
                  onChange={(e) => setEditClientForm({ ...editClientForm, direccion: e.target.value })}
                  className="mt-1 text-foreground"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Ciudad</Label>
                  <Input
                    value={editClientForm.ciudad}
                    onChange={(e) => setEditClientForm({ ...editClientForm, ciudad: e.target.value })}
                    className="mt-1 text-foreground"
                  />
                </div>
                <div>
                  <Label>Provincia</Label>
                  <Input
                    value={editClientForm.estado_provincia}
                    onChange={(e) => setEditClientForm({ ...editClientForm, estado_provincia: e.target.value })}
                    className="mt-1 text-foreground"
                  />
                </div>
                <div>
                  <Label>Cód. Postal</Label>
                  <Input
                    value={editClientForm.codigo_postal}
                    onChange={(e) => setEditClientForm({ ...editClientForm, codigo_postal: e.target.value })}
                    className="mt-1 text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estado Civil</Label>
                  <Select
                    value={editClientForm.estado_civil}
                    onValueChange={(val) => setEditClientForm({ ...editClientForm, estado_civil: val })}
                  >
                    <SelectTrigger className="mt-1 text-foreground">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                      <SelectItem value="Casado/a">Casado/a</SelectItem>
                      <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                      <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                      <SelectItem value="Unión Libre">Unión Libre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Identificación (Cédula/RUC)</Label>
                  <Input
                    required
                    value={editClientForm.numero_identificacion}
                    onChange={(e) => setEditClientForm({ ...editClientForm, numero_identificacion: e.target.value })}
                    className="mt-1 text-foreground"
                  />
                </div>
              </div>
              <div>
                <Label>Fecha de Nacimiento</Label>
                <Input
                  type="date"
                  value={editClientForm.fecha_nacimiento}
                  onChange={(e) => setEditClientForm({ ...editClientForm, fecha_nacimiento: e.target.value })}
                  className="mt-1 text-foreground"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('common.saving') : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditPolicyModalOpen && selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-lg border max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Editar Póliza</h3>
            <form onSubmit={handleUpdatePolicy} className="space-y-4">
              <div>
                <Label>Número de Póliza</Label>
                <Input
                  required
                  value={editPolicyForm.numero_poliza}
                  onChange={(e) => setEditPolicyForm({ ...editPolicyForm, numero_poliza: e.target.value })}
                  className="mt-1 text-foreground"
                />
              </div>
              <div>
                <Label>Tipo de Póliza</Label>
                <Select
                  value={editPolicyForm.tipo_poliza}
                  onValueChange={(val) => setEditPolicyForm({ ...editPolicyForm, tipo_poliza: val })}
                >
                  <SelectTrigger className="mt-1 text-foreground">
                    <SelectValue placeholder="Seleccione el tipo de póliza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Auto">Auto</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Hogar">Hogar</SelectItem>
                    <SelectItem value="Vida">Vida</SelectItem>
                    <SelectItem value="Responsabilidad Civil">Responsabilidad Civil</SelectItem>
                    <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Monto Prima</Label>
                <Input
                  type="number"
                  value={editPolicyForm.monto_prima}
                  onChange={(e) => setEditPolicyForm({ ...editPolicyForm, monto_prima: e.target.value })}
                  className="mt-1 text-foreground"
                />
              </div>
              <div>
                <Label>Aseguradora</Label>
                <Input
                  value={editPolicyForm.nombre_aseguradora}
                  onChange={(e) => setEditPolicyForm({ ...editPolicyForm, nombre_aseguradora: e.target.value })}
                  className="mt-1 text-foreground"
                />
              </div>
              <div>
                <Label>Tipo Cobertura Médica</Label>
                <Select
                  value={editPolicyForm.tipo_cobertura_medica}
                  onValueChange={(val) => setEditPolicyForm({ ...editPolicyForm, tipo_cobertura_medica: val })}
                >
                  <SelectTrigger className="mt-1 text-foreground">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Familiar">Familiar</SelectItem>
                    <SelectItem value="Colectiva">Colectiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Beneficiarios de Cobertura</Label>
                <Input
                  value={editPolicyForm.beneficiarios_cobertura}
                  onChange={(e) => setEditPolicyForm({ ...editPolicyForm, beneficiarios_cobertura: e.target.value })}
                  className="mt-1 text-foreground"
                />
              </div>
              <div>
                <Label>Beneficiarios de Indemnización</Label>
                <Input
                  value={editPolicyForm.beneficiarios_indemnizacion}
                  onChange={(e) => setEditPolicyForm({ ...editPolicyForm, beneficiarios_indemnizacion: e.target.value })}
                  className="mt-1 text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha Inicio</Label>
                  <Input
                    type="date"
                    value={editPolicyForm.fecha_inicio}
                    onChange={(e) => setEditPolicyForm({ ...editPolicyForm, fecha_inicio: e.target.value })}
                    className="mt-1 text-foreground"
                  />
                </div>
                <div>
                  <Label>Fecha Vencimiento</Label>
                  <Input
                    type="date"
                    value={editPolicyForm.fecha_vencimiento}
                    onChange={(e) => setEditPolicyForm({ ...editPolicyForm, fecha_vencimiento: e.target.value })}
                    className="mt-1 text-foreground"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditPolicyModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('common.saving') : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadModule;