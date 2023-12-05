import { bindArg, observer, on, trigger } from '@month/utils';
import { useNative } from './native';
import {
    Commands,
    GameState,
    LOG,
    SERVE,
    TEAM_LEFT,
    TEAM_RIGHT,
    VOICE_ENABLED,
    COMMAND_TYPE,
    LOG_TYPE,
    START_TYPE,
    STOP_TYPE,
    BACK_TYPE,
} from './const';
import { useScreenLock } from './screen';
import { startListen } from './speech';
import { template } from './template';

const eventOptions = { passive: true };

const initTemplate = (ctx: Window, element: Element) => {
    const state: GameState = {
        [TEAM_LEFT]: 0,
        [TEAM_RIGHT]: 0,
        [SERVE]: TEAM_LEFT,
        [LOG]: [],
        [VOICE_ENABLED]: false,
    };
    const gameStateObserver = observer<GameState, void>();
    const htmlElement = element as HTMLDivElement;
    htmlElement.innerText = '';
    htmlElement.classList.add('tennis');
    const [
        wrapper,
        plusOneLeft,
        scoreElement,
        plusOneRight,
        voiceCommands,
        back,
        logElement,
    ] = template(ctx, htmlElement);
    htmlElement.appendChild(wrapper);

    const voiceControlObserver = useNative(ctx);
    startListen(ctx, gameStateObserver);
    useScreenLock(ctx, voiceControlObserver);
    voiceControlObserver(
        bindArg((command: Commands) => {
            const [type, data] = command;
            if (type === COMMAND_TYPE) {
                state[LOG].unshift(structuredClone(state));
                while (state[LOG].length > 5) {
                    state[LOG].pop();
                }
                state[data] += 1;
                return gameStateObserver(bindArg(state, trigger));
            }
            if (type === BACK_TYPE) {
                const lastState = state[LOG].shift();
                if (!lastState) {
                  return;
                }
                Object.assign(state, lastState);
                return gameStateObserver(bindArg(state, trigger));
            }
            if (type === STOP_TYPE) {
                state[VOICE_ENABLED] = false;
                return gameStateObserver(bindArg(state, trigger));
            }
        }, on)
    );

    plusOneLeft.addEventListener(
        'click',
        () => {
            voiceControlObserver(
              bindArg([COMMAND_TYPE, TEAM_LEFT], trigger)
            );
        },
        eventOptions
    );

    gameStateObserver(
        bindArg(() => {
            const {
                [TEAM_LEFT]: teamLeft,
                [TEAM_RIGHT]: teamRight,
                [SERVE]: serve,
            } = state;

            logElement.innerHTML = state[LOG].map(
                (log, i) => `<div>${i}: "${log}"</div>`
            ).join('');

            voiceCommands.innerText = state[VOICE_ENABLED]
                ? `Voice control enabled`
                : `Voice control disabled`;

            if (teamLeft == 0 && teamRight == 0) {
                state[SERVE] = TEAM_LEFT;
                scoreElement.innerText = `${SERVE}0:0`;
                return;
            }
            if (!((teamRight + teamLeft) % 2)) {
                state[SERVE] = serve == TEAM_RIGHT ? TEAM_LEFT : TEAM_RIGHT;
            }
            const leftBall = state[SERVE] == TEAM_LEFT ? SERVE : '';
            const rightBall = state[SERVE] == TEAM_RIGHT ? SERVE : '';
            scoreElement.innerText = `${leftBall}${teamLeft}:${teamRight}${rightBall}`;
        }, on)
    );

    voiceCommands.addEventListener('click', () => {
        state[VOICE_ENABLED] = !state[VOICE_ENABLED];
        let command = state[VOICE_ENABLED] ? START_TYPE : STOP_TYPE;
        voiceControlObserver(bindArg([command], trigger));
        gameStateObserver(bindArg(state, trigger));
    });

    plusOneRight.addEventListener(
        'click',
        () => {
            voiceControlObserver(
              bindArg([COMMAND_TYPE, TEAM_RIGHT], trigger)
            );
        },
        eventOptions
    );
    back.addEventListener('click', () => {
        voiceControlObserver(bindArg([BACK_TYPE], trigger));
    });
};

export const initTennisEffect = (ctx: Window) => {
    const tags = ctx.document.querySelectorAll('.js-tennis');
    ctx.Array.from(tags).forEach(bindArg(ctx, initTemplate));
};
