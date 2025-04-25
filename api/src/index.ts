const isSteamLoopbackHost = window.location.hostname === 'steamloopback.host';

declare global {
	interface Window {
		Millennium: Millennium;
		PLUGIN_LIST: any;
		MILLENNIUM_BACKEND_IPC: any;
		MILLENNIUM_IPC_SOCKET: WebSocket;
		CURRENT_IPC_CALL_COUNT: number;
	}
}

/** Returnable IPC types */
type IPC_types = string | number | boolean;

declare const g_PopupManager: any;

window.MILLENNIUM_BACKEND_IPC = {
	postMessage: (messageId: number, contents: string) =>
		new Promise((resolve) => {
			const message = { id: messageId, iteration: window.CURRENT_IPC_CALL_COUNT++, data: contents };

			const messageHandler = (data: MessageEvent) => {
				let json;
				try {
					json = JSON.parse(data.data);
				} catch {
					console.error('Failed to parse JSON from backend IPC', data.data, contents);
					return;
				}

				if (json.id !== message.iteration) return;

				resolve(json);
				window.MILLENNIUM_IPC_SOCKET.removeEventListener('message', messageHandler);
			};

			window.MILLENNIUM_IPC_SOCKET.addEventListener('message', messageHandler);
			window.MILLENNIUM_IPC_SOCKET.send(JSON.stringify(message));
		}),
};

window.Millennium = {
	// @ts-ignore (ignore overloaded function)
	callServerMethod: (pluginName: string, methodName: string, kwargs: any) =>
		new Promise((resolve, reject) => {
			const query = { pluginName, methodName, ...(kwargs && { argumentList: kwargs }) };

			window.MILLENNIUM_BACKEND_IPC.postMessage(0, query).then((response: any) => {
				if (response?.failedRequest) {
					return reject(`IPC call failed [plugin: ${pluginName}, method: ${methodName}] -> ${response.failMessage}`);
				}

				resolve(typeof response.returnValue === 'string' ? atob(response.returnValue) : response.returnValue);
			});
		}),
	findElement: (privateDocument: Document, querySelector: string, timeout?: number): Promise<NodeListOf<Element>> =>
		new Promise((resolve, reject) => {
			const matchedElements = privateDocument.querySelectorAll(querySelector);
			if (matchedElements.length) return resolve(matchedElements);

			const observer = new MutationObserver(() => {
				const elements = privateDocument.querySelectorAll(querySelector);
				if (elements.length) {
					observer.disconnect();
					if (timer) clearTimeout(timer);
					resolve(elements);
				}
			});

			observer.observe(privateDocument.body, { childList: true, subtree: true });

			const timer =
				timeout &&
				setTimeout(() => {
					observer.disconnect();
					reject();
				}, timeout);
		}),

	// Only define exposeObj and AddWindowCreateHook if the current URL host is steamloopback.host
	...(isSteamLoopbackHost
		? {
				exposeObj: function <T extends object>(exports: any, obj: T): void {
					for (const key in obj) {
						exports[key] = obj[key];
					}
				},
				AddWindowCreateHook: (callback: any) => {
					// used to have extended functionality but removed since it was shotty
					g_PopupManager.AddPopupCreatedCallback((e: any) => {
						callback(e);
					});
				},
		  }
		: {}),
};

/*
 Global Millennium API for developers. 
*/
type Millennium = {
	/**
	 * @brief Call a method on the backend
	 * @deprecated Use `callable` instead.
	 * Example usage:
	 * ```typescript
	 * // before
	 * const result = await Millennium.callServerMethod('methodName', { arg1: 'value' });
	 * // after
	 * const method = callable<[{ arg1: string }]>("methodName");
	 *
	 * const result1 = await method({ arg1: 'value1' });
	 * const result2 = await method({ arg1: 'value2' });
	 * ```
	 */
	callServerMethod: (methodName: string, kwargs?: object) => Promise<any>;
	findElement: (privateDocument: Document, querySelector: string, timeOut?: number) => Promise<NodeListOf<Element>>;
	exposeObj?: <T extends object>(obj: T) => any;
	AddWindowCreateHook?: (callback: (context: object) => void) => void;
};

// callable function definition
const callable = <Args extends any[] = [], Return = void | IPC_types>(
	cb: (route: string, ...args: Args) => Promise<Return>,
	route: string,
): ((...args: Args) => Promise<Return>) => {
	return (...args: Args) => cb(route, ...args);
};

// Only define and export pluginSelf if the current URL host is steamloopback.host
const m_private_context: any = undefined;
export const pluginSelf = isSteamLoopbackHost ? m_private_context : undefined;

const BindPluginSettings = (pluginName: string) => {
	// @ts-ignore
	return window.MILLENNIUM_PLUGIN_SETTINGS_STORE[pluginName].settingsStore;
};

const Millennium: Millennium = window.Millennium;
export { Millennium, callable, BindPluginSettings };
