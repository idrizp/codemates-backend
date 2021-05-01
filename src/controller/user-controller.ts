import { Request, Response } from "express";
import { Collection } from "mongodb";
import User from "../entity/User";

export default class UserController {

    static getProfile(collection: Collection) {
        return async (req: Request, res: Response) => {
            let id = req.query.id ? req.query.id : req["user"]["id"];
            const userProfile: User | undefined = await collection.findOne({ id: id });
            if (!userProfile) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            delete userProfile.password;
            res.status(200).json({ profile: userProfile });
        }
    }

}