
import CryptoJS from 'crypto-js';

// Generate a public hash of the server seed (The "Commit")
export function commitHash(serverSeed: string): string {
  return CryptoJS.SHA256(serverSeed).toString(CryptoJS.enc.Hex);
}

/**
 * Modified Crash Multiplier Generation for "Slim" Large Wins
 * 1. Use HMAC-SHA256 to generate a deterministic random value.
 * 2. Increase Instant Crash (1.00x) probability to 3%.
 * 3. Apply a damping exponent to the standard multiplier formula.
 *    This keeps small wins common but makes large multipliers exponentially rarer.
 */
export function computeCrashFromSeed(serverSeed: string, clientSeed: string, nonce: number): number {
  const hmacInput = `${clientSeed}:${nonce}`;
  const hmac = CryptoJS.HmacSHA256(hmacInput, serverSeed).toString(CryptoJS.enc.Hex);

  // Instant Crash Rule: Increased to ~3% (hash % 100 < 3)
  // We use a portion of the hash for the modulo check
  const instantCrashCheck = parseInt(hmac.slice(0, 8), 16) % 100;
  if (instantCrashCheck < 3) {
    return 1.00;
  }

  // Standard Crash Calculation with Damping
  // 1. Extract first 52 bits (13 hex characters)
  const slice = hmac.slice(0, 13);
  const r = parseInt(slice, 16);
  
  // 2. Normalize X = r / 2^52 -> X is in range [0, 1)
  const max52Bit = Math.pow(2, 52);
  const X = r / max52Bit;

  /**
   * SLIM WIN FORMULA:
   * Instead of: Multiplier = HouseEdge / (1 - X)
   * We use: Multiplier = HouseEdge * ( (1 / (1 - X)) ^ DampingExponent )
   * 
   * houseEdge = 0.96 (4% baseline edge)
   * dampingExponent = 0.7 (drastically reduces the tail of high multipliers)
   */
  const houseEdge = 0.96;
  const dampingExponent = 0.7;
  
  const baseValue = 1 / (1 - X);
  const rawMultiplier = houseEdge * Math.pow(baseValue, dampingExponent);
  
  // Rounding must be downward to two decimal places, minimum 1.00x
  const result = Math.floor(rawMultiplier * 100) / 100;

  return Math.max(1.00, result);
}

export function generateServerSeed(): string {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
}
