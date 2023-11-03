import { bindArg } from './bind';
import { cont } from './cont';

export type ObserverState<EventType> = ((e: EventType) => void)[];
export type ObserverInstance<EventType, ResultType = any> = (
    a: (s: ObserverState<EventType>) => ResultType
) => ResultType;

export const observer = <EventType, ResultType = any>(
    state = [] as ObserverState<EventType>
) => {
    return cont<ObserverState<EventType>, ResultType>(state);
};

export const on = <EventType>(
    callback: (e: EventType) => void,
    state: ObserverState<EventType>
) => {
    state.push(callback);
};

export const trigger = <EventType>(
    event: EventType,
    state: ObserverState<EventType>
) => {
    for (const callback of state) {
        callback(event);
    }
};

export const sumOperator = (state: ObserverState<number>) => {
    const oldObserver = observer(state);
    const newObserver = observer<number>();
    let sum = 0;
    oldObserver(
        bindArg((newVal: number) => {
            sum += newVal;
            newObserver(bindArg(sum, trigger));
        }, on)
    );
    return newObserver;
};
