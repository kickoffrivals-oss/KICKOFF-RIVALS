
import { GameStatus } from './types';
import { computeCrashFromSeed, generateServerSeed, commitHash } from './provablyFair';
import { GAME_SPEED_FACTOR, IDLE_TIME_MS } from './constants';

export type EngineState = {
  status: GameStatus;
  roundId: number;
  multiplier: number;
  commit: string;
  reveal: string | null;
  startTime: number;
  nextStartTime: number;
  nonce: number;
};

type Listener = (state: EngineState) => void;

export class GameEngine {
  private status: GameStatus = GameStatus.IDLE;
  private roundId: number = 0;
  private nonce: number = 0;
  private serverSeed: string = "";
  private clientSeed: string = "aviator-newspaper-client-seed-v1"; // Custom client seed
  private crashPoint: number = 1.00;
  private startTime: number = 0;
  private crashTime: number = 0;
  private nextStartTime: number = 0;
  
  private listeners: Set<Listener> = new Set();
  private loopId: number | null = null;

  constructor() {
    this.prepareNextRound();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): EngineState {
    const currentMult = this.calculateCurrentMultiplier();
    
    return {
      status: this.status,
      roundId: this.roundId,
      multiplier: currentMult,
      commit: commitHash(this.serverSeed),
      reveal: this.status === GameStatus.CRASHED ? this.serverSeed : null,
      startTime: this.startTime,
      nextStartTime: this.nextStartTime,
      nonce: this.nonce
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(l => l(state));
  }

  private calculateCurrentMultiplier(): number {
    if (this.status === GameStatus.IDLE) return 1.00;
    if (this.status === GameStatus.CRASHED) return this.crashPoint;

    const now = Date.now();
    const elapsed = now - this.startTime;
    
    // Formula: M = e^(k * t)
    const m = Math.exp(GAME_SPEED_FACTOR * elapsed);
    return Math.min(m, this.crashPoint);
  }

  private prepareNextRound() {
    this.roundId++;
    this.nonce++; // Increment nonce per round
    this.status = GameStatus.IDLE;
    
    // Provably Fair Generation
    this.serverSeed = generateServerSeed();
    this.crashPoint = computeCrashFromSeed(this.serverSeed, this.clientSeed, this.nonce);
    
    const now = Date.now();
    this.nextStartTime = now + IDLE_TIME_MS;
    
    this.notify();

    const timeUntilStart = this.nextStartTime - now;
    setTimeout(() => this.startFlight(), timeUntilStart);
  }

  private startFlight() {
    this.status = GameStatus.FLYING;
    this.startTime = Date.now();
    
    // Deterministic duration based on speed factor
    const durationMs = Math.log(this.crashPoint) / GAME_SPEED_FACTOR;
    this.crashTime = this.startTime + durationMs;
    
    this.notify();
    this.loopId = setInterval(() => this.tick(), 100) as unknown as number;
  }

  private tick() {
    if (this.status !== GameStatus.FLYING) return;
    if (Date.now() >= this.crashTime) {
      this.crash();
    }
  }

  private crash() {
    if (this.loopId) clearInterval(this.loopId);
    this.status = GameStatus.CRASHED;
    this.notify();

    setTimeout(() => {
      this.prepareNextRound();
    }, 4000);
  }
}

export const engine = new GameEngine();
