import { request, Request, Response } from "express";
import { Collection, Cursor } from "mongodb";
import { v4 as generateUUID } from "uuid";
import MatchInvite from "../entity/MatchInvite";
import User from "../entity/User";
import SocketController from "./socket/socket-controller";

export default class MatchController {

	static addFriend(userCollection: Collection) {
		return async (req: Request, res: Response) => {
			const user: User = req["user"];
			const target: User | undefined = await userCollection.findOne({ 
				id: req.params.user,
				skill: user.skill,
				languages: {
					$in: [...user.languages]
				} 
			});
			if (!target) {
				res.status(404).json({ error: "User not found. You can only be friends with people in your skillset." });
				return;
			}
			userCollection.updateOne({ id: user.id }, { $push: { friends: target.id }});
			res.status(200).json({ friend: target.id });
		}
	}

	static invite(userCollection: Collection, inviteCollection: Collection) {
		return async (req: Request, res: Response) => {
			const inviter: User = req["user"];
			
			const invitedId = req.params.user;
			const invitedUser: User = await userCollection.findOne({ 
				id: invitedId, 
				languages: {
					$in: inviter.languages,
				},
				skill: inviter.skill
			});

			if (!invitedUser) {
				res.status(404).json({ error: "User not found." });
				return;
			}
		
			if (await inviteCollection.findOne({
				invited: invitedUser.id,
				time: {
					$lte: Date.now() - 60 * 1000 * 30
				}
			})) {
				res.status(403).json({ error: "That user already has a pending invite." });
			}

			const invite = new MatchInvite(
				generateUUID(),
				inviter.id,
				invitedUser.id,
				Date.now()
			);
			inviteCollection.insertOne(invite);
			
			res.status(200).json({ invite });
			return;
		}
	}

	static acceptInvite(
		userCollection: Collection, 
		inviteCollection: Collection,
		socketController: SocketController	
	) {
		return async (req: Request, res: Response) => {
			const user: User = req["user"];
			const inviteId: string = req.params.invite;
			
			const invite: MatchInvite = await inviteCollection.findOne({ id: inviteId });
			if (invite.inviter === user.id) {
				res.status(403).json({ error: "You can't accept your own invite." });
				return;
			}
			if (!invite) {
				res.status(404).json({ error: "Invite not found." });
				return;
			}

			const socket = socketController.getSocket(invite.inviter);
			if (!socket) {
				await inviteCollection.deleteOne({ id: invite.id });
				res.status(400).json({ error: "User is not online, so the invite was cancelled. "});
				return;
			}

			// TODO: Start game
		}
	}

	static getFriends(userCollection: Collection) {
		return async (req: Request, res: Response) => {
			const user: User = req["user"];
			res.status(200).json({ friends: user.friends });
		}
	}

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