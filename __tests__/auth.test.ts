/**
 * Tests manuels pour l'authentification
 * À exécuter manuellement dans la console du navigateur
 */

import { registerWithEmail, signInWithEmail } from '../src/lib/auth';

// Test 1 : Vérifier que l'email est valide
function testEmailValidation(email: string): boolean {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return EMAIL_REGEX.test(email);
}

// Test 2 : Vérifier que le mot de passe a au moins 6 caractères
function testPasswordValidation(password: string): boolean {
  return password.length >= 6;
}

// Tests
console.log('=== Tests de validation ===');
console.log('Email valide (test@test.com):', testEmailValidation('test@test.com'));
console.log('Email invalide (test):', testEmailValidation('test'));
console.log('Mot de passe valide (123456):', testPasswordValidation('123456'));
console.log('Mot de passe invalide (123):', testPasswordValidation('123'));

/**
 * Pour tester l'inscription réelle :
 * 1. Ouvrez la console du navigateur sur https://gohair-premium.vercel.app
 * 2. Copiez-collez ce code :
 * 
 * try {
 *   const user = await registerWithEmail('votre@email.com', 'password123');
 *   console.log('Inscription réussie:', user);
 * } catch (error) {
 *   console.error('Erreur d\'inscription:', error);
 * }
 */
