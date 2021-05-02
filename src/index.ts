import "reflect-metadata";

import * as dotenv from "dotenv";
dotenv.config();

import * as http from "http";
import * as express from "express";
import * as helmet from "helmet";
import * as cors from "cors";
import { MongoClient } from "mongodb";
import AuthController from "./controller/auth-controller";
import MatchController from "./controller/match-controller";
import authenticatedOnly, { authenticatedOnlySocket } from "./middleware/auth-middleware";
import { Server } from "socket.io";
import UserController from "./controller/user-controller";
import SocketController from "./controller/socket/socket-controller";

(async () => {
	try {
		const client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });
		await client.connect();

		const database = client.db();
		
		const userCollection = database.collection("users");
		userCollection.createIndex({ id: "hashed" });

		const gameCollection = database.collection("games");
		gameCollection.createIndex({ id: "hashed" });

		const inviteCollection = database.collection("invites");
		inviteCollection.createIndex({ id: "hashed" });

		const app = express();
		const server = http.createServer(app);
		const socketServer = new Server();

		const io = socketServer.listen(server);
		
		const socketController = new SocketController(io, userCollection);

		app.use(helmet());
		app.use(cors());
		
		app.use(express.json());
		app.use(express.urlencoded({ extended: true }));

		app.post("/api/match/{user}/invite", authenticatedOnly(userCollection), MatchController.invite(userCollection, inviteCollection));
		app.post("/api/match/{invite}/accept", authenticatedOnly(userCollection), MatchController.acceptInvite(userCollection, inviteCollection, socketController));
		app.post("/api/match/friend/{user}", authenticatedOnly(userCollection), MatchController.addFriend(userCollection));
		app.get("/api/match", authenticatedOnly(userCollection), MatchController.matchUsers(userCollection));
		app.get("/api/profile", authenticatedOnly(userCollection), UserController.getProfile(userCollection));
		app.post("/api/login", AuthController.logIn(userCollection));
		app.post("/api/register", AuthController.register(userCollection));
		
		server.listen(process.env.PORT, () => {
			console.log(`Listening to port ${process.env.PORT}`);
		});

	} catch (err) {
		throw err;
	}
})().catch(err => {
	throw err;
});