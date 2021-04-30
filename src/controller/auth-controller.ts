import { Request, Response } from "express";
import User, { Skill } from "../entity/User";
import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";
import { Collection, Db, MongoClient } from "mongodb";

const INVALID_CREDENTIALS = { error: "Invalid credentials." };
export default class AuthController {

	static createToken(user: User) {
		return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "30m" });
	}

	static register(collection: Collection) {
		// TODO: We should really type check these! Good thing this is for a hackathon though.
		type RegisterRequestBody = {
			username: string;
			password: string;
			email: string;

			github: string | undefined;
			twitter: string | undefined;
			discord: string | undefined;
			facebook: string | undefined;
			linkedIn: string | undefined;

			skill: Skill;
			languages: string[];
		};
		return async (req: Request, res: Response) => {
			const body = req.body as RegisterRequestBody;
			if (!body.username || !body.password || !body.email || !body.skill) {
				res.status(400).json({ error: "Missing required fields " });
				return;
			}

			let existing = await collection.findOne({ username: body.username });
			let emailTaken = false;
			if (!existing) {
				existing = await collection.findOne({email: body.email});
				if (existing) emailTaken = true;
			}
			if (existing) {
				res.status(409).json({ error: emailTaken ? "An account with that email exists." : "That username is taken. "});
				return;
			}

			const user = new User();

			user.username = body.username;
			user.password = (await argon2.hash(body.password)).toString()
			user.email = body.email;
			user.skill = body.skill;
			user.languages = body.languages;

			if (body.twitter) {
				user.twitter = body.twitter;
			}

			if (body.github) {
				user.github = body.github;
			}

			if (body.facebook) {
				user.facebook = body.facebook;
			}

			if (body.discord) {
				user.discord = body.discord;
			}

			if (body.linkedIn) {
				user.linkedIn = body.linkedIn;
			}

			collection.insertOne(user);
			res.status(200).json({ token: this.createToken(user) });
		}
	}

	static logIn(collection: Collection) {
		type LogInRequestBody = {
			username: string;
			password: string;
		}
		return async (req: Request, res: Response) => {
			const body = req.body as LogInRequestBody;
			if (!body.username || !body.password) {
				res.status(400).json("Please provide a username *and* password.");
				return;
			}

			const user: User | undefined = await collection.findOne({ username: body.username as string });
			if (!user) {
				res.status(401).json(INVALID_CREDENTIALS);
				return;
			}

			const verified = await argon2.verify(user.password, body.password as string);
			if (!verified) {
				res.status(401).json(INVALID_CREDENTIALS);
				return;
			}

			res.status(200).json({ token: this.createToken(user) });
		};
	}

}