export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateAmount = (amount: string): number => {
  if (!amount || amount.trim() === '') {
    throw new ValidationError('يرجى إدخال المبلغ');
  }

  const numericAmount = parseFloat(amount);
  
  if (isNaN(numericAmount)) {
    throw new ValidationError('يرجى إدخال مبلغ صحيح');
  }

  if (numericAmount <= 0) {
    throw new ValidationError('يجب أن يكون المبلغ أكبر من صفر');
  }

  if (numericAmount > 999999999) {
    throw new ValidationError('المبلغ كبير جداً');
  }

  return numericAmount;
};

export const validateCategory = (category: string): void => {
  if (!category || category.trim() === '') {
    throw new ValidationError('يرجى اختيار فئة المصروف');
  }
};

export const validateMood = (mood: string): void => {
  if (!mood || mood.trim() === '') {
    throw new ValidationError('يرجى اختيار الحالة المزاجية');
  }
};

export const validateSalary = (salary: string): number => {
  if (!salary || salary.trim() === '') {
    throw new ValidationError('يرجى إدخال الراتب');
  }

  const numericSalary = parseFloat(salary);
  
  if (isNaN(numericSalary)) {
    throw new ValidationError('يرجى إدخال راتب صحيح');
  }

  if (numericSalary <= 0) {
    throw new ValidationError('يجب أن يكون الراتب أكبر من صفر');
  }

  if (numericSalary > 999999999) {
    throw new ValidationError('الراتب كبير جداً');
  }

  return numericSalary;
};

export const validateGoalTitle = (title: string): void => {
  if (!title || title.trim() === '') {
    throw new ValidationError('يرجى إدخال عنوان الهدف');
  }

  if (title.length > 100) {
    throw new ValidationError('عنوان الهدف طويل جداً');
  }
};

export const validateGoalAmount = (amount: string): number => {
  if (!amount || amount.trim() === '') {
    throw new ValidationError('يرجى إدخال مبلغ الهدف');
  }

  const numericAmount = parseFloat(amount);
  
  if (isNaN(numericAmount)) {
    throw new ValidationError('يرجى إدخال مبلغ صحيح');
  }

  if (numericAmount <= 0) {
    throw new ValidationError('يجب أن يكون مبلغ الهدف أكبر من صفر');
  }

  if (numericAmount > 999999999) {
    throw new ValidationError('مبلغ الهدف كبير جداً');
  }

  return numericAmount;
};

export const validateDate = (date: string): void => {
  if (!date || date.trim() === '') {
    throw new ValidationError('يرجى إدخال تاريخ الهدف');
  }

  const goalDate = new Date(date);
  const today = new Date();
  
  if (isNaN(goalDate.getTime())) {
    throw new ValidationError('تاريخ غير صحيح');
  }

  if (goalDate <= today) {
    throw new ValidationError('يجب أن يكون تاريخ الهدف في المستقبل');
  }
};