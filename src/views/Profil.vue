<template>
    <div>
        <div class="card shadow m-auto my-5" style="max-width: 50%; min-width: 350px;">
            <div class="card-body">
                <div v-if="isParked" class="alert alert-info">
                    Vous ne pouvez pas modifier votre profil pendant que votre voiture est stationnée
                </div>
                <form @submit.prevent="updateProfile">
                    <section>
                        <div class="d-flex align-items-center justify-content-between">
                            <h2>Informations personnelles</h2>
                            <div v-if="userValidationMessage" class="text-info">
                                {{ userValidationMessage }}
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="name" class="form-label">Nom</label>
                            <input type="text" class="form-control" v-model="userInfo.name" id="name"
                                :class="{ 'is-invalid': !validateName(), 'is-valid': validateName() }" />
                            <div v-if="!validateName()" class="invalid-feedback">Le nom doit contenir de 3 à 50 caractères
                                alphanumériques</div>
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" v-model="userInfo.email" id="email"
                                :class="{ 'is-invalid': !validateEmail(), 'is-valid': validateEmail() }" />
                            <div v-if="!validateEmail()" class="invalid-feedback">Adresse courriel invalide</div>
                        </div>
                        <div v-if="isValet">
                            <label for="price" class="form-label">Tarif</label>
                            <input type="number" id="price" name="price" class="form-control"
                                :class="{ 'is-invalid': !validatePrice(), 'is-valid': validatePrice() }"
                                v-model="userInfo.tarif" min="0" />
                        </div>
                    </section>

                    <section class="card" v-if="!isValet">
                        <div class="card-body">
                            <div class="d-flex align-items-center justify-content-between">
                                <h2>Voiture</h2>
                                <div v-if="carValidationMessage" class="text-info">
                                    {{ carValidationMessage }}
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="licensePlate" class="form-label">Immatriculation</label>
                                <input type="text" class="form-control" v-model="carInfo.licensePlate" id="licensePlate"
                                    :class="{ 'is-invalid': !validateLicensePlate(), 'is-valid': validateLicensePlate() }" />
                                <div v-if="!validateLicensePlate()" class="invalid-feedback">
                                    Doit contenir 6 caractères
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="brand" class="form-label">Marque</label>
                                <input type="text" class="form-control" v-model="carInfo.brand" id="brand"
                                    :class="{ 'is-invalid': !validateBrand(), 'is-valid': validateBrand() }" />
                                <div v-if="!validateBrand()" class="invalid-feedback">
                                    La marque doit contenir entre 1 et 50 caractères
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="model" class="form-label">Modèle</label>
                                <input type="text" class="form-control" v-model="carInfo.model" id="model"
                                    :class="{ 'is-invalid': !validateModel(), 'is-valid': validateModel() }" />
                                <div v-if="!validateModel()" class="invalid-feedback">
                                    Le modèle doit contenir entre 1 et 50 caractères
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="color" class="form-label">Couleur</label>
                                <input type="text" class="form-control" v-model="carInfo.color" id="color"
                                    :class="{ 'is-invalid': !validateColor(), 'is-valid': validateColor() }" />
                                <div v-if="!validateColor()" class="invalid-feedback">
                                    La couleur doit contenir entre 3 et 50 caractères
                                </div>
                            </div>
                        </div>
                    </section>
                    <button type="submit" class="btn btn-success shadow-sm mt-3" :disabled="!isFormValid">Mettre à jour le
                        profil</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>

import { jwtDecode } from 'jwt-decode';

export default {
    data() {
        return {
            isValet: false,
            userInfo: {
                name: '',
                email: '',
                tarif: '',
            },
            carInfo: {
                licensePlate: '',
                brand: '',
                model: '',
                color: '',
            },
            userValidationMessage: '',
            carValidationMessage: '',
            isFormValid: false,
            isParked: false
        };
    },
    mounted() {
        fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/user/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                'Content-Type': 'application/json'
            },
        })
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error("Informations de l'utilisateur introuvables.");
                }
            })
            .then(data => {
                this.isValet = data.user.data.isValet
                this.userInfo.name = data.user.data.username;
                this.userInfo.email = data.user.data.email;
                this.userInfo.tarif = data.user.data.price

                if (!this.isValet) {
                    if (data.user.data.voiture) {
                        this.isParked = data.user.data.voiture.isParked;
                        this.carInfo.licensePlate = data.user.data.voiture.plaque;
                        this.carInfo.model = data.user.data.voiture.modele;
                        this.carInfo.color = data.user.data.voiture.couleur;
                        this.carInfo.brand = data.user.data.voiture.marque;
                    } else {
                        this.carValidationMessage = "Aucune voiture !"
                    }
                }
            })
            .catch(error => console.error('Erreur lors de la récupération des informations de l\'utilisateur', error));

    },
    methods: {
        validateName() {
            return /^[A-Za-z0-9]{3,50}$/.test(this.userInfo.name.trim());
        },
        validateEmail() {
            return /.+@.+\..+/.test(this.userInfo.email.trim());
        },
        validateLicensePlate() {
            return /.{6}/.test(this.carInfo.licensePlate.trim());
        },
        validateBrand() {
            return /^[A-Za-z]{1,50}$/.test(this.carInfo.brand.trim());
        },
        validateModel() {
            return /^[A-Za-z]{1,50}$/.test(this.carInfo.model.trim());
        },
        validateColor() {
            return /^[A-Za-z]{3,50}$/.test(this.carInfo.color.trim());
        },
        validatePrice() {
            if (this.userInfo.tarif < 0)
                return false
            return true
        },
        updateProfile() {
            if (this.isFormValid) {
                fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/user/${jwtDecode(localStorage.getItem('jwt')).id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.userInfo.email,
                        username: this.userInfo.name,
                        price: this.userInfo.tarif
                    })
                })
                    .then(response => {
                        return response.json()
                    })
                    .then(data => {
                        this.userValidationMessage = data.message
                    })
                    .catch(error => console.error('Erreur lors de la mise à jour du profil', error));
                if (!this.isValet) {
                    fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/car/${jwtDecode(localStorage.getItem('jwt')).id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            marque: this.carInfo.marque,
                            modele: this.carInfo.model,
                            couleur: this.carInfo.color,
                            plaque: this.carInfo.licensePlate
                        })
                    })
                        .then(response => {
                            return response.json()
                        })
                        .then(data => {
                            console.log(data.message)
                            this.carValidationMessage = data.message
                        })
                        .catch(error => console.error('Erreur lors de la récupération des informations de l\'utilisateur', error))
                }
            } else {
                console.error("Le formulaire n'est pas valide. Veuillez corriger les champs invalides.");
            }

        },
    },
    watch: {
        userInfo: {
            deep: true,
            handler() {
                this.isFormValid = this.validateName() && this.validateEmail() && this.validatePrice();
            },
        },
        carInfo: {
            deep: true,
            handler() {
                this.isFormValid = this.validateLicensePlate() && this.validateBrand() && this.validateModel() && this.validateColor();
            },
        },
    },
};
</script>