import { domCreator } from "@month/utils";

export const template = (ctx: Window, root: HTMLElement) => {
  const res = domCreator(ctx, root, ['div', []]);
  return res as [];
}
