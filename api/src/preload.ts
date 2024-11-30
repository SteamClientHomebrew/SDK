import React from "react";
import Logger from "../../client/src/logger";

const logger = new Logger('Core');
const isSharedJSContext = window.location.hostname === 'steamloopback.host';

declare global {
	interface Window {
		MILLENNIUM_API: object;
		SP_REACT: typeof React;
		SP_REACTDOM: any;
		MILLENNIUM_IPC_PORT: number;
		webpackChunksteamui?: any;
	}
}

declare const steam_client_components: (module: any, react: typeof React) => object;
declare const millennium_api_components: (module: any) => object;

// export * from './deck-libs';
const CreateWebSocket = (url: string): Promise<WebSocket> => {
	return new Promise((resolve, reject) => {
		try {
			let socket = new WebSocket(url);
			socket.addEventListener('open', () => {
				logger.log('Successfully connected to IPC server.');
				resolve(socket);
			});
			socket.addEventListener('close', () => {
				setTimeout(() => {
					CreateWebSocket(url).then(resolve).catch(reject);
				}, 100);
			});
		} 
		catch (error) {
			console.warn('Failed to connect to IPC server:', error);
		} 
	});
}

const WaitForSocket = (socket: WebSocket) => {
	return new Promise<void>((resolve, reject) => {
		if (socket.readyState === WebSocket.OPEN) {
			resolve();
		} else {
			socket.addEventListener('open', () => resolve());
			socket.addEventListener('error', () => reject());
		}
	});
}

const InjectLegacyReactGlobals = async () => {
	window.MILLENNIUM_API = {
		...window.MILLENNIUM_API,
		...millennium_api_components({}),
		...steam_client_components({}, window.SP_REACT)
	};
}

const WaitForSPReactDOM = () => {
	return new Promise<void>((resolve) => {
		const CallBack = (module: any) => {
			if (module?.length >= 5) {
				InjectLegacyReactGlobals();
				clearInterval(interval);
				resolve();
			}
		}

		const interval = setInterval(() => CallBack(window?.webpackChunksteamui), 100);
	});
}

const StartPreloader = (port: number, shimList?: string[]) => {
	window.MILLENNIUM_IPC_PORT = port;
	logger.log(`Successfully bound to ${isSharedJSContext ? 'client' : 'webkit'} DOM...`);

	CreateWebSocket('ws://localhost:' + port).then(async (socket: WebSocket) => {
		window.MILLENNIUM_IPC_SOCKET = socket;
		window.CURRENT_IPC_CALL_COUNT = 0;
	
		await Promise.all([ WaitForSocket(socket), ...(isSharedJSContext ? [WaitForSPReactDOM()] : []) ]);
		logger.log("Ready to inject shims...");

		if (!isSharedJSContext) 
			(window as any).MILLENNIUM_API = millennium_api_components({});

		shimList?.forEach((shim) => {
			!document.querySelectorAll(`script[src='${shim}'][type='module']`).length 
				&& document.head.appendChild(Object.assign(document.createElement('script'), { src: shim, type: 'module', id: 'millennium-injected' }));
		});
	}).catch((error) => 
		console.error('Initial WebSocket connection failed:', error));
}

export default StartPreloader;
