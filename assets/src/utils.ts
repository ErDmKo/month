export const randomRange = (min: number, max: number) => {
    return min + Math.random() * (max - min);
}
export const bindArgs = (bindedArgs, fn) => {
    return (...args) => {
        return fn.apply(null, bindedArgs.concat(args));
    }
}
export const bindArg = (arg, fn) => {
    return bindArgs([arg], fn);
}