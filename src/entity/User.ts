import { v4 as generateUUID } from "uuid";
export default class User {
	constructor(
		public id: string = generateUUID(),
		public username: string = "",
		public email: string = "",
		public password: string = "",
		public github: string = "",
		public twitter: string = "",
		public facebook: string = "",
		public discord: string = "",
		public linkedIn: string = "",
		public skill: Skill = Skill.BEGINNER,
		public languages: string[] = []) {
	}
}

export enum Skill {
	BEGINNER,
	INTERMEDIATE,
	ADVANCED
}