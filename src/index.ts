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
import authenticatedOnly from "./middleware/auth-middleware";
import { Server } from "socket.io";

(async () => {
	try {
		const client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });
		await client.connect();

		const database = client.db();
		
		const usersCollection = database.collection("users");
		usersCollection.createIndex({ id: "hashed" });

		const gameCollection = database.collection("games");;
		gameCollection.createIndex({ id: "hashed" });

		const app = express();
		const server = http.createServer(app);
		
		const socket = new Server();
		
		const io = socket.listen(server);
		

		app.use(helmet());
		app.use(cors());
		
		app.use(express.json());
		app.use(express.urlencoded({ extended: true }));

		app.get("/api/match", authenticatedOnly(usersCollection), MatchController.matchUsers(usersCollection));
		app.post("/api/login", AuthController.logIn(usersCollection));
		app.post("/api/register", AuthController.register(usersCollection));
		
		server.listen(process.env.PORT, () => {
			console.log(`Listening to port ${process.env.PORT}`);
		});

	} catch (err) {
		throw err;
	}
})().catch(err => {
	throw err;
});