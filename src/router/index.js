import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Accueil.vue'),
  },
  {
    path: '/profil',
    name: 'profil',
    component: () => import('../views/Profil.vue'),
  },
  {
    path: '/transaction',
    name: 'transaction',
    component: () => import('../views/Transaction.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LogIn.vue')
  },
  {
    path: '/sign',
    name: 'sign',
    component: () => import('../views/SignUp.vue')
  },
  {
    path: '/moveCar/:idUser',
    name: 'moveCar',
    component: () => import('../views/MoveCar.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('jwt');
  if (!isAuthenticated && to.name == 'home') {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;
