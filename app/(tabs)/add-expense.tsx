import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Save, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validateAmount, validateCategory, validateMood, ValidationError } from '@/utils/validation';

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  mood: string;
  note?: string;
}

interface CategoryItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export default function AddExpenseScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const colors = {
    primary: '#4CAF50',
    secondary: '#2196F3',
    accent: '#FF9800',
    danger: '#F44336',
    background: isDark ? '#1A1A1A' : '#F8F9FA',
    card: isDark ? '#2D2D2D' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#333333',
    textSecondary: isDark ? '#B0B0B0' : '#666666',
    border: isDark ? '#404040' : '#E0E0E0',
    inputBg: isDark ? '#404040' : '#F5F5F5',
  };

  const categories: CategoryItem[] = [
    { id: 'food', name: 'طعام', emoji: '🍔', color: '#FF6B6B' },
    { id: 'transport', name: 'نقل', emoji: '🚌', color: '#4ECDC4' },
    { id: 'bills', name: 'فواتير', emoji: '💡', color: '#45B7D1' },
    { id: 'entertainment', name: 'ترفيه', emoji: '🎬', color: '#96CEB4' },
    { id: 'health', name: 'صحة', emoji: '💊', color: '#FF8A65' },
    { id: 'shopping', name: 'تسوق', emoji: '🛍️', color: '#BA68C8' },
    { id: 'education', name: 'تعليم', emoji: '📚', color: '#FFB74D' },
    { id: 'other', name: 'أخرى', emoji: '📦', color: '#FFEAA7' },
  ];

  const moods = [
    { id: 'happy', name: 'سعيد', emoji: '😊', color: '#4CAF50' },
    { id: 'neutral', name: 'عادي', emoji: '😐', color: '#FF9800' },
    { id: 'stressed', name: 'متوتر', emoji: '😰', color: '#F44336' },
  ];

  const handleSaveExpense = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      // التحقق من صحة البيانات
      const expenseAmount = validateAmount(amount);
      validateCategory(selectedCategory);
      validateMood(selectedMood);
      
      const userData = await AsyncStorage.getItem('userData');
      let currentData = userData ? JSON.parse(userData) : { salary: 0, monthlyExpenses: [] };

      const newExpense: Expense = {
        id: Date.now().toString(),
        amount: expenseAmount,
        category: selectedCategory,
        date: selectedDate.toISOString(),
        mood: selectedMood,
        note: note.trim() || undefined,
      };

      currentData.monthlyExpenses.push(newExpense);
      await AsyncStorage.setItem('userData', JSON.stringify(currentData));

      Alert.alert(
        'تم الحفظ ✅',
        'تم إضافة المصروف بنجاح',
        [
          {
            text: 'إضافة آخر',
            onPress: () => {
              setAmount('');
              setSelectedCategory('');
              setSelectedMood('');
              setNote('');
              setSelectedDate(new Date());
            },
          },
          {
            text: 'العودة للرئيسية',
            onPress: () => router.push('/'),
          },
        ]
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        Alert.alert('خطأ في البيانات', error.message);
      } else {
        console.error('Error saving expense:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء حفظ المصروف');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (text: string) => {
    // السماح بالأرقام والنقطة العشرية فقط
    const cleanText = text.replace(/[^0-9.]/g, '');
    // منع أكثر من نقطة عشرية واحدة
    const parts = cleanText.split('.');
    if (parts.length > 2) {
      return;
    }
    setAmount(cleanText);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>إضافة مصروف جديد</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Amount Input */}<View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>المبلغ</Text>
          <View style={styles.amountContainer}>
            <TextInput
              style={[styles.amountInput, { 
                backgroundColor: colors.inputBg, 
                color: colors.text,
                borderColor: amount && validateAmount(amount) ? colors.primary : colors.border 
              }]}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={10}
            />
            <Text style={[styles.currencyText, { color: colors.textSecondary }]}>د.ج</Text>
          </View>
        </View>{/* Category Selection */}<View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>التصنيف</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  { 
                    backgroundColor: selectedCategory === category.id 
                      ? category.color + '20' 
                      : colors.inputBg,
                    borderColor: selectedCategory === category.id 
                      ? category.color 
                      : colors.border,
                  }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>{/* Date Selection */}<View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>التاريخ</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={colors.primary} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {selectedDate.toLocaleDateString('ar')}
            </Text>
          </TouchableOpacity>
{showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>{/* Mood Selection */}<View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>الحالة المزاجية</Text>
          <View style={styles.moodsContainer}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodItem,
                  { 
                    backgroundColor: selectedMood === mood.id 
                      ? mood.color + '20' 
                      : colors.inputBg,
                    borderColor: selectedMood === mood.id 
                      ? mood.color 
                      : colors.border,
                  }
                ]}
                onPress={() => setSelectedMood(mood.id)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodName, { color: colors.text }]}>{mood.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>{/* Note Input */}<View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>ملاحظة (اختياري)</Text>
          <TextInput
            style={[styles.noteInput, { 
              backgroundColor: colors.inputBg, 
              color: colors.text,
              borderColor: colors.border 
            }]}
            value={note}
            onChangeText={setNote}
            placeholder="أضف ملاحظة عن هذا المصروف..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>{/* Save Button */}<TouchableOpacity
          style={[
            styles.saveButton, 
            { 
              backgroundColor: isLoading ? colors.textSecondary : colors.primary,
              opacity: isLoading ? 0.7 : 1 
            }
          ]}
          onPress={handleSaveExpense}
          disabled={isLoading}
        >
          <Save size={24} color="white" />
          <Text style={styles.saveButtonText}>
            {isLoading ? 'جاري الحفظ...' : 'حفظ المصروف'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  card: {
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'Cairo-Bold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: 'center',
    fontFamily: 'Cairo-Bold',
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Cairo-Bold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Cairo-SemiBold', 
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'Cairo-Regular',
  },
  moodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodItem: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  moodName: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Cairo-SemiBold',
  },
  noteInput: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: 'Cairo-Regular',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 15,
    marginBottom: 30,
    padding: 18,
    borderRadius: 15,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Cairo-Bold',
  },
});