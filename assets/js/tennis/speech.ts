import { bindArg, delayOperator, ObserverInstance, on } from '@month/utils';
import { 
  GameState,
  SERVE,
  TEAM_LEFT,
  TEAM_RIGHT,
  TEAM_NAMES
} from './const';

export const startListen = (
  ctx: Window,
  observerObj: ObserverInstance<GameState, any>
) => {
    const synth = ctx.speechSynthesis;
    const internalObserver: ObserverInstance<GameState> = 
      observerObj(bindArg(100, delayOperator));
    internalObserver(bindArg((state: GameState) => {
      const {
        [TEAM_LEFT]: teamLeft,
        [TEAM_RIGHT]: teamRight,
        [SERVE]: serve
      } = state;
      const server = TEAM_NAMES[serve];
      const text = `Serving ${server} score ${teamLeft} ${teamRight}`;
      console.log(text);
      const utterThis = new SpeechSynthesisUtterance(text);
      synth.speak(utterThis);
    }, on));
    return observerObj;
};
