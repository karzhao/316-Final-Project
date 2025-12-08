import { jsTPS_Transaction } from "jstps";

export default class RenamePlaylist_Transaction extends jsTPS_Transaction {
    constructor(store, playlistId, oldName, newName) {
        super();
        this.store = store;
        this.playlistId = playlistId;
        this.oldName = oldName;
        this.newName = newName;
    }

    async doTransaction() {
        await this.store.renamePlaylist(this.playlistId, this.newName);
    }

    async undoTransaction() {
        await this.store.renamePlaylist(this.playlistId, this.oldName);
    }
}
