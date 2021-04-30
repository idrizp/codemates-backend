import { BaseEntity, Column, Generated, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

export default class User extends BaseEntity {

	@PrimaryGeneratedColumn()
	@Generated("uuid")
	id: string;

	@Column({ type: "varchar", length: 64 })
	username: string;

	@Column({ type: "text" })
	email: string;

	@Column({ type: "text" })
	password: string;

	@Column({ type: "varchar", nullable: true })
	github: string;

	@Column({ type: "varchar", nullable: true })
	twitter: string;

	@Column({ type: "varchar", nullable: true })
	facebook: string;

	@Column({ type: "varchar", nullable: true })
	discord: string;

}