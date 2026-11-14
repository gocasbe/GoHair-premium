# Guide de diagnostic - Problème d'inscription

## Étape 1 : Vérifier Firebase Console

1. Allez sur https://console.firebase.google.com/
2. Sélectionnez le projet "gohair-premium"
3. Vérifiez **Authentication** → **Sign-in method** :
   - "Email/Password" doit être activé ✓
4. Vérifiez **Firestore Database** :
   - La base de données doit exister
   - Si elle n'existe pas, cliquez sur "Créer une base de données"
   - Choisissez "Commencer en mode test"
   - Sélectionnez une localisation (ex: europe-west)

## Étape 2 : Vérifier les règles Firestore

Dans Firebase Console → Firestore Database → **Règles**, assurez-vous que les règles ressemblent à ceci :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Si les règles sont différentes, elles bloquent l'écriture et empêchent la création de comptes.

## Étape 3 : Tester dans la console du navigateur

1. Ouvrez https://gohair-premium.vercel.app
2. Appuyez sur F12 pour ouvrir la console
3. Copiez et collez ce code :

```javascript
// Test de diagnostic Firebase
(async () => {
  console.log('=== Diagnostic Firebase ===');
  
  try {
    // Importer les modules Firebase
    const { initializeApp } = await import('firebase/app');
    const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
    const { getFirestore, setDoc, doc } = await import('firebase/firestore');
    
    // Configuration Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyDbHRPM74YvzYeSRSxdUGpkvZXlrLoiyRQ",
      authDomain: "gohair-premium.firebaseapp.com",
      projectId: "gohair-premium",
      storageBucket: "gohair-premium.firebasestorage.app",
      messagingSenderId: "892768439164",
      appId: "1:892768439164:web:e68049e506a28b376032f9"
    };
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✓ Firebase initialisé');
    
    // Test d'inscription
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'password123';
    
    console.log('Test d\'inscription avec:', testEmail);
    
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✓ Utilisateur créé:', userCredential.user.uid);
    
    // Test d'écriture Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: testEmail,
      role: 'client',
      createdAt: new Date().toISOString()
    });
    console.log('✓ Données utilisateur sauvegardées dans Firestore');
    
    console.log('=== Diagnostic réussi ===');
  } catch (error) {
    console.error('✗ Erreur:', error.code, error.message);
  }
})();
```

## Étape 4 : Solutions courantes

### Erreur "FirebaseError: Missing or insufficient permissions"
→ Les règles Firestore sont trop restrictives. Modifiez-les pour permettre l'écriture.

### Erreur "FirebaseError: permission-denied"
→ Vérifiez que Firestore est activé et que les règles permettent l'écriture.

### Erreur "auth/email-already-in-use"
→ Cet email existe déjà. Utilisez un autre email.

### Erreur "auth/invalid-email"
→ L'email n'est pas au bon format.

### Erreur "auth/weak-password"
→ Le mot de passe doit avoir au moins 6 caractères.

## Étape 5 : Contact

Si le problème persiste après ces vérifications :
1. Notez l'erreur exacte de la console
2. Vérifiez les règles Firestore
3. Contactez le support ou vérifiez la documentation Firebase
