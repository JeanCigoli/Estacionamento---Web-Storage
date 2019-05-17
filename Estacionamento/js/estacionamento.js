const $ = (el) => document.querySelector(el);
const pipe = (...fns) => arg => fns.reduce((val, fn) => fn(val), arg);

// CHAMANDO OS INPUTS
const $nome = $("#nome");
const $placa = $("#placa");
const $valorPrimeiraHora = $("#valor_primeira");
const $valorDemaisHoras = $("#valor_demais");

const $nomeComp = $("#comp_nome");
const $placaComp = $("#comp_placa");
const $dataComp = $("#comp_data");
const $horaComp = $("#comp_hora");

const $btPrincipal = $("#adicionar");
const $btRelatorio = $("#relatorio");
const $btPreco = $("#salvar_preco");
const $btConfirmar = $("#conf_saida");

const $registros = $("#registros");

const $inputPrincipal = document.querySelectorAll(".validador");
const $inputPreco = document.querySelectorAll(".valid_preco");

let codigoAtual;

// ESSENCIAIS PARA O PROJETO
const limitarCaracteres = () => {
    $nome.maxLength = 50;
    $placa.maxLength = 8;
    $valorPrimeiraHora.maxLength = 9;
    $valorDemaisHoras.maxLength = 9;
}

const limparTabela = () => {
    $registro = $("#registros");
    while ($registro.firstChild){
        $registro.removeChild($registro.firstChild);
    }
}

const limparRelatorio = () => {
    $registro = $("#registros_relatorio");
    while ($registro.firstChild){
        $registro.removeChild($registro.firstChild);
    }
}

const limparInputs = (el) => {
    const $campos = Array.from(el);
    $campos.map(campos => campos.value = "");
}

// PARA ABRIR MODAL
const $modal_preco = $("#preco_modal");
const $modal_comp = $("#comprovante_modal");

// botões 
const $abrirPreco = $("#preco");
const $abrirRelatorio = $("#relatorio_modal")
const $fechar_preco = $("#fechar_preco");
const $fechar_comp = $("#fechar_comp");
const $fechar_relatorio = $("#fechar_relatorio");

const abrirModal = (el) => el.classList.add("abrirModal");
const fecharModal = (el) => el.classList.remove("abrirModal");


// BANCO DE ARRAY

let banco = [];
let bancoRelatorio = [];
let preco = [];

const exibirTabela = () => {
    lerRegistroBD();
    $registro = $("#registros");
    limparTabela();
    banco.map( registro => {
        $tr = document.createElement("tr");
        $tr.innerHTML = `
            <td class="texto">${registro.nome}</td>
            <td class="texto">${registro.placa}</td>
            <td class="texto">${registro.data_entrada}</td>
            <td class="texto">${registro.hora_entrada}</td>
            <td class="acoes">
                <button class="botao_acao texto" id="comprovante_${registro.codigo}">Comp</button>
                <button class="botao_acao texto" id="editar_${registro.codigo}">Editar</button>
                <button class="botao_acao texto" id="saida_${registro.codigo}">Saída</button>
            </td>
        `
        $registro.insertBefore($tr, null);
    })
}

const exibirRelatorio = () => {
    $registro = $("#registros_relatorio");
    lerRelatorioBD();
    limparRelatorio();
    bancoRelatorio.map( registro => {
        $tr = document.createElement("tr");
        $tr.innerHTML = `
            <td class="texto">${registro.nome}</td>
            <td class="texto">${registro.data_entrada} ${registro.hora_entrada}</td>
            <td class="texto">${registro.data_saida} ${registro.hora_saida}</td>
            <td class="texto"> R$ ${registro.preco}</td>
        `
        $registro.insertBefore($tr, null);
    })

    const totalRelatorio = bancoRelatorio.reduce( (soma, registro) => soma + parseFloat(registro.preco), 0);

    $trTotal = document.createElement("tr");
    $trTotal.innerHTML = `
        <td class="subtitulo" colspan="3">Total</td>
        <td class="texto"> R$ ${totalRelatorio} </td>
    `
    $registro.insertBefore($trTotal, null);
    
}


