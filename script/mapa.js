//mapa começando em Sp, feito com base no guia do site leaflet : https://leafletjs.com/examples/quick-start/
const mapa = L.map('mapa').setView([-23.5505, -46.6333], 13);
const marcadores = L.layerGroup().addTo(mapa);

//adiciona o openstreetmap q mostra os dados do mapa, rua e etc
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(mapa);

const buscar = document.getElementById('buscar');
const btnBuscar = document.getElementById('btnBuscar');

btnBuscar.addEventListener('click', buscarLocal);


async function buscarLocal() {

    const local = buscar.value.trim();

    if (local === '') {
        alert('Nada foi digitado, digite um local para buscar');
        return;
    }

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&countrycodes=br&q=${encodeURIComponent(local)}`; // integraçao da api nominatim que busca localizações

        const resposta = await fetch(url); 
        if (!resposta.ok) {
            throw new Error('Erro ao buscar a local');
        }

        const dados = await resposta.json(); //armazena a resposta que vem em formato json
        const resultadoSp = dados.find(lugar => lugar.address?.state === 'São Paulo'); //verifica se o estado é São Paulo

        if (!resultadoSp) {
            alert('Localização não encontrada, tente outro local');
            return;
        }

        const latitude = Number(resultadoSp.lat);
        const longitude = Number(resultadoSp.lon);
        mapa.setView([latitude, longitude], 16);

  
        await buscarUbs(latitude, longitude);

    } catch (erro) {
        console.error(erro);
        alert('erro ao buscar a localização');
    }
}

// Função para buscar as Ubs


async function buscarUbs(latitude, longitude) {

    const resposta = await fetch('dados/ubs.json'); 
    if (!resposta.ok) {
        throw new Error('Erro ao carregar as UBS');
    }

    const unidades = await resposta.json(); 

    marcadores.clearLayers();

    const proximas = unidades.filter(ubs =>
        mapa.distance([latitude, longitude], [ubs.lat, ubs.lon]) <= 2000
    );

    const listaUbs = document.getElementById('listaUbs');
    listaUbs.replaceChildren(); // Limpa oq já tem antes de colocar novos cards

    proximas.forEach(ubs => {
        L.marker([ubs.lat, ubs.lon])
            .addTo(marcadores)
            .bindPopup(ubs.nome);
            
        const cards = document.createElement('a'); // cards vao ser elementos do tipo link
        cards.className = 'cards';
        cards.textContent = ubs.nome;
        listaUbs.appendChild(cards); // aplica no html

        cards.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ubs.nome + ', São Paulo, Brasil')}`;
        cards.target = '_blank'; 
    });



    if (proximas.length === 0) {
        alert('Nenhuma UBS cadastrada encontrada em até 3 km.');
    }
}


