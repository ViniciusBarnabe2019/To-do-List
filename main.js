const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron') //Módulo de Resposta ao Render
const path = require('path')
const fs = require("fs")
const uuid = require('uuid')

var janela = null

//Desabilita Aceleração por Hardware
app.disableHardwareAcceleration()

app.on('ready', ()=> {
    //cria Janela
    janela = new BrowserWindow({
        width: 500, 
        height: 600, 
        maximizable: false,
        resizable: false,
        center: true,
        nodeIntegration: false, 
        contextIsolation: true, 
        enableRemoteModule: false, 
        devTools: false,
        webPreferences: {
            preload: path.join(__dirname + '/preload.js')
        }
    }) 
    janela.setMenu(null) //Remove Menu Horizontal
    janela.setIcon(path.join(app.getAppPath(), 'images', 'icone.png')) //Seta ícone
    janela.loadFile('./public/index.html')  //Carrega Página pra Janela
})

//Comunicação
ipcMain.on('fs', (event, obj) => {
    //Cria e Escreve no Arquivo da Tarefa
    if(obj.situacao == "create"){
        var createStream = fs.createWriteStream(path.join(app.getAppPath(), "tarefas", uuid.v4() + ".txt")) //Cria Arquivo
        createStream.write("#Title " + obj.titulo + "\n" + "\n") //Insere o Título da Tarefa
        createStream.write("#Descrição " + obj.descricao + "\n" + "\n") //Insere a Descrição da Tarefa
        createStream.write("#Status " + obj.status + "\n" + "\n") //Insere o Status da Tarefa
        createStream.write("#Data " + obj.data.toLocaleDateString()) //Insere a Data de Criação da Tarefa
        createStream.end();

        enviaMsg("escrita", "Arquivo Criado com Sucesso!")
    }
    else if(obj.situacao == "search"){
        if(!obj.filter){
            var qtdTasks = 0
            fs.readdirSync(path.join(app.getAppPath(), "tarefas")).forEach(arquivo => {
                //Abre e Lê Arquivo na Codificação UTF-8
                var dados = fs.readFileSync(path.join(app.getAppPath(), "tarefas", arquivo), {encoding:'utf8', flag:'r'})
                var nome_arquivo = arquivo.split(".")            
                var arrayStrings = dados.split("#")
                var arrayTitulo = arrayStrings[1].split("Title")
                var arrayDescricao = arrayStrings[2].split("Descrição")

                //Procura Tarefa Através de seu Título ou Descrição
                if(arrayTitulo[1].indexOf(obj.query) != -1 || arrayDescricao[1].indexOf(obj.query) != -1){
                    qtdTasks++
                    respondeConsulta("consulta", dados, nome_arquivo[0])
                } 
            })
            if(qtdTasks == 0){
                respondeSemTarefa()
            }
        }
        else {
            var qtdTasks = 0
            fs.readdirSync(path.join(app.getAppPath(), "tarefas")).forEach(arquivo => {
                //Abre e Lê Arquivo na Codificação UTF-8
                var dados = fs.readFileSync(path.join(app.getAppPath(), "tarefas", arquivo), {encoding:'utf8', flag:'r'})
                var nome_arquivo = arquivo.split(".")            
                var arrayStrings = dados.split("#")
                var arrayStatus = arrayStrings[3].split("Status")  
                var arrayData = arrayStrings[4].split("Data")

                //Filtro Data
                if(obj.checks.data[0]){
                    //Data + Concluída e/ou Não Concluído
                    if(obj.checks.concluido && obj.checks.aguardando){
                        if(arrayStatus[1].indexOf("Concluída") != -1 && arrayData[1].indexOf(obj.checks.data[1]) != -1 || arrayStatus[1].indexOf("Não Concluído") != -1 && arrayData[1].indexOf(obj.checks.data[1]) != -1){
                            qtdTasks++
                            respondeConsulta("consulta", dados, nome_arquivo[0])
                        }
                    }
                    //Data + Concluída
                    else if(obj.checks.concluido){
                        if(arrayStatus[1].indexOf("Concluída") != -1 && arrayData[1].indexOf(obj.checks.data[1]) != -1){
                            qtdTasks++
                            respondeConsulta("consulta", dados, nome_arquivo[0])
                        }
                    }
                    //Data + Não Concluído
                    else if(obj.checks.aguardando){
                        if(arrayStatus[1].indexOf("Não Concluído") != -1 && arrayData[1].indexOf(obj.checks.data[1]) != -1){
                            qtdTasks++
                            respondeConsulta("consulta", dados, nome_arquivo[0])
                        }
                    }
                    //Data
                    else {
                        if(arrayData[1].indexOf(obj.checks.data[1]) != -1){
                            qtdTasks++
                            respondeConsulta("consulta", dados, nome_arquivo[0])
                        }
                    }
                    return
                }
                //Filtro Concluído
                if(obj.checks.concluido){
                    if(arrayStatus[1].indexOf("Concluída") != -1){
                        qtdTasks++
                        respondeConsulta("consulta", dados, nome_arquivo[0])
                    } 
                }    
                //Filtro Não Concluído
                if(obj.checks.aguardando){
                    if(arrayStatus[1].indexOf("Não Concluído") != -1){
                        qtdTasks++
                        respondeConsulta("consulta", dados, nome_arquivo[0])
                    } 
                }   
            })
            if(qtdTasks == 0){
                respondeSemTarefa()
            }
        }
    }
    else if(obj.situacao == "read"){ 
        var qtdTasks = 0
        fs.readdirSync(path.join(app.getAppPath(), "tarefas")).forEach(arquivo => {
            //Abre e Lê Arquivo na Codificação UTF-8
            var dados = fs.readFileSync(path.join(app.getAppPath(), "tarefas", arquivo), {encoding:'utf8', flag:'r'})
            var nome_arquivo = arquivo.split(".")          
            qtdTasks++
            respondeConsulta("consulta", dados, nome_arquivo[0])
        })
        if(qtdTasks == 0){
            respondeSemTarefa()
        }     
    }
    else if(obj.situacao == "single"){
        var dados = fs.readFileSync(path.join(app.getAppPath(), "tarefas", obj.file_id + ".txt"), {encoding:'utf8', flag:'r'})
        if(dados == ""){
            respondeSemTarefa()
        }    
        else {
            respondeConsulta("single", dados, obj.file_id)
        } 
    }
    else if(obj.situacao == "update"){
        var conteudo = montaConteudo(obj.titulo, obj.descricao, obj.status, obj.data)

        fs.writeFile(path.join(app.getAppPath(), "tarefas", obj.arquivo + ".txt"), conteudo, (erro) => {
                enviaMsg("update", "Tarefa Atualizada Com Sucesso!")
        })
    }
    else if(obj.situacao == "finish"){
        var conteudo = montaConteudo(obj.titulo, obj.descricao, obj.status, obj.data)
        
        fs.writeFile(path.join(app.getAppPath(), "tarefas", obj.file_id + ".txt"), conteudo, (erro) => {
                enviaMsg("finish", "Tarefa Concluída Com Sucesso!") 
        })
    }
    else if(obj.situacao == "delete"){
        fs.unlink(path.join(app.getAppPath(), "tarefas", obj.file + ".txt"), (erro) => {
                enviaMsg("delete", "Tarefa Deletada Com Sucesso!") 
        })
    }
})
//End Comunicação

//Funções de Resposta
function respondeConsulta(tipo, dados, file_name){
    janela.webContents.send("respostaFs", {
        type: tipo,
        status: "ok",
        tarefa: dados,
        file: file_name
    })
}

function respondeSemTarefa(){
    janela.webContents.send("respostaFs", {
        type: "empty",
        status: "ok"
    })
}

function enviaMsg(tipo, $msg){
    janela.webContents.send("respostaFs", {
        type: tipo,
        status: "ok",
        msg: $msg
    }) 
}
//End Funções de Resposta

function montaConteudo(titulo, descricao, status, data){
    return "#Title " + titulo + "\n" + "\n" +
           "#Descrição " + descricao + "\n" + "\n" +
           "#Status " + status + "\n" +
           "#Data " + data
}