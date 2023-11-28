<template>
    <div>
        <div class="card shadow m-auto my-5" style="max-width: 50%; min-width: 350px;">
            <div class="card-body">
                <form @submit.prevent="updateProfile">
                    <section>
                        <h2>Informations personnelles</h2>
                        <div class="mb-3">
                            <label for="name" class="form-label">Nom</label>
                            <input type="text" class="form-control" v-model="userInfo.name" id="name" />
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" v-model="userInfo.email" id="email" />
                        </div>
                    </section>

                    <section class="card">
                        <div class="card-body">
                            <h2>Voiture</h2>
                            <div class="mb-3">
                                <label for="licensePlate" class="form-label">Immatriculation</label>
                                <input type="text" class="form-control" v-model="carInfo.licensePlate" id="licensePlate" />
                            </div>
                            <div class="mb-3">
                                <label for="brand" class="form-label">Marque</label>
                                <input type="text" class="form-control" v-model="carInfo.brand" id="brand" />
                            </div>
                            <div class="mb-3">
                                <label for="model" class="form-label">Modèle</label>
                                <input type="text" class="form-control" v-model="carInfo.model" id="model" />
                            </div>
                            <div class="mb-3">
                                <label for="color" class="form-label">Couleur</label>
                                <input type="text" class="form-control" v-model="carInfo.color" id="color" />
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
                this.userInfo.name = data.name;
                this.userInfo.email = data.email;
            })
            .catch(error => console.error('Erreur lors de la récupération des informations de l\'utilisateur', error));
    },
    methods: {
        updateProfile() {
            fetch('https://api-garenoticket-604fa7d27199.herokuapp.com/user/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: jwtDecode(localStorage.getItem('jwt')).id,
                    email: this.userInfo.email,
                    username: this.userInfo.name,
                })
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Profil mis à jour !');
                        // Mettez à jour les données locales si nécessaire
                    } else {
                        throw new Error('Échec de la mise à jour du profil.');
                    }
                })
                .catch(error => console.error('Erreur lors de la mise à jour du profil', error));
        },
    },
};
</script>