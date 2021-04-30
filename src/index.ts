import "reflect-metadata";

import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import * as helmet from "helmet";
import * as cors from "cors";
import { createConnection, Connection } from "typeorm";
import AuthController from "./controller/auth-controller";
import User from "./entity/User";
import Language from "./entity/Language";

(async () => {
	try {
		const connection = await createConnection({
			type: "postgres",
			url: process.env.POSTGRES_URL,
			entities: [User, Language]
		});
		await connection.synchronize(true);

		const app = express();
		app.use(helmet());
		app.use(cors());

		app.use(express.json());
		app.use(express.urlencoded({ extended: true }));

		app.post("/api/login", AuthController.logIn());
		app.post("/api/register", AuthController.register());

		app.listen(process.env.PORT, () => {
			console.log(`Listening to port ${process.env.PORT}`);
		});

	} catch (err) {
		throw err;
	}
})().catch(err => {
	throw err;
});