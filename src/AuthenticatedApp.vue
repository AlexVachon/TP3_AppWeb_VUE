<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div>
    <header class="border-bottom shadow-sm">
      <nav class="navbar navbar-expand-lg">
        <div class="container-fluid">
          <a class="navbar-brand" style="margin-right: 50%;" href="/">GareNoTicket</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="navbar-nav">
              <li class="nav-item">
                <RouterLink class="nav-link link-success shadow-sm" :to="{ name: 'home' }">MA PLACE</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link link-success shadow-sm" :to="{ name: 'profil' }">PROFIL</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link link-success shadow-sm" :to="{ name: 'transaction' }">TRANSACTION</RouterLink>
              </li>
              <li class="nav-item">
                <button @click="logout" class="nav-link link-success shadow-sm">DÉCONNEXION</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  </div>
  <div class="container">
    <RouterView />
  </div>
</template>


<script>
export default {
  methods: {
    logout() {
      localStorage.removeItem('jwt')
      location.href = "/login"
    }
  }
}
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
}

.nav-link {
  margin-right: 15px;
  text-decoration: none;
  color: #007bff;
}

.nav-link:hover {
  text-decoration: underline;
  color: #0056b3;
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-link {
    margin-bottom: 10px;
    margin-right: 0;
  }
}
</style>
