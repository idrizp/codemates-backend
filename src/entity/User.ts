import { BaseEntity, Column, Entity, Generated, JoinTable, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn, Table } from "typeorm";
import Language from "./Language";

@Entity()
export default class User extends BaseEntity {

	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 64 })
	username: string;

	@Column({ type: "text" })
	email: string;

	@Column({ type: "text" })
	password: string;

	@Column({ nullable: true })
	github: string;

	@Column({ nullable: true })
	twitter: string;

	@Column({ nullable: true })
	facebook: string;

	@Column({ nullable: true })
	discord: string;

	@Column({ nullable: true })
	linkedIn: string;

	@Column("text")
	skill: Skill;

	@ManyToMany(type => Language, language => language.users)
	@JoinTable()
	languages: Language[];

}

export enum Skill {
	BEGINNER,
	INTERMEDIATE,
	ADVANCED
}