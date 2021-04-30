import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import User from "./User";

@Entity()
export default class Language extends BaseEntity {

	@PrimaryColumn({ type: "text" })
	name: string;

	@ManyToMany(type => User, user => user.languages)
	users: User[];

}