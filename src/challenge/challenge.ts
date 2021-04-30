export default class Game {

	private wins: Map<string, Challenge[]> = new Map();
	private submitted: Set<string> = new Set();

	public challengeStartTimestamp: number;
	public currentChallenge: Challenge | undefined;

	constructor(
		public id: string,
		public challenger: string,
		public challenged: string,
	) {
		this.wins.set(challenger, []);
		this.wins.set(challenged, []);
	}

	setChallenge(challenge: Challenge) {
		if (this.submitted.has(this.challenger)) {
			this.wins.get(this.challenger).push(this.currentChallenge);
		}
		if (this.submitted.has(this.challenged)) {
			this.wins.get(this.challenged).push(this.currentChallenge);
		}
		this.currentChallenge = challenge;
	}

	/**
	 * Returns the winner of the game.
	 * @returns the id of the user who has won, or undefined if the game was a tie.
	 */
	getWinner(): string | undefined {
		let challengerWins = this.wins.get(this.challenger);
		let challengedWins = this.wins.get(this.challenged);

		if (challengerWins.length === challengedWins.length)
			return undefined;

		if (challengerWins.length > challengedWins.length) {
			return this.challenger;
		}

		return this.challenged;
	}

}

export class Challenge {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public time: number
	) {}
}