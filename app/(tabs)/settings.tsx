import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
  Share,
} from 'react-native';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Moon, Sun, Bell, Download, Upload, Share2, Trash2, DollarSign, Wallet, Info, CircleHelp as HelpCircle, ChevronRight } from 'lucide-react-native';
import { useNotifications } from '@/providers/NotificationProvider';
import { BackupService } from '@/utils/backup';
import { validateSalary, ValidationError } from '@/utils/validation';

interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  dailyReminder: boolean;
  currency: string;
  language: string;
}

export default function SettingsScreen() {
  const systemColorScheme = useColorScheme();
  const { scheduleExpenseReminder, cancelAllNotifications } = useNotifications();
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: systemColorScheme === 'dark',
    notifications: true,
    dailyReminder: true,
    currency: 'DZD',
    language: 'ar',
  });

  const isDark = settings.darkMode;

  const colors = {
    primary: '#4CAF50',
    secondary: '#2196F3',
    accent: '#FF9800',
    danger: '#F44336',
    warning: '#FFC107',
    background: isDark ? '#1A1A1A' : '#F8F9FA',
    card: isDark ? '#2D2D2D' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#333333',
    textSecondary: isDark ? '#B0B0B0' : '#666666',
    border: isDark ? '#404040' : '#E0E0E0',
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggleDarkMode = (value: boolean) => {
    const newSettings = { ...settings, darkMode: value };
    saveSettings(newSettings);
  };

  const handleToggleNotifications = (value: boolean) => {
    const newSettings = { ...settings, notifications: value };
    saveSettings(newSettings);
  };

  const handleToggleDailyReminder = (value: boolean) => {
    const newSettings = { ...settings, dailyReminder: value };
    saveSettings(newSettings);
    
    if (value) {
      scheduleExpenseReminder();
    } else {
      cancelAllNotifications();
    }
  };

  const handleCreateBackup = async () => {
    await BackupService.createBackup();
  };

  const handleRestoreBackup = async () => {
    Alert.alert(
      'استعادة النسخة الاحتياطية',
      'سيتم استبدال جميع البيانات الحالية. هل أنت متأكد؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'استعادة', 
          style: 'destructive',
          onPress: () => BackupService.restoreBackup()
        },
      ]
    );
  };

  const handleExportCSV = async () => {
    await BackupService.exportToCSV();
  };

  const handleExportData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const goals = await AsyncStorage.getItem('financialGoals');
      
      const exportData = {
        userData: userData ? JSON.parse(userData) : null,
        goals: goals ? JSON.parse(goals) : [],
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
      };

      const dataString = JSON.stringify(exportData, null, 2);
      
      await Share.share({
        message: `بيانات تطبيق مصروفي\n${dataString}`,
        title: 'تصدير بيانات مصروفي',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تصدير البيانات');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'مسح جميع البيانات',
      'هل أنت متأكد من حذف جميع بياناتك؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['userData', 'financialGoals']);
              Alert.alert('تم الحذف', 'تم حذف جميع البيانات بنجاح');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف البيانات');
            }
          },
        },
      ]
    );
  };

  const handleEditSalary = () => {
    Alert.prompt(
      'تعديل الراتب',
      'أدخل راتبك الشهري الجديد:',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حفظ',
          onPress: async (input) => {
            try {
              const newSalary = validateSalary(input || '');
              
              const userData = await AsyncStorage.getItem('userData');
              const currentData = userData ? JSON.parse(userData) : { monthlyExpenses: [] };
              currentData.salary = newSalary;
              currentData.salaryDate = new Date().toISOString();
              
              await AsyncStorage.setItem('userData', JSON.stringify(currentData));
              Alert.alert('تم الحفظ ✅', 'تم تحديث راتبك بنجاح');
            } catch (error) {
              if (error instanceof ValidationError) {
                Alert.alert('خطأ في البيانات', error.message);
              } else {
                console.error('Error updating salary:', error);
                Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الراتب');
              }
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleResetMonthlyData = () => {
    Alert.alert(
      'إعادة ضبط البيانات الشهرية',
      'سيتم حذف جميع المصاريف الشهرية. هل أنت متأكد؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة ضبط',
          style: 'destructive',
          onPress: async () => {
            try {
              const userData = await AsyncStorage.getItem('userData');
              if (userData) {
                const currentData = JSON.parse(userData);
                currentData.monthlyExpenses = [];
                await AsyncStorage.setItem('userData', JSON.stringify(currentData));
                Alert.alert('تم بنجاح', 'تم إعادة ضبط البيانات الشهرية');
              }
            } catch (error) {
              console.error('Error updating salary:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء إعادة الضبط');
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const showAbout = () => {
    Alert.alert(
      'حول مصروفي',
      'مصروفي - تطبيق إدارة المصاريف الشخصية\nالإصدار: 1.0.0\n\nتطبيق مصمم خصيصاً للمستخدمين العرب لتتبع وإدارة مصاريفهم الشخصية بطريقة بسيطة وفعالة.\n\nالميزات:\n• تتبع المصاريف اليومية\n• تقارير مفصلة\n• أهداف مالية\n• نسخ احتياطية\n• تصدير البيانات',
      [{ text: 'حسناً' }]
    );
  };

  const showHelp = () => {
    Alert.alert(
      'المساعدة',
      'كيفية استخدام التطبيق:\n\n1. أدخل راتبك الشهري في الإعدادات\n2. سجل مصاريفك اليومية من خلال زر "إضافة مصروف"\n3. راجع تقاريرك المالية في قسم "التقارير"\n4. ضع أهدافاً مالية وتتبع تقدمك\n5. استخدم النسخ الاحتياطية لحماية بياناتك\n\nنصائح:\n• سجل مصاريفك فور حدوثها\n• راجع التقارير أسبوعياً\n• ضع أهدافاً واقعية',
      [{ text: 'فهمت' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>الإعدادات</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        
        {/* Appearance Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>المظهر</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {isDark ? <Moon size={24} color={colors.primary} /> : <Sun size={24} color={colors.accent} />}
              <Text style={[styles.settingLabel, { color: colors.text }]}>الوضع الداكن</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={settings.darkMode ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Notifications Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>الإشعارات</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={24} color={colors.secondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>تفعيل الإشعارات</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.secondary + '50' }}
              thumbColor={settings.notifications ? colors.secondary : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={24} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>تذكير يومي (8 مساءً)</Text>
            </View>
            <Switch
              value={settings.dailyReminder}
              onValueChange={handleToggleDailyReminder}
              trackColor={{ false: colors.border, true: colors.accent + '50' }}
              thumbColor={settings.dailyReminder ? colors.accent : colors.textSecondary}
              disabled={!settings.notifications}
            />
          </View>
        </View>

        {/* Financial Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>الإعدادات المالية</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleEditSalary}>
            <View style={styles.settingLeft}>
              <DollarSign size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>تعديل الراتب الشهري</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Wallet size={24} color={colors.secondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>العملة</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>دينار جزائري (د.ج)</Text>
          </View>
        </View>

        {/* Data Management */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>إدارة البيانات</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleCreateBackup}>
            <View style={styles.settingLeft}>
              <Download size={24} color={colors.secondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>إنشاء نسخة احتياطية</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleRestoreBackup}>
            <View style={styles.settingLeft}>
              <Upload size={24} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>استعادة نسخة احتياطية</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleExportCSV}>
            <View style={styles.settingLeft}>
              <Share2 size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>تصدير إلى Excel</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleResetMonthlyData}>
            <View style={styles.settingLeft}>
              <Trash2 size={24} color={colors.warning} />
              <Text style={[styles.settingLabel, { color: colors.warning }]}>إعادة ضبط البيانات الشهرية</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
            <View style={styles.settingLeft}>
              <Trash2 size={24} color={colors.danger} />
              <Text style={[styles.settingLabel, { color: colors.danger }]}>مسح جميع البيانات</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* About & Help */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>المساعدة والدعم</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={showHelp}>
            <View style={styles.settingLeft}>
              <HelpCircle size={24} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>كيفية الاستخدام</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={showAbout}>
            <View style={styles.settingLeft}>
              <Info size={24} color={colors.secondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>حول التطبيق</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={[styles.appInfo, { backgroundColor: colors.card }]}>
          <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
            مصروفي - إدارة المصاريف الشخصية
          </Text>
          <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
            الإصدار 1.0.0
          </Text>
          <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
            صُنع بـ ❤️ للمستخدمين العرب
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Cairo-Bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 15,
    borderRadius: 15,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 10,
    fontFamily: 'Cairo-Bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 15,
    fontFamily: 'Cairo-Regular',
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
  },
  appInfo: {
    margin: 15,
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appInfoText: {
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'Cairo-Regular',
  },
});