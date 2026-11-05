import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Check, BellOff, ArrowRight } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const NotificationCenter = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) return;

    fetchNotifications();

    const subscribeToNotifications = async () => {
      try {
        await pb.collection('notifications').subscribe('*', function (e) {
          if (e.record.user_id === currentUser.id) {
            fetchNotifications(); // Refresh list on any change to this user's notifications
          }
        });
      } catch (err) {
        console.error('Failed to subscribe to notifications:', err);
      }
    };

    subscribeToNotifications();

    return () => {
      pb.collection('notifications').unsubscribe('*');
    };
  }, [isAuthenticated, currentUser]);

  const fetchNotifications = async () => {
    try {
      // Get unread count
      const countResult = await pb.collection('notifications').getList(1, 1, {
        filter: `user_id="${currentUser.id}" && is_read=false`,
        $autoCancel: false
      });
      setUnreadCount(countResult.totalItems);

      // Get latest 5 unread (or all if few)
      const listResult = await pb.collection('notifications').getList(1, 5, {
        filter: `user_id="${currentUser.id}" && is_read=false`,
        sort: '-created',
        $autoCancel: false
      });
      setNotifications(listResult.items);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await pb.collection('notifications').update(id, { is_read: true }, { $autoCancel: false });
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id, { stopPropagation: () => {} });
    }
    setIsOpen(false);
    if (notification.action_url) {
      navigate(notification.action_url);
    } else if (notification.related_id) {
      // Basic heuristic navigation based on type
      if (notification.type === 'status_change' || notification.type === 'new_request') {
        navigate('/reimbursements');
      } else if (notification.type === 'policy_expiring') {
        navigate(currentUser?.role === 'broker_admin' ? '/broker-dashboard' : '/dashboard');
      }
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h4 className="font-semibold text-sm">{t('notifications.title')}</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs font-normal">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <ScrollArea className="max-h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <BellOff className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">{t('notifications.empty')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('notifications.empty_desc')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="flex flex-col gap-1 p-4 hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-0 transition-colors relative group"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-tight">
                      {notification.title}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-primary transition-opacity"
                      onClick={(e) => markAsRead(notification.id, e)}
                      title={t('notifications.mark_read')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <span className="text-[10px] text-muted-foreground/80 mt-1">
                    {notification.created ? formatDistanceToNow(parseISO(notification.created), { addSuffix: true }) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t border-border/50 bg-muted/20">
          <Button 
            variant="ghost" 
            className="w-full text-xs h-8 justify-center text-primary" 
            asChild
            onClick={() => setIsOpen(false)}
          >
            <Link to="/notifications" className="flex items-center gap-1">
              {t('common.view_all')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;