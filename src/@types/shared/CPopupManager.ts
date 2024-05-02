import { EBrowserType } from "./enums";
import { BrowserContext } from "./interfaces";

interface RestoreDetails {
	bExpires: boolean;
	/**
	 * Date as a Unix timestamp.
	 */
	last_used: number;
	strRestoreDetails: string;
}

interface SteamPopupParameters {
	availscreenheight: number;
	availscreenwidth: number;
	bHideOnClose: boolean;
	bModal: boolean;
	bNoFocusOnShow: boolean;
	/**
	 * @todo saw in js, but is it there ?
	 */
	bNoInitialShow: boolean;
	bPinned: boolean;
	/**
	 * Popup's <body> class.
	 */
	body_class: string;
	browserType: EBrowserType;
	/**
	 * Popup is centered on this window.
	 */
	center_on_window: Window;
	dimensions: Partial<{
		height: number;
		left: number;
		top: number;
		width: number;
	}>;
	/**
	 * {@link EPopupCreationFlags}
	 */
	eCreationFlags: number;
	/**
	 * Popup <html> class.
	 */
	html_class: string;
	/**
	 * @todo unused ?
	 */
	hwndParent: number;
	/**
	 * Popup minimum height.
	 */
	minHeight: number;
	/**
	 * Popup minimum width.
	 */
	minWidth: number;
	/**
	 * Parent browser ID.
	 */
	parent_container_popup_id: number;
	/**
	 * Root element class.
	 */
	popup_class: string;
	replace_existing_popup: boolean;
	strRestoreDetails: string;
	strUserAgent: string;
	strVROverlayKey: string;
	// @v
	/**
	 * These parameters are interpreted by the Steam process to open popups
	 * in the Steam overlay or SteamVR dashboard instead of on the desktop.
	 */
	target_browser: BrowserContext;
	/**
	 * Popup name.
	 */
	m_strName: string;
	/**
	 * Document title.
	 */
	m_strTitle: string;
	/**
	 * Parent browser ID.
	 */
	window_opener_id: number;

	DoCallback(e: any): any;
	OnBlur(): any;
	OnClose(): any;
	OnCreate(): any;
	OnFocus(): any;
	OnLoad(): any;
	OnResize(): any;
	Render(e: any, t: any): any;
	UpdateParamsBeforeShow(e: any): any;
}

// @v
/**
 * Helper to track when all links for a newly created popup have loaded.
 * Supports CPopup replacement too.
 */
interface CRenderWhenLinksReady {
	m_fnRender: () => void | undefined;
	m_rgLoadingLinks: Node[];

	AddLink(link: Node, checkIfLoaded: boolean): void;
	SetTarget(renderCallback: any): void;
}

interface SteamPopup {
	/**
	 * `true` if the popup will not be shown initially.
	 */
	m_bCreateHidden: boolean;
	/**
	 * `true` if created.
	 */
	m_bCreated: boolean;
	/**
	 * `true` if focused.
	 */
	m_bFocused: boolean;
	m_callbacks: {
		onLoad(e: any, t: any): any;
		onResize(t: any, r: any, i: any): any;
		updateParamsBeforeShow(...args: any[]): any;
	};
	/**
	 * Root element.
	 */
	m_element: Node;
	m_fnReadyToRender(...args: any[]): any;
	m_onCreateRender: any;
	m_popup: Window;
	m_renderWhenReady: CRenderWhenLinksReady;
	m_rgParams: Partial<SteamPopupParameters>;
}

export interface CPopupManager {
	DebouncedSaveSavedDimensionStore_DebounceProperties: {
		hTimer: any;
		nPending: number;
	};
	m_DynamicCSSObserver: MutationObserver;
	m_bSaveRequired: boolean;
	m_bShuttingDown: boolean;
	m_mapPopups: Map<string, SteamPopup>;
	m_mapRestoreDetails: Map<string, RestoreDetails>;
	m_rgPopupCreatedCallbacks: ((popup?: SteamPopup) => void)[];
	m_rgShutdownCallbacks: ((popup?: SteamPopup) => void)[];
	m_unCurrentAccountID: number;

	/**
	 * Adds a callback to dispatch on popup creation.
	 */
	AddPopupCreatedCallback(callback: (popup: SteamPopup) => void): void;
	/**
	 * Adds a callback to dispatch on Steam shutdown.
	 */
	AddShutdownCallback(callback: () => void): void;
	/**
	 * Adds a popup and dispatches all the callbacks.
	 */
	AddTrackedPopup(popupName: string, popup: SteamPopup): void;
	/**
	 * @returns `true` if one of the context menus is focused, `false` otherwise.
	 */
	BAnyMenuHasFocus(): boolean;
	/**
	 * @returns `true` if one of the windows is focused, `false` otherwise.
	 */
	BAnyPopupHasFocus(): boolean;
	/**
	 * @returns `true` if Steam is about to shut down, `false` otherwise.
	 */
	BShuttingDown(): boolean;
	/**
	 * Clears saved restore details from {@link m_mapRestoreDetails}.
	 */
	ClearSavedDimensionStore(): void;
	/**
	 * @todo is this used/useful ?
	 */
	ClosePopupsOwnedByBrowser(browser: BrowserContext): void;
	/**
	 * @returns the popup for the specified popup name.
	 */
	GetExistingPopup(popupName: string): SteamPopup;
	/**
	 * @returns the key used for usage in localStorage. Saved on a per-account basis.
	 */
	GetLocalStorageKey(): string;
	/**
	 * @returns the popup for the specified window.
	 */
	GetPopupForWindow(window: Window): SteamPopup;
	/**
	 * @todo wtf does that return ? SteamPopup[] on [...this]
	 */
	GetPopups(): any;
	/**
	 * @returns restore details for the specified window.
	 */
	GetRestoreDetails(windowName: string): string;
	/**
	 * Loads saved restore details from localStorage.
	 */
	LoadSavedDimensionStore(): void;
	/**
	 * Deletes a popup.
	 */
	RemoveTrackedPopup(popup: SteamPopup): void;
	/**
	 * Saves restore details in localStorage.
	 */
	SaveSavedDimensionStore(): void;
	/**
	 * @param accountId Steam3 ID.
	 */
	SetCurrentLoggedInAccountID(accountId: number): void;
	/**
	 * Sets restore details for the specified popup.
	 */
	SetRestoreDetails(
		popupName: string,
		restoreDetails: string,
		expires: boolean,
	): void;
}
