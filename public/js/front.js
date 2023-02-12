const inputPesquisar = document.getElementById("pesquisar")
const iconSearch = document.getElementById('search')
const spanSearch = document.getElementsByClassName('span_pesquisar')[0]
const menuBar = document.getElementsByClassName('icon_filter')[0]
const lista_itens = document.getElementById('listaBar')
const check_concluido = document.getElementById('checkConcluido')
const check_aguardando = document.getElementById('checkAguardando')
const check_date = document.getElementById('checkData')
const inputDate = document.getElementById('dataTarefa')
const btn_filtrar = document.getElementById('btnFiltrar')
const modalNovaTarefa = document.getElementsByTagName('dialog')[0]
const modalSucesso = document.getElementsByTagName('dialog')[1]
const modalTarefa = document.getElementsByTagName('dialog')[2]
const modalPergunta = document.getElementsByTagName('dialog')[3]
const fechaTarefa = document.getElementsByClassName('closeTarefa')[0]
const btnCancelar = document.getElementsByClassName('btn_cancelar')[0]
const btnEditarTarefa = document.getElementsByClassName('btn_editar_tarefa')[0]
const btnExcluirTarefa = document.getElementsByClassName('btn_excluir_tarefa')[0]
const btnConcluir = document.getElementsByClassName('btn_concluir')[0]
const btnExcluir = document.getElementsByClassName('btn_excluir')[0]
const btnAtualizar = document.getElementsByClassName('btn_atualizar')[0]
const btnCancelarExclusao = document.getElementsByClassName('btn_cancelar_exclusao')[0]
const btnClose = document.getElementsByClassName('btn_close')[0]
const btnConcluirTarefa = document.getElementsByClassName('btn_concluir_tarefa')[0]
const btnSalvarTarefa = document.getElementsByClassName('btn_update_tarefa')[0]
const cancelarEdicao = document.getElementsByClassName('btn_cancel_update')[0]
const msgErroTitulo = document.getElementById('passwordHelpBlock')
const msgErroDescricao = document.getElementById('descriptionHelpBlock')
const smallTituloTarefa = document.getElementById('msgTituloTarefa')
const smallDescricaoTarefa = document.getElementById('msgDescricaoTarefa')
const btnNovaTarefa = document.getElementsByClassName('btn_criar')[0]
const secaoTarefas = document.getElementsByClassName('secao_tarefas')[0]

var tempTitle = "", tempDesc = "", checkConcluido = false, checkAguardando = false, checkData = false

