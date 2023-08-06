import { bindArg, observer, on, trigger } from "@month/utils";

const TEAM_LEFT = 'L';
const TEAM_RIGHT = 'R';

type GameState = {
  teamLeft: number,
  teamRight: number,
  serve: typeof TEAM_LEFT | typeof TEAM_RIGHT | ''
}

const initTemplate = (ctx: Window, element: Element) => {
    const state = {
      teamLeft: 0,
      teamRight: 0,
      serve: ''
    } as GameState;
    const gameStateObserver = observer<number, void>();
    const htmlElement = element as HTMLDivElement;
    htmlElement.innerText = '';
    htmlElement.classList.add('tennis');
    const wrapper = ctx.document.createElement('div');
    wrapper.classList.add('wrapper');
    const plusOneLeft = ctx.document.createElement('button');
    plusOneLeft.classList.add('pOneL');
    plusOneLeft.innerText = '+1 Left';
    const plusOneRight = ctx.document.createElement('button');
    plusOneRight.classList.add('pOneR');
    plusOneRight.innerText = '+1 Right';
    const scoreElement = ctx.document.createElement('span');
    scoreElement.classList.add('score');
    scoreElement.innerText = '0:0';

    gameStateObserver(bindArg(()=>{
      if (state.serve == '') {
        state.serve = state.teamLeft ? TEAM_LEFT : TEAM_RIGHT;
      }
      const {teamLeft, teamRight, serve} = state;
      if (!((teamRight + teamLeft) % 2)) {
        state.serve = serve == TEAM_RIGHT ? TEAM_LEFT : TEAM_RIGHT;
      }
      const leftBall = state.serve == TEAM_LEFT ? '🎾' : '';
      const rightBall = state.serve == TEAM_RIGHT ? '🎾' : '';
      scoreElement.innerText = `${leftBall}${teamLeft}:${teamRight}${rightBall}`;
    }, on));

    htmlElement.appendChild(wrapper);
    wrapper.appendChild(plusOneLeft);
    wrapper.appendChild(scoreElement);
    wrapper.appendChild(plusOneRight);

    plusOneRight.addEventListener('click', () => {
      state.teamRight += 1;
      gameStateObserver(bindArg(0, trigger));
    }, { passive: true });
    plusOneLeft.addEventListener('click', () => {
      state.teamLeft += 1;
      gameStateObserver(bindArg(0, trigger));
    }, { passive: true });
}

export const initTennisEffect = (ctx: Window) => {
    const tags = ctx.document.querySelectorAll('.js-tennis');
    ctx.Array.from(tags).forEach(bindArg(ctx, initTemplate));
}
