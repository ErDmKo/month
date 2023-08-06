import { bindArg } from "@month/utils";

const initTemplate = (ctx: Window, element: Element) => {
    const htmlElement = element as HTMLDivElement;
    htmlElement.innerHTML = 'TODO';
}

export const initTennisEffect = (ctx: Window) => {
    const tags = ctx.document.querySelectorAll('.js-tennis');
    ctx.Array.from(tags).forEach(bindArg(ctx, initTemplate));
}
