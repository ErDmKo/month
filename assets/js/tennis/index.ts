import { bindArg, observer, on, trigger } from "@month/utils";
import { Sides, TEAM_LEFT, TEAM_RIGHT } from "./const";
import { Commands, COMMAND_TYPE, LOG_TYPE, startListen } from "./speech";

const SERVE = '🏓' as const;
const LOG = 3 as const;

type GameState = {
  [TEAM_LEFT]: number,
  [TEAM_RIGHT]: number,
  [SERVE]: Sides[keyof Sides],
  [LOG]: string[]
}
const eventOptions = { passive: true };

const initTemplate = (ctx: Window, element: Element) => {
    const state: GameState = {
      [TEAM_LEFT]: 0,
      [TEAM_RIGHT]: 0,
      [SERVE]: TEAM_LEFT,
      [LOG]: []
    };
    const gameStateObserver = observer<number, void>();
    const htmlElement = element as HTMLDivElement;
    htmlElement.innerText = '';
    htmlElement.classList.add('tennis');
    const wrapper = ctx.document.createElement('div');
    wrapper.classList.add('wrapper');
    const plusOneLeft = ctx.document.createElement('button');
    plusOneLeft.classList.add('pOneL');
    plusOneLeft.innerText = '+1 Yellow';
    const plusOneRight = ctx.document.createElement('button');
    plusOneRight.classList.add('pOneR');
    plusOneRight.innerText = '+1 Right';
    const scoreElement = ctx.document.createElement('span');
    scoreElement.classList.add('score');
    scoreElement.innerText = `${SERVE}0:0`;

    const logElement = ctx.document.createElement('div');
    logElement.classList.add('log');

    gameStateObserver(bindArg(()=>{
      const {
        [TEAM_LEFT]: teamLeft,
        [TEAM_RIGHT]: teamRight, 
        [SERVE]: serve
      } = state;

      logElement.innerHTML = state[LOG]
        .map((log, i) => `<div>${i}: "${log}"</div>`).join('');

      if (teamLeft == 0 && teamRight == 0) {
        return;
      }
      if (!((teamRight + teamLeft) % 2)) {
        state[SERVE] = serve == TEAM_RIGHT ? TEAM_LEFT : TEAM_RIGHT;
      }
      const leftBall = state[SERVE] == TEAM_LEFT ? SERVE : '';
      const rightBall = state[SERVE] == TEAM_RIGHT ? SERVE : '';
      scoreElement.innerText = `${leftBall}${teamLeft}:${teamRight}${rightBall}`;
    }, on));

    htmlElement.appendChild(wrapper);
    wrapper.appendChild(plusOneLeft);
    wrapper.appendChild(scoreElement);
    wrapper.appendChild(plusOneRight);
    wrapper.appendChild(logElement);

    const voiceControlObserver = startListen(ctx);
    voiceControlObserver(bindArg((command: Commands) => {
      const [type, data] = command;
      if (type === COMMAND_TYPE) {
        state[data] += 1;
      }
      if (type === LOG_TYPE) {
        state[LOG].unshift(data);
        if (state[LOG].length > 5) {
          state[LOG].pop();
        }
      }
      gameStateObserver(bindArg(0, trigger));
    }, on));

    plusOneLeft.addEventListener('click', () => {
      state[TEAM_LEFT] += 1;
      gameStateObserver(bindArg(0, trigger));
    }, eventOptions);
    plusOneRight.addEventListener('click', () => {
      state[TEAM_RIGHT] += 1;
      gameStateObserver(bindArg(0, trigger));
    }, eventOptions);
}

export const initTennisEffect = (ctx: Window) => {
    const tags = ctx.document.querySelectorAll('.js-tennis');
    ctx.Array.from(tags).forEach(bindArg(ctx, initTemplate));
}
