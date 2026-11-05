import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, UploadCloud, X } from 'lucide-react';

const ReimbursementRequestModal = ({ open, onClose }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userPolicies, setUserPolicies] = useState([]);

  const [formData, setFormData] = useState({
    policy_id: '',
    amount: '',
    description: '',
    files: []
  });

  useEffect(() => {
    if (open && currentUser) {
      fetchUserPolicies();
      setFormData({ policy_id: '', amount: '', description: '', files: [] });
    }
  }, [open, currentUser]);

  const fetchUserPolicies = async () => {
    try {
      const res = await pb.collection('polizas').getList(1, 50, {
        sort: '-created',
        $autoCancel: false
      });
      setUserPolicies(res.items);
    } catch (err) {
      console.error('Failed to fetch policies for modal:', err);
      setUserPolicies([]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.target.files)]
      }));
    }
  };

  const removeFile = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.policy_id) {
      toast.error('Debe seleccionar una póliza');
      return;
    }
    if (!formData.amount || !formData.description) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const selectedPolicy = userPolicies.find(p => p.id === formData.policy_id);

      // Save amount inside description or a dedicated field if added. We append it to description.
      const formattedDescription = `Monto Solicitado: $${formData.amount}\n\nDetalles: ${formData.description}`;

      // Create Request
      const requestRecord = await pb.collection('reimbursement_requests').create({
        user_id: currentUser.id,
        broker_id: currentUser.broker_id,
        policy_id: selectedPolicy.id,
        status: 'pending',
        description: formattedDescription,
        monto: Number(formData.amount) // Sending monto in case schema accepts it implicitly via dynamic save
      }, { $autoCancel: false });

      // Upload Documents
      if (formData.files.length > 0) {
        for (const file of formData.files) {
          const docData = new FormData();
          docData.append('request_id', requestRecord.id);
          docData.append('file', file);
          docData.append('file_type', file.type.includes('pdf') ? 'pdf' : 'image');

          await pb.collection('reimbursement_documents').create(docData, { $autoCancel: false });
        }
      }

      toast.success('Solicitud enviada exitosamente');
      onClose();
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error('Error al enviar la solicitud. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Nueva Solicitud de Reembolso</DialogTitle>
          <DialogDescription>
            Ingrese los detalles del siniestro o atención médica y adjunte los recibos correspondientes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="policy_id">Póliza Afectada <span className="text-destructive">*</span></Label>
            <Select
              value={formData.policy_id}
              onValueChange={(val) => setFormData({ ...formData, policy_id: val })}
            >
              <SelectTrigger id="policy_id">
                <SelectValue placeholder="Seleccione una póliza" />
              </SelectTrigger>
              <SelectContent>
                {userPolicies.length === 0 ? (
                  <SelectItem value="none" disabled>No tiene pólizas disponibles</SelectItem>
                ) : (
                  userPolicies.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.numero_poliza} - Seguro de {p.tipo_poliza}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto Solicitado (USD) <span className="text-destructive">*</span></Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Ej. 150.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Evento <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describa brevemente el motivo del reembolso..."
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Documentos y Recibos</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">Haga clic o arrastre archivos aquí</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB por archivo)</p>
            </div>

            {formData.files.length > 0 && (
              <div className="space-y-2 mt-4">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-lg text-sm">
                    <span className="truncate max-w-[80%]">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReimbursementRequestModal;