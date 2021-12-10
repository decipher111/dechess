const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const port = 8001

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, '/src')))
app.use('*', (req, res, next) => {
	// Logger
	let time = new Date()
	console.log(`${req.method} to ${req.originalUrl} at ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
	next()
})

let game = {
    contractAddress: '',
    addressPlayer1: '',
    addressPlayer2: '',
    escrowPlayer1: '',
    escrowPlayer2: '',
    socketPlayer1: '',
    socketPlayer2: '',
}


start()

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

        socket.on('finish', () => {
            io.to(socket.id).emit('finish-2-messages')
        })
    })

    http.listen(port, '0.0.0.0')
    console.log(`Listening on localhost:${port}`)
}
