import { bindArg } from "../utils";

const initTemplate = () => {
    console.log('initTemplate');  
}

export const initEffect = (ctx: Window) => {
    const tags = ctx.document.querySelectorAll('.js-month');
    ctx.Array.from(tags).forEach(bindArg(ctx, initTemplate));
};
