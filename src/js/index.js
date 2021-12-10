let Contract
let game = {
    contractAddress: '',
    addressPlayer1: '',
    addressPlayer2: '',
    escrowPlayer1: 0,
    escrowPlayer2: 0,
}
let contractInstance
let socket
let web3Provider = null
let contracts = {}
let web3 = null


window.ethereum.enable();


web3Provider = window['ethereum']
web3 = new Web3(web3Provider)
// web3.eth.defaultAccount = web3.eth.accounts[0]



start()

function start() {
    socket = io()

    socket.on('start-game', redirectToGame)


    document.querySelector('#button-continue').addEventListener('click', () => {
        const valueSelected = document.querySelector('#eth-value').value
        const addressSelected = document.querySelector('#eth-address').value.trim()

        web3.eth.defaultAccount = web3.eth.accounts[0]
        
        Contract = web3.eth.contract(abi)

        // If this is the first player set his escrow and balance
        if(addressSelected.length === 0) {
            game.escrowPlayer1 = web3.toWei(valueSelected)
            game.addressPlayer1 = web3.eth.defaultAccount
            game.socketPlayer1 = socket.id
            contractInstance = Contract.new({
                value: web3.toWei(valueSelected),
                data: bytecode.object,
                gas: 4712388
            }, (err, result) => {
                // This callback will be called twice, the second time includes the contract address
                if(!result.address) {
                    document.querySelector('#display-address').innerHTML = 'The transaction is being processed, wait until the block is mined to see the address here...'
                } else {
                    document.querySelector('#display-address').innerHTML = 'Contract address: ' + result.address + ' waiting for second player'
                    game.contractAddress = result.address

                    socket.emit('setup-player-1', game)
                }
            })

        // If this is the second player set his escrow and balance
        } else {
            let interval

            contractInstance = Contract.at(addressSelected)
            game.contractAddress = addressSelected
            game.escrowPlayer2 = web3.toWei(valueSelected)
            game.addressPlayer2 = web3.eth.defaultAccount
            game.socketPlayer2 = socket.id
            contractInstance.setupPlayer2({
                value: web3.toWei(valueSelected),
                gas: 4712388
            }, (err, result) => {
                document.querySelector('#display-address').innerHTML = 'The transaction is being processed, wait until the block is mined to start the game'

                interval = setInterval(() => {
                    web3.eth.getTransaction(result, (err, result) => {
                        if(result.blockNumber != null) {
                            document.querySelector('#display-address').innerHTML = 'Game ready'
                            clearInterval(interval)

                            socket.emit('setup-player-2', game)
                        }
                    })
                }, 1e3)
            })
        }
    })
}

// Changes the view to game
function redirectToGame() {
    window.location = '/game.html'
}
