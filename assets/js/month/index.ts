import { bindArg } from "@month/utils";
import { template } from "./template";

const initTemplate = (
  ctx: Window,
  root: HTMLElement
) => {
  template(ctx, root);
}

export const initEffect = (ctx: Window) => {
    const tags = ctx.document.querySelectorAll('.js-month');
    ctx.Array.from(tags).forEach(bindArg(ctx, initTemplate));
};
