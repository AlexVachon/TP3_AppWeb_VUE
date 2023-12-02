<template>
    <div class="my-5 m-auto">
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
                    <table class="table m-auto">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Montant</th>
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
</template>
<script>
export default {
    data() {
        return {
            factures: []
        }
    },
    mounted() {
        this.fetchFactures()
    },
    methods: {
        fetchFactures() {
            console.log(`Bearer ${localStorage.getItem('jwt')}`)
            fetch(`https://api-garenoticket-604fa7d27199.herokuapp.com/historique`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                },
            })
                .then(response => {
                    if(response.ok){
                        return response.json()
                    }else{
                        throw new Error("Erreur lors de la récupération de l'historique des factures.")
                    }
                })
                .then(data => {
                    console.log(data)
                    this.factures = data
                })
                .catch(error=>console.error(error))
        }
    }
}

</script>