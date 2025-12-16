export interface Activity {
  address: string;
  amount: string;
  chance: string;
  won: boolean;
  winAmount?: string;
  time: string;
}

export interface UserBalance {
  chain: string;
  asset: string;
  balance: number;
  usdValue?: number;
  icon: string;
  color: string;
}

export interface GameState {
  currentPot: number;
  userChance: number;
  usdcPaidOut: number;
  usdcToDev: number;
  totalPlays: number;
}

export interface PaymentInfo {
  selectedPayment: UserBalance | null;
  contributionAmount: number;
  hasEnoughUSDC: boolean;
  hasEnoughGas: boolean;
  canBuyDirectly: boolean;
}
