import { useNative } from './native';
// import { useServer } from "./server";

export const startListen = (ctx: Window) => {
    const observerObj = useNative(ctx);

    return observerObj;
};