// CRUD MAIS OU MENOS

const lerRegistroBD = () => {
    const jsonBanco = JSON.parse(localStorage.getItem("BD"));
    banco = jsonBanco ? jsonBanco : [];
}

const gravarRegistroBD = () => {
    const jsonBanco = JSON.stringify(banco);
    localStorage.setItem("BD", jsonBanco);
}

const lerRelatorioBD = () => {
    const jsonBanco = JSON.parse(localStorage.getItem("BDR"));
    bancoRelatorio = jsonBanco ? jsonBanco : [];
}

const gravarRelatorioBD = () => {
    const jsonBanco = JSON.stringify(bancoRelatorio);
    localStorage.setItem("BDR", jsonBanco);
}

const lerPrecoBD = () => {
    const jsonBanco = JSON.parse(localStorage.getItem("RS"));
    preco = jsonBanco ? jsonBanco : [];
}

const gravarPrecoBD = () => {
    const jsonBanco = JSON.stringify(preco);
    localStorage.setItem("RS", jsonBanco);
}


const lerRegistro = codigo => {
    lerRegistroBD();
    return banco.filter( rs => rs.codigo == codigo);
};

const adicionarRegistro = (registro) => {

    const ultimoIndice = banco.length -1;
    let novoCodigo;

    if(ultimoIndice == -1){
        novoCodigo = 1;
    }else{
        novoCodigo = parseInt( banco[ultimoIndice].codigo ) + 1;
    }

    registro.codigo = novoCodigo.toString();
    banco.push(registro);
    gravarRegistroBD();
    gerarComprovante(registro.codigo);

}

const adicionarRelatorio = registro => {

    const ultimoIndice = bancoRelatorio.length -1;
    let novoCodigo;

    if(ultimoIndice == -1){
        novoCodigo = 1;
    }else{
        novoCodigo = parseInt( bancoRelatorio[ultimoIndice].codigo ) + 1;
    }

    registro.codigo = novoCodigo.toString();
    bancoRelatorio.push(registro);
    gravarRelatorioBD();

}

const atualizarRegistro = (codigo, registro) => {
    const indice = banco.findIndex(rs => rs.codigo == codigo);
    banco.splice(indice, 1, registro);
    gravarRegistroBD();
}

const removerRegistro = codigo => {
    const indice = banco.findIndex(rs => rs.codigo == codigo);
    banco.splice(indice, 1);
    gravarRegistroBD();
}


// PEGANDO A DATA E HORA ATUAL

let data;
let hora;

const dataAtual = (dataAgora) => {

    // Guarda cada pedaço em uma variável
    let dia = dataAgora.getDate();         // 1-31
    if(dia <= 9){
        dia = "0"+ dia;
    }

    let mes = dataAgora.getMonth() + 1;    // 0-11 (zero=janeiro)
    if(mes <= 9){
        mes = "0"+ mes;
    }

    let ano = dataAgora.getFullYear();     // 4 dígitos

    let horaAgora = dataAgora.getHours();  // 0-23
    if(horaAgora <= 9){
        horaAgora = "0"+ horaAgora;
    }

    let min = dataAgora.getMinutes();      // 0-59
    if(min <= 9){
        min = "0"+ min;
    }

    let seg = dataAgora.getSeconds();      // 0-59
    if(seg <= 9){
        seg = "0"+ seg;
    }


    // Formata a data e a hora (note o mês + 1)
    data = dia + '/' + mes + '/' + ano;
    hora = horaAgora + ':' + min + ':' + seg;
}

// FAZENDO TODA A PARTE LÓGICA

// verificando se está vazio
const verificarCampos = (el) => {
    const $campos = Array.from(el);

    const camposVazios = $campos.filter(campo => campo.value == false)

    return camposVazios.length == 0;

}

