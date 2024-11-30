import React from "react";
import Logger from "./logger";

const logger = new Logger('Core');
const isSharedJSContext = window.location.hostname === 'steamloopback.host';

declare global {
	interface Window {
	  SP_REACT: typeof React;
	  SP_REACTDOM: any;
	  MILLENNIUM_IPC_PORT: number;
	}
}

declare const millennium_api_components: (module: any, react: typeof React) => void;
declare const millennium_webkit_components: (module: any) => void;

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
	(window as any).MILLENNIUM_API = millennium_api_components({}, window.SP_REACT);
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
	logger.group(`Injecting ${isSharedJSContext ? 'client' : 'webkit'} shims...`);

	CreateWebSocket('ws://localhost:' + port).then(async (socket: WebSocket) => {
		window.MILLENNIUM_IPC_SOCKET = socket;
		window.CURRENT_IPC_CALL_COUNT = 0;
	
		await Promise.all([ WaitForSocket(socket), ...(isSharedJSContext ? [WaitForSPReactDOM()] : []) ]);
		logger.groupEnd("Ready to inject shims...");

		if (!isSharedJSContext) 
			(window as any).MILLENNIUM_API = millennium_webkit_components({});

		shimList?.forEach((shim) => {
			!document.querySelectorAll(`script[src='${shim}'][type='module']`).length 
				&& document.head.appendChild(Object.assign(document.createElement('script'), { src: shim, type: 'module', id: 'millennium-injected' }));
		});
	}).catch((error) => 
		console.error('Initial WebSocket connection failed:', error));
}

export default StartPreloader;
