// Déclaration de la classe ScratchLink, qui imite le comportement d'un WebSocket
class ScratchLink {

    // Constructeur : initialise un nouveau ScratchLink ou un WebSocket classique si l'URL ne correspond pas
    constructor(url) {
        // Match any WSS/WS connection ending in /scratch/ble or /scratch/bt
        // This catches 127.0.0.1, localhost, and device-manager on ANY port.
        const scratchLinkPattern = /^wss?:\/\/.*\/scratch\/(ble|bt)$/;

        if (!scratchLinkPattern.test(url)) {
            // Pass through standard WebSockets (like Multiplayer games)
            return new ScratchLink.WebSocket(url);
        }

        console.log("🚀 CodePM: Intercepted Scratch Link connection:", url);
        this.url = url;
        this._open();
    }
    
    constructor_old(url) {
        if (!url.startsWith('wss://device-manager.scratch.mit.edu:20110/scratch/')) {
            console.log(url)
            return new ScratchLink.WebSocket(url);
        }

        this.url = url;
        this._open();
    }

    _open() {
        this.socketId = ScratchLink.socketId;
        ScratchLink.sockets.set(ScratchLink.socketId, this);
        ScratchLink.socketId++;

        this._postMessage({
            method: 'open',
            socketId: this.socketId,
            url: this.url
        });

        setTimeout(() => {
            this.onopen();
        }, 100);
    }

    close() {
        this._postMessage({
            method: 'close',
            socketId: this.socketId
        });

        this.onclose();

        ScratchLink.sockets.delete(this.socketId);
    }

    send(message) {
        this._postMessage({
            method: 'send',
            socketId: this.socketId,
            jsonrpc: message
        });
    }

    _postMessage(message) {
        webkit.messageHandlers.scratchLink.postMessage(JSON.stringify(message));
    }

    handleMessage(message) {
        this.onmessage({
            data: message
        });
    }
}

ScratchLink.socketId = 0;
ScratchLink.sockets = new Map();

ScratchLink.CONNECTING = window.WebSocket.CONNECTING;
ScratchLink.OPEN = window.WebSocket.OPEN;
ScratchLink.CLOSING = window.WebSocket.CLOSING;
ScratchLink.CLOSED = window.WebSocket.CLOSED;

ScratchLink.WebSocket = window.WebSocket;
window.WebSocket = ScratchLink;
