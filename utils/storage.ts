import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  mood: string;
  note?: string;
}

export interface UserData {
  salary: number;
  monthlyExpenses: Expense[];
  salaryDate: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  emoji: string;
  createdAt: string;
}

export const StorageKeys = {
  USER_DATA: 'userData',
  FINANCIAL_GOALS: 'financialGoals',
  APP_SETTINGS: 'appSettings',
} as const;

export class StorageService {
  static async getUserData(): Promise<UserData | null> {
    try {
      const data = await AsyncStorage.getItem(StorageKeys.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  static async saveUserData(userData: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageKeys.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  static async getFinancialGoals(): Promise<FinancialGoal[]> {
    try {
      const data = await AsyncStorage.getItem(StorageKeys.FINANCIAL_GOALS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting financial goals:', error);
      return [];
    }
  }

  static async saveFinancialGoals(goals: FinancialGoal[]): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageKeys.FINANCIAL_GOALS, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving financial goals:', error);
      throw error;
    }
  }

  static async addExpense(expense: Expense): Promise<void> {
    try {
      const userData = await this.getUserData();
      const updatedData: UserData = userData || {
        salary: 0,
        monthlyExpenses: [],
        salaryDate: new Date().toISOString(),
      };
      
      updatedData.monthlyExpenses.push(expense);
      await this.saveUserData(updatedData);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  static async updateExpense(expenseId: string, updatedExpense: Partial<Expense>): Promise<void> {
    try {
      const userData = await this.getUserData();
      if (!userData) return;

      const expenseIndex = userData.monthlyExpenses.findIndex(exp => exp.id === expenseId);
      if (expenseIndex !== -1) {
        userData.monthlyExpenses[expenseIndex] = {
          ...userData.monthlyExpenses[expenseIndex],
          ...updatedExpense,
        };
        await this.saveUserData(userData);
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  static async deleteExpense(expenseId: string): Promise<void> {
    try {
      const userData = await this.getUserData();
      if (!userData) return;

      userData.monthlyExpenses = userData.monthlyExpenses.filter(exp => exp.id !== expenseId);
      await this.saveUserData(userData);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  static async resetMonthlyData(): Promise<void> {
    try {
      const userData = await this.getUserData();
      if (!userData) return;

      userData.monthlyExpenses = [];
      userData.salaryDate = new Date().toISOString();
      await this.saveUserData(userData);
    } catch (error) {
      console.error('Error resetting monthly data:', error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        StorageKeys.USER_DATA,
        StorageKeys.FINANCIAL_GOALS,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}