//Respostas do Main.JS
window.api.receive("respostaFs", (obj) => {
    if(obj.status == "ok"){
        if(obj.type == 'consulta'){
            var aside_tarefa = document.createElement('ASIDE')
            aside_tarefa.attributes = 'class'
            aside_tarefa.setAttribute('class', 'asideTarefa')
            aside_tarefa.attributes = 'id'
            aside_tarefa.setAttribute('id', obj.file)
            aside_tarefa.attributes = 'onclick'
            aside_tarefa.setAttribute('onclick', 'mostraTarefa(this)')

            var divStatus = document.createElement('DIV')
            divStatus.attributes = 'class'
            divStatus.setAttribute('class', 'div_status')

            var spanStatus = document.createElement('SPAN')
            spanStatus.attributes = 'class'
            spanStatus.setAttribute('class', 'span_status')

            var h3Titulo = document.createElement('H3')
            h3Titulo.attributes = 'class'
            h3Titulo.setAttribute('class', 'titulo_tarefa')

            var divData = document.createElement('DIV')
            divData.attributes = 'class'
            divData.setAttribute('class', 'div_data')

            preencheCampos('consulta', obj, secaoTarefas, aside_tarefa, h3Titulo, null, divStatus, spanStatus, divData)
        }
        else if(obj.type == "escrita"){
            document.getElementById('text_msg').innerText = 'Tarefa Criada com Sucesso!'
            modalSucesso.showModal()
            limpaInputs()
        }
        else if(obj.type == "single"){
            var statusTarefa = document.getElementsByClassName('status_tarefa')[0]
            var dateTarefa = document.getElementsByClassName('data_tarefa')[0]
            var titleTarefa = document.getElementById('tituloTarefa')
            var descricaoTarefa = document.getElementById('textTarefa')

            var arrayStrings = obj.tarefa.split("#")
            var arrayStatus = arrayStrings[3].split("Status")  
            var arrayData = arrayStrings[4].split("Data")
            var arrayTitulo = arrayStrings[1].split("Title")
            var arrayDescricao = arrayStrings[2].split("Descrição")

            statusTarefa.innerHTML = '<b>Status:</b> ' + arrayStatus[1]
            dateTarefa.innerHTML = '<b>Aberta em:</b>' + arrayData[1]

            titleTarefa.value = arrayTitulo[1]
            tempTitle = titleTarefa.value
            descricaoTarefa.value = arrayDescricao[1]
            tempDesc = descricaoTarefa.value

            titleTarefa.disabled = true
            descricaoTarefa.disabled = true
            titleTarefa.style.backgroundColor = 'transparent'
            descricaoTarefa.style.backgroundColor = 'transparent'

            validaStatus('single', null, arrayStatus[1].trim())

            btnAtualizar.attributes = 'onclick'
            btnAtualizar.onclick = function(){
                if(titleTarefa.value.trim() == '' && descricaoTarefa.value.trim() == ''){
                    modalPergunta.close()
                    smallTituloTarefa.style.display = 'block'
                    smallDescricaoTarefa.style.display = 'block'
                    return
                }
                else if(titleTarefa.value.trim() == ''){
                    modalPergunta.close()
                    smallTituloTarefa.style.display = 'block'
                    smallDescricaoTarefa.style.display = 'none'
                    return
                }
                else if(descricaoTarefa.value.trim() == ''){
                    modalPergunta.close()
                    smallTituloTarefa.style.display = 'none'
                    smallDescricaoTarefa.style.display = 'block'
                    return
                }
                atualizarTarefa(obj.file, titleTarefa.value, descricaoTarefa.value, arrayStatus[1], arrayData[1])
            }

            btnConcluir.attributes = 'onclick'
            btnConcluir.onclick = function(){
                concluirTarefa(obj.file, titleTarefa.value, descricaoTarefa.value, arrayData[1], 'Concluída')
            }

            btnEditarTarefa.addEventListener('click', () => {
                btnConcluirTarefa.style.display = 'none'
                btnSalvarTarefa.style.display = 'block'
                btnEditarTarefa.style.display = 'none'
                cancelarEdicao.style.display = 'block'
                btnExcluirTarefa.style.display = 'none'
                titleTarefa.disabled = false
                descricaoTarefa.disabled = false
                titleTarefa.style.backgroundColor = 'rgba(186, 188, 188, 0.7)'
                descricaoTarefa.style.backgroundColor = 'rgba(186, 188, 188, 0.7)'
                titleTarefa.style.color = 'black'
                descricaoTarefa.style.color = 'black'
            })

            cancelarEdicao.addEventListener('click', () => {
                btnConcluirTarefa.style.display = 'block'
                btnSalvarTarefa.style.display = 'none'
                btnEditarTarefa.style.display = 'block'
                cancelarEdicao.style.display = 'none'
                btnExcluirTarefa.style.display = 'block'
                smallTituloTarefa.style.display = 'none'
                smallDescricaoTarefa.style.display = 'none'
                preencheCampos('single', null, null, null, titleTarefa, descricaoTarefa, null, null, null)
                titleTarefa.disabled = true
                descricaoTarefa.disabled = true
                titleTarefa.style.backgroundColor = 'transparent'
                descricaoTarefa.style.backgroundColor = 'transparent'
            })

            btnExcluir.attributes = 'onclick'
            btnExcluir.setAttribute('onclick', "excluirTarefa('" + obj.file + "')")

            smallTituloTarefa.style.display = 'none'
            smallDescricaoTarefa.style.display = 'none' 

            modalTarefa.showModal()

            //Volta ao topo
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth' //Subida Animada
            })
        }
        else if(obj.type == "update" || obj.type == "delete" || obj.type == "finish"){
            document.getElementById('text_msg').innerText = obj.msg
            modalPergunta.close()
            modalSucesso.showModal()
            limpaInputs()
        }
        else if(obj.type == 'empty'){
            tarefaNaoEncontrada()
        }
    }
    else if(obj.status == "fail") {
        console.log(obj.msg)
    }
})
//End Respostas do Main.JS

function showNovaTarefa(){
    modalNovaTarefa.showModal()
}

function concluirTarefa(file, title, describe, data_criacao, stat){
    window.api.send("fs", {
        situacao: "finish",
        file_id: file,
        titulo: title,
        descricao: describe,
        status: stat,
        data: data_criacao
    }) 
}

function salvarTarefa(titulo, descricao){
    // Do Render pro Main.js
    window.api.send("fs", {
        situacao: "create",
        titulo: titulo,
        descricao: descricao,
        status: "Não Concluído",
        data: new Date()
    }) 
    //End Comunicação com Preload
}

//Consulta Todas as Tarefas
function consultaTarefa(){
    window.api.send("fs", {
        situacao: "read"
    }) 
}

