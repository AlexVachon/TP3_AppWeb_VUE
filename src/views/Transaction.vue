<template>
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
                                11
                            </div>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-success">PAYER MAINTENANT</button>
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
                                    <td>{{ facture.createdAt }}</td>
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
                            <tr v-for="(facture) in historique">
                                <td>{{ facture.createdAt }}</td>
                                <td>{{ facture.price }}</td>
                                <td>{{ facture.isPaid }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            factures: [],
            historique: []
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
                    console.log(data)
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
                    console.log(data)
                    this.historique = data
                })
                .catch(error => console.error(error))
        }
    }
}

</script>