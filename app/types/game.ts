import { type Component } from 'vue'

export interface GameResult {
  score: number
  level: number
  describe: string
}

export interface Game {
  name: string
  image?: string
  component: Component
  ref: string
  init: boolean,
  rank: {
    score: number
    level: number
  }[]
}

export interface GameScoreProps {
  visible: boolean
  gameResult: GameResult
  fitWidth: string
}

export type GameScoreCloseType = "off" | "exit"

export interface GameScoreEmits {
  (e: "on-close", type: GameScoreCloseType): void;
  (e: "on-restart"): void;
}
