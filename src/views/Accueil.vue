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
                <div v-if="!isValet">
                    <div v-if="isMoving">
                        <div class="alert alert-primary d-flex align-items-center" role="alert" style="height: 25px;">
                            <svg class="bi flex-shrink-0 me-2" role="img" aria-label="Info:" style="width: 15px;">
                                <use xlink:href="#info-fill" />
                            </svg>
                            <div>
                                Votre voiture est en cours de déplacement...
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-center align-items-center">
                        <a href="#" @click="saveCarPosition" class="btn btn-light shadow-sm mx-2"
                            :class="{ 'disabled': isParked }">JE LAISSE MA VOITURE</a>
                        <a href="#" @click="recoverCar" class="btn btn-light shadow-sm mx-2"
                            :class="{ 'disabled': !isParked || isMoving }">J'AI RÉCUPÉRÉ MA VOITURE</a>
                        <img @click="zoomToMarker(this.carPosition)" src="/icons/zoomTo.png" class="icon mx-2"
                            alt="Moving To Car">
                    </div>
                </div>
                <div v-else>
                    <div class="d-flex justify-content-start align-items-center my-2">
                        <img @click="zoomToMarker(this.valetPosition)" class="icon" src="/icons/zoomTo.png" alt="Zoomer">
                        <div class="text-center fw-lighter">Votre position</div>
                    </div>

                    <table class="table table-hover m-auto shadow-sm" style="width: 95%;">
                        <thead class="table-light">
                            <tr>
                                <th>Nom</th>
                                <th>Marque</th>
                                <th>Modèle</th>
                                <th>Plaque</th>
                                <th>Couleur</th>
                                <th>Temps restant</th>
                            </tr>
                        </thead>
                        <tbody class="overflow-auto">
                            <tr v-for="(user) in users" :key="user.id">
                                <td>{{ user.username }}</td>
                                <td>{{ user.voiture.marque }}</td>
                                <td>{{ user.voiture.modele }}</td>
                                <td>{{ user.voiture.plaque }}</td>
                                <td>{{ user.voiture.couleur }}</td>
                                <td>{{ user.voiture.timeRemaining }}</td>
                                <td>
                                    <img @click="zoomToMarker(user.voiture)" class="mx-1 icon" src="/icons/zoomTo.png"
                                        alt="Zoomer">

                                    <img @click="moveCar(user._id)" class="mx-1 icon" src="/icons/moveCar.png"
                                        alt="Move Car">
                                </td>
                            </tr>
                            <div v-if="!users || users.length === 0">
                                <p class="text-center fw-lighter my-2">No data available.</p>
                            </div>
                        </tbody>
                    </table>

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
            isValet: false,
            isMoving: false,
            loading: true,
            hasCar: false,
            isParked: false,
            carPosition: { latitude: 0, longitude: 0 },
            hasNoPosition: true,
            carMarker: null,
            valetPosition: { latitude: 0, longitude: 0 },
            users: [],
        };
    },
    mounted() {
        this.checkIsValet();
        if (this.isValet) {
            this.initializeMapForValet();
            setInterval(this.updateTimeRemaining, 1000);
        }
        else
            this.checkCarStatus();
    },
    methods: {
        checkIsValet() {
            const jwt = localStorage.getItem('jwt');

            if (jwt) {
                const decodedToken = jwtDecode(jwt);

                if (typeof decodedToken === 'object' && decodedToken !== null) {
                    this.isValet = decodedToken.isValet || false;
                } else {
                    console.error('Le token JWT n\'a pas été décodé correctement.');
                }
            } else {
                console.error('Le token JWT est manquant.');
            }
        },
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
                    this.carPosition.latitude = data.user.data.voiture?.latitude
                    this.carPosition.longitude = data.user.data.voiture?.longitude
                    this.hasNoPosition = !this.carPosition.latitude && !this.carPosition.longitude;

                    this.isMoving = data.user.data.voiture.isMoving
                    this.initializeMapForUser();
                })
                .catch(error => console.error("Erreur lors la récupération des données de l'utilisateur: ", error));
        },
        initializeMapForValet() {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.valetPosition = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };

                        this.initializeMap(this.valetPosition.latitude, this.valetPosition.longitude);

                        const redIcon = new L.Icon({
                            iconUrl: '/icons/red-icon.png',
                            iconSize: [25, 35],
                            iconAnchor: [13.98, 40],
                            popupAnchor: [0, -40]
                        });

                        const valetMarker = L.marker([this.valetPosition.latitude, this.valetPosition.longitude], { icon: redIcon })
                            .addTo(this.map)
                            .bindPopup('Vous êtes ici')
                            .openPopup();

                        this.getOtherCarsPositions();
                        this.loading = false;
                    },
                    (error) => {
                        console.error(`Erreur de géolocalisation: ${error.message}`);
                    }
                );
            } else {
                console.error("La géolocalisation n'est pas prise en charge par votre navigateur.");
            }
        },
        getOtherCarsPositions() {
            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/users`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.users = data
                    data.forEach(user => {
                        const carMarker = L.marker([user.voiture.latitude, user.voiture.longitude])
                            .addTo(this.map)
                            .bindPopup(`<b>${user.username}</b><br/>${user.voiture.marque} ${user.voiture.modele}<br/>${user.voiture.plaque}<br/>${user.voiture.couleur}`)
                            .openPopup();


                    });
                })
                .catch(error => console.error("Erreur lors de la récupération des positions des voitures : ", error));
        },
        initializeMapForUser() {
            if (this.hasCar && !this.hasNoPosition) {
                console.log('Initialize map for car position');
                this.initializeMap(this.carPosition.latitude, this.carPosition.longitude);
                this.showCarPosition();
                this.loading = false
            } else {
                console.log('Initialize map using geolocation');
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            this.initializeMap(latitude, longitude);
                            this.showCurrentPosition();
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
            }
        },
        initializeMap(latitude, longitude) {
            const mapContainer = document.getElementById('map');

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

                this.carMarker.setPopupContent('Nouvelle position');
            }
        },
        saveCarPosition() {
            const userId = jwtDecode(localStorage.getItem('jwt')).id;
            const carId = userId;
            const isParked = !this.isParked;
            const timetoleave = this.timeToLeave()

            this.carPosition.latitude = this.carMarker.getLatLng().lat;
            this.carPosition.longitude = this.carMarker.getLatLng().lng;

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
                    timeToLeave: timetoleave
                })
            })
                .then(response => response.json())
                .then(data => {
                    this.isParked = data.voiture.isParked;
                })
                .catch(error => console.error('Erreur lors de la sauvegarde de la position de la voiture : ', error));
        },
        recoverCar() {
            const userId = jwtDecode(localStorage.getItem('jwt')).id;
            const isParked = !this.isParked;

            if (this.carMarker) {
                this.carMarker.dragging.enable();
            }

            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/car/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isParked: isParked,
                    latitude: null,
                    longitude: null,
                    timeToLeave: null
                })
            })
                .then(response => response.json())
                .then(data => {
                    this.isParked = data.voiture.isParked;
                    this.carPosition.latitude = data.voiture.latitude
                    this.carPosition.longitude = data.voiture.longitude
                    this.hasNoPosition = true
                })
                .catch(error => console.error('Erreur lors de la sauvegarde de la position de la voiture : ', error));
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
        calculateTimeRemaining(timeToLeave) {
            const now = Date.now();
            const timeToLeaveTimestamp = new Date(timeToLeave).getTime();
            const timeDifference = timeToLeaveTimestamp - now;

            if (timeDifference <= 0) {
                return 'expiré';
            }

            const secondsRemaining = Math.floor(timeDifference / 1000);

            if (secondsRemaining < 120) {
                return `${secondsRemaining} secondes`;
            }

            const minutesRemaining = Math.floor(secondsRemaining / 60);
            const hoursRemaining = Math.floor(minutesRemaining / 60);

            if (minutesRemaining < 60) {
                return `${minutesRemaining} minutes`;
            }

            const remainingMinutes = minutesRemaining % 60;
            return `${hoursRemaining} heures ${remainingMinutes} minutes`;
        },
        updateTimeRemaining() {
            // Parcourez les utilisateurs et mettez à jour le temps restant pour chacun
            this.users.forEach((user) => {
                user.voiture.timeRemaining = this.calculateTimeRemaining(user.voiture.timeToLeave);
            });
        },
        zoomToMarker(voiture) {
            if (voiture) {
                this.map.flyTo([voiture.latitude, voiture.longitude], this.map.getZoom());
            }
        },
        moveCar(userId) {
            this.$router.push({ name: 'moveCar', params: { idUser: userId } });
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
</style>
  