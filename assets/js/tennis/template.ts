import { domCreator, REF, PROP } from '@month/utils';
import { SERVE, TEAM_LEFT_NAME, TEAM_RIGHT_NAME } from './const';

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
            [
                'span',
                [['class', 'score'], ['innerText', `${SERVE}0:0`, PROP], [REF]],
            ],
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
                [
                    ['class', 'voice'],
                    ['innerText', 'Back', PROP],
                    [REF],
                ],
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
