import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, AlertCircle } from 'lucide-react';
import { isValidPolicyId } from '@/lib/policyValidation.js';

const PolicyRegistrationForm = ({ initialData = null, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    numero_poliza: '',
    nombre_asegurado: '',
    numero_identificacion: '',
    asegurado_id: '',
    nombre_aseguradora: '',
    monto_cobertura: '',
    tipo_poliza: 'Médica',
    monto_prima: '',
    fecha_vencimiento: '',
    estado: 'Activa',
    tipo_cobertura_medica: 'Individual',
    beneficiarios_cobertura: '',
    beneficiarios_indemnizacion: '',
    marca_vehiculo: '',
    modelo_vehiculo: '',
    placa_vehiculo: '',
    anio_vehiculo: '',
    chasis_vehiculo: ''
  });

  useEffect(() => {
    if (initialData && initialData.id && isValidPolicyId(initialData.id)) {
      let formattedDate = '';
      if (initialData.fecha_vencimiento) {
        formattedDate = initialData.fecha_vencimiento.split('T')[0].split(' ')[0];
      }

      setFormData({
        numero_poliza: initialData.numero_poliza || '',
        nombre_asegurado: initialData.nombre_asegurado === 'Cliente Seleccionado' ? '' : (initialData.nombre_asegurado || ''),
        numero_identificacion: initialData.numero_identificacion || '',
        asegurado_id: initialData.asegurado_id || '',
        nombre_aseguradora: initialData.nombre_aseguradora || '',
        monto_cobertura: initialData.monto_cobertura || '',
        tipo_poliza: initialData.tipo_poliza || 'Médica',
        monto_prima: initialData.monto_prima || '',
        fecha_vencimiento: formattedDate,
        estado: initialData.estado || 'Activa',
        tipo_cobertura_medica: initialData.tipo_cobertura_medica || 'Individual',
        beneficiarios_cobertura: initialData.beneficiarios_cobertura || '',
        beneficiarios_indemnizacion: initialData.beneficiarios_indemnizacion || '',
        marca_vehiculo: initialData.marca_vehiculo || '',
        modelo_vehiculo: initialData.modelo_vehiculo || '',
        placa_vehiculo: initialData.placa_vehiculo || '',
        anio_vehiculo: initialData.anio_vehiculo || '',
        chasis_vehiculo: initialData.chasis_vehiculo || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const records = await pb.collection('asegurados').getList(1, 5, {
        filter: `(nombre_completo ~ "${query}" || numero_identificacion ~ "${query}") && broker_id="${currentUser?.broker_id}"`,
        $autoCancel: false
      });
      setSuggestions(records.items);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Error buscando asegurados:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser?.broker_id) {
      setError('Error de sesión: No se encontró el ID del broker.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        asegurado_id: formData.asegurado_id,
        nombre_asegurado: formData.nombre_asegurado === 'Cliente Seleccionado' ? '' : formData.nombre_asegurado,
        monto_prima: parseFloat(formData.monto_prima) || 0,
        monto_cobertura: parseFloat(formData.monto_cobertura) || 0,
        broker_id: currentUser.broker_id,
        poliza_id: initialData?.poliza_id ? initialData.poliza_id : `POL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      };

      if (payload.tipo_poliza !== 'Médica') {
        payload.tipo_cobertura_medica = '';
        payload.beneficiarios_cobertura = '';
      }
      if (payload.tipo_poliza !== 'Vida') {
        payload.beneficiarios_indemnizacion = '';
      }
      if (payload.tipo_poliza !== 'Auto') {
        payload.marca_vehiculo = '';
        payload.modelo_vehiculo = '';
        payload.placa_vehiculo = '';
        payload.anio_vehiculo = '';
        payload.chasis_vehiculo = '';
      }

      if (initialData?.id) {
        if (!isValidPolicyId(initialData.id)) {
          throw new Error('Identificador de póliza inválido para actualización.');
        }
        await pb.collection('polizas').update(initialData.id, payload, { $autoCancel: false });
        toast.success('Póliza actualizada exitosamente');
      } else {
        try {
          const existing = await pb.collection('polizas').getFirstListItem(
            `numero_poliza="${payload.numero_poliza}" && broker_id="${currentUser.broker_id}"`,
            { $autoCancel: false }
          );
          if (existing) {
            setError('Ya existe una póliza con este número en su cartera.');
            setLoading(false);
            return;
          }
        } catch (err) {
          if (err.status !== 404) throw err;
        }

        await pb.collection('polizas').create(payload, { $autoCancel: false });
        toast.success('Póliza registrada exitosamente');
      }

      if (onSuccess) onSuccess();

    } catch (err) {
      console.error('Error saving policy:', err);
      if (err.status === 404) {
        setError('El registro original ya no existe o fue eliminado.');
        toast.error('Error: Póliza no encontrada');
      } else {
        setError(err.message || 'Ocurrió un error al guardar la póliza. Verifique los datos.');
        toast.error('Error al guardar la póliza');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-xl border-border/50 rounded-2xl overflow-hidden bg-card">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
        <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Shield className="h-5 w-5 text-primary" />
          {initialData?.id ? 'Editar Póliza' : 'Registrar Nueva Póliza'}
        </CardTitle>
        <CardDescription className="text-balance">
          Complete los detalles de la póliza y la información del asegurado.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-balance">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="text-sm font-semibold tracking-tight text-foreground border-b border-border/50 pb-2">Información General</h3>

              <div className="space-y-2">
                <Label htmlFor="numero_poliza">Número de Póliza *</Label>
                <Input
                  id="numero_poliza"
                  name="numero_poliza"
                  value={formData.numero_poliza}
                  onChange={handleChange}
                  required
                  placeholder="Ej. POL-2024-001"
                  className="text-foreground bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre_aseguradora">Aseguradora *</Label>
                <Input
                  id="nombre_aseguradora"
                  name="nombre_aseguradora"
                  value={formData.nombre_aseguradora}
                  onChange={handleChange}
                  required
                  placeholder="Nombre de la compañía"
                  className="text-foreground bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monto_cobertura">Monto de Cobertura *</Label>
                <Input
                  id="monto_cobertura"
                  name="monto_cobertura"
                  type="number"
                  value={formData.monto_cobertura || ''}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 100000"
                  className="text-foreground bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_poliza">Tipo de Póliza *</Label>
                  <Select value={formData.tipo_poliza} onValueChange={(v) => handleSelectChange('tipo_poliza', v)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Médica">Médica</SelectItem>
                      <SelectItem value="Auto">Auto</SelectItem>
                      <SelectItem value="Vida">Vida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Select value={formData.estado} onValueChange={(v) => handleSelectChange('estado', v)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activa">Activa</SelectItem>
                      <SelectItem value="Vencida">Vencida</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monto_prima">Prima Total ($) *</Label>
                  <Input
                    id="monto_prima"
                    name="monto_prima"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monto_prima}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className="text-foreground bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_vencimiento">Vencimiento *</Label>
                  <Input
                    id="fecha_vencimiento"
                    name="fecha_vencimiento"
                    type="date"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    required
                    className="text-foreground bg-background"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-sm font-semibold tracking-tight text-foreground border-b border-border/50 pb-2">Datos del Asegurado</h3>

              <div className="space-y-2 relative">
                <Label htmlFor="nombre_asegurado">Nombre Completo *</Label>
                <Input
                  id="nombre_asegurado"
                  name="nombre_asegurado"
                  value={formData.nombre_asegurado}
                  onChange={(e) => {
                    handleChange(e);
                    fetchSuggestions(e.target.value);
                  }}
                  required
                  placeholder="Nombre del titular"
                  className="text-foreground bg-background"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 bg-background border border-border rounded-xl shadow-xl w-full mt-1 max-h-48 overflow-y-auto">
                    {suggestions.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 hover:bg-muted cursor-pointer text-sm border-b last:border-0"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            nombre_asegurado: s.nombre_completo,
                            numero_identificacion: s.numero_identificacion || '',
                            asegurado_id: s.id
                          }));
                          setShowSuggestions(false);
                        }}
                      >
                        <span className="font-medium">{s.nombre_completo}</span>
                        <span className="text-muted-foreground block text-xs">{s.numero_identificacion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_identificacion">Identificación (Cédula/RUC) *</Label>
                <Input
                  id="numero_identificacion"
                  name="numero_identificacion"
                  value={formData.numero_identificacion}
                  onChange={handleChange}
                  required
                  placeholder="Número de documento"
                  className="text-foreground bg-background"
                />
              </div>

              {formData.tipo_poliza === 'Médica' && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_cobertura_medica">Tipo de Cobertura Médica</Label>
                    <Select value={formData.tipo_cobertura_medica} onValueChange={(v) => handleSelectChange('tipo_cobertura_medica', v)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Familiar">Familiar</SelectItem>
                        <SelectItem value="Grupal">Grupal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beneficiarios_cobertura">Beneficiarios de Cobertura</Label>
                    <Input
                      id="beneficiarios_cobertura"
                      name="beneficiarios_cobertura"
                      value={formData.beneficiarios_cobertura}
                      onChange={handleChange}
                      placeholder="Nombres separados por coma"
                      className="text-foreground bg-background"
                    />
                  </div>
                </div>
              )}

              {formData.tipo_poliza === 'Auto' && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marca_vehiculo">Marca de Vehículo *</Label>
                      <Input
                        id="marca_vehiculo"
                        name="marca_vehiculo"
                        value={formData.marca_vehiculo}
                        onChange={handleChange}
                        required
                        placeholder="Ej. Toyota"
                        className="text-foreground bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modelo_vehiculo">Modelo de Vehículo *</Label>
                      <Input
                        id="modelo_vehiculo"
                        name="modelo_vehiculo"
                        value={formData.modelo_vehiculo}
                        onChange={handleChange}
                        required
                        placeholder="Ej. Corolla"
                        className="text-foreground bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="placa_vehiculo">Placa *</Label>
                      <Input
                        id="placa_vehiculo"
                        name="placa_vehiculo"
                        value={formData.placa_vehiculo}
                        onChange={handleChange}
                        required
                        placeholder="ABC-1234"
                        className="text-foreground bg-background uppercase"
                      />
                    </div>
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="anio_vehiculo">Año</Label>
                      <Input
                        id="anio_vehiculo"
                        name="anio_vehiculo"
                        value={formData.anio_vehiculo}
                        onChange={handleChange}
                        placeholder="2023"
                        className="text-foreground bg-background"
                      />
                    </div>
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="chasis_vehiculo">Chasis / VIN *</Label>
                      <Input
                        id="chasis_vehiculo"
                        name="chasis_vehiculo"
                        value={formData.chasis_vehiculo}
                        onChange={handleChange}
                        required
                        placeholder="Nº de Chasis"
                        className="text-foreground bg-background uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.tipo_poliza === 'Vida' && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label htmlFor="beneficiarios_indemnizacion">Beneficiarios de Indemnización</Label>
                    <Input
                      id="beneficiarios_indemnizacion"
                      name="beneficiarios_indemnizacion"
                      value={formData.beneficiarios_indemnizacion}
                      onChange={handleChange}
                      placeholder="Nombres y parentesco"
                      className="text-foreground bg-background"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30 border-t border-border/50 px-6 py-4 flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : (initialData?.id ? 'Actualizar Póliza' : 'Registrar Póliza')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PolicyRegistrationForm;