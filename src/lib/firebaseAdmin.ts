
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';

let firebaseAdminApp: App | undefined = undefined;
let initializationError: string | null = null;

const serviceAccountKeyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
const projectIdEnv = process.env.FIREBASE_PROJECT_ID;
const clientEmailEnv = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;

console.log("FirebaseAdmin: Modül yükleniyor. Firebase Admin SDK başlatılmaya çalışılıyor.");

if (!admin.apps.length) {
  console.log("FirebaseAdmin: Mevcut Firebase Admin uygulaması yok. Yeni bir tane başlatılıyor.");
  let serviceAccount: ServiceAccount | undefined = undefined;

  if (serviceAccountKeyString) {
    console.log(`FirebaseAdmin: FIREBASE_SERVICE_ACCOUNT_KEY_JSON AYARLI. Uzunluk: ${serviceAccountKeyString.length}. İçeriğin ilk 20 karakteri: "${serviceAccountKeyString.substring(0, 20)}..."`);
    try {
      serviceAccount = JSON.parse(serviceAccountKeyString);
    } catch (e: any) {
      const parseErrorMsg = `FIREBASE_SERVICE_ACCOUNT_KEY_JSON parse edilemedi: ${e.message}`;
      console.error("FirebaseAdmin: KRİTİK_JSON_PARSE_HATASI -", parseErrorMsg);
      initializationError = parseErrorMsg;
    }
  } else if (projectIdEnv && clientEmailEnv && privateKeyEnv) {
    console.log("FirebaseAdmin: FIREBASE_SERVICE_ACCOUNT_KEY_JSON tanımsız. Ayrı Firebase ortam değişkenleri (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) kullanılmaya çalışılıyor.");
    serviceAccount = {
      projectId: projectIdEnv,
      clientEmail: clientEmailEnv,
      // Ortam değişkeninden gelen private key'deki \n literallerini gerçek yeni satır karakterlerine dönüştür
      privateKey: privateKeyEnv.replace(/\\n/g, '\n'),
    };
    console.log("FirebaseAdmin: Servis hesabı nesnesi ayrı ortam değişkenlerinden oluşturuldu. Proje ID:", serviceAccount.projectId);
  } else {
    initializationError = "Firebase Admin SDK başlatılamadı: Ne FIREBASE_SERVICE_ACCOUNT_KEY_JSON ne de ayrı (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) ortam değişkenleri tam olarak ayarlanmamış.";
    console.error("FirebaseAdmin: KRİTİK_ENV_DEĞİŞKENİ_EKSİK -", initializationError);
  }

  if (serviceAccount && !initializationError) {
    try {
      console.log("FirebaseAdmin: BAŞLATMA_ÖNCESİ - Servis Hesabı Kullanılıyor. SA'dan Proje ID:", serviceAccount.projectId);
      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        const missingFieldsMsg = "Servis hesabı bilgileri gerekli alanlardan bir veya daha fazlasını (project_id, client_email, private_key) içermiyor.";
        console.error("FirebaseAdmin: KRİTİK_SA_DOĞRULAMA_HATASI -", missingFieldsMsg);
        initializationError = missingFieldsMsg;
        throw new Error(missingFieldsMsg); // Throw to prevent initialization attempt
      }

      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("FirebaseAdmin: BAŞLATMA_SONRASI - Firebase Admin SDK başarıyla başlatıldı. Uygulama adı:", firebaseAdminApp.name);

      if (firebaseAdminApp && typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null) {
        console.log("FirebaseAdmin: BAŞLATMA_SONRASI_KONTROL - firebaseAdminApp.INTERNAL tanımlı. SDK muhtemelen doğru başlatıldı.");
      } else {
        const internalErrorMsg = "Başlatma sonrası Firebase Admin App INTERNAL nesnesi tanımsız. Bu genellikle kimlik bilgileriyle veya SDK'nın temel kurulumuyla ilgili bir sorunu gösterir.";
        console.error("FirebaseAdmin: KRİTİK BAŞLATMA_SONRASI_KONTROL -", internalErrorMsg);
        initializationError = initializationError || internalErrorMsg;
      }
    } catch (error: any) {
      if (!initializationError) {
        initializationError = `Firebase Admin SDK Başlatma Hatası: ${error.message}`;
      }
      console.error("FirebaseAdmin: KRİTİK BAŞLATMA HATASI - ", initializationError, "Hata detayı:", error);
    }
  } else if (!initializationError) { // serviceAccount is undefined but no specific error was set
     initializationError = "Firebase Admin SDK için servis hesabı bilgileri oluşturulamadı.";
     console.error("FirebaseAdmin: KRİTİK -", initializationError);
  }

} else {
  console.log("FirebaseAdmin: Firebase Admin uygulaması zaten başlatılmış. Mevcut uygulama kullanılıyor.");
  firebaseAdminApp = admin.app();
  if (firebaseAdminApp && !(typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null) && !initializationError) {
    initializationError = "Mevcut Firebase Admin App'in INTERNAL nesnesi tanımsız. SDK tam olarak işlevsel olmayabilir.";
    console.warn("FirebaseAdmin: UYARI -", initializationError);
  }
}

export { admin, firebaseAdminApp };

export function getAdminInitializationError(): string | null {
  if (initializationError) {
    return initializationError;
  }
  if (!firebaseAdminApp) {
    return "Firebase Admin App (firebaseAdminApp) tanımsız. Başlatma muhtemelen sessizce başarısız oldu veya denenmedi.";
  }
  if (!(typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null)) {
    return "Firebase Admin App'in INTERNAL nesnesi tanımsız. SDK tam olarak işlevsel olmayabilir (kimlik bilgileri veya kurulum sorunu).";
  }
  return null;
}
