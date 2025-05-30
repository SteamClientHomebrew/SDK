enum Context {
	Client,
	Browser,
}

declare global {
	interface Window {
		MILLENNIUM_API: object;
		SP_REACTDOM: any;
		MILLENNIUM_IPC_PORT: number;
		MILLENNIUM_FRONTEND_LIB_VERSION: string;
		MILLENNIUM_BROWSER_LIB_VERSION: string;
		MILLENNIUM_LOADER_BUILD_DATE: string;
	}
}

class Bootstrap {
	logger: import('@steambrew/client/build/logger').default;
	startTime: number;
	ctx: Context;

	async init() {
		const loggerModule = await import('@steambrew/client/build/logger');

		this.logger = new loggerModule.default('Bootstrap');
		this.ctx = window.location.hostname === 'steamloopback.host' ? Context.Client : Context.Browser;
		this.startTime = performance.now();
	}

	connectMillenniumBackend(port: number): Promise<WebSocket> {
		return new Promise((resolve) => {
			try {
				let socket = new WebSocket('ws://127.0.0.1:' + port);

				socket.addEventListener('open', () => {
					const endTime = performance.now(); // End timing
					const connectionTime = endTime - this.startTime;
					this.logger.log(`Successfully connected to IPC server in ${connectionTime.toFixed(2)} ms.`);
					resolve(socket);
				});

				socket.addEventListener('error', () => {
					console.error('Failed to connect to IPC server at port', port);
					window.location.reload(); // Reload the page if the connection fails
				});
			} catch (error) {
				console.warn('Failed to connect to IPC server:', error);
			}
		});
	}

	async injectLegacyReactGlobals() {
		this.logger.log('Injecting Millennium API...');

		if (!window.SP_REACT) {
			this.logger.log('Injecting legacy React globals...');

			const webpack = await import('@steambrew/client/build/webpack');

			window.SP_REACT = webpack.findModule((m) => m.Component && m.PureComponent && m.useLayoutEffect);
			window.SP_REACTDOM = webpack.findModule((m) => m.createPortal && m.createRoot);
		}

		this.logger.log('Injecting Millennium frontend library...');
		Object.assign((window.MILLENNIUM_API ??= {}), await import('@steambrew/client'), await import('./millennium-api'));

		this.logger.log('Millennium API injected successfully.', window.MILLENNIUM_API);
	}

	waitForClientReady(): Promise<void> {
		const checkReady = async (resolve: () => void, interval) => {
			// @ts-expect-error Part of the builtin Steam Client API.
			if (!window.App?.BFinishedInitStageOne()) return;
			clearInterval(interval);
			await this.injectLegacyReactGlobals();
			resolve();
		};

		return new Promise((resolve) => {
			const interval = setInterval(() => checkReady(resolve, interval), 0);
		});
	}

	async StartPreloader(port: number, shimList?: string[]) {
		await this.init();

		/** Setup IPC */
		window.MILLENNIUM_IPC_PORT = port;
		window.MILLENNIUM_IPC_SOCKET = await this.connectMillenniumBackend(port);
		window.CURRENT_IPC_CALL_COUNT = 0;

		window.MILLENNIUM_FRONTEND_LIB_VERSION = process.env.MILLENNIUM_FRONTEND_LIB_VERSION || 'unknown';
		window.MILLENNIUM_BROWSER_LIB_VERSION = process.env.MILLENNIUM_FRONTEND_LIB_VERSION || 'unknown';
		window.MILLENNIUM_LOADER_BUILD_DATE = process.env.MILLENNIUM_LOADER_BUILD_DATE || 'unknown';

		switch (this.ctx) {
			case Context.Client: {
				this.logger.log('Running in client context...');
				await this.waitForClientReady();
				break;
			}
			case Context.Browser: {
				this.logger.log('Running in browser context...');
				window.MILLENNIUM_API = await import('./millennium-api');

				const browserUtils = await import('./browser-init');
				await browserUtils.appendAccentColor();
				break;
			}
			default: {
				this.logger.error("Unknown context, can't load Millennium:", this.ctx);
				return;
			}
		}

		this.logger.log('Loading user plugins...');

		/** Inject the JavaScript shims into the DOM */
		shimList?.forEach(
			(shim) =>
				!document.querySelector(`script[src="${shim}"][type="module"]`) &&
				document.head.appendChild(
					Object.assign(document.createElement('script'), {
						src: shim,
						type: 'module',
						id: 'millennium-injected',
					}),
				),
		);

		const endTime = performance.now(); // End timing
		const connectionTime = endTime - this.startTime;
		this.logger.log(`Successfully injected shims into the DOM in ${connectionTime.toFixed(2)} ms.`);
	}
}

export default Bootstrap;
