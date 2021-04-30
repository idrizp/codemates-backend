import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import * as helmet from "helmet";
import * as cors from "cors";
import { createConnection, Connection } from "typeorm";

(async () => {
	try {
		const connection = await createConnection({
			type: "postgres",
			url: process.env.POSTGRES_URL
		});

		const app = express();
		app.use(helmet());
		app.use(cors());

		app.use(express.json());
		app.use(express.urlencoded());

		app.listen(process.env.PORT, () => {
			console.log(`Listening to port ${process.env.PORT}`);
		})
	} catch (err) {
		throw err;
	}
})();