import React, { createContext, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// إعداد سلوك الإشعارات
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationContextType {
  scheduleExpenseReminder: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const scheduleExpenseReminder = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'تذكير مصروفي 💰',
          body: 'لا تنس تسجيل مصاريف اليوم!',
          sound: 'default',
        },
        trigger: {
          hour: 20, // 8 مساءً
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('خطأ في جدولة الإشعار:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('خطأ في إلغاء الإشعارات:', error);
    }
  };

  const value = {
    scheduleExpenseReminder,
    cancelAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('فشل في الحصول على إذن الإشعارات');
    return;
  }
}