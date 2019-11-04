const IO = require('socket.io');
let sc = null;

class SocketController {
    constructor(server) {
        this.io = IO.listen(server);
        this.init();
    }

    init() {
        console.log('initialize socket io!');
        this.io.on('connection', socket => console.log('client connected'));
    }

    emit(channel, message) {
        this.io.emit(channel, message);
    }
}

module.exports = {
    init: server => {
        if(sc) return;
        sc = new SocketController(server);
    },
    emit: (channel, message) => sc.emit(channel, message)
};


    /*
const connections = [];
let connection;
const init = io => {
    console.log('Initializing WebSocket!');
    io.on('connection', socket => {
        connections.push(socket);
    });
};

const emit = (channel, message) => {
    connections.

};

const emitOrder = (channel, order) => {
    connections.map(socket => {
        socket.emit(channel, order);
    });
};

module.exports = {
    init: server => {
        if(sc) return;
        sc = new SocketController(server);
    },
    emitOrder
};
*/
