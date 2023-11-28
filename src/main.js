import './assets/main.css'

import { createApp } from 'vue';
import App from './App.vue';
import AuthenticatedApp from './AuthenticatedApp.vue';
import { isAuthenticated } from './authenticated';
import router from './router';
import "bootstrap/dist/css/bootstrap.min.css";

const app = createApp(isAuthenticated.value ? AuthenticatedApp : App);
app.use(router);
app.mount('#app');