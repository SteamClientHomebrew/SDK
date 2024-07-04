declare global {
    interface Window {
        Millennium: Millennium,
        PLUGIN_LIST: any,
        MILLENNIUM_BACKEND_IPC: typeof IPCMain,
        MILLENNIUM_IPC_SOCKET: WebSocket,
        CURRENT_IPC_CALL_COUNT: number
    }
}

/**
 * Steam window popup manager. 
 */
declare const g_PopupManager: any; 
/**
 * pre export module from rollup
 */
declare const exports: any;

const IPCMain = {
    postMessage: (messageId: number, contents: string) => {
        return new Promise((resolve: (value: unknown) => void) => {

            const message = { id: messageId, iteration: window.CURRENT_IPC_CALL_COUNT++, data: contents }

            const messageHandler = function(data: MessageEvent) {
                const json: any = JSON.parse(data.data)

                /**
                 * wait to receive the correct message id from the backend
                 */
                if (json.id != message.iteration)
                    return

                resolve(json);
                window.MILLENNIUM_IPC_SOCKET.removeEventListener('message', messageHandler);
            };

            window.MILLENNIUM_IPC_SOCKET.addEventListener('message', messageHandler);
            window.MILLENNIUM_IPC_SOCKET.send(JSON.stringify(message));
        });
    }
}

window.MILLENNIUM_BACKEND_IPC = IPCMain

window.Millennium = {
    // @ts-ignore (ignore overloaded function)
    callServerMethod: (pluginName: string, methodName: string, kwargs: any) => {
        return new Promise((resolve, reject) => {
            const query: any = {
                pluginName: pluginName,
                methodName: methodName
            }

            if (kwargs) query.argumentList = kwargs

            /* call handled from "src\core\ipc\pipe.cpp @ L:67" */
            window.MILLENNIUM_BACKEND_IPC.postMessage(0, query).then((response: any) => 
            {
                if (response?.failedRequest) {

                    const m = ` Millennium.callServerMethod() from [name: ${pluginName}, method: ${methodName}] failed on exception -> ${response.failMessage}`;
                    
                    // Millennium can't accurately pin point where this came from
                    // check the sources tab and find your plugins index.js, and look for a call that could error this
                    throw new Error(m)
                    reject()
                }

                const val: string = response.returnValue
                if (typeof val === 'string') {
                    resolve(atob(val))
                }
                resolve(val)
            })
        })
    }, 
    AddWindowCreateHook: (callback: any) => {
        // used to have extended functionality but removed since it was shotty
        g_PopupManager.AddPopupCreatedCallback((e: any) => {
            callback(e)
        });
    },
    findElement: (privateDocument: Document, querySelector: string, timeout?: number): Promise<NodeListOf<Element>> => {
        return new Promise((resolve, reject) => {
            const matchedElements = privateDocument.querySelectorAll(querySelector);

            /**
             * node is already in DOM and doesn't require watchdog
             */
            if (matchedElements.length) {
                resolve(matchedElements);
            }

            let timer: any = null;

            const observer = new MutationObserver(() => {
                const matchedElements = privateDocument.querySelectorAll(querySelector);
                if (matchedElements.length) {
                    if (timer) 
                        clearTimeout(timer);

                    observer.disconnect();
                    resolve(matchedElements);
                }
            });

            /** observe the document body for item changes, assuming we are waiting for target element */
            observer.observe(privateDocument.body, {
                childList: true,
                subtree: true
            });

            if (timeout) {
                timer = setTimeout(() => {
                    observer.disconnect();
                    reject();
                }, timeout);
            }
        });
    },
    exposeObj: function<T extends object>(obj: T): void {
        for (const key in obj) {
            exports[key] = obj[key];
        }
    }
}

/*
 Global Millennium API for developers. 
*/
type Millennium = {
    /* call a backend server method */
    callServerMethod: (methodName: string, kwargs?: object) => Promise<any>,
    AddWindowCreateHook: (callback: (context: object) => void) => void,
    findElement: (privateDocument: Document,  querySelector: string, timeOut?: number) => Promise<NodeListOf<Element>>,
    /* Expose a function to mainworld so it can be called from the backend */
    exposeObj: <T extends object>(obj: T) => any
};


const m_private_context: any = undefined

/**
 * @brief
 * pluginSelf is a sandbox for data specific to your plugin. 
 * You can't access other plugins sandboxes and they can't access yours 
 * 
 * @example
 * | pluginSelf.var = "Hello"
 * | console.log(pluginSelf.var) -> Hello
 */

const pluginSelf: any = m_private_context
const Millennium: Millennium = window.Millennium

export { Millennium, pluginSelf }