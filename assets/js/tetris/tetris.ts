import { bindArg, bindArgs, fillElemWidhCanvas, on } from '@month/utils';
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
    ['Space', 'Start (space)'],
    ['KeyE', 'Rotate (E)'],
    ['KeyA', 'Left (A)'],
    ['KeyS', 'Down (S)'],
    ['KeyD', 'Right (D)'],
];
const inlineBlock = {
    display: 'inline-block',
    margin: '5px',
};
const block = {
    display: 'block',
    margin: '5px auto',
};
const smallButton = {
    padding: '5px',
    touchAction: 'manipulation',
};
const phoneStyleMap = (ctx: Window): Record<string, any> => ({
    Space: ctx.Object.assign({}, smallButton, block),
    KeyE: ctx.Object.assign({}, smallButton, block),
    KeyS: ctx.Object.assign({}, inlineBlock, smallButton),
    KeyA: ctx.Object.assign({}, inlineBlock, smallButton),
    KeyD: ctx.Object.assign({}, inlineBlock, smallButton),
});

const addPhoneControls = (
    ctx: Window,
    element: HTMLDivElement,
    keyHandlers: KeyHandlers
) => {
    const controls = ctx.document.createElement('div');
    ctx.Object.assign(element.style, {
        marginBottom: '200px',
    });
    ctx.Object.assign(controls.style, {
        position: 'absolute',
        top: '100%',
        left: '0',
        right: '0',
    });
    const styles = phoneStyleMap(ctx);
    phoneControlsMap.forEach(([key, name]) => {
        const elem = ctx.document.createElement('button');
        elem.innerText = name;
        const style = styles[key];
        if (style) {
            ctx.Object.assign(elem.style, style);
        }
        elem.addEventListener('click', keyHandlers[key], { passive: true });
        controls.appendChild(elem);
    });
    element.appendChild(controls);
};

const initCanvas = (ctx: Window, element: Element) => {
    const htmlElement = element as HTMLDivElement;
    htmlElement.innerHTML = '';
    const boardSize: Vector2D = [10, 20];
    ctx.Object.assign(htmlElement.style, {
        height: '400px',
        width: '200px',
        backgroundColor: 'white',
        margin: '40px auto 0',
    });
    const info = ctx.document.createElement('div');
    ctx.Object.assign(info.style, {
        left: '0',
        right: '0',
        position: 'absolute',
        top: '-30px',
    });
    info.innerText = START_TEXT;
    element.appendChild(info);
    const [rect, canvas] = fillElemWidhCanvas(ctx, htmlElement);
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
    const tags = document.querySelectorAll('.js-tetris');
    ctx.Array.from(tags).forEach(bindArg(ctx, initCanvas));
};
