import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface BackupData {
  userData: any;
  financialGoals: any[];
  appSettings: any;
  backupDate: string;
  appVersion: string;
}

export class BackupService {
  static async createBackup(): Promise<void> {
    try {
      // جمع البيانات
      const userData = await AsyncStorage.getItem('userData');
      const financialGoals = await AsyncStorage.getItem('financialGoals');
      const appSettings = await AsyncStorage.getItem('appSettings');

      const backupData: BackupData = {
        userData: userData ? JSON.parse(userData) : null,
        financialGoals: financialGoals ? JSON.parse(financialGoals) : [],
        appSettings: appSettings ? JSON.parse(appSettings) : {},
        backupDate: new Date().toISOString(),
        appVersion: '1.0.0',
      };

      // إنشاء ملف النسخة الاحتياطية
      const fileName = `mesrofi_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(backupData, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );

      // مشاركة الملف
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'حفظ النسخة الاحتياطية',
        });
      }

      Alert.alert('تم بنجاح', 'تم إنشاء النسخة الاحتياطية بنجاح');
    } catch (error) {
      console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
      Alert.alert('خطأ', 'فشل في إنشاء النسخة الاحتياطية');
    }
  }

  static async restoreBackup(): Promise<void> {
    try {
      // اختيار ملف النسخة الاحتياطية
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // قراءة الملف
      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const backupData: BackupData = JSON.parse(fileContent);

      // التحقق من صحة البيانات
      if (!backupData.backupDate || !backupData.appVersion) {
        throw new Error('ملف النسخة الاحتياطية غير صحيح');
      }

      // استعادة البيانات
      if (backupData.userData) {
        await AsyncStorage.setItem('userData', JSON.stringify(backupData.userData));
      }

      if (backupData.financialGoals) {
        await AsyncStorage.setItem('financialGoals', JSON.stringify(backupData.financialGoals));
      }

      if (backupData.appSettings) {
        await AsyncStorage.setItem('appSettings', JSON.stringify(backupData.appSettings));
      }

      Alert.alert(
        'تم بنجاح',
        'تم استعادة النسخة الاحتياطية بنجاح. سيتم إعادة تشغيل التطبيق.',
        [
          {
            text: 'حسناً',
            onPress: () => {
              // يمكن إضافة إعادة تشغيل التطبيق هنا
            },
          },
        ]
      );
    } catch (error) {
      console.error('خطأ في استعادة النسخة الاحتياطية:', error);
      Alert.alert('خطأ', 'فشل في استعادة النسخة الاحتياطية');
    }
  }

  static async exportToCSV(): Promise<void> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        Alert.alert('تنبيه', 'لا توجد بيانات للتصدير');
        return;
      }

      const data = JSON.parse(userData);
      const expenses = data.monthlyExpenses || [];

      if (expenses.length === 0) {
        Alert.alert('تنبيه', 'لا توجد مصاريف للتصدير');
        return;
      }

      // إنشاء محتوى CSV
      let csvContent = 'التاريخ,المبلغ,الفئة,الحالة المزاجية,الملاحظة\n';
      
      expenses.forEach((expense: any) => {
        const date = new Date(expense.date).toLocaleDateString('ar');
        const amount = expense.amount;
        const category = this.getCategoryArabicName(expense.category);
        const mood = this.getMoodArabicName(expense.mood);
        const note = expense.note || '';
        
        csvContent += `${date},${amount},${category},${mood},"${note}"\n`;
      });

      // حفظ الملف
      const fileName = `mesrofi_expenses_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // مشاركة الملف
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'تصدير المصاريف',
        });
      }

      Alert.alert('تم بنجاح', 'تم تصدير المصاريف بنجاح');
    } catch (error) {
      console.error('خطأ في تصدير CSV:', error);
      Alert.alert('خطأ', 'فشل في تصدير البيانات');
    }
  }

  private static getCategoryArabicName(category: string): string {
    const categoryNames: Record<string, string> = {
      food: 'طعام',
      transport: 'نقل',
      bills: 'فواتير',
      entertainment: 'ترفيه',
      health: 'صحة',
      shopping: 'تسوق',
      education: 'تعليم',
      other: 'أخرى',
    };
    return categoryNames[category] || category;
  }

  private static getMoodArabicName(mood: string): string {
    const moodNames: Record<string, string> = {
      happy: 'سعيد',
      neutral: 'عادي',
      stressed: 'متوتر',
    };
    return moodNames[mood] || mood;
  }
}