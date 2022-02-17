import { animateSnowflake, drawSnowflake, initSnowflake, SnowFlakeInstance } from "./snowflake";
import { bindArg, bindArgs, randomRange } from "./utils";
declare global {
    interface Window {
        Object: typeof Object
    }
}

const draw = (
    ctx: Window,
    canvasCtx: CanvasRenderingContext2D,
    snowflakes: SnowFlakeInstance[],
    rect: {width: number, height: number},
) => {
    canvasCtx.clearRect(0, 0, rect.width, rect.height);
    snowflakes.forEach((snowflake) => {
        snowflake(animateSnowflake);
        snowflake(bindArg(canvasCtx, drawSnowflake));
    });
    ctx.requestAnimationFrame(bindArgs([
        ctx,
        canvasCtx,
        snowflakes,
        rect,
    ], draw));
};
const initCanvas = (ctx: Window, tag: Element) => {
    const canvas = ctx.document.createElement('canvas');
    ctx.Object.assign(canvas.style, {
        position: 'absolute',
        top: '0px',
        left: '0px',
        pointerEvents: 'none',
        width: '100%',
        height: '100%'
    });
    const htmlElement = tag as HTMLDivElement;
    ctx.Object.assign(htmlElement.style, {
        position: 'relative'
    });
    tag.appendChild(canvas);
    const rectRaw = canvas.getBoundingClientRect();
    const rect = ctx.Object.assign(rectRaw, {
        width: rectRaw.width * 2,
        height: rectRaw.height * 2
    });
    ctx.Object.assign(canvas, {
        width: rect.width,
        height: rect.height
    });
    const snowflakes = [];
    for (let i = 0; i < 100; i++) {
        snowflakes.push(initSnowflake({
            position: [rect.width, rect.height],
            curentPosition: [
                randomRange(0, rect.width), 
                randomRange(0, rect.height)
            ],
        }));
    }
    var canvasCtx = canvas.getContext("2d");
    draw(ctx, canvasCtx, snowflakes, rect);
}

window.addEventListener('load', () => {
    const tags = document.querySelectorAll('.js-header');
    window.Array.from(tags).forEach(bindArg(window, initCanvas));
});