const link =  "0c3506b8-4813-4d47-91dd-cb04b92f8494";
let mensagens = [];  
let usuario = prompt("Insira um nome para entrar no chat:");
let participantes = [];
let nomeSelecionado = "Todos";
let privacidade = "Público";


function novaArea(){
    let overlay = document.querySelector(".overlay");
    let areaNova = document.querySelector(".area-escolha");
    overlay.classList.add("escuro")
    areaNova.classList.remove("none");

    overlay.addEventListener("click", function(event) {   
        if(!areaNova.contains(event.target)){
            areaNova.classList.add("none");
            overlay.classList.remove("escuro");
        }
    })
}

function buscarMensagens(){
    setInterval (() => {
        const promessa = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages/" + link);
        promessa.then(mensagensRecebidas);
        promessa.catch(tratarErro);
    }, 3000);
};

function mensagensRecebidas(resposta){
    console.log(resposta);
    mensagens = resposta.data;
    renderizarMensagens();
}

function tratarErro(erro){
    console.log(erro);
    alert("Houve um erro ao buscar as mensagens!");
}

function renderizarMensagens(){
    const ul = document.querySelector(".mensagens");
    ul.innerHTML = "";
    
    mensagens.forEach( mensagem => {
        const li = document.createElement('li');

        if(mensagem.type === "status") {
                li.classList.add("status");
                li.innerHTML = `<span class="cor-tempo">(${mensagem.time})</span> <span class="nome-cor"><strong>${mensagem.from}</strong></span> <span class="cor-texto">${mensagem.text}</span>`
            } else if(mensagem.type === "message" || mensagem.to === "Todos"){
                li.classList.add("normais");
                li.innerHTML = `<span class="cor-tempo">(${mensagem.time})</span> <span class="nome-cor"><strong>${mensagem.from}</strong></span> <span class="cor-texto">para</span> <span class="nome-cor">${mensagem.to} :</span> <span class="cor-texto">${mensagem.text}</span> `
            } else if(mensagem.type === "private_message" && (mensagem.from === usuario || mensagem.to === usuario)){
                li.classList.add("reservadas");
                li.innerHTML = `<span class="cor-tempo">(${mensagem.time})</span> <span class="nome-cor"><strong>${mensagem.from}</strong></span> <span class="cor-texto">reservadamente para</span> <span class="nome-cor">${mensagem.to} :</span> <span class="cor-texto">${mensagem.text}</span>`
            };
            ul.appendChild(li);
            li.scrollIntoView();
            
    });
}

function entrarSala(){
    const promessa = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants/" + link, {name: usuario});
    promessa.then(quandoSucesso);
    promessa.catch(quandoErro);
}

function quandoSucesso(resposta){
    alert("Você entrou na sala!");
    manterConexao();
    buscarMensagens();
}

function quandoErro(erro){
    if(erro.response && erro.response.status === 400){
        alert("Esse nome já existe ou o campo está vazio!");
        usuario = prompt("Insira outro nome!");
        entrarSala();
    }
}

function manterConexao(){
    setInterval(() => {
        const participanteAtivo = {name: usuario};

        const promessa = axios.post("https://mock-api.driven.com.br/api/v6/uol/status/" + link, participanteAtivo);
        promessa.then(avisarUsuario);
        promessa.catch(erroAvisarUsuario);
    }, 5000);
}

function avisarUsuario(resposta){
    console.log(resposta);
}
function erroAvisarUsuario(erro){
    console.log(erro)
    alert("Desconectado!!!");
    window.location.reload();
    entrarSala();
}

function enviarMensagem(){
    let enviarMensagem = document.querySelector(".escrever").value;
    let tipoMensagem = "";

    if(privacidade === "Reservadamente"){
        tipoMensagem = "private_message" ;
    } else {
        tipoMensagem = "message";
    }

    const enviarMensagens = {
        from: usuario,
        to: nomeSelecionado,
        text: enviarMensagem,
        type: tipoMensagem
    }
    
    const promessa = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages/" + link, enviarMensagens);
    promessa.then(mensagemEnviadaSucesso);
    promessa.catch(mensagemNaoEnviada);
}

function mensagemEnviadaSucesso(resposta){
    console.log(resposta);
    renderizarMensagens();

    document.querySelector(".escrever").value = "";
};

function mensagemNaoEnviada (erro) {
    console.log(erro);
}

function  mensagensPrivadas (){  
    let reservadas = mensagens.filter( mensagem => {
    return mensagem.type === "private_message" && (mensagem.from === usuario || mensagem.to === usuario);
    });
renderizarMensagens(reservadas);
}

function buscarParticipantes(){
    setInterval(() => {
    const promessa = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants/" + link);
    promessa.then(participanteAtivo);
    promessa.catch(participanteInativo);
    }, 10000);
}

function participanteAtivo(resposta){
    console.log(resposta);
    participantes = resposta.data;
    renderizarParticipantes();
}

function participanteInativo(erro){
    console.log(erro)
}

function renderizarParticipantes(){
    const ul = document.querySelector(".participantes");
    ul.innerHTML = "";

    participantes.forEach( usu => {  
        ul.innerHTML += `
            <li class= "nomes" onclick="escolherUsuario(this)">
                <div class= "ordem">
                    <ion-icon name="person-circle" class="ion"></ion-icon>
                    <span class="span">${usu.name}</span>
                </div>
                <span class="span1 none">
                    <ion-icon name="checkmark-circle-outline"></ion-icon>
                </span>
            </li>
        `;
    })

}

function escolherUsuario(elemento){
    let remetente = document.querySelector(".remetente");
    const nome = elemento.querySelector(".span").innerText;
    nomeSelecionado = nome;

    const todosItens = document.querySelectorAll(".nomes");
    todosItens.forEach(item => {
        const checkmark = item.querySelector(".span1");
        checkmark.classList.add("none");  
    });
    
    const checkmark = elemento.querySelector(".span1");
    
    if (checkmark.classList.contains("none")) {
        checkmark.classList.remove("none");  
    } else {
        checkmark.classList.add("none");
    }
    remetente.innerHTML = `<p class="remetente">Enviando para ${nomeSelecionado} (${privacidade})</p>`;
}
    

function escolherPrivacidade (elemento) {
    let remetente = document.querySelector(".remetente");
    const priv = elemento.querySelector(".span-pri").innerText;
    privacidade = priv;

    const cadeados = document.querySelectorAll(".pri-pub");
    cadeados.forEach( item => {
        const checkmark = item.querySelector(".span1");
        checkmark.classList.add("none");
    });
    const checkmark = elemento.querySelector(".span1");

    if (checkmark.classList.contains("none")) {
        checkmark.classList.remove("none");  
    } else {
        checkmark.classList.add("none");
    }
    remetente.innerHTML = `<p class="remetente">Enviando para ${nomeSelecionado} (${privacidade})</p>`;
}

entrarSala();
buscarMensagens();
buscarParticipantes();

