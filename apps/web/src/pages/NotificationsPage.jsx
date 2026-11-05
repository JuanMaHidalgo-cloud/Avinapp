import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { format, parseISO } from 'date-fns';
import { Trash2, CheckSquare, Search, BellOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const NotificationsPage = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters & State
  const [typeFilter, setTypeFilter] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    fetchNotifications();
  }, [currentUser, page, typeFilter, unreadOnly, searchTerm]);

  const fetchNotifications = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    
    try {
      let filterStr = `user_id="${currentUser.id}"`;
      if (typeFilter !== 'all') {
        filterStr += ` && type="${typeFilter}"`;
      }
      if (unreadOnly) {
        filterStr += ` && is_read=false`;
      }
      if (searchTerm) {
        // Simple search in title or message
        filterStr += ` && (title~"${searchTerm}" || message~"${searchTerm}")`;
      }

      const result = await pb.collection('notifications').getList(page, 20, {
        filter: filterStr,
        sort: '-created',
        $autoCancel: false
      });
      
      setNotifications(result.items);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await pb.collection('notifications').update(id, { is_read: true }, { $autoCancel: false });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadRecords = await pb.collection('notifications').getFullList({
        filter: `user_id="${currentUser.id}" && is_read=false`,
        $autoCancel: false
      });
      
      for (const record of unreadRecords) {
        await pb.collection('notifications').update(record.id, { is_read: true }, { $autoCancel: false });
      }
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update notifications');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      for (const id of selectedIds) {
        await pb.collection('notifications').delete(id, { $autoCancel: false });
      }
      toast.success(`${selectedIds.size} notifications deleted`);
      setSelectedIds(new Set());
      fetchNotifications();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete notifications');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet>
        <title>{t('nav.notifications')} - {t('common.brand')}</title>
      </Helmet>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('notifications.title')}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMarkAllRead} className="gap-2 bg-background">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{t('notifications.mark_all_read')}</span>
            </Button>
            {selectedIds.size > 0 && (
              <Button variant="destructive" onClick={handleDeleteSelected} className="gap-2">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t('notifications.delete_selected')} ({selectedIds.size})</span>
              </Button>
            )}
          </div>
        </div>

        <Card className="mb-6 shadow-sm border-border/50">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('notifications.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('notifications.types.all')}</SelectItem>
                  <SelectItem value="status_change">{t('notifications.types.status_change')}</SelectItem>
                  <SelectItem value="policy_expiring">{t('notifications.types.policy_expiring')}</SelectItem>
                  <SelectItem value="new_request">{t('notifications.types.new_request')}</SelectItem>
                  <SelectItem value="scheduled_report">{t('notifications.types.scheduled_report')}</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="unread-only" 
                  checked={unreadOnly}
                  onCheckedChange={setUnreadOnly}
                />
                <Label htmlFor="unread-only" className="text-sm cursor-pointer whitespace-nowrap">
                  {t('notifications.unread_only')}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="shadow-sm border-border/40">
                <CardContent className="p-4 flex gap-4">
                  <Skeleton className="h-5 w-5 rounded mt-1" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <BellOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">{t('notifications.empty')}</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">{t('notifications.empty_desc')}</p>
            </div>
          ) : (
            <>
              {/* Header for bulk select if items exist */}
              <div className="flex items-center gap-3 px-4 py-2 border rounded-lg bg-card shadow-sm">
                <Checkbox 
                  checked={notifications.length > 0 && selectedIds.size === notifications.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
                <span className="text-sm font-medium text-muted-foreground">Select All</span>
              </div>
              
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`shadow-sm border-border/40 transition-colors hover:border-border ${!notification.is_read ? 'bg-primary/5 border-primary/20' : ''}`}
                >
                  <CardContent className="p-4 flex gap-4">
                    <div className="pt-1">
                      <Checkbox 
                        checked={selectedIds.has(notification.id)}
                        onCheckedChange={() => toggleSelect(notification.id)}
                      />
                    </div>
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        if (!notification.is_read) handleMarkAsRead(notification.id);
                        if (notification.action_url) window.location.href = notification.action_url;
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                        <h4 className={`text-base leading-tight ${!notification.is_read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.created ? format(parseISO(notification.created), 'MMM d, yyyy h:mm a') : ''}
                        </span>
                      </div>
                      <p className={`text-sm ${!notification.is_read ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination (Simple) */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button 
                    variant="outline" 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotificationsPage;