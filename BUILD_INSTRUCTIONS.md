# تعليمات بناء تطبيق مصروفي لنظام Android

## المتطلبات الأساسية

### 1. تثبيت Node.js و npm
```bash
# تحقق من الإصدار
node --version  # يجب أن يكون 16 أو أحدث
npm --version
```

### 2. تثبيت Expo CLI
```bash
npm install -g @expo/cli
npm install -g eas-cli
```

### 3. إنشاء حساب Expo
- اذهب إلى [expo.dev](https://expo.dev) وأنشئ حساباً
- سجل الدخول من خلال CLI:
```bash
expo login
```

## خطوات البناء

### 1. تثبيت التبعيات
```bash
npm install
```

### 2. إعداد EAS Build
```bash
eas build:configure
```

### 3. بناء APK للاختبار
```bash
# بناء نسخة تجريبية
eas build --platform android --profile preview

# أو بناء نسخة الإنتاج
eas build --platform android --profile production
```

### 4. تنزيل APK
بعد اكتمال البناء، ستحصل على رابط لتنزيل ملف APK من لوحة تحكم Expo.

## البناء المحلي (اختياري)

### 1. تثبيت Android Studio
- حمل وثبت [Android Studio](https://developer.android.com/studio)
- تأكد من تثبيت Android SDK

### 2. إعداد متغيرات البيئة
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 3. البناء المحلي
```bash
# إنشاء build محلي
eas build --platform android --local
```

## إعدادات التوقيع الرقمي

### 1. إنشاء مفتاح التوقيع
```bash
# إنشاء keystore جديد
keytool -genkeypair -v -keystore mesrofi-release-key.keystore -alias mesrofi-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. إعداد ملف credentials.json
```json
{
  "android": {
    "keystore": {
      "keystorePath": "mesrofi-release-key.keystore",
      "keystorePassword": "YOUR_KEYSTORE_PASSWORD",
      "keyAlias": "mesrofi-key-alias",
      "keyPassword": "YOUR_KEY_PASSWORD"
    }
  }
}
```

## اختبار التطبيق

### 1. اختبار على المحاكي
```bash
# تشغيل المحاكي
expo start --android
```

### 2. اختبار على جهاز حقيقي
- ثبت تطبيق Expo Go من Google Play
- امسح QR code الذي يظهر عند تشغيل `expo start`

## نشر التطبيق

### 1. إعداد Google Play Console
- أنشئ حساب مطور على [Google Play Console](https://play.google.com/console)
- ادفع رسوم التسجيل (25 دولار لمرة واحدة)

### 2. رفع APK
- اذهب إلى Google Play Console
- أنشئ تطبيقاً جديداً
- ارفع ملف APK في قسم "App bundles and APKs"

### 3. ملء معلومات التطبيق
- أضف وصف التطبيق
- ارفع الصور والأيقونات
- حدد الفئة والتصنيف العمري
- أضف سياسة الخصوصية

## استكشاف الأخطاء

### مشاكل شائعة وحلولها:

1. **خطأ في البناء:**
   ```bash
   # امسح cache وأعد التثبيت
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

2. **مشاكل Android SDK:**
   ```bash
   # تحديث SDK
   sdkmanager --update
   ```

3. **مشاكل الذاكرة:**
   ```bash
   # زيادة ذاكرة Node.js
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

## ملاحظات مهمة

- تأكد من تحديث `app.json` بمعلومات التطبيق الصحيحة
- اختبر التطبيق على أجهزة مختلفة قبل النشر
- احتفظ بنسخة احتياطية من مفتاح التوقيع
- راجع سياسات Google Play قبل النشر

## الدعم

للحصول على المساعدة:
- [وثائق Expo](https://docs.expo.dev/)
- [مجتمع Expo Discord](https://discord.gg/expo)
- [منتدى Expo](https://forums.expo.dev/)