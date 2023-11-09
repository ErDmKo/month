export const TEAM_LEFT = 0 as const;
export const TEAM_RIGHT = 1 as const;

export type Sides = {
    TEAM_LEFT: typeof TEAM_LEFT;
    TEAM_RIGHT: typeof TEAM_RIGHT;
};
export const LOG_TYPE = 0 as const;
export const COMMAND_TYPE = 1 as const;
export const STOP_TYPE = 2 as const;
export const START_TYPE = 3 as const;

export type Commands =
    | [typeof LOG_TYPE, string]
    | [typeof COMMAND_TYPE, Sides[keyof Sides]]
    | [typeof STOP_TYPE]
    | [typeof START_TYPE];

export const TEAM_LEFT_NAME = 'first';
export const TEAM_RIGHT_NAME = 'second';

export const WORDS_TO_COMMANDS: Record<string, Commands | undefined> = {
    [TEAM_LEFT_NAME]: [COMMAND_TYPE, TEAM_LEFT],
    [TEAM_RIGHT_NAME]: [COMMAND_TYPE, TEAM_RIGHT],
};

export const STOP_COMMAND = 'stop';