//Consulta Individual
function mostraTarefa(elemento){
    window.api.send("fs", {
        situacao: "single",
        file_id: elemento.getAttribute("id")
    }) 
}

//Exclui uma Tarefa
function excluirTarefa(arquivo){
    window.api.send("fs", {
        situacao: "delete",
        file: arquivo
    }) 
}

function criarTarefa(titulo, descricao){
    msgErroTitulo.style.display = 'none'
    msgErroDescricao.style.display = 'none'

    if(titulo.trim() == '' && descricao.trim() == ''){
        msgErroTitulo.style.display = 'block'
        msgErroDescricao.style.display = 'block'
        return
    }
    else if(titulo.trim() == ''){
        msgErroTitulo.style.display = 'block'
        return
    }
    else if(descricao.trim() == ''){
        msgErroDescricao.style.display = 'block'
        return
    }
    else {
        salvarTarefa(titulo, descricao)
        modalNovaTarefa.close()
    }
}

function tarefaNaoEncontrada(){
    destroiAsides()
    var asideMsg = document.createElement('ASIDE')
    var div_icon_msg = document.createElement('DIV')
    var p_msg = document.createElement('P')
    var icon_msg = document.createElement('I')

    icon_msg.attributes = 'class'
    icon_msg.setAttribute('class', 'fa-solid fa-circle-exclamation')
    asideMsg.attributes = 'class'
    asideMsg.setAttribute('class', 'aside_msg')

    div_icon_msg.appendChild(icon_msg)
    p_msg.appendChild(document.createTextNode("Nenhuma Tarefa Encontrada"))

    asideMsg.appendChild(div_icon_msg)
    asideMsg.appendChild(p_msg)
    secaoTarefas.appendChild(asideMsg)
}

function mostraPergunta(pergunta, tipo){
    if(tipo == 'ask'){
        btnExcluir.style.display = 'none'
        btnAtualizar.style.display = 'block'
        btnConcluir.style.display = 'none'
    }
    else if(tipo == 'del'){
        btnExcluir.style.display = 'block'
        btnAtualizar.style.display = 'none'
        btnConcluir.style.display = 'none'
    }
    else if(tipo == 'finish'){
        btnConcluir.style.display = 'block'
        btnExcluir.style.display = 'none'
        btnAtualizar.style.display = 'none'
    }
    document.getElementById('text_msg_pergunta').innerText = pergunta
    modalPergunta.showModal()
}

function atualizarTarefa(file, title, describe, stat, data_criacao){
    // Do Render pro Main.js
    window.api.send("fs", {
        situacao: "update",
        arquivo: file,
        titulo: title,
        descricao: describe,
        status: stat,
        data: data_criacao
    }) 
    //End Comunicação com Preload
}

function preencheCampos(tipo, obj, secao_task, aside, titulo, describe, div_status, span_status, div_data){
    if(tipo == 'consulta'){
        var arrayStrings = obj.tarefa.split("#")
            
        /*Status*/            
        var arrayStatus = arrayStrings[3].split("Status")            
        span_status.appendChild(document.createTextNode(arrayStatus[1]))
        div_status.appendChild(span_status)
        aside.appendChild(div_status)

        validaStatus('consulta', span_status, arrayStatus[1].trim())

        /*Titulo*/
        var arrayTitulo = arrayStrings[1].split("Title")            
        titulo.appendChild(document.createTextNode(arrayTitulo[1]))
        aside.appendChild(titulo)

        /*Data*/
        var arrayData = arrayStrings[4].split("Data")            
        div_data.appendChild(document.createTextNode(arrayData[1]))
        aside.appendChild(div_data)

        secao_task.appendChild(aside)
    }
    else if(tipo == 'single'){
        titulo.value = tempTitle
        describe.value = tempDesc
    }
}

function validaStatus(tipo, span, status){
    if(tipo == 'consulta'){
        if(status == 'Concluída'){
            span.style.backgroundColor = 'rgb(0,191,255)'
        }   
        else {
            span.style.backgroundColor = 'rgb(255, 129, 2)'            
        }     
    }
    else if(tipo == 'single'){
        if(status == 'Concluída'){
            btnConcluirTarefa.style.display = 'none'
            btnEditarTarefa.style.display = 'none'
            btnExcluirTarefa.style.display = 'none'
        }   
        else {
            btnConcluirTarefa.style.display = 'block'
            btnEditarTarefa.style.display = 'block'
            btnExcluirTarefa.style.display = 'block'
        }    
    }
}

