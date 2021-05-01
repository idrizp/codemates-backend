import User from "../entity/User";
import Game from "./challenge";
import { v4 as generateUUID } from "uuid";

export default class GameManager {

    private playing: Set<string> = new Set();
    private games: Map<string, Game> = new Map();

    isPlaying(user: string | User) {
        if (user instanceof User)
            return this.playing.has(user.id);
        else 
            return this.playing.has(user);
    }

    createGame(challenger: string, challenged: string): Game {
        const game = new Game(this, generateUUID(), challenger, challenged);
        this.playing.add(challenger);
        this.playing.add(challenged);
        this.games.set(game.id, game);
        return game;
    }

    removeGame(gameId: string) {
        this.games.delete(gameId);
    }

}