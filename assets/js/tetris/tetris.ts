import { bindArg, bindArgs, domCreator, fillElemWidhCanvas, on, PROP, REF } from '@month/utils';
import {
    FieldInstance,
    drawField,
    addFigureRandomFigure,
    Vector2D,
    initField,
    moveFieldFigure,
    getObservers,
    GAME_STATE_PLAY,
    GAME_STATE_END,
    rotateFieldFigureLeft,
    rotateFieldFigureRight,
} from './field';

const draw = (
    ctx: Window,
    fieldInstance: FieldInstance,
    canvasCtx: CanvasRenderingContext2D
) => {
    fieldInstance(bindArg(canvasCtx, drawField));
    ctx.requestAnimationFrame(bindArgs([ctx, fieldInstance, canvasCtx], draw));
};

type FieldAction = () => any;
type KeyHandlers = Record<string, FieldAction>;

const getKeyHandlers = (
    ctx: Window,
    fieldInstance: FieldInstance
): KeyHandlers => {
    const figureBind: KeyHandlers = {
        Space: bindArg(ctx, addFigureRandomFigure) as any,
        KeyE: rotateFieldFigureLeft as any,
        KeyQ: rotateFieldFigureRight as any,
        // "KeyW": bindArgs([ctx, [0, -1]], moveFieldFigure),
        KeyS: bindArgs([ctx, [0, 1]], moveFieldFigure),
        KeyA: bindArgs([ctx, [-1, 0]], moveFieldFigure),
        KeyD: bindArgs([ctx, [1, 0]], moveFieldFigure),
    };
    for (let key in figureBind) {
        figureBind[key] = bindArg(figureBind[key], fieldInstance);
    }
    return figureBind;
};

const START_TEXT = 'Press SPACE to start';

const phoneControlsMap: [string, string][] = [
    ['Space', 'Start (Space)'],
    ['KeyE', 'Rotate Right (E)'],
    ['KeyQ', 'Rotate Left (Q)'],
    ['KeyA', 'Left (A)'],
    ['KeyS', 'Down (S)'],
    ['KeyD', 'Right (D)'],
];
const smallButton = 's';
const phoneStyleMap = (ctx: Window): Record<string, string[]> => ({
    Space: ['start', smallButton],
    KeyE: ['rotateR', smallButton],
    KeyQ: ['rotateL', smallButton],
    KeyS: ['down', smallButton],
    KeyA: ['left', smallButton],
    KeyD: ['right', smallButton],
});

const addPhoneControls = (
    ctx: Window,
    element: HTMLDivElement,
    keyHandlers: KeyHandlers
) => {
    const styles = phoneStyleMap(ctx);
    domCreator(ctx, element, [
      'div', [
        ['class', 'c'],
      ],
      phoneControlsMap.map(([key, name]) => {
        const classes = styles[key];
        return ['button', [
          ['innerText', name, PROP],
          ['class', (classes || []).join(' ')],
          ['onclick', keyHandlers[key], PROP]
        ]];
      })
    ]);
};

const initCanvas = (ctx: Window, element: Element) => {
    const htmlElement = element as HTMLDivElement;
    htmlElement.innerHTML = '';
    htmlElement.classList.add('tetris');
    const boardSize: Vector2D = [10, 20];
    const [
      wrapper,
      info
    ] = domCreator(ctx, htmlElement, [
      'div', [
        ['class', 'wrapper'],
        [REF]
      ], [
        ['div', [
          ['class', 'info'],
          ['innerText', START_TEXT],
          [REF]
        ]]
      ],
    ]);
    const [rect, canvas] = fillElemWidhCanvas(ctx, wrapper);
    var canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) {
        return;
    }
    const [collums, rows] = boardSize;
    const collHeight = rect.height / rows;
    const collWidth = rect.width / collums;
    const collSize: Vector2D = [collWidth, collHeight];
    const fieldInstance = initField(ctx, boardSize, collSize);
    const keyHandlers = getKeyHandlers(ctx, fieldInstance);
    addPhoneControls(ctx, element as HTMLDivElement, keyHandlers);
    document.addEventListener('keydown', (e) => {
        if (keyHandlers[e.code]) {
            keyHandlers[e.code]();
        }
    });
    const [gameState, score] = fieldInstance(getObservers);
    gameState(
        bindArg((state: number) => {
            if (state === GAME_STATE_PLAY && info.innerText == START_TEXT) {
                info.innerText = '';
                info.style.top = '-30px';
            } else if (state === GAME_STATE_END) {
                info.innerText = 'Game Over';
            }
        }, on)
    );
    score(
        bindArg((no: number) => {
            info.innerText = `Your score ${no}`;
        }, on)
    );
    draw(ctx, fieldInstance, canvasCtx);
};

export const initTetrisEffect = (ctx: Window) => {
    const tags = ctx.document.querySelectorAll('.js-tetris');
    ctx.Array.from(tags).forEach(bindArg(ctx, initCanvas));
};
