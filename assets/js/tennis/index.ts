import { bindArg, observer, on, trigger } from '@month/utils';
import { useNative } from './native';
import {
    GameState,
    LOG,
    SERVE,
    TEAM_LEFT,
    TEAM_RIGHT,
    VOICE_ENABLED,
} from './const';
import {
    Commands,
    COMMAND_TYPE,
    LOG_TYPE,
    START_TYPE,
    STOP_TYPE,
} from './const';
import { useScreenLock } from './screen';
import { startListen } from './speech';
import { template } from './tepmplate';

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
    const elements = template(ctx, htmlElement);
    if (!elements) {
        return;
    }
    const {
        wrapper,
        plusOneLeft,
        scoreElement,
        plusOneRight,
        voiceCommands,
        logElement,
    } = elements;

    const voiceControlObserver = useNative(ctx);
    startListen(ctx, gameStateObserver);
    useScreenLock(ctx, voiceControlObserver);
    voiceControlObserver(
        bindArg((command: Commands) => {
            const [type, data] = command;
            if (type === COMMAND_TYPE) {
                state[data] += 1;
                gameStateObserver(bindArg(state, trigger));
            }
            if (type === LOG_TYPE) {
                state[LOG].unshift(data);
                while (state[LOG].length > 5) {
                    state[LOG].pop();
                }
            }
            if (type === STOP_TYPE) {
                state[VOICE_ENABLED] = false;
                gameStateObserver(bindArg(state, trigger));
            }
        }, on)
    );

    htmlElement.appendChild(wrapper);
    plusOneLeft.addEventListener(
        'click',
        () => {
            state[TEAM_LEFT] += 1;
            gameStateObserver(bindArg(state, trigger));
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
            state[TEAM_RIGHT] += 1;
            gameStateObserver(bindArg(state, trigger));
        },
        eventOptions
    );
};

export const initTennisEffect = (ctx: Window) => {
    const tags = ctx.document.querySelectorAll('.js-tennis');
    ctx.Array.from(tags).forEach(bindArg(ctx, initTemplate));
};
