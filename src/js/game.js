let game = {}
let isThisPlayer1 = false
let isThisPlayer2 = false
let web3Provider = null
let web3 = null

window.ethereum.enable();
web3Provider = window['ethereum']
web3 = new Web3(web3Provider)

start()

async function start() {
    window.addEventListener('load', () => {
        socket = io()
        setListeners()
    })
}

function setListeners() {
    socket.on('connect', () => {
        console.log('Socket id connected to server', socket.id)
        web3.eth.defaultAccount = web3.eth.accounts[0]
        // Because we reloaded the page when redirecting, we need to update the socket id of all addresses
        socket.emit('setup-game', {
            socket: socket.id,
            address: web3.eth.defaultAccount
        })
    })

    socket.on('initial-game-data', gameData => {
        game = gameData

        // Who's this?
        if(game.addressPlayer1 == web3.eth.defaultAccount) isThisPlayer1 = true
        else isThisPlayer2 = true
    })

    socket.on('error', message => {
        status(message)
    })


    socket.on('finish-2-messages', message => {
        console.log(web3.eth.accounts[0])
        web3.eth.defaultAccount = web3.eth.accounts[0]
        let contract = web3.eth.contract(abi).at(game.contractAddress)

        contract.verifyPlayerBalance({
            gas: 4712388
        }, (err, result) => {
            console.log(err, result)
        })
    })
    document.querySelector('.finish').addEventListener('click', finishGame)
    game()
}

function finishGame() {
    socket.emit('finish')
}