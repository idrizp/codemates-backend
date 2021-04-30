import { request, Request, Response } from "express";
import { Collection, Cursor } from "mongodb";
import User from "../entity/User";

export default class MatchController {

	static matchUsers(collection: Collection) {
		return async (req: Request, res: Response) => {
			let page: number = 1;
			if (req.query && req.query.page) {
				page = Number.parseInt(req.query.page.toString()) || 1
			}
			const user: User = req["user"];
			const matched: Cursor<User> = collection.find({
				id: {
					$ne: user.id
				},
				skill: {
					$eq: user.skill
				},
				languages: {
					$in: [...user.languages]
				}
			})
			.skip((page - 1) * 10)
			.limit(10);
			
			const matchedUsers = await matched.toArray()
			res.status(200).json({
				users: matchedUsers.map(found => {
					delete found.password;
					delete found.email;
					delete found["_id"];
					return found;
				})
			});
		};
	}

}