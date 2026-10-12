/* =====================================================================
   أَشْعَارِي — إعدادات سريعة
   ---------------------------------------------------------------------
   1) الوضع المحلي (الافتراضي): القصائد تُحفَظ في متصفحك فقط (localStorage).
      استخدم زرّي «تصدير» و«استيراد» لنقلها بين الأجهزة.
   2) وضع النشر العام (Firebase): ألصق إعدادات Firebase هنا ليرى الزوّار
      قصائدك، وتبقى أنت وحدك من يضيف ويعدّل بعد تسجيل الدخول.
      الخطوات:
        - أنشئ مشروعًا في Firebase، وفعّل Firestore وAuthentication (Email/Password).
        - أضف مستخدمًا واحدًا (أنت) من لوحة Authentication.
        - في قواعد Firestore:
            rules_version = '2';
            service cloud.firestore { match /databases/{db}/documents {
              match /poems/{id} {
                allow read: if true;
                allow write: if request.auth != null
                             && request.auth.token.email == 'YOUR_EMAIL@example.com';
              } } }
        - ثم ضع الإعدادات هنا بدل null:
            const FIREBASE_CONFIG = { apiKey:"...", authDomain:"...", projectId:"...", appId:"..." };
   ===================================================================== */
const FIREBASE_CONFIG = { apiKey:"AIzaSyARIiSt4DCbl7CyPfrdPnY4xB5aTBGBulw", authDomain:"ashari-af6c7.firebaseapp.com", projectId:"ashari-af6c7", appId:"1:76069042904:web:f7d02174511da9833e35ad" };
