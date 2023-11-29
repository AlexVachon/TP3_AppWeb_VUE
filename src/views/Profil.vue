<template>
    <div>
        <div class="card shadow m-auto my-5" style="max-width: 50%; min-width: 350px;">
            <div class="card-body">
                <form @submit.prevent="updateProfile">
                    <section>
                        <h2>Informations personnelles</h2>
                        <div v-if="userValidationMessage" class="alert alert-info w-75" role="alert">
                            {{ userValidationMessage }}
                        </div>
                        <div class="mb-3">
                            <label for="name" class="form-label">Nom</label>
                            <input type="text" class="form-control" v-model="userInfo.name" id="name"
                                :class="{ 'is-invalid': !validateName() }" />
                            <div v-if="!validateName()" class="invalid-feedback">Le nom doit contenir de 3 à 50 caractères
                                alphanumériques</div>
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" v-model="userInfo.email" id="email"
                                :class="{ 'is-invalid': !validateEmail() }" />
                            <div v-if="!validateEmail()" class="invalid-feedback">Adresse courriel invalide</div>
                        </div>
                    </section>

                    <section class="card">
                        <div class="card-body">
                            <h2>Voiture</h2>
                            <div v-if="carValidationMessage" class="alert alert-info w-75" role="alert">
                                {{ carValidationMessage }}
                            </div>
                            <div class="mb-3">
                                <label for="licensePlate" class="form-label">Immatriculation</label>
                                <input type="text" class="form-control" v-model="carInfo.licensePlate" id="licensePlate"
                                    :class="{ 'is-invalid': carInfo.licensePlate && !validateLicensePlate() }" />
                                <div v-if="carInfo.licensePlate && !validateLicensePlate()" class="invalid-feedback">
                                    Doit contenir 6 caractères
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="brand" class="form-label">Marque</label>
                                <input type="text" class="form-control" v-model="carInfo.brand" id="brand"
                                    :class="{ 'is-invalid': carInfo.brand && !validateBrand() }" />
                                <div v-if="carInfo.brand && !validateBrand()" class="invalid-feedback">
                                    La marque doit contenir entre 1 et 50 caractères
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="model" class="form-label">Modèle</label>
                                <input type="text" class="form-control" v-model="carInfo.model" id="model"
                                    :class="{ 'is-invalid': carInfo.model && !validateModel() }" />
                                <div v-if="carInfo.model && !validateModel()" class="invalid-feedback">
                                    Le modèle doit contenir entre 1 et 50 caractères
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="color" class="form-label">Couleur</label>
                                <input type="text" class="form-control" v-model="carInfo.color" id="color"
                                    :class="{ 'is-invalid': carInfo.color && !validateColor() }" />
                                <div v-if="carInfo.color && !validateColor()" class="invalid-feedback">
                                    La couleur doit contenir entre 3 et 50 caractères
                                </div>
                            </div>
                        </div>
                    </section>
                    <button type="submit" class="btn btn-success shadow-sm mt-3">Mettre à jour le profil</button>
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
            userInfo: {
                name: '',
                email: '',
            },
            carInfo: {
                licensePlate: '',
                brand: '',
                model: '',
                color: '',
            },
            userValidationMessage: '',
            carValidationMessage: '',
        };
    },
    mounted() {
        fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/user?userId=${jwtDecode(localStorage.getItem('jwt')).id}`, {
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
                this.userInfo.name = data.user.data.username;
                this.userInfo.email = data.user.data.email;
                if (data.user.data.voiture) {
                    this.carInfo.licensePlate = data.user.voiture.plaque;
                    this.carInfo.model = data.user.voiture.modele;
                    this.carInfo.color = data.user.voiture.couleur;
                    this.carInfo.brand = data.user.voiture.marque;
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
        updateProfile() {
            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/user/${jwtDecode(localStorage.getItem('jwt')).id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.userInfo.email,
                    username: this.userInfo.name,
                })
            })
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    this.userValidationMessage = data.message
                })
                .catch(error => console.error('Erreur lors de la mise à jour du profil', error));
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
                    this.carValidationMessage = data.message
                })
                .catch(error => console.error('Erreur lors de la récupération des informations de l\'utilisateur', error))
        },
    },
};
</script>