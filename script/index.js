const trilho = document.getElementById("trilhoCarrossel");
const carrossel = document.getElementById("carrossel");
const indicadores = Array.from(document.querySelectorAll("#indicadoresCarrossel button"));
const anterior = document.getElementById("slideAnterior");
const proximo = document.getElementById("slideProximo");
const cardsOriginais = Array.from(trilho.querySelectorAll(".card-carrossel"));
const quantidade = cardsOriginais.length;
const clonesInicio = cardsOriginais.map(card => card.cloneNode(true));
const clonesFim = cardsOriginais.map(card => card.cloneNode(true));
let cardsCarrossel;
let slideAtual = quantidade;
let temporizadorCarrossel;
let pausaCarrossel = false;
let animando = false;

clonesInicio.forEach(card => {
    card.dataset.clone = "inicio";
    trilho.appendChild(card);
});
clonesFim.reverse().forEach(card => {
    card.dataset.clone = "fim";
    trilho.insertBefore(card, trilho.firstChild);
});

cardsCarrossel = Array.from(trilho.querySelectorAll(".card-carrossel"));

function atualizarDestaque() {
    cardsCarrossel.forEach((card, indice) => {
        const ativo = indice === slideAtual;
        card.classList.toggle("ativo", ativo);
        if (ativo) card.setAttribute("aria-current", "true");
        else card.removeAttribute("aria-current");
    });
    const indiceOriginal = (slideAtual - quantidade + quantidade) % quantidade;
    indicadores.forEach((botao, indice) => {
        if (indice === indiceOriginal) botao.setAttribute("aria-current", "true");
        else botao.removeAttribute("aria-current");
    });
}

function posicionarSlide(animar = true) {
    const card = cardsCarrossel[slideAtual];
    if (!card) return;
    trilho.style.transition = animar ? "transform .7s cubic-bezier(.22,.7,.25,1)" : "none";
    const centroCarrossel = carrossel.clientWidth / 2;
    const centroCard = card.offsetLeft + card.offsetWidth / 2;
    trilho.style.transform = `translateX(${centroCarrossel - centroCard}px)`;
    atualizarDestaque();
}

function mostrarSlide(indice) {
    if (animando) return;
    slideAtual = indice;
    animando = true;
    posicionarSlide(true);
}

trilho.addEventListener("transitionend", evento => {
    if (evento.propertyName !== "transform") return;
    if (slideAtual >= quantidade * 2) {
        slideAtual -= quantidade;
        posicionarSlide(false);
    } else if (slideAtual < quantidade) {
        slideAtual += quantidade;
        posicionarSlide(false);
    }
    animando = false;
});

function iniciarCarrossel() {
    clearInterval(temporizadorCarrossel);
    temporizadorCarrossel = setInterval(() => {
        if (!pausaCarrossel && !animando) mostrarSlide(slideAtual + 1);
    }, 5000);
}

anterior.addEventListener("click", () => {
    if (!animando) mostrarSlide(slideAtual - 1);
    iniciarCarrossel();
});

proximo.addEventListener("click", () => {
    if (!animando) mostrarSlide(slideAtual + 1);
    iniciarCarrossel();
});

indicadores.forEach((botao, indice) => botao.addEventListener("click", () => {
    if (!animando) {
        const indiceAtual = (slideAtual - quantidade + quantidade) % quantidade;
        let deslocamento = indice - indiceAtual;
        if (deslocamento > quantidade / 2) deslocamento -= quantidade;
        if (deslocamento < -quantidade / 2) deslocamento += quantidade;
        mostrarSlide(slideAtual + deslocamento);
    }
    iniciarCarrossel();
}));

carrossel.addEventListener("mouseenter", () => pausaCarrossel = true);
carrossel.addEventListener("mouseleave", () => pausaCarrossel = false);
carrossel.addEventListener("focusin", () => pausaCarrossel = true);
carrossel.addEventListener("focusout", () => pausaCarrossel = false);
window.addEventListener("resize", () => posicionarSlide(false));

slideAtual = quantidade;
posicionarSlide(false);
iniciarCarrossel();
