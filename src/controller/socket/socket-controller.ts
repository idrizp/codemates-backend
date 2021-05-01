import { Server, Socket } from "socket.io";
import * as jwt from "jsonwebtoken";
import { authenticatedOnlySocket } from "../../middleware/auth-middleware";
import { Collection } from "mongodb";
import User from "../../entity/User";

export default class SocketController {

	private socketToUser: Map<Socket, string> = new Map();
	private userToSocket: Map<string, Socket> = new Map();
	
	constructor(
		server: Server, 
		private collection: Collection
	) {
		server.use(authenticatedOnlySocket(collection));
		server.on("connect", (socket) => {
			this.socketToUser.set(socket, socket.data.user.id);
			this.userToSocket.set(socket.data.user.id, socket);
			socket.on("disconnect", () => {
				this.socketToUser.delete(socket);
				this.userToSocket.delete(socket.data.user.id);
			});
		});
	}

	getSocket(userId: string): Socket | undefined {
		return this.userToSocket.get(userId);
	}

	async getUser(socket: Socket): Promise<User | undefined> {
		const id = this.socketToUser.get(socket);
		if (!id) return undefined;
		
		const user = await this.collection.findOne({ id: id });
		if (!user) return undefined;

		return user;
	}

	getUserId(socket: Socket): string | undefined {
		const id = this.socketToUser.get(socket);
		if (!id) return undefined;
		return id;
	}

}