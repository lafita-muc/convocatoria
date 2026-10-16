// ============================================================
// CONFIGURACIÓN DE FIREBASE
// ============================================================
// Recomendado: un proyecto de Firebase PROPIO para la convocatoria
// (separado del de Tickets, para que las reglas de uno no pisen las del otro).
//
// 1. https://console.firebase.google.com/ → "Agregar proyecto"
//    (p. ej. "lafita-nuevas-miradas"; el plan gratuito "Spark" basta).
// 2. Configuración del proyecto (rueda dentada) > General > Tus apps > </> (Web).
//    Registra una app y copia aquí abajo los valores de "firebaseConfig".
// 3. Menú lateral:
//      - Firestore Database > Crear base de datos (modo producción, región europe-west3)
//      - Authentication > Sign-in method > habilita "Correo/contraseña"
//        y crea un usuario para cada persona del comité de selección.
// 4. Firestore > Reglas: pega el contenido de firestore.rules y publica.
//
// Mientras apiKey esté vacío, el formulario se puede probar pero no guarda nada.
// ============================================================

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const FIREBASE_LISTO = !!firebaseConfig.apiKey;
let db = null;
let auth = null;

if (FIREBASE_LISTO && typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  if (typeof firebase.auth === 'function') auth = firebase.auth();
}
