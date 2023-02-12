const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld(
    "api", {
        send: (canal, data) => {
            let canaisValidos = ["fs"] // Listagem de Comunicações Permitidas

            if (canaisValidos.includes(canal)) {
                ipcRenderer.send(canal, data) //Manda os dados do Render para o canal permitido em Main.js
            }
        },
        receive: (canal, func) => {
            let canaisValidos = ["respostaFs"] // Listagem de Comunicação Permitidas

            if(canaisValidos.includes(canal)) {                
                ipcRenderer.on(canal, (event, ...args) => func(...args)) //Manda os dados do Main.js para o Render
            }
        }
    }
);