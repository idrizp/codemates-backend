import { Request, Response } from "express";
import { Collection, Cursor } from "mongodb";
import User from "../entity/User";

export default class MatchController {

	static matchUsers(collection: Collection) {
		return async (req: Request, res: Response) => {
			const user: User = req["user"];
			const matched: Cursor<User> = collection.find({
				id: {
					$ne: user.id
				},
				languages: {
					$in: [...user.languages]
				}
			});
			
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