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
                    <a href="#" @click="saveCarPosition" class="btn btn-light shadow-sm mx-2"
                        :class="{ 'disabled': isParked }">JE LAISSE MA VOITURE</a>
                    <a href="#" @click="recoverCar" class="btn btn-light shadow-sm mx-2"
                        :class="{ 'disabled': !isParked }">J'AI RÉCUPÉRÉ MA VOITURE</a>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
import { jwtDecode } from 'jwt-decode';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default {
    data() {
        return {
            loading: true,
            hasCar: false,
            isParked: false,
            carPosition: { latitude: 0, longitude: 0 },
            hasNoPosition: true,
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
            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/user?userId=${jwtDecode(localStorage.getItem('jwt')).id}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.hasCar = data.user.data.voiture ? true : false;
                    this.isParked = data.user.data.voiture.isParked;
                    this.carPosition.latitude = data.user.data.voiture?.latitude || 0;
                    this.carPosition.longitude = data.user.data.voiture?.longitude || 0;
                    this.hasNoPosition = this.carPosition.latitude === 0 && this.carPosition.longitude === 0;
                    console.log("isParked: ", this.isParked)
                    console.log("lat: ", this.carPosition.latitude)
                    console.log("long: ", this.carPosition.longitude)
                })
                .catch(error => console.error("Erreur lors la récupération des données de l'utilisateur: ", error));
        },
        initializeMap(latitude, longitude) {
            const mapContainer = document.getElementById('map')

            if (!mapContainer) {
                console.error('Map container not found.');
                return;
            }

            if (this.map) {
                this.map.remove();
            }

            this.map = L.map(mapContainer, { zoomControl: true }).setView([latitude, longitude], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            if (this.hasCar && !this.hasNoPosition) {
                this.showCarPosition();
            } else {
                this.showCurrentPosition();
            }
        },
        showCurrentPosition() {
            this.carMarker = L.marker([this.map.getCenter().lat, this.map.getCenter().lng], { draggable: !this.isParked })
                .addTo(this.map)
                .bindPopup('Ma voiture')
                .openPopup();

            this.carMarker.on('dragend', this.onMarkerDragEnd);
        },
        showCarPosition() {
            this.map.flyTo([this.carPosition.latitude, this.carPosition.longitude], this.map.getZoom());
            this.showCarMarker();
        },
        showCarMarker() {
            this.carMarker = L.marker([this.carPosition.latitude, this.carPosition.longitude], { draggable: !this.isParked })
                .addTo(this.map)
                .bindPopup('Ma voiture')
                .openPopup();

            this.carMarker.on('dragend', this.onMarkerDragEnd);
        },
        onMarkerDragEnd(e) {
            if (!this.isParked) {
                this.carPosition.latitude = e.target.getLatLng().lat;
                this.carPosition.longitude = e.target.getLatLng().lng;
                console.log(this.carPosition.latitude);
                console.log(this.carPosition.longitude);

                this.carMarker.setPopupContent('Nouvelle position');
            }
        },
        saveCarPosition() {
            const userId = jwtDecode(localStorage.getItem('jwt')).id;
            const carId = userId;
            const isParked = !this.isParked;

            if (this.carMarker) {
                this.carMarker.dragging.disable();
            }

            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/car/${carId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    latitude: this.carPosition.latitude,
                    longitude: this.carPosition.longitude,
                    isParked: isParked,
                })
            })
                .then(response => response.json())
                .then(data => {
                    this.isParked = data.voiture.isParked;
                    console.log(data)
                })
                .catch(error => console.error('Erreur lors de la sauvegarde de la position de la voiture : ', error));
        },
        recoverCar() {
            const userId = jwtDecode(localStorage.getItem('jwt')).id;
            const carId = userId;
            const isParked = !this.isParked;

            if (this.carMarker) {
                this.carMarker.dragging.enable();
            }   

            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/car/${carId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isParked: isParked,
                    latitude: null,
                    longitude: null,
                })
            })
                .then(response => response.json())
                .then(data => {
                    this.isParked = data.voiture.isParked;
                    this.carPosition.latitude = data.voiture.latitude
                    this.carPosition.longitude = data.voiture.longitude
                    this.hasNoPosition = true
                    console.log(data)
                })
                .catch(error => console.error('Erreur lors de la sauvegarde de la position de la voiture : ', error));
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
  