const salvarDados = () => {

    const novoRegistro = {
        nome: $nome.value,
        placa: $placa.value,
    }

    if($btPrincipal.textContent == "Adicionar"){

        let dataAgora = new Date();

        dataAtual(dataAgora);

        novoRegistro.data_entrada = data;
        novoRegistro.hora_entrada = hora;
        novoRegistro.dataEntrada_mils = dataAgora.getTime();

        adicionarRegistro(novoRegistro);

    }else if ($btPrincipal.textContent == "Atualizar"){

        novoRegistro.data_entrada = data;
        novoRegistro.hora_entrada = hora;
        novoRegistro.codigo = codigoAtual;
        atualizarRegistro(codigoAtual, novoRegistro);
    }
    
}

const adicionarCarro = () => {
    if (verificarCampos($inputPrincipal)) {
        if(validarPlaca($placa.value)){
            salvarDados();
            exibirTabela();
            limparInputs($inputPrincipal);
            $btPrincipal.textContent = "Adicionar"
        }else{
            alert("Por favor siga o padrão de exemplo: AAA-0000")
        }
    } else {
        alert("Verifique se os campos está preenchido ou correto!")
    }
}

// ABRIR O COMPROVANTE COM OS DADOS

const gerarComprovante = codigo => {

    let campos = lerRegistro(codigo);

    $nomeComp.value = campos[0].nome;
    $placaComp.value = campos[0].placa;
    $dataComp.value = campos[0].data_entrada;
    $horaComp.value = campos[0].hora_entrada;

    abrirModal($modal_comp);

}

// ABRIR A PAGINA PARA EDITAR A PLACA OU VEÍCULO

const abrirRegistro = codigo => {

    let campos = lerRegistro(codigo);
    
    $nome.value = campos[0].nome;
    $placa.value = campos[0].placa;
    data = campos[0].data_entrada;
    hora = campos[0].hora_entrada;
    codigoAtual = codigo;

    $btPrincipal.textContent = "Atualizar"

}

// TUDO RELACIONADO A SAÍDA DO CARRO

let tempo;
let precoFinal;

const completarRegistro = codigo => {

    let campos = lerRegistro(codigo);

    const novoRegistroRelatorio = {
        nome: campos[0].nome,
        placa: campos[0].placa,
        data_entrada: campos[0].data_entrada,
        hora_entrada: campos[0].hora_entrada,
        data_saida: data,
        hora_saida: hora,
        tempo: tempo,
        preco: precoFinal
    }

    removerRegistro(codigo);
    adicionarRelatorio(novoRegistroRelatorio);
}

const calcularPreco = hora => {

    let primeiraHora = parseFloat(preco[0].valor_primeira);
	let demaisHora = parseFloat(preco[0].valor_demais);
		
	if(hora == 1) {
		precoFinal = primeiraHora;
	}else if(hora > 1){
		precoFinal = primeiraHora + (hora-1) * demaisHora;
	}else{
        precoFinal = 0.0;
    }

}

const calcularTempo = codigo => {

    let campos = lerRegistro(codigo);

    let dataFinal = new Date();
    dataAtual(dataFinal);

    let mils = dataFinal.getTime() - campos[0].dataEntrada_mils;
		 
    let hora = Math.floor(mils / 1000 / 60 / 60);
    let minuto = Math.floor(mils / 1000 / 60);
		
	if(hora == 0.0) {	
		hora += 1;
	} else if (hora >= 1) {
		hora += 1;
	}
		
    tempo = hora;
    calcularPreco(hora);
}

const verificarPreco = () => {

    lerPrecoBD();

    const ultimoIndice = preco.length -1;

    if(ultimoIndice != -1){
        return true;
    }else{
        return false;
    }
}

const saidaCarro = codigo => {

    if(verificarPreco()){

        calcularTempo(codigo);
        completarRegistro(codigo);

    }else{
        alert("Por favor verifique se existe um preço adicionado!");
    }
    
}



// ACHANDO O BOTÕES PARA GERAR AS ACÕES

