<template>
    <div v-if="notification" class="mt-2">
        <div class="alert alert-primary d-flex align-items-center" role="alert" style="height: 25px;">
            <svg class="bi flex-shrink-0 me-2" role="img" aria-label="Info:" style="width: 15px;">
                <use xlink:href="#info-fill" />
            </svg>
            <div>
                {{ notification }}
            </div>
        </div>
    </div>
    <div class="my-5 m-auto shadow">
        <div class="card">
            <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex  align-items-center">
                        <div class="text-body-secondary me-3">
                            Total à payer:
                        </div>
                        <div>
                            <div class="badge rounded-pill text-bg-success">
                                {{ montantPayer }}
                            </div>
                        </div>
                    </div>
                    <div>
                        <button @click="createFacture" class="btn btn-success">PAYER MAINTENANT</button>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <h1 class="card-title">Historique des factures</h1>
                <div>
                    <div v-if="factures.length === 0">
                        <p class="badge bg-dark-subtle">Votre historique est vide</p>
                    </div>
                    <div v-else>
                        <table class="table table-hover m-auto shadow-sm" style="width:95%;">
                            <thead class="table-light">
                                <tr>
                                    <th class="col-9">Date</th>
                                    <th class="col-3">Montant</th>
                                </tr>
                            </thead>
                            <tbody class="overflow-auto">
                                <tr v-for="(facture) in factures">
                                    <td>{{ LocalString(facture.createdAt) }}</td>
                                    <td>{{ facture.price }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="my-5 m-auto shadow">
        <div class="card">
            <div class="card-header">
                Historique des déplacements
            </div>
            <div class="card-body">
                <div v-if="historique.length === 0">
                    <p class="badge bg-dark-subtle">Votre historique est vide</p>
                </div>
                <div v-else>
                    <table class="table table-hover m-auto shadow-sm" style="width: 95%;">
                        <thead class="table-light">
                            <tr>
                                <td class="col-8">Date</td>
                                <td class="col-2">Prix</td>
                                <td class="col-2">Payé</td>
                            </tr>
                        </thead>
                        <tbody class="overflow-auto">
                            <tr v-for="(histo) in historique">
                                <td>{{ LocalString(histo.createdAt) }}</td>
                                <td>{{ histo.price }}</td>
                                <td>{{ histo.isPaid ? 'Oui' : 'Non' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" class="d-none">
        <symbol id="info-fill" viewBox="0 0 16 16">
            <path
                d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
        </symbol>
    </svg>
</template>
<script>
export default {
    data() {
        return {
            factures: [],
            historique: [],
            montantPayer: 0.0,
            notification: "",
        }
    },
    mounted() {
        this.fetchFactures(),
            this.fetchHistoriqueDeplacements()
    },
    methods: {
        fetchFactures() {
            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/facture`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                },
            })
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw new Error("Erreur lors de la récupération de l'historique des factures.")
                    }
                })
                .then(data => {
                    this.factures = data
                })
                .catch(error => console.error(error))
        },
        fetchHistoriqueDeplacements() {
            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/historique`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                },
            })
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw new Error("Erreur lors de la récupération de l'historique des déplacements.")
                    }
                })
                .then(data => {
                    this.historique = data
                    let total = 0.0
                    for (const d of this.historique) {
                        if (!d.isPaid) {
                            total += d.price
                        }
                    }
                    this.montantPayer = total
                })
                .catch(error => console.error(error))
        },
        createFacture() {
            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/effectuerPaiement`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                },
            })
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw new Error("Erreur lors du paiement.")
                    }
                })
                .then(data => {
                    this.notification = data.message
                    this.fetchFactures()
                    this.fetchHistoriqueDeplacements()
                })
                .catch(error => console.error(error))
        },
        LocalString(date) {
            const dateObj = new Date(date);
            return dateObj.toLocaleString();
        }
    }
}

</script>