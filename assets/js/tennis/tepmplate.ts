import { domCreator, REF, Ref, chekRefs, PROP } from '@month/utils';
import { SERVE, TEAM_LEFT_NAME, TEAM_RIGHT_NAME } from './const';

export const template = (ctx: Window, root: HTMLElement) => {
    const wrapperRef: Ref = {};
    const plusRefL: Ref = {};
    const plusRefR: Ref = {};
    const scoreRef: Ref = {};
    const voiceRef: Ref = {};
    const logRef: Ref = {};
    domCreator(ctx, root, [
        [
            ['class', 'wrapper'],
            [REF, wrapperRef],
        ],
        [
            [
                [
                    ['class', 'pOneL'],
                    ['innerText', `+1 ${TEAM_LEFT_NAME}`, PROP],
                    [REF, plusRefL],
                ],
                ,
                'button',
            ],
            [
                [
                    ['class', 'score'],
                    ['innerText', `${SERVE}0:0`, PROP],
                    [REF, scoreRef],
                ],
                ,
                'span',
            ],
            [
                [
                    ['class', 'pOneR'],
                    ['innerText', `+1 ${TEAM_RIGHT_NAME}`, PROP],
                    [REF, plusRefR],
                ],
                ,
                'button',
            ],
            [
                [
                    ['class', 'voice'],
                    ['innerText', 'Voice control disabled', PROP],
                    [REF, voiceRef],
                ],
                ,
                'button',
            ],
            [
                [
                    ['class', 'log'],
                    [REF, logRef],
                ],
            ],
        ],
    ] as const);
    const refList = [
        wrapperRef,
        plusRefL,
        scoreRef,
        plusRefR,
        voiceRef,
        logRef,
    ];
    if (!chekRefs(refList)) {
        return;
    }
    const [
        { current: wrapper },
        { current: plusOneLeft },
        { current: scoreElement },
        { current: plusOneRight },
        { current: voiceCommands },
        { current: logElement },
    ] = refList;
    return {
        wrapper,
        plusOneLeft,
        scoreElement,
        plusOneRight,
        voiceCommands,
        logElement,
    };
};
