import { bindArg, ObserverInstance, on } from '@month/utils';
import { Commands, START_TYPE, STOP_TYPE } from './const';

export const useScreenLoock = (
    ctx: Window,
    observerObj: ObserverInstance<Commands, void>
) => {
    let lock: any = undefined;
    observerObj(
        bindArg(([type]: Commands) => {
            if (type === STOP_TYPE) {
                lock || lock.release();
            }
            if (type === START_TYPE) {
                (ctx.navigator as any).wakeLock
                    .request('screen')
                    .then((wakeLock: any) => {
                        lock = wakeLock;
                    });
            }
        }, on)
    );
};
