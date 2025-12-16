import { type Activity } from "./types";

// ============================================================================
// GAME MECHANICS CONSTANTS
// ============================================================================

/** Minimum ticket price in USDC */
export const MIN_TICKET_PRICE = 1;

/** Starting win chance percentage */
export const STARTING_WIN_CHANCE = 1;

/** Win chance increment per play (in percentage points) */
export const WIN_CHANCE_INCREMENT = 1;

/** Maximum win chance percentage */
export const MAX_WIN_CHANCE = 10;

/** Percentage of pot awarded to winner (0.25 = 25%) */
export const WIN_POT_PERCENTAGE = 0.25;

/** Percentage of contribution going to pot (0.5 = 50%) */
export const POT_SPLIT_PERCENTAGE = 0.5;

/** Percentage of contribution going to developer (0.5 = 50%) */
export const DEV_SPLIT_PERCENTAGE = 0.5;

// ============================================================================
// PAYMENT & BLOCKCHAIN CONSTANTS
// ============================================================================

/** Potshot contract address on Base */
export const POTSHOT_CONTRACT_ADDRESS = "0xfEad3B67778033cBAA4386a96e4EA2CDE4bfD7E8" as const; // TODO: Replace with actual deployed contract address

/** USDC contract address on Base Mainnet */
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

/** Estimated gas fee in ETH for transactions */
export const ESTIMATED_GAS_FEE = 0.0001;

/** Quick amount options for ticket purchase (in USDC) */
export const QUICK_AMOUNTS = [1, 5, 10, 25] as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

/** Animation delay increments for staggered fade-ins */
export const ANIMATION_DELAYS = {
  FIRST: 0.2,
  SECOND: 0.3,
  THIRD: 0.4,
  FOURTH: 0.5,
} as const;

/** Game flow steps for "How It Works" section */
export const GAME_STEPS = [
  {
    number: 1,
    title: "Get USDC on Base Network",
    description: "Connect you Metamask and top up with some USDC and ETH (for gas) on Base chain",
    color: "orange" as const,
  },
  {
    number: 2,
    title: "Min $1, Contribute More",
    description: "1 ticket entry per play. Pay more to grow the pot faster",
    color: "accent" as const,
  },
  {
    number: 3,
    title: "Build Your Odds",
    description: `Start at ${STARTING_WIN_CHANCE}%, gain +${WIN_CHANCE_INCREMENT}% each play (max ${MAX_WIN_CHANCE}%)`,
    color: "orange" as const,
  },
  {
    number: 4,
    title: "Win Big",
    description: `Hit your chance = ${WIN_POT_PERCENTAGE * 100}% of pot. Reset to ${STARTING_WIN_CHANCE}% & play again`,
    color: "accent" as const,
  },
] as const;

// ============================================================================
// DEFAULT VALUES - Shown while loading
// ============================================================================

/** Default placeholder for addresses */
export const DEFAULT_ADDRESS = "0x0000...0000";

/** Default placeholder for numeric values */
export const DEFAULT_VALUE = "--";

/** Default placeholder for amounts */
export const DEFAULT_AMOUNT = "--";

/** Default placeholder for percentages */
export const DEFAULT_PERCENTAGE = "--";

// ============================================================================
// MOCK DATA - Replace with actual blockchain data
// ============================================================================

/** Mock data for live activity feed */
export const mockActivity: Activity[] = [
  {
    address: "0x742d...f4d2",
    amount: "5 USDC",
    chance: "4%",
    won: true,
    winAmount: "+125 USDC",
    time: "2m ago",
  },
  {
    address: "0x8ba1...45dc",
    amount: "10 USDC",
    chance: "6%",
    won: false,
    time: "5m ago",
  },
  {
    address: "0x1234...5678",
    amount: "2 USDC",
    chance: "10%",
    won: false,
    time: "10m ago",
  },
];


/** Mock Base USDC balance - replace with actual wagmi balance */
export const MOCK_BASE_USDC_BALANCE = 125.50;

/** Mock Base ETH balance - replace with actual wagmi balance */
export const MOCK_BASE_ETH_BALANCE = 0.0015;

/** Mock game state values - replace with actual contract data */
export const MOCK_GAME_STATE = {
  currentPot: 523.45,
  userChance: 1,
  usdcPaidOut: 1247.89,
  usdcToDev: 892.50,
  totalPlays: 342,
} as const;
