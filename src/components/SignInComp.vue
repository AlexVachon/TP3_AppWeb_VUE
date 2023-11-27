<template>
    <div class="signup">
        <div class="mt-3 w-75 mx-auto">
            <h2 class="mb-3 pb-3 border-light-subtle border-bottom">Création d'un compte</h2>
            <form @submit.prevent="signIn">

                <div class="mb-3">
                    <label class="form-label" for="email">Email:</label>
                    <input v-model="email" class="form-control" type="text" name="email" id="email"  />
                    <span v-if="emailError" class="text-danger">{{ emailError }}</span>
                </div>

                <div class="mb-3">
                    <label class="form-label" for="nom">Nom:</label>
                    <input v-model.trim="nom" class="form-control" type="text" id="nom" name="nom"  />
                    <span v-if="nomError" class="text-danger">{{ nomError }}</span>
                </div>

                <div class="mb-3">
                    <label class="form-label" for="password">Mot de passe:</label>
                    <input v-model="password" class="form-control" type="password" name="password" id="password"  />
                    <span v-if="passwordError" class="error">{{ passwordError }}</span>
                </div>

                <div class="mb-3">
                    <label class="form-label" for="conf_password">Confirmation mot de passe:</label>
                    <input v-model="confPassword" class="form-control" type="password" name="conf_password"
                        id="conf_password"  />
                </div>

                <button type="submit" class="btn btn-success my-3">S'inscrire</button>
            </form>
        </div>
    </div>
</template>
  
<script>
export default {
    data() {
        return {
            email: '',
            nom: '',
            password: '',
            confPassword: '',
            emailError: '',
            nomError: '',
            passwordError: ''
        };
    },
    methods: {
        validateForm() {
            let isValid = true;
            this.nomError = ""
            this.emailError = ""
            this.passwordError = ""
            
            if (!this.email) {
                this.nomError = "Veuillez entrer votre email";
                isValid = false
            }else if (!this.isValidEmail(this.email)){
                this.emailError = "Veuillez entrer une adresse courriel valide";
                isValid = false;
            }

            if (!this.nom) {
                this.nomError = "Veuillez entrer votre nom";
                isValid = false
            }

            if (!this.password) {
                this.nomError = "Veuillez entrer votre mot de passe";
                isValid = false
            }
            return isValid
        },
        isValidEmail(email) {
            return email.includes("@");
        },
        signIn() {
            if (this.validateForm()) {
                console.log('Email:', this.email);
                console.log('Nom:', this.nom);
                console.log('Mot de passe:', this.password);
                console.log('Confirmation mot de passe:', this.confPassword);
            }else{
                console.log('Validation incorrecte!!!')
            }
            
        }
    }
};
</script>
  
<style>
@media (min-width: 1024px) {
    .signup {
        min-height: 100vh;
        display: flex;
        align-items: center;
    }
}
</style>
  