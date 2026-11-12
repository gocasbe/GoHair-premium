import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export type NotificationPreferences = {
  promos: boolean;
  availability: boolean;
  reminders: boolean;
};

const NOTIFICATIONS_KEY = 'notification_preferences';

/**
 * Service de gestion des notifications locales
 * Gère les préférences utilisateur et l'envoi de notifications pour promos et disponibilités
 */

// Configuration des notifications (pour mobile)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Récupérer les préférences de notifications
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading notification preferences:', error);
  }
  return { promos: true, availability: true, reminders: true };
}

/**
 * Sauvegarder les préférences de notifications
 */
export async function setNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
}

/**
 * Demander la permission pour les notifications (mobile)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Envoyer une notification locale pour une promo
 */
export async function sendPromoNotification(title: string, body: string): Promise<void> {
  const prefs = await getNotificationPreferences();
  if (!prefs.promos) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'promo' },
      },
      trigger: null, // Immédiat
    });
  } catch (error) {
    console.error('Error sending promo notification:', error);
  }
}

/**
 * Envoyer une notification locale pour une disponibilité
 */
export async function sendAvailabilityNotification(salonName: string, stylist: string, time: string): Promise<void> {
  const prefs = await getNotificationPreferences();
  if (!prefs.availability) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Nouvelle disponibilité',
        body: `${stylist} est disponible à ${time} chez ${salonName}`,
        data: { type: 'availability', salonName, stylist, time },
      },
      trigger: null, // Immédiat
    });
  } catch (error) {
    console.error('Error sending availability notification:', error);
  }
}

/**
 * Programmer une notification de rappel pour un rendez-vous
 */
export async function scheduleReminderNotification(bookingId: string, salonName: string, date: string, time: string): Promise<void> {
  const prefs = await getNotificationPreferences();
  if (!prefs.reminders) return;

  try {
    // Pour la démo, notification immédiate (à améliorer avec trigger programmé)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rappel de rendez-vous',
        body: `Rendez-vous le ${date} à ${time} chez ${salonName}`,
        data: { type: 'reminder', bookingId },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error scheduling reminder notification:', error);
  }
}

/**
 * Annuler une notification programmée
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Annuler toutes les notifications programmées
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}
