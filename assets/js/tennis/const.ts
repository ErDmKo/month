export const TEAM_LEFT = 0 as const;
export const TEAM_RIGHT = 1 as const;

export type Sides = {
  TEAM_LEFT: typeof TEAM_LEFT,
  TEAM_RIGHT: typeof TEAM_RIGHT
}
