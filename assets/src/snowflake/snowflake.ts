import { cont, randomRange } from "@src/utils";

type SnowflakeState = {
    position: [x: number, y: number]
    curentPosition: [x: number, y: number],
    angle: number,
    size: [width: number, len: number]
    slides: number
    subSlides?: number
    rotation?: boolean
}
type PartialState = Partial<SnowflakeState>;
type MinimumState = Pick<SnowflakeState, 'position' | 'curentPosition'>;

const randomazeSnowflake = (
    ctx: Window,
    state: PartialState & MinimumState
): SnowflakeState => {
    const {position: [x]} = state;
    state.curentPosition = [randomRange(ctx, 0, x), -100];
    state.size = [randomRange(ctx, 1, 4), randomRange(ctx, 10, 70)];
    state.slides = Math.round(randomRange(ctx, 3, 10));
    state.angle = Math.round(randomRange(ctx, 0, 360));
    state.subSlides = randomRange(ctx, 1, state.slides);
    state.rotation = randomRange(ctx, 0, 1) >= 0.5 ? true : false;
    return state as SnowflakeState;
}
export type SnowFlakeInstance =
    <R> (fn: (s: SnowflakeState) => R) => R

export const initSnowflake = (
    ctx: Window,
    state: MinimumState
): SnowFlakeInstance => {
    const initPos = state.curentPosition;
    const inputState = state as Partial<SnowflakeState> & MinimumState;
    const newState = randomazeSnowflake(ctx, inputState)
    if (initPos) {
        state.curentPosition = initPos;
    }
    return cont(newState);
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

export const drawSnowflake = (
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

    const step = (360 / slides) * Math.PI / 180;
    canvasCtx.save();
    canvasCtx.translate(centerX, centerY);
    canvasCtx.rotate(snowflakeAngle);
    for (let i = 0; i < slides; i++) {
        canvasCtx.fillStyle = "rgba(255,255,255,0.3)";
        canvasCtx.rotate(step);
        canvasCtx.fillRect(
            -(width / 2),
            0,
            width, 
            rootLength
        );
        drawSnowflakeInner(canvasCtx, rootLength, width, subSlides);
    }
    canvasCtx.restore()
};

export const animateSnowflake = (ctx: Window, state: SnowflakeState) => {
    const {
        position: [maxX, maxY],
        curentPosition: [x, y],
        angle: snowflakeAngle,
        slides,
        size: [width, len]
    } = state;
    if (
        x > maxX ||
        y + (slides/width) >= maxY + (len * 2)
    ) {
        return randomazeSnowflake(ctx, state);
    }
    state.curentPosition = [
        x,
        y + ( slides/width/2 )
    ];
    state.angle = snowflakeAngle + ( (state.rotation ? 1 : -1) * len / 10000);
}