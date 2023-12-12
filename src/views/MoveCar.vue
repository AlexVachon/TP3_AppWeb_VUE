<template>
    <div class="card m-auto mt-5" style="max-width: 900px;">
        <div v-if="loading" class="loading-overlay">
            <div class="loading-content">
                <img src="/loading-gif.gif" style="width: 20px;" alt="Loading GIF">
                <p>Chargement en cours...</p>
            </div>
        </div>
        <div id="map" style="height: 400px;"></div>
        <div class="card-body border-top bg-light-subtle shadow">
            <div class="d-flex justify-content-center">
                <a href="#" @click="movingCar()" class="btn btn-light shadow-sm mx-2"
                    :class="{ 'disabled': isParked }">JE DÉPLACE LA VOITURE</a>
                <a href="#" @click="parkingCar()" class="btn btn-light shadow-sm mx-2"
                    :class="{ 'disabled': !isParked }">VALIDATION DU STATIONNEMENT</a>
            </div>
        </div>
    </div>
</template>

<script>
import { jwtDecode } from 'jwt-decode';
import L from 'leaflet';

export default {
    data() {
        return {
            isParked: true,
            loading: true,
            user: null,
            valetPosition: {
                latitude: null,
                longitude: null
            }
        }
    },
    mounted() {
        this.getUserInfo()
    },
    methods: {
        initializeMap(carLatitude, carLongitude) {


            const redIcon = new L.Icon({
                iconUrl: '/icons/red-icon.png',
                iconSize: [25, 35],
            });

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.valetPosition.latitude = position.coords.latitude;
                    this.valetPosition.longitude = position.coords.longitude;

                    const valetMarker = L.marker([this.valetPosition.latitude, this.valetPosition.longitude], { icon: redIcon })
                    const carMarker = L.marker([carLatitude, carLongitude])

                    const map = L.map('map').setView([carLatitude, carLongitude], 13);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors',
                    }).addTo(map);

                    valetMarker.addTo(map)
                    carMarker.addTo(map)
                    this.loading = false
                },
                (error) => {
                    console.error(`Erreur de géolocalisation: ${error.message}`);
                }
            );
        },
        getUserInfo() {
            const idUser = this.$route.params.idUser;
            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/user?userId=${idUser}`, {
                method: 'GET',
                headers: {
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
                    this.user = data.user.data
                    this.initializeMap(this.user.voiture.latitude, this.user.voiture.longitude)
                })
                .catch(error => console.error('Erreur lors de la récupération des informations de l\'utilisateur', error));
        },
        movingCar(){
            this.isParked = false
        },
        parkingCar(){
            this.isParked = true
        }
    },
};
</script>

<style scoped>
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}

.loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
</style>
