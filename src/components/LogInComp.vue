<template>
  <div class="w-75 m-auto">
    <div class="mt-3">
      <h2 class="mb-3 pb-3 border-light-subtle border-bottom">Connexion</h2>
      <form @submit.prevent="login" novalidate>
        <div v-if="errorMessage" class="mb-3 alert alert-danger">
          {{ errorMessage }}
        </div>
        <div class="mb-3">
          <label class="form-label" for="email">Email:</label>
          <input :class="{ 'form-control': true, 'is-invalid': errorMessage }" type="text" v-model="email" />
        </div>
        <div class="mb-3">
          <label class="form-label" for="password">Mot de passe:</label>
          <input class="form-control" type="password" v-model="password" />
        </div>

        <button type="submit" class="btn btn-success my-3">Se connecter</button>
      </form>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: ""
    };
  },
  methods: {
    login() {
      fetch("https://api-garenoticket-604fa7d27199.herokuapp.com/auth/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      })
        .then(response => {
          if (response.ok) {
            return response.json()
          } else {
            throw new Error("Adresse e-mail ou mot de passe incorrect.")
          }
        })
        .then(data => {
          localStorage.setItem('jwt', data.token)
          this.$router.push('/')
        })
        .catch(error => {
          this.errorMessage = error.message
        })
    }
  }
}
</script>

<style></style>