function pesquisarTarefa($query) {
    if($query.trim() == ''){
        return
    }
    else {
        destroiAsides()
        window.api.send("fs", {
            situacao: "search",
            query: $query,
            filter: false
        }) 
    }
}

function pesquisaComFiltro(){
    if(checkData && inputDate.value == ''){
        msgDataFiltro.style.display = 'block'
    }
    else {
        destroiAsides()
        msgDataFiltro.style.display = 'none'
        let arrayData = inputDate.value.split("-")
        let data_tarefa = arrayData[2] + "/" + arrayData[1] + "/" + arrayData[0]
        window.api.send("fs", {
            situacao: "search",
            filter: true,
            checks: {
                concluido: checkConcluido,
                aguardando: checkAguardando,
                data: new Array(checkData, data_tarefa)
            }
        }) 
    }
}

function destroiAsides(){
    while(secaoTarefas.firstChild != null){
        secaoTarefas.removeChild(secaoTarefas.firstChild)
    }
}

spanSearch.addEventListener('click', () => {
    pesquisarTarefa(inputPesquisar.value)
})

inputPesquisar.addEventListener('keyup', function(e){
    var key = e.which || e.keyCode
    if(key == 13) { 
        pesquisarTarefa(inputPesquisar.value)
    }
    else if(inputPesquisar.value == ''){
        // Backspace,      Letras e Números,        Números Numpads
        if(key == 8 || key >= 48 && key <= 90 || key >= 96 && key <= 105) {
            destroiAsides()
            consultaTarefa()
        }
    }
})

btnCancelar.addEventListener('click', () => {
    msgErroTitulo.style.display = 'none'
    msgErroDescricao.style.display = 'none'
    limpaInputs()
    modalNovaTarefa.close()
})

btnCancelarExclusao.addEventListener('click', () => {
    modalPergunta.close()
})

btnClose.addEventListener('click', () => {
    modalSucesso.close()
    window.location.reload(true)
})

fechaTarefa.addEventListener('click', () => {
    btnConcluirTarefa.style.display = 'block'
    btnSalvarTarefa.style.display = 'none'
    btnEditarTarefa.style.display = 'block'
    cancelarEdicao.style.display = 'none'
    btnExcluirTarefa.style.display = 'block'
    smallTituloTarefa.style.display = 'none'
    smallDescricaoTarefa.style.display = 'none'

    modalTarefa.close()
})

inputPesquisar.addEventListener('focus', foco)
    
inputPesquisar.addEventListener('blur', () => {
    spanSearch.style.backgroundColor = '#e9ecef';
    spanSearch.style.borderColor = '#e9ecef'
    spanSearch.style.boxShadow = 'none'
    iconSearch.style.color = 'black'
})

function foco(){	
	spanSearch.style.backgroundColor = 'black'
	spanSearch.style.borderColor = 'black'
	spanSearch.style.boxShadow = '0 0 0 0.1em black'
	iconSearch.style.color = 'white'
}

function contaChecks(){
    if(check_concluido.checked || check_aguardando.checked || check_date.checked){
        return 1
    }
    else return 0
}

menuBar.addEventListener('click', () => {
	if(lista_itens.style.display == 'block'){
		lista_itens.style.display = 'none'
        limpa()
	}
	else {
		lista_itens.style.display = 'block'
	}
})

function ativaBtnFiltro(){
    if(contaChecks() >= 1){
        btn_filtrar.disabled = false
    }
    else {
        btn_filtrar.disabled = true
    }
}

function limpa(){
    check_concluido.checked = false
    check_aguardando.checked = false
    check_date.checked = false
    msgDataFiltro.style.display = 'none'
    inputDate.style.display = 'none'
    inputDate.value = ''
    btn_filtrar.disabled = true
    checkConcluido = false
    checkAguardando = false
    checkData = false
}

function limpaInputs(){
    document.getElementById('inputTitulo').value = ''
    document.getElementById('inputDescricao').value = ''
}

check_concluido.addEventListener('change', () => {
    ativaBtnFiltro()
    if(check_concluido.checked){
        checkConcluido = true
    }
    else {
        checkConcluido = false
    }
})

check_aguardando.addEventListener('change', () => {
    ativaBtnFiltro()
    if(check_aguardando.checked){
        checkAguardando = true
    }
    else {
        checkAguardando = false
    }
})

check_date.addEventListener('change', () => {
    if(inputDate.style.display == 'block'){
        msgDataFiltro.style.display = 'none'
        inputDate.style.display = 'none'
        inputDate.value = ''
    }
    else {
        inputDate.style.display = 'block'
    }

    ativaBtnFiltro()
    if(check_date.checked){
        checkData = true
    }
    else {
        checkData = false
    }
})