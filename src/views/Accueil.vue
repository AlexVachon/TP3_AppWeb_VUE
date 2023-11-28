<template>
    <div>
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
                    <a href="#" @click="toggleCarPosition" class="btn btn-light shadow-sm mx-2">JE LAISSE MA VOITURE</a>
                    <a href="#" class="btn btn-light shadow-sm mx-2 disabled">J'AI RÉCUPÉRÉ MA VOITURE</a>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default {
    data() {
        return {
            loading: true,
            hasCar: false,
            carPosition: { latitude: 0, longitude: 0 },
            map: null,
            carMarker: null,
        };
    },
    mounted() {
        this.checkCarStatus();

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    this.initializeMap(latitude, longitude);
                    this.loading = false;
                },
                (error) => {
                    console.error(`Erreur de géolocalisation: ${error.message}`);
                    this.loading = false;
                }
            );
        } else {
            console.error("La géolocalisation n'est pas prise en charge par votre navigateur.");
            this.loading = false;
        }
    },
    methods: {
        checkCarStatus() {
            // Faites une requête à votre API pour vérifier si l'utilisateur a une voiture enregistrée
            // Mettez à jour this.hasCar et this.carPosition en conséquence
        },
        initializeMap(latitude, longitude) {
            this.map = L.map('map').setView([latitude, longitude], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            if (this.hasCar) {
                // Afficher la position de la voiture s'il y en a une
                this.showCarPosition();
            } else {
                // Afficher la position actuelle de l'utilisateur
                this.showCurrentPosition();
            }
        },
        showCurrentPosition() {
            L.marker([this.map.getCenter().lat, this.map.getCenter().lng])
                .addTo(this.map)
                .bindPopup('Votre position actuelle.')
                .openPopup();
        },
        showCarPosition() {
            this.carMarker = L.marker([this.carPosition.latitude, this.carPosition.longitude])
                .addTo(this.map)
                .bindPopup('Position de votre voiture.')
                .openPopup();
        },
        toggleCarPosition() {
            // Afficher ou masquer la position de la voiture en fonction de l'état actuel
            if (this.carMarker) {
                this.map.removeLayer(this.carMarker);
                this.carMarker = null;
            } else {
                this.showCarPosition();
            }

            // Sauvegarder la nouvelle position de la voiture via votre API
            // Assurez-vous de mettre à jour this.carPosition avec la nouvelle position
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
</style>
  