const acharBotao = json => {

    const [opt, codigo] = json.target.id.split("_");

    if(opt == "comprovante"){
        gerarComprovante(codigo);
    } else if (opt == "editar"){
        abrirRegistro(codigo);
    } else if (opt == "saida"){
        saidaCarro(codigo);
    }
    
    exibirTabela();
}

// PAGINA DE RELATORIO


const abrirRelatorio = () => {
    exibirRelatorio();
    abrirModal($abrirRelatorio);
}



// TUDO RELACIONADO A PREÇO

const atualizarPreco = (registro) => {

    const ultimoIndice = preco.length -1;

    if(ultimoIndice == -1){
        preco.push(registro);
    }else {
        preco.splice(0, 1, registro);
    }

    gravarPrecoBD();
    
}

const salvarPreco = () => {

    lerPrecoBD();

    let valorPrimeira = $valorPrimeiraHora.value.replace("," , ".");
    let valorDemais = $valorDemaisHoras.value.replace("," , ".");

    const novoPreco = {
        valor_primeira: valorPrimeira,
        valor_demais: valorDemais
    }

    atualizarPreco(novoPreco);
}


const adicionarPreco = () => {
    lerPrecoBD();
    if (verificarCampos($inputPreco)) {
        salvarPreco();
        limparInputs($inputPreco);
        fecharModal($modal_preco);
    } else {
        alert("Verifique se os campos está preenchido!")
    }  
}

const abrirPreco = () => {
    lerPrecoBD();
    const ultimoIndice = preco.length -1;

    if(ultimoIndice == -1){
        abrirModal($modal_preco)
    }else {
        $valorPrimeiraHora.value = preco[0].valor_primeira.replace(".", ",");
        $valorDemaisHoras.value = preco[0].valor_demais.replace(".", ",");
        abrirModal($modal_preco)
    }
}


// FILTRAR OS CARACTERES DOS CAMPOS

const filtrarNumero = texto => texto.replace(/[^0-9]/g, "")
const filtrarTexto = texto => texto.replace(/[^A-Za-zÀ-ÿ ]/g, "")
const filtrarPlaca = texto => texto.replace(/[^A-Za-zÀ-ÿ0-9]/g, "")

const validarPlaca = el => /[a-zA-Z]{3}-[0-9]{4}/g.test(el);

const addHifen = texto => texto.replace(/(.{3})(.)/, "$1-$2"); 
const TornarMaiuscula = texto => texto.toUpperCase();

const addVirgula = numero => numero.replace(/(.*)(.{2})/, "$1,$2")
                                    .replace(/(.*)(.{6})/, "$1.$2");

const mascaraPreco = pipe(filtrarNumero, addVirgula);

const mascaraPlaca = pipe(filtrarPlaca, TornarMaiuscula, addHifen );


// EVENTOS
$fechar_preco.addEventListener("click", () => fecharModal($modal_preco));
$abrirPreco.addEventListener("click", () => abrirPreco());
$fechar_comp.addEventListener("click", () => fecharModal($modal_comp));
$fechar_relatorio.addEventListener("click", () => fecharModal($abrirRelatorio));
$btPrincipal.addEventListener("click", () => adicionarCarro());
$btRelatorio.addEventListener("click", () => abrirRelatorio());
$btPreco.addEventListener("click", () => adicionarPreco());

$registros.addEventListener("click", acharBotao);

//EVENTOS DE KEYUP
$nome.addEventListener("keyup", () => $nome.value = filtrarTexto($nome.value));
$placa.addEventListener("keyup", () => $placa.value = mascaraPlaca($placa.value));
$valorPrimeiraHora.addEventListener("keyup", () => $valorPrimeiraHora.value = mascaraPreco($valorPrimeiraHora.value));
$valorDemaisHoras.addEventListener("keyup", () => $valorDemaisHoras.value = mascaraPreco($valorDemaisHoras.value));

exibirTabela();
limitarCaracteres();