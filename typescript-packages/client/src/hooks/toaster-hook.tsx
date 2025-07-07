import Toast from '../components/Toast';
import Logger from '../logger';
import { ReactNode } from 'react';
import { callOriginal, injectFCTrampoline, Patch, replacePatch } from '../utils';
import { findModuleExport } from '../webpack';
import { ErrorBoundary } from '../components';

// TODO export
enum ToastType {
	New,
	Update,
	Remove,
}

export interface ToastData {
	title: ReactNode;
	body: ReactNode;
	subtext?: ReactNode;
	logo?: ReactNode;
	icon?: ReactNode;
	timestamp?: Date;
	onClick?: () => void;
	className?: string;
	contentClassName?: string;
	/** ms before toast popup is hidden. defaults to 5 seconds */
	duration?: number;
	/** ms before toast is removed from the tray. Valve's logic will always remove all toasts 48h after they are first viewed regardless of this value */
	expiration?: number;
	critical?: boolean;
	eType?: number;
	sound?: number;
	/** Hidden 10min after first viewed */
	showNewIndicator?: boolean;
	playSound?: boolean;
	showToast?: boolean;
}

export interface ToastNotification {
	data: ToastData;
	dismiss: () => void;
}

declare global {
	interface Window {
		__TOASTER_INSTANCE: any;
		settingsStore: any;
		NotificationStore: any;
	}
}

class Toaster extends Logger {
	private toastPatch?: Patch;

	constructor() {
		super('Toaster');

		window.__TOASTER_INSTANCE?.deinit?.();
		window.__TOASTER_INSTANCE = this;

		const ValveToastRenderer = findModuleExport((e) => e?.toString?.()?.includes(`controller:"notification",method:`));
		// TODO find a way to undo this if possible?
		const patchedRenderer = injectFCTrampoline(ValveToastRenderer);
		this.toastPatch = replacePatch(patchedRenderer, 'component', (args: any[]) => {
			if (args?.[0]?.group?.millennium || args?.[0]?.group?.notifications?.[0]?.millennium) {
				return args[0].group.notifications.map((notification: any) => (
					<ErrorBoundary>
						<Toast toast={notification.data} newIndicator={notification.bNewIndicator} location={args?.[0]?.location} />
					</ErrorBoundary>
				));
			}
			return callOriginal;
		});

		this.log('Initialized');
	}

	toast(toast: ToastData): ToastNotification {
		if (toast.sound === undefined) toast.sound = 6;
		if (toast.playSound === undefined) toast.playSound = true;
		if (toast.showToast === undefined) toast.showToast = true;
		if (toast.timestamp === undefined) toast.timestamp = new Date();
		if (toast.showNewIndicator === undefined) toast.showNewIndicator = true;
		/* eType 13 
      13: {
        proto: m.mu,
        fnTray: null,
        showToast: !0,
        sound: f.PN.ToastMisc,
        eFeature: l.uX
      }
    */
		let toastData = {
			nNotificationID: window.NotificationStore.m_nNextTestNotificationID++,
			bNewIndicator: toast.showNewIndicator,
			rtCreated: Date.now(),
			eType: toast.eType || 12,
			eSource: 1, // Client
			nToastDurationMS: toast.duration || (toast.duration = 5e3),
			data: toast,
			millennium: true,
		};
		let group: any;
		function fnTray(toast: any, tray: any) {
			group = {
				eType: toast.eType,
				notifications: [toast],
			};
			tray.unshift(group);
		}
		const info = {
			showToast: toast.showToast,
			sound: toast.sound,
			eFeature: 0,
			toastDurationMS: toastData.nToastDurationMS,
			bCritical: toast.critical,
			fnTray,
		};
		const self = this;
		let expirationTimeout: number;
		const toastResult: ToastNotification = {
			data: toast,
			dismiss() {
				self.debug('Dismissing toast', toast);
				// it checks against the id of notifications[0]
				try {
					expirationTimeout && clearTimeout(expirationTimeout);
					group && window.NotificationStore.RemoveGroupFromTray(group);
				} catch (e) {
					self.error('Error while dismissing toast:', e);
				}
			},
		};
		if (toast.expiration) {
			expirationTimeout = window.setTimeout(() => {
				self.debug('Dismissing expired toast', toast);
				try {
					group && window.NotificationStore.RemoveGroupFromTray(group);
				} catch (e) {
					this.error('Error while dismissing expired toast:', e);
				}
			}, toast.expiration);
		}
		try {
			window.NotificationStore.ProcessNotification(info, toastData, ToastType.New);
		} catch (e) {
			this.error('Error while sending toast:', e);
		}
		return toastResult;
	}

	deinit() {
		this.toastPatch?.unpatch();
	}
}

export default Toaster;
