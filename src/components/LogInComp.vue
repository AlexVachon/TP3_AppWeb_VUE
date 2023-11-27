<template>
    <div class="w-75 m-auto">
        <div class="mt-3">
            <h2 class="mb-3 pb-3 border-light-subtle border-bottom">Connexion</h2>
            <form @submit.prevent="login">
                <div class="mb-3">
                    <label class="form-label" for="email">Email:</label>
                    <input class="form-control" type="text" v-model="email" required />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="password">Mot de passe:</label>
                    <input class="form-control" type="password" v-model="password" required />
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
    };
  },
  methods: {
    login() {
      // Logique de connexion ici
      console.log("Email:", this.email);
      console.log("Password:", this.password);
    },
  },
};
</script>

<style>

</style>
