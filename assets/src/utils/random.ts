export const randomRange = (ctx: Window, min: number, max: number) => {
    return min + ctx.Math.random() * (max - min);
}