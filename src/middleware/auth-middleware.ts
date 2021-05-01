import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { Collection } from "mongodb";
import { Socket } from "socket.io";
import User from "../entity/User";

export default function authenticatedOnly(collection: Collection) {
	return async (req: Request, res: Response, next: NextFunction) => {
		const authorization = req.headers["authorization"];
		if (!authorization) {
			res.status(401).json({ error: "Unauthorized." });
			return;
		}
		//Bearer  <-- 7 chars(incl space)
		const bearerToken = authorization.substring(7);
		if (bearerToken.length === 0) {
			res.status(401).json({ error: "Invalid token provided." });
			return;
		}

		try {
			const id = jwt.verify(bearerToken, process.env.JWT_SECRET)["id"];
			const user: User | undefined = await collection.findOne({ id: id });
			if (!user) {
				res.status(400).json({ error: "Invalid token provided." });
				return;
			}
			req["user"] = user;
			next();
		} catch (err) {
			res.status(401).json({ error: "Invalid token provided." });
			return;
		}
	}
}

export function authenticatedOnlySocket(collection: Collection) {
	return async (socket: Socket, next) => {
		const token = socket.handshake.auth.token;
		if (!token) {
			next(new Error("Provide an authentication token."));
			return;
		}
		try {
			const data = jwt.verify(token, process.env.JWT_SECRET);
			const user = collection.findOne({id: data["id"]});
			if (!user) {
				next(new Error("Invalid token."));
				return;
			}
			socket.data.user = user;
			next();
		} catch(err) {
			next(new Error("Invaid token."));
			return;
		}			
	}
}