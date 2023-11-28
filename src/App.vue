<script setup>
import { RouterLink, RouterView } from 'vue-router'
import MessageAccueil from './components/MessageAccueil.vue'
</script>

<template>
  <div class="flex-layout" v-if="!isAuthenticated">
    <div class="grid-layout">
      <header>
        <img class="border-light-subtle border-end border-bottom logo" alt="Vue logo" src="@/assets/logo_parking.svg"
          width="100" height="100" />
        <div class="wrapper">
          <MessageAccueil msg="GareNoTicket" />
          <nav>
            <RouterLink :to="{ name: 'login' }" class="link-success">Connexion</RouterLink>
            <RouterLink :to="{ name: 'sign' }" class="link-success">Créer un compte</RouterLink>
          </nav>
        </div>
      </header>
      <RouterView />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    const isAuthenticated = !!localStorage.getItem('jwt')
    console.log(isAuthenticated)
    return { isAuthenticated }
  }
}
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.flex-layout {
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  place-content: center;
  height: 100vh;
  padding: 0 2rem;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;
    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
