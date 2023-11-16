export type Ref = { current?: HTMLElement };

export const REF = 1 as const;
export const PROP = 0 as const;

type Props =
    | readonly [key: string, value: string, isProp?: typeof PROP]
    | readonly [typeof REF, Ref];

type DOMStruct = readonly [
    attributes: readonly Props[],
    children?: readonly DOMStruct[],
    tag?: string
];

// No recusion
export const domCreator = (ctx: Window, root: Element, struct: DOMStruct) => {
    if (!(ctx.document && typeof ctx.document.createElement == 'function')) {
        return;
    }
    const currnent = [[root, struct] as const];
    while (currnent.length) {
        const nextStruct = currnent.pop();
        if (!nextStruct) {
            break;
        }
        const [root, struct] = nextStruct;
        const [attributes, children, tag] = struct;
        const element = ctx.document.createElement(tag || 'div');
        attributes.forEach(([key, value, isProp]) => {
            if (key === REF) {
                value.current = element;
            } else if (isProp === PROP) {
                (element as any)[key] = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        root.appendChild(element);
        (children || []).forEach((child) => {
            currnent.unshift([element, child]);
        });
    }
};

export const chekRefs = (refList: Ref[]): refList is Required<Ref>[] => {
    return refList.every((ref) => {
        return ref.current;
    });
};
