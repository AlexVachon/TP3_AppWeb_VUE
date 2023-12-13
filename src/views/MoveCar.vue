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
            <div v-if="notification">
                <div class="alert alert-primary d-flex align-items-center" role="alert" style="height: 25px;">
                    <svg class="bi flex-shrink-0 me-2" role="img" aria-label="Info:" style="width: 15px;">
                        <use xlink:href="#info-fill" />
                    </svg>
                    <div>
                        {{ notification }}
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-center align-items-center">
                <a href="#" @click="movingCar" class="btn btn-light shadow-sm mx-2" :class="{ 'disabled': !isParked }">JE
                    DÉPLACE LA VOITURE</a>
                <a href="#" @click="parkingCar" class="btn btn-light shadow-sm mx-2"
                    :class="{ 'disabled': isParked }">VALIDATION DU STATIONNEMENT</a>

                <img v-if="!isMoving" @click="zoomToCar" src="/icons/zoomTo.png" class="icon mx-2" alt="Moving To Car">
                <img v-else @click="zoomToValet" src="/icons/zoomTo.png" class="icon mx-2" alt="Moving To Valet">
            </div>
            <div v-if="isMoving">
                <p class="text text-center fw-lighter my-2">Vérifier la position de la voiture ou déplacer le marqueur rouge
                    pour le corriger puis valider le stationnement</p>
            </div>
        </div>

        <svg xmlns="http://www.w3.org/2000/svg" class="d-none">
            <symbol id="info-fill" viewBox="0 0 16 16">
                <path
                    d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </symbol>
        </svg>
    </div>
</template>

<script>
import { jwtDecode } from 'jwt-decode';
import L from 'leaflet';

export default {
    data() {
        return {
            isParked: true,
            isMoving: false,
            loading: true,
            user: null,
            valetPosition: {
                latitude: null,
                longitude: null
            },
            carMarker: null,
            valetMarker: null,
            map: null,
            notification: "",
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
                iconAnchor: [13.98, 40],
            });

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.valetPosition.latitude = position.coords.latitude;
                    this.valetPosition.longitude = position.coords.longitude;

                    this.valetMarker = L.marker([this.valetPosition.latitude, this.valetPosition.longitude], {
                        icon: redIcon,
                        draggable: true
                    });
                    this.carMarker = L.marker([carLatitude, carLongitude])

                    this.map = L.map('map').setView([carLatitude, carLongitude], 13);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors',
                    }).addTo(this.map);

                    this.valetMarker.addTo(this.map)
                    this.carMarker.addTo(this.map)
                    this.loading = false
                },
                (error) => {
                    console.error(`Erreur de géolocalisation: ${error.message}`);
                }
            );
        },
        getUserInfo() {
            const idUser = this.$route.params.idUser;
            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/user/`, {
                method: 'GET',
                headers: {
                    'Authorization': idUser,
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
        movingCar() {
            this.isParked = false
            this.isMoving = true

            if (this.carMarker) {
                this.map.removeLayer(this.carMarker);
                this.carMarker = null;
            }
            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/car/${this.user._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isMoving: true,
                })
            })
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    this.notification = "Voiture en mouvement..."
                })
                .catch(error => console.error('Erreur lors de la récupération des informations de l\'utilisateur', error))
        },
        parkingCar() {
            this.isParked = true;
            this.isMoving = false;

            const valetLatLng = this.valetMarker.getLatLng(); // Obtenez les coordonnées du valet
            this.carMarker = L.marker([valetLatLng.lat, valetLatLng.lng]).addTo(this.map);
            console.log(this.timeToLeave())

            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/car/${this.user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isMoving: false,
                    latitude: valetLatLng.lat,
                    longitude: valetLatLng.lng,
                    timeToLeave: this.timeToLeave(),
                    valet: jwtDecode(localStorage.getItem("jwt")).id
                })
            })
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    this.notification = "Voiture stationnée..."
                })
                .catch(error => console.error('Erreur lors de la récupération des informations de l\'utilisateur', error))
        },
        zoomToCar() {
            if (this.carMarker) {
                this.map.flyTo([this.carMarker.getLatLng().lat, this.carMarker.getLatLng().lng], 13);
            }
        },
        zoomToValet() {
            if (this.valetMarker) {
                this.map.flyTo([this.valetMarker.getLatLng().lat, this.valetMarker.getLatLng().lng], 13);
            }
        },
        timeToLeave() {
            const now = Date.now();

            const max = 60 * 60 * 1000;

            if (now >= new Date().setHours(11, 0, 0, 0) && now <= new Date().setHours(12, 30, 0, 0)) {
                return new Date().setHours(14, 30, 0, 0)
            }

            if (now >= new Date().setHours(16, 0, 0, 0)) {
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.setHours(10, 0, 0, 0);
            }

            if (now <= new Date().setHours(9, 0, 0, 0)) {
                return new Date().setHours(11, 0, 0, 0)
            }
            return new Date(now + max);
        },
        createHistoriqueDeplacement(){

            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/'/historique/create/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isMoving: true,
                    userId: this.user._id
                })
            })
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    this.notification = "Voiture en mouvement..."
                })
                .catch(error => console.error('Erreur lors de la récupération des informations de l\'utilisateur', error))
        },
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

.icon {
    height: 4%;
}

.icon:hover {
    opacity: 0.7;
}

.text {
    font-size: smaller;
}</style>
