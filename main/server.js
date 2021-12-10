const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const ethereumjs = require('ethereumjs-abi')
const ethereumjsUtil = require('ethereumjs-util')
const port = 4000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'src')))

// 1. Setup message from player 1 with his data. He sees "Waiting for second player to join"
// 2. Setup message from player 2 with his data. A soon as he join, both get redirected to the game page
// 3. Redirect both players to the game.html view
// 4. Both players exchange messages in order with a sequence
// 5. The balances get updated whenever both messages are received and checked
let games = []
let player1Message = {}
let player2Message = {}
let game = {
    contractAddress: '',
    addressPlayer1: '',
    addressPlayer2: '',
    escrowPlayer1: '',
    escrowPlayer2: '',
    socketPlayer1: '',
    socketPlayer2: ''
}

/* Game => {
    contractAddress, -
    addressPlayer1, -
    addressPlayer2, -
    socketPlayer1, -
    socketPlayer2, -
    escrowPlayer1, -
    escrowPlayer2, -
    balancePlayer1, -
    balancePlayer2, -
    sequence,
    signedMessage1, -
    signedMessage2, -
    betPlayer1, -
    betPlayer2, -
    callPlayer1, -
    callPlayer2, -
    nonce1, -
    nonce2 -
}
*/

async function start() {
    io.on('connection', socket => {
        console.log('User connected', socket.id)

        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id)
        })

        socket.on('setup-player-1', data => {
            console.log('1. Received setup-player-1')
            game = {
                contractAddress: data.contractAddress,
                escrowPlayer1: data.escrowPlayer1,
                addressPlayer1: data.addressPlayer1,
                socketPlayer1: data.socketPlayer1
            }
        })

        socket.on('setup-player-2', async data => {
            console.log('2. Received setup-player-2')
            game.escrowPlayer2 = data.escrowPlayer2
            game.addressPlayer2 = data.addressPlayer2
            game.socketPlayer2 = data.socketPlayer2
            game.sequence = 0

            console.log('3. Emitting start-game')
            io.emit('start-game')
        })

        socket.on('setup-game', data => {
            console.log('4. Received setup-game')
            if(data.address == game.addressPlayer1) {
                game.socketPlayer1 = data.socket
            } else {
                game.socketPlayer2 = data.socket
            }

            console.log('5. Emmiting initial game data for both players with the updated sockets')
            io.emit('initial-game-data', game)
        })


        
        // On finish send the 2 latest messages which are contained in the last element.
        socket.on('finish', () => {
            io.to(socket.id).emit('finish-2-messages')
        })
    })

    http.listen(port, '0.0.0.0')
    console.log(`Listening on localhost:${port}`)
}

start()
