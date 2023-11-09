import { bindArg, observer, on, trigger } from '@month/utils';
import { Commands, LOG_TYPE, START_TYPE, STOP_TYPE } from './const';

declare global {
    interface Window {
        WebSocket: typeof WebSocket;
        MediaRecorder: typeof MediaRecorder;
    }
}

export const useServer = (ctx: Window) => {
    const { protocol, host } = ctx.location;
    const wsProtocol = protocol === 'http:' ? 'ws:' : 'wss:';
    const client = new ctx.WebSocket(`${wsProtocol}//${host}/ws`);
    const observerObj = observer<Commands, void>();
    client.onmessage = (event) => {
        console.log(event);
    };
    client.onopen = () => {
        client.send('hi');
    };
    observerObj(
        bindArg(([type]: Commands) => {
            if (type === START_TYPE) {
                if (ctx.navigator.mediaDevices) {
                    navigator.mediaDevices
                        .getUserMedia({ audio: true })
                        .then((stream) => {
                            const mediaRecorder = new ctx.MediaRecorder(stream);
                            let chunks = [];
                            mediaRecorder.start();
                            mediaRecorder.ondataavailable = (event) => {
                                console.log(event.data);
                                chunks.push(event.data);
                                client.send(event.data);
                            };
                            setTimeout(() => {
                                mediaRecorder.requestData();
                            }, 2_000);
                            observerObj(
                                bindArg(([type]: Commands) => {
                                    if (type === STOP_TYPE) {
                                        mediaRecorder.stop();
                                        stream.getTracks().forEach((track) => {
                                            track.stop();
                                        });
                                    }
                                }, on)
                            );
                        })
                        .catch((err) => {
                            observerObj(
                                bindArg([LOG_TYPE, err.message], trigger)
                            );
                        });
                } else {
                    // browser unable to access media devices
                    // (update your browser)
                }
            }
        }, on)
    );

    return observerObj;
};
