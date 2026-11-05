import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Download, FileText as FileTextIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import ReimbursementRequestModal from '@/components/ReimbursementRequestModal.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format, parseISO } from 'date-fns';

const ReimbursementRequestsPage = () => {
  const { currentUser } = useAuth();
  const brokerId = currentUser?.broker_id;
  const [requests, setRequests] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState(new Set());
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentUser, brokerId]);

  const fetchData = async () => {
    console.log("Verificando autenticación:", { currentUser, brokerId });
    if (!currentUser) return;

    try {
      const requestsData = await pb.collection('reimbursement_requests').getList(1, 50, {
        sort: '-created',
        $autoCancel: false
      });

      console.log("¡Datos obtenidos con éxito!", requestsData.items);
      setRequests(requestsData.items);

      const policiesData = await pb.collection('polizas').getList(1, 50, {
        $autoCancel: false
      });
      setPolicies(policiesData.items);

      const docsMap = {};
      for (const request of requestsData.items) {
        const docs = await pb.collection('reimbursement_documents').getList(1, 10, {
          filter: `request_id="${request.id}"`,
          $autoCancel: false
        });
        docsMap[request.id] = docs.items;
      }
      setDocuments(docsMap);
    } catch (error) {
      console.error("--- ERROR DETALLADO DE POCKETBASE ---");
      console.error("Mensaje:", error.message);
      console.error("Código:", error.status);
      console.error("Detalles completos:", error.data);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, requestId) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('request_id', requestId);
      formData.append('file', file);

      await pb.collection('reimbursement_documents').create(formData);
      fetchData();
    } catch (error) {
      console.error("Error al subir:", error);
    } finally {
      setUploading(false);
    }
  };

  const toggleExpanded = (requestId) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'warning';
      case 'En proceso': return 'secondary';
      case 'Devuelto': return 'outline';
      case 'Finalizado': return 'default';
      case 'Rechazado': return 'destructive';
      case 'Aprobado': return 'default';
      case 'Acreditado': return 'default';
      default: return 'default';
    }
  };

  const getPolicyNumber = (policyId) => {
    const policy = policies.find(p => p.id === policyId);
    return policy?.numero_poliza || 'Desconocida';
  };

  const getAsegurado = (policyId) => {
    const policy = policies.find(p => p.id === policyId);
    return policy?.nombre_asegurado || 'N/A';
  };

  const getAseguradora = (policyId) => {
    const policy = policies.find(p => p.id === policyId);
    return policy?.nombre_aseguradora || 'N/A';
  };

  const handleModalClose = () => {
    setModalOpen(false);
    fetchData();
  };

  const filteredRequests = requests.filter((request) => {
    const policyNumber = getPolicyNumber(request.policy_id).toLowerCase();
    const insured = getAsegurado(request.policy_id).toLowerCase();
    const insurer = getAseguradora(request.policy_id).toLowerCase();
    const requestId = request.id.toLowerCase();
    const search = searchTerm.toLowerCase();

    return requestId.includes(search) ||
      policyNumber.includes(search) ||
      insured.includes(search) ||
      insurer.includes(search);
  });

  return (
    <>
      <Helmet>
        <title>Reembolsos - avinapp</title>
        <meta name="description" content="Gestiona tus solicitudes de reembolso" />
      </Helmet>

      <div className="flex-1 flex flex-col">
        <Header />

        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Reembolsos</h1>
                  <p className="text-muted-foreground mt-1">
                    Gestiona y da seguimiento a tus solicitudes de reembolso.
                  </p>
                </div>
                <Button onClick={() => setModalOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Solicitud
                </Button>
              </div>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Buscar por ID, Póliza, Asegurado o Aseguradora..."
                  className="w-full p-2 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-16">
                  <FileTextIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay solicitudes</h3>
                  <p className="text-muted-foreground mb-6">
                    Aún no has realizado ninguna solicitud de reembolso.
                  </p>
                  <Button onClick={() => setModalOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear la primera
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              Solicitud #{request.id.slice(0, 8)}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Póliza: {getPolicyNumber(request.policy_id)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Asegurado: {getAsegurado(request.policy_id)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Aseguradora: {getAseguradora(request.policy_id)}
                            </p>
                          </div>
                          <Badge variant={getStatusColor(request.status)}>
                            {request.status || 'Pendiente'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Descripción</p>
                            <p className="text-sm text-muted-foreground">{request.description}</p>
                          </div>

                          <div className="flex gap-6 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Enviado:</span>{' '}
                              {request.created ? format(parseISO(request.created), 'MMM dd, yyyy') : 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Actualizado:</span>{' '}
                              {request.updated ? format(parseISO(request.updated), 'MMM dd, yyyy') : 'N/A'}
                            </div>
                          </div>

                          {documents[request.id]?.length > 0 && (
                            <Collapsible
                              open={expandedRequests.has(request.id)}
                              onOpenChange={() => toggleExpanded(request.id)}
                            >
                              <CollapsibleTrigger asChild>
                                <Button variant="outline" size="sm" className="mt-2">
                                  {expandedRequests.has(request.id) ? 'Ocultar Documentos' : 'Ver Documentos'} ({documents[request.id].length})
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-3">
                                <div className="space-y-2">
                                  {documents[request.id].map((doc) => (
                                    <div
                                      key={doc.id}
                                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                    >
                                      <div className="flex items-center gap-2">
                                        <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                          {doc.file_type === 'pdf' ? 'Documento PDF' : 'Imagen'}
                                        </span>
                                      </div>
                                      <a
                                        href={pb.files.getUrl(doc, doc.file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                      >
                                        <Download className="h-4 w-4" />
                                        Descargar
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>

                        {/* Sección informativa del estado actual (solo lectura) */}
                        <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="w-full sm:w-auto">
                            <span className="text-sm font-medium mb-1 block">Estado Actual de la Solicitud:</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(request.status)} className="text-sm px-3 py-1">
                                {request.status || 'Pendiente'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <label className="text-sm font-medium mb-2 block">¿Olvidaste un documento?</label>
                          <input
                            type="file"
                            disabled={uploading}
                            className="text-sm w-full"
                            onChange={(e) => handleFileUpload(e.target.files[0], request.id)}
                          />
                          {uploading && <p className="text-xs text-blue-600 mt-1">Subiendo...</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>

        <Footer />
      </div>

      <ReimbursementRequestModal
        open={modalOpen}
        onClose={handleModalClose}
        policies={policies}
      />
    </>
  );
};

export default ReimbursementRequestsPage;