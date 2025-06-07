
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';

let firebaseAdminApp: App | undefined = undefined;
let initializationError: string | null = null;

const serviceAccountKeyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

// Teşhis amaçlı loglama eklendi
console.log("FirebaseAdmin: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON kontrol ediliyor.");
if (serviceAccountKeyString === undefined) {
  console.log("FirebaseAdmin: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON tanımsız (undefined).");
} else if (serviceAccountKeyString === null) {
  console.log("FirebaseAdmin: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON null.");
} else if (serviceAccountKeyString === "") {
  console.log("FirebaseAdmin: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON boş bir string.");
} else {
  console.log(`FirebaseAdmin: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON AYARLI. Uzunluk: ${serviceAccountKeyString.length}. İçeriğin ilk 20 karakteri: "${serviceAccountKeyString.substring(0, 20)}..."`);
}
// Teşhis amaçlı loglama sonu

console.log("FirebaseAdmin: Modül yükleniyor. Firebase Admin SDK başlatılmaya çalışılıyor.");

if (!admin.apps.length) {
  console.log("FirebaseAdmin: Mevcut Firebase Admin uygulaması yok. Yeni bir tane başlatılıyor.");
  try {
    if (!serviceAccountKeyString) {
      initializationError = "FIREBASE_SERVICE_ACCOUNT_KEY_JSON çevre değişkeni ayarlanmamış.";
      console.error("FirebaseAdmin: KRİTİK_ENV_DEĞİŞKENİ_EKSİK -", initializationError);
      throw new Error(initializationError);
    }
    
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKeyString);
    } catch (e: any) {
      const parseErrorMsg = `FIREBASE_SERVICE_ACCOUNT_KEY_JSON parse edilemedi: ${e.message}`;
      console.error("FirebaseAdmin: KRİTİK_JSON_PARSE_HATASI -", parseErrorMsg);
      initializationError = parseErrorMsg;
      throw new Error(initializationError);
    }

    console.log("FirebaseAdmin: BAŞLATMA_ÖNCESİ - Servis Hesabı Parse Edildi. SA'dan Proje ID:", serviceAccount.project_id);
    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      const missingFieldsMsg = "Servis hesabı JSON'u gerekli alanlardan bir veya daha fazlasını (project_id, client_email, private_key) içermiyor.";
      console.error("FirebaseAdmin: KRİTİK_SA_DOĞRULAMA_HATASI -", missingFieldsMsg);
      initializationError = missingFieldsMsg;
      throw new Error(initializationError);
    }

    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // projectId credential'dan otomatik olarak algılanır
    });

    console.log("FirebaseAdmin: BAŞLATMA_SONRASI - Firebase Admin SDK başarıyla başlatıldı. Uygulama adı:", firebaseAdminApp.name);

    // Başarılı başlatma için bir sağlamlık kontrolü olarak INTERNAL özelliğini kontrol et
    if (firebaseAdminApp && typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null) {
        console.log("FirebaseAdmin: BAŞLATMA_SONRASI_KONTROL - firebaseAdminApp.INTERNAL tanımlı. SDK muhtemelen doğru başlatıldı.");
    } else {
        const internalErrorMsg = "Başlatma sonrası Firebase Admin App INTERNAL nesnesi tanımsız. Bu genellikle kimlik bilgileriyle veya SDK'nın temel kurulumuyla ilgili bir sorunu gösterir. Kimlik doğrulama özellikleri büyük olasılıkla başarısız olacaktır.";
        console.error("FirebaseAdmin: KRİTİK BAŞLATMA_SONRASI_KONTROL -", internalErrorMsg);
        initializationError = initializationError || internalErrorMsg; // Daha önce bir hata varsa onu koru
    }

  } catch (error: any) {
    if (!initializationError) { // Daha spesifik bir kontrol tarafından zaten ayarlanmadıysa
        initializationError = `Firebase Admin SDK Başlatma Hatası: ${error.message}`;
    }
    console.error("FirebaseAdmin: KRİTİK BAŞLATMA HATASI - ", initializationError);
    // Çok ayrıntılı logları önlemek için, derinlemesine hata ayıklama gerekmedikçe burada tam 'error' nesnesini loglamaktan kaçının.
    // console.error("FirebaseAdmin: Başlatma sırasında tam hata nesnesi:", error); 
  }
} else {
  console.log("FirebaseAdmin: Firebase Admin uygulaması zaten başlatılmış. Mevcut uygulama kullanılıyor.");
  firebaseAdminApp = admin.app(); // Varsayılan uygulamayı al
  // Mevcut uygulama için de başlatma sonrası kontrolü yap, başka bir yerde kötü başlatılmış olma ihtimaline karşı
  if (firebaseAdminApp && !(typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null) && !initializationError) {
    initializationError = "Mevcut Firebase Admin App'in INTERNAL nesnesi tanımsız. SDK tam olarak işlevsel olmayabilir.";
    console.warn("FirebaseAdmin: UYARI -", initializationError);
  }
}

export { admin, firebaseAdminApp }; // firebaseAdminApp başlatma başarısız olursa tanımsız olabilir

export function getAdminInitializationError(): string | null {
  // Bu fonksiyon, başlatma durumunun tek doğru kaynağıdır.
  // Açık başlatma denemesi sırasında yakalanan herhangi bir hatayı önceliklendirir.
  if (initializationError) {
    return initializationError;
  }
  // Açık bir hata yoksa, ancak uygulama veya INTERNAL özelliği eksikse bunu bildir.
  if (!firebaseAdminApp) {
    return "Firebase Admin App (firebaseAdminApp) tanımsız. Başlatma muhtemelen sessizce başarısız oldu veya denenmedi.";
  }
  if (!(typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null)) {
    return "Firebase Admin App'in INTERNAL nesnesi tanımsız. SDK tam olarak işlevsel olmayabilir (kimlik bilgileri veya kurulum sorunu).";
  }
  return null; // Hata yok
}
