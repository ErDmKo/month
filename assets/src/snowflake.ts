import { randomRange } from "./utils";

type SnowflakeState = {
    position: [x: number, y: number]
    curentPosition?: [x: number, y: number],
    angle?: number,
    size?: [width: number, len: number]
    slides?: number
    subSlides?: number
    rotation?: boolean
}
const curry2 = (fn) => {
    return (a) => (b) => fn(a, b);
};
const cont = curry2((obj, fn) => {
    return fn(obj);
});

const randomazeSnowflake = (state: SnowflakeState) => {
    const {position: [x]} = state;
    state.curentPosition = [randomRange(0, x), -100];
    state.size = [randomRange(1, 4), randomRange(10, 70)];
    state.slides = Math.round(randomRange(3, 10));
    state.angle = Math.round(randomRange(0, 360));
    state.subSlides = randomRange(1, state.slides);
    state.rotation = randomRange(0, 1) >= 0.5 ? true : false;
    return state;
}

export const initSnowflake = (state: SnowflakeState) => {
    const initPos = state.curentPosition;
    randomazeSnowflake(state)
    if (initPos) {
        state.curentPosition = initPos;
    }
    return cont(state);
}

export const drawSnowflakeInner = (
    canvasCtx: CanvasRenderingContext2D,
    width: number,
    height: number,
    no = 2
) => {
    const step = width / (no + 1);
    for (let i = 1; i <= no; i++) {
        const xpos = step * i;
        const len = width / (1.1 * (i + 1));
        canvasCtx.save()

        canvasCtx.translate(height/no - 1, xpos);
        canvasCtx.rotate(45 * Math.PI / 180);

        canvasCtx.fillRect(0, 0, len, height/2);

        canvasCtx.rotate(90 * Math.PI / 180);
        canvasCtx.fillRect(0, 0, len, height/2);
        canvasCtx.restore();
    }
}

export const drawSnowflake = curry2((
    canvasCtx: CanvasRenderingContext2D,
    state: SnowflakeState
) => {
    const {
        slides,
        subSlides,
        curentPosition: [centerX, centerY],
        angle: snowflakeAngle,
        size: [width, rootLength]
    } = state;

    const step = 360 / slides;
    for (let i = 0; i < slides; i++) {
        canvasCtx.save();
        canvasCtx.fillStyle = "rgba(255,255,255,0.3)";
        canvasCtx.translate(centerX, centerY);
        const angle = step * i * Math.PI / 180;
        canvasCtx.rotate(angle + snowflakeAngle);
        canvasCtx.fillRect(
            -(width / 2),
            0,
            width, 
            rootLength
        );
        drawSnowflakeInner(canvasCtx, rootLength, width, subSlides);
        canvasCtx.restore()
    }
});

export const animateSnowflake = curry2((frame: number, state: SnowflakeState) => {
    const {
        position: [maxX, maxY],
        curentPosition: [x, y],
        angle: snowflakeAngle,
        slides,
        size: [width, len]
    } = state;
    const randomWindX = 0;
    const randomWindY = 0;
    if (
        (x + randomWindX) > maxX || 
        (y + (slides/width) + randomWindY) >= (maxY + (len * 2))
    ) {
        return randomazeSnowflake(state);
    } 
    state.curentPosition = [
        (x + randomWindX) % maxX,
        (y + (slides/width/2) + randomWindY) % (maxY + (len * 2))
    ];
    state.angle = snowflakeAngle + ( (state.rotation ? 1 : -1) * len / 10000);
})