import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Calendar, 
  Trophy, 
  Users, 
  MessageCircle, 
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeConfig = {
  deadline: { 
    icon: Calendar, 
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' 
  },
  achievement: { 
    icon: Trophy, 
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
  },
  community: { 
    icon: MessageCircle, 
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
  },
  mentor: { 
    icon: Users, 
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
  },
  system: { 
    icon: AlertCircle, 
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' 
  }
};

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['allNotifications'],
    queryFn: () => base44.entities.Notification.filter({ user_id: user?.id }, '-created_date'),
    enabled: !!user?.id
  });

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.Notification.update(id, { read: true });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allNotifications'] })
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allNotifications'] })
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.Notification.delete(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allNotifications'] })
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      navigate(createPageUrl(notification.link));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header 
        title="Notifications" 
        rightContent={
          unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllReadMutation.mutate()}
              className="text-indigo-600 dark:text-indigo-400"
            >
              Mark all read
            </Button>
          )
        }
      />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{unreadCount}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Unread notifications</p>
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notification, idx) => {
              const config = typeConfig[notification.type] || typeConfig.system;
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer group ${
                    notification.read
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-semibold ${
                          notification.read 
                            ? 'text-slate-700 dark:text-slate-300' 
                            : 'text-slate-800 dark:text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotificationMutation.mutate(notification.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  
                  {notification.priority === 'high' && (
                    <div className="absolute top-4 right-4">
                      <span className="text-xs font-medium text-red-500">Urgent</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isLoading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">All caught up!</h3>
              <p className="text-slate-500 dark:text-slate-400">You have no notifications</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}