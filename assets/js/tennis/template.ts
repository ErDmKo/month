import { domCreator, REF, PROP, DOMStruct } from '@month/utils';
import {
    GameState,
    SERVE,
    TEAM_LEFT,
    TEAM_LEFT_NAME,
    TEAM_RIGHT,
    TEAM_RIGHT_NAME,
    UPDATE_DATE,
} from './const';

export const gameStateRender = (
    ctx: Window,
    root: HTMLElement,
    stateList: GameState[]
) => {
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
    const historyInfo = stateList.map((state, i) => {
        const {
            [TEAM_LEFT]: teamLeft,
            [TEAM_RIGHT]: teamRight,
            [UPDATE_DATE]: updateDate,
        } = state;
        const leftBall = state[SERVE] == TEAM_LEFT ? SERVE : '';
        const rightBall = state[SERVE] == TEAM_RIGHT ? SERVE : '';
        const stateString = `${leftBall}${teamLeft}:${teamRight}${rightBall}`;
        const time = `${updateDate.toLocaleTimeString()}`;
        return [
            'div',
            [],
            [
                [
                    'div',
                    [
                        ['class', 'time'],
                        ['innerText', time, PROP],
                    ],
                ],
                ['div', [['innerText', stateString, PROP]]],
            ],
        ] as DOMStruct<'div'>;
    });
    const [res] = domCreator(ctx, root, ['span', [[REF]], historyInfo]);
    root.appendChild(res);
    return res;
};

export const template = (ctx: Window, root: HTMLElement) => {
    const res = domCreator(ctx, root, [
        'div',
        [['class', 'wrapper'], [REF]],
        [
            [
                'button',
                [
                    ['class', 'pOneL'],
                    ['innerText', `+1 ${TEAM_LEFT_NAME}`, PROP],
                    [REF],
                ],
            ],
            ['span', [['class', 'score'], [REF]]],
            [
                'button',
                [
                    ['class', 'pOneR'],
                    ['innerText', `+1 ${TEAM_RIGHT_NAME}`, PROP],
                    [REF],
                ],
            ],
            [
                'button',
                [
                    ['class', 'voice'],
                    ['innerText', 'Voice control disabled', PROP],
                    [REF],
                ],
                ,
            ],
            [
                'button',
                [['class', 'voice'], ['innerText', 'Back', PROP], [REF]],
                ,
            ],
            ['div', [['class', 'log'], [REF]]],
        ],
    ]);
    return res as [
        HTMLDivElement,
        HTMLButtonElement,
        HTMLSpanElement,
        HTMLButtonElement,
        HTMLButtonElement,
        HTMLDivElement,
        HTMLDivElement
    ];
};
