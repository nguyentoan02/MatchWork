import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useToast } from "./useToast";
import { useUser } from "./useUser";
import { useSocket } from "./useSocket";
import { notificationApi, type Notification } from "@/api/notification";

interface NotificationData {
   _id: string;
   title: string;
   message: string;
   isRead: boolean;
   createdAt: string;
   userId: string;
}

interface UseNotificationReturn {
   isConnected: boolean;
   notifications: NotificationData[];
   unreadCount: number;
   sendNotification: (
      userId: string,
      data: { title: string; message: string }
   ) => void;
   markAsRead: (notificationId: string) => void;
   markAllAsRead: () => void;
   deleteNotification: (notificationId: string) => void;
   clearAllNotifications: () => void;
   getNotifications: (page?: number, limit?: number) => void;
   error: string | null;
   isLoading: boolean;
   refetch: () => void;
   // Mutation states
   isMarkingAsRead: boolean;
   isMarkingAllAsRead: boolean;
   isDeletingNotification: boolean;
   isClearingAll: boolean;
}

export const useNotification = (): UseNotificationReturn => {
   const { user } = useUser();
   const queryClient = useQueryClient();
   const addToast = useToast();
   const socket = useSocket("notifications");

   const [isConnected, setIsConnected] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const {
      notifications: storeNotifications,
      unreadCount: storeUnreadCount,
      setNotifications,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      setUnreadCount,
      removeNotification,
      clearNotifications,
   } = useNotificationStore();

   // Fetch notifications query (fallback)
   const {
      data: notificationsData,
      isLoading: isLoadingNotifications,
      refetch: refetchNotifications,
   } = useQuery({
      queryKey: ["notifications"],
      queryFn: () => notificationApi.getNotifications(1, 50),
      enabled: !!user && !isConnected, // Only fetch when not connected via socket
      staleTime: 30000,
      refetchOnWindowFocus: false,
   });

   // Mutations
   const markAsReadMutation = useMutation({
      mutationFn: notificationApi.markAsRead,
      onSuccess: (_, notificationId) => {
         markNotificationAsRead(notificationId);
         queryClient.invalidateQueries({
            queryKey: ["notifications-unread-count"],
         });
      },
      onError: (error) => {
         console.error("Error marking notification as read:", error);
         addToast("error", "Không thể đánh dấu thông báo đã đọc");
      },
   });

   const markAllAsReadMutation = useMutation({
      mutationFn: notificationApi.markAllAsRead,
      onSuccess: () => {
         markAllNotificationsAsRead();
         queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
      onError: (error) => {
         console.error("Error marking all notifications as read:", error);
         addToast("error", "Không thể đánh dấu tất cả thông báo đã đọc");
      },
   });

   const deleteNotificationMutation = useMutation({
      mutationFn: notificationApi.deleteNotification,
      onSuccess: (_, notificationId) => {
         removeNotification(notificationId);
      },
      onError: (error) => {
         console.error("Error deleting notification:", error);
         addToast("error", "Không thể xóa thông báo");
      },
   });

   const clearAllNotificationsMutation = useMutation({
      mutationFn: notificationApi.clearAllNotifications,
      onSuccess: () => {
         clearNotifications();
      },
      onError: (error) => {
         console.error("Error clearing all notifications:", error);
         addToast("error", "Không thể xóa tất cả thông báo");
      },
   });

   // Socket event handlers
   useEffect(() => {
      if (!socket || !user) return;

      // Connection status handlers
      const handleConnect = () => {
         setIsConnected(true);
         setError(null);
         
         // Request initial data when connected
         socket.emit("getUnreadCount");
         socket.emit("getNotifications", { page: 1, limit: 50 });
      };

      const handleDisconnect = () => {
         setIsConnected(false);
      };

      const handleConnectError = (error: any) => {
         setError(`Connection failed: ${error.message}`);
         setIsConnected(false);
      };

      // Notification event handlers
      const handleNewNotification = (data: any) => {
         const notification: Notification = {
            ...data.notification,
            type: data.notification.type || "system",
         };

         addNotification(notification);

         // Show toast for new notification
         // addToast("info", notification.title || "Thông báo mới", {
         //    description: notification.message,
         // });

         // Update unread count
         queryClient.invalidateQueries({
            queryKey: ["notifications-unread-count"],
         });
      };

      const handleUnreadCount = (data: any) => {
         setUnreadCount(data.count);
      };

      const handleNotificationList = (data: any) => {
         const mappedNotifications = data.notifications.map((n: any) => ({
            ...n,
            type: n.type || n.data?.type || "system",
         }));
         setNotifications(mappedNotifications);
      };

      const handleNotificationMarkedRead = (data: any) => {
         markNotificationAsRead(data.notificationId);
      };

      const handleAllNotificationsMarkedRead = () => {
         markAllNotificationsAsRead();
      };

      const handleNotificationDeleted = (data: any) => {
         removeNotification(data.notificationId);
      };

      const handleAllNotificationsCleared = () => {
         clearNotifications();
      };

      const handleNotificationError = (error: any) => {
         setError(error.message || "Notification error occurred");
      };

      // Register socket event listeners
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("connect_error", handleConnectError);
      
      // Notification events
      socket.on("newNotification", handleNewNotification);
      socket.on("unreadCount", handleUnreadCount);
      socket.on("notificationList", handleNotificationList);
      socket.on("notificationMarkedRead", handleNotificationMarkedRead);
      socket.on("allNotificationsMarkedRead", handleAllNotificationsMarkedRead);
      socket.on("notificationDeleted", handleNotificationDeleted);
      socket.on("allNotificationsCleared", handleAllNotificationsCleared);
      socket.on("notification_error", handleNotificationError);

      // Special event for when notification connection is established
      socket.on("notification_connected", () => {
         socket.emit("getUnreadCount");
         socket.emit("getNotifications", { page: 1, limit: 50 });
      });

      // Check if already connected
      if (socket.connected) {
         handleConnect();
      }

      // Cleanup function
      return () => {
         socket.off("connect", handleConnect);
         socket.off("disconnect", handleDisconnect);
         socket.off("connect_error", handleConnectError);
         socket.off("newNotification", handleNewNotification);
         socket.off("unreadCount", handleUnreadCount);
         socket.off("notificationList", handleNotificationList);
         socket.off("notificationMarkedRead", handleNotificationMarkedRead);
         socket.off("allNotificationsMarkedRead", handleAllNotificationsMarkedRead);
         socket.off("notificationDeleted", handleNotificationDeleted);
         socket.off("allNotificationsCleared", handleAllNotificationsCleared);
         socket.off("notification_error", handleNotificationError);
         socket.off("notification_connected");
      };
   }, [socket, user, addNotification, markNotificationAsRead, markAllNotificationsAsRead, setNotifications, setUnreadCount, removeNotification, clearNotifications, addToast, queryClient]);

   // Update store when API data changes (fallback when socket not connected)
   useEffect(() => {
      if (notificationsData?.data?.notifications && !isConnected) {
         const mappedNotifications = notificationsData.data.notifications.map(
            (n: any) => ({
               ...n,
               type: n.type ?? n.data?.type ?? "system",
            })
         );
         setNotifications(mappedNotifications);
      }
   }, [notificationsData, setNotifications, isConnected]);

   // Helper functions
   const sendNotification = useCallback(
      (userId: string, data: { title: string; message: string }) => {
         if (socket?.connected) {
            socket.emit("sendNotification", { userId, ...data });
         }
      },
      [socket]
   );

   const handleMarkAsRead = useCallback(
      (notificationId: string) => {
         if (socket?.connected) {
            socket.emit("markNotificationRead", notificationId);
         } else {
            // Fallback to API call
            markAsReadMutation.mutate(notificationId);
         }
      },
      [socket, markAsReadMutation]
   );

   const handleMarkAllAsRead = useCallback(() => {
      if (socket?.connected) {
         socket.emit("markAllNotificationsRead");
      } else {
         // Fallback to API call
         markAllAsReadMutation.mutate();
      }
   }, [socket, markAllAsReadMutation]);

   const handleDeleteNotification = useCallback(
      (notificationId: string) => {
         if (socket?.connected) {
            socket.emit("deleteNotification", notificationId);
         } else {
            // Fallback to API call
            deleteNotificationMutation.mutate(notificationId);
         }
      },
      [socket, deleteNotificationMutation]
   );

   const handleClearAllNotifications = useCallback(() => {
      if (socket?.connected) {
         socket.emit("clearAllNotifications");
      } else {
         // Fallback to API call
         clearAllNotificationsMutation.mutate();
      }
   }, [socket, clearAllNotificationsMutation]);

   const getNotifications = useCallback(
      (page = 1, limit = 50) => {
         if (socket?.connected) {
            socket.emit("getNotifications", { page, limit });
         } else {
            // Fallback to refetch API
            refetchNotifications();
         }
      },
      [socket, refetchNotifications]
   );

   return {
      isConnected,
      notifications: storeNotifications,
      unreadCount: storeUnreadCount,
      sendNotification,
      markAsRead: handleMarkAsRead,
      markAllAsRead: handleMarkAllAsRead,
      deleteNotification: handleDeleteNotification,
      clearAllNotifications: handleClearAllNotifications,
      getNotifications,
      error,
      isLoading: isLoadingNotifications && !isConnected,
      refetch: refetchNotifications,
      // Mutation states
      isMarkingAsRead: markAsReadMutation.isPending,
      isMarkingAllAsRead: markAllAsReadMutation.isPending,
      isDeletingNotification: deleteNotificationMutation.isPending,
      isClearingAll: clearAllNotificationsMutation.isPending,
   };
};
