<template>
    <div class="signup">
        <div class="mt-3 w-75 mx-auto">
            <h2 class="mb-3 pb-3 border-light-subtle border-bottom">Création d'un compte</h2>
            <form @submit.prevent="signIn" novalidate>
                <div v-if="errorMessage" class="mb-3 alert alert-danger">
                    {{ errorMessage }}
                </div>
                <div class="mb-3">
                    <label class="form-label" for="email">Email:</label>
                    <input v-model="email" class="form-control" type="text" name="email" id="email"
                        :class="{ 'is-invalid': emailError, 'is-valid': !emailError && email }" />
                    <span v-if="emailError" class="text-danger">{{ emailError }}</span>
                </div>

                <div class="mb-3">
                    <label class="form-label" for="nom">Nom:</label>
                    <input v-model.trim="nom" class="form-control" type="text" id="nom" name="nom"
                        :class="{ 'is-invalid': nomError, 'is-valid': !nomError && nom }" />
                    <span v-if="nomError" class="text-danger">{{ nomError }}</span>
                </div>

                <div class="mb-3">
                    <label class="form-label" for="password">Mot de passe:</label>
                    <input v-model="password" class="form-control" type="password" name="password" id="password"
                        :class="{ 'is-invalid': passwordError, 'is-valid': !passwordError && password && password.length >= 6 }" />
                    <span v-if="passwordError" class="text-danger">{{ passwordError }}</span>
                </div>

                <div class="mb-3">
                    <label class="form-label" for="conf_password">Confirmation mot de passe:</label>
                    <input v-model="confPassword" class="form-control" type="password" name="conf_password"
                        id="conf_password"
                        :class="{ 'is-invalid': confPassword !== password, 'is-valid': confPassword === password && confPassword }" />
                    <span v-if="confPassword !== password" class="text-danger">Les mots de passe ne
                        correspondent pas.</span>
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
            passwordError: '',
            errorMessage: ''
        };
    },
    methods: {
        validateForm() {
            let isValid = true;
            this.nomError = "";
            this.emailError = "";
            this.passwordError = "";

            if (this.email.length > 50) {
                this.emailError = "Votre adresse courriel ne peut dépasser 50 caractères";
                isValid = false;
            } else if (!this.isValidEmail(this.email)) {
                this.emailError = "Veuillez entrer une adresse courriel valide";
                isValid = false;
            }

            if (!this.nom) {
                this.nomError = "Veuillez entrer votre nom";
                isValid = false;
            }

            if (!this.password || this.password.length < 6) {
                this.passwordError = "Veuillez entrer votre mot de passe";
                isValid = false;
            }
            return isValid;
        },
        isValidEmail(email) {
            return /.+@.+\..+/.test(email.trim());
        },
        signIn() {
            if (this.validateForm()) {
                console.log('Email:', this.email);
                console.log('Nom:', this.nom);
                console.log('Mot de passe:', this.password);
                console.log('Confirmation mot de passe:', this.confPassword);

                fetch("https://api-garenoticket-604fa7d27199.herokuapp.com/auth/signup", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.email,
                        username: this.nom,
                        password: this.password,
                        confirmPassword: this.confPassword
                    })
                })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error("Erreur lors de la création du compte.");
                        }
                    })
                    .then(data => {
                        this.$router.push({
                            name: 'login',
                            query: { email: this.email }
                        });
                    })
                    .catch(error => {
                        console.error(error);
                        this.errorMessage = error.message;
                    });
            } else {
                console.log('Validation incorrecte!!!');
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
  