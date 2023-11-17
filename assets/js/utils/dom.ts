export type Ref<T = HTMLElement> = [current?: T];

export const REF = 1 as const;
export const PROP = 0 as const;

type Props =
    | readonly [key: string, value: string]
    | readonly [key: string, value: any, isProp: typeof PROP]
    | readonly [key: typeof REF, ref?: Ref];

type DOMStruct<K extends keyof HTMLElementTagNameMap> = readonly [
    tag: K,
    attributes: readonly Props[],
    children?: readonly DOMStruct<K>[]
];

// No recusion
export const domCreator = <K extends keyof HTMLElementTagNameMap>(
    ctx: Window,
    root: Element,
    struct: DOMStruct<K>
) => {
    if (!(ctx.document && typeof ctx.document.createElement == 'function')) {
        throw new Error();
    }
    const currnent = [[root, struct] as const];
    const refs: HTMLElementTagNameMap[K][] = [];
    while (currnent.length) {
        const nextStruct = currnent.pop();
        if (!nextStruct) {
            break;
        }
        const [root, struct] = nextStruct;
        const [tag, attributes, children] = struct;
        const element = ctx.document.createElement(tag);
        for (const [key, value, isProp] of attributes) {
            if (key === REF) {
                if (value) {
                    value[0] = element;
                }
                refs.push(element);
            } else if (isProp === PROP) {
                if (key === 'style') {
                    Object.assign(element.style, value);
                } else {
                    (element as any)[key] = value;
                }
            } else {
                element.setAttribute(key, value);
            }
        };
        root.appendChild(element);
        (children || []).forEach((child) => {
            currnent.unshift([element, child]);
        });
    }
    return refs;
};

export const chekRefs = (refList: Ref[]): refList is Required<Ref>[] => {
    return refList.every((ref) => {
        return ref[0];
    });
};
