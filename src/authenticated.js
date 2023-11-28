// authenticated.js
import { ref } from 'vue';

// Fonction pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = ref(!!localStorage.getItem('jwt'));
