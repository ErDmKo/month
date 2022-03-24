export const fillElemWidhCanvas = (
    ctx: Window,
    element: HTMLDivElement
): [DOMRect, HTMLCanvasElement] => {
    const canvas = ctx.document.createElement('canvas');
    ctx.Object.assign(canvas.style, {
        position: 'absolute',
        top: '0px',
        left: '0px',
        pointerEvents: 'none',
        width: '100%',
        height: '100%'
    });
    ctx.Object.assign(element.style, {
        position: 'relative'
    });
    element.appendChild(canvas);
    const rectRaw = canvas.getBoundingClientRect();
    const rect = ctx.Object.assign(rectRaw, {
        width: rectRaw.width * 2,
        height: rectRaw.height * 2
    });
    ctx.Object.assign(canvas, {
        width: rect.width,
        height: rect.height
    });
    return [rect, canvas];
}