import {ListenClient} from "./ListenClient.js";

const CLIENT_TIMEOUT = 5 * 60 * 1000;

class ClientManager {

    /**
     * Clients that are currently active
     * @type {ListenClient[]}
     */
    activeClients = [];

    constructor() {
        setInterval(() => {
            const clientsPendingClosure = this.activeClients.filter(x => x.inactiveSince && x.inactiveSince + CLIENT_TIMEOUT <= Date.now());
            clientsPendingClosure.forEach(client => {
                client.close();
            });

            this.activeClients = this.activeClients.filter(x => !x.inactiveSince || x.inactiveSince + CLIENT_TIMEOUT > Date.now());
            this.activeClients.forEach(client => {
                client.websockets.forEach(ws => {
                    ws.ws.ping();
                });
            });
        }, 30000);
    }

    /**
     * Binds a WebSocket to an active ListenClient
     * @param ws {WebSocket}
     * @param channel {string}
     * @returns {Promise<void>}
     */
    async bindWebsocket(ws, channel) {
        channel = channel.toLowerCase();

        let listenClient = this.activeClients.find(x => x.channel === channel);

        if (!listenClient) {
            listenClient = new ListenClient(channel);
            try {
                await listenClient.connect();
            } catch(err) {
                throw err;
            }
            this.activeClients.push(listenClient);
        }

        listenClient.addWebsocket(ws);
    }

}

export default new ClientManager();