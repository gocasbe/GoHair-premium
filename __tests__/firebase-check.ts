/**
 * Script de diagnostic Firebase
 * À exécuter dans la console du navigateur sur https://gohair-premium.vercel.app
 */

// Copiez ce code dans la console du navigateur pour tester

async function diagnoseFirebase() {
  console.log('=== Diagnostic Firebase ===');
  
  try {
    // Importer Firebase (déjà chargé dans l'app)
    const { getAuth } = await import('firebase/auth');
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    
    // Tester l'authentification
    console.log('1. Test Auth Firebase...');
    const auth = getAuth();
    console.log('Auth initialisé:', !!auth);
    
    // Tester Firestore
    console.log('2. Test Firestore...');
    const db = getFirestore();
    console.log('Firestore initialisé:', !!db);
    
    // Tester l'écriture dans Firestore
    console.log('3. Test écriture Firestore...');
    try {
      const testDoc = await addDoc(collection(db, 'test'), {
        timestamp: new Date().toISOString(),
        test: true
      });
      console.log('✓ Écriture Firestore réussie:', testDoc.id);
    } catch (error: any) {
      console.error('✗ Erreur écriture Firestore:', error.code, error.message);
    }
    
    console.log('=== Diagnostic terminé ===');
  } catch (error: any) {
    console.error('Erreur de diagnostic:', error);
  }
}

// Exécuter le diagnostic
diagnoseFirebase();
