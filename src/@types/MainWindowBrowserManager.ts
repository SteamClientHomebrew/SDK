import { CCallbackList } from "./shared/interfaces";

type SteamBrowserAction = "POP" | "PUSH" | "REPLACE";

type SteamBrowserTab = "community" | "store" | "me";

export interface SteamBrowserHistoryEntry {
	hash: string;
	key: string;
	pathname: string;
	search: string;

	/**
	 * Present if `pathname` is `/browser/`.
	 */
	state?: {
		/**
		 * `true` if called from Steam.
		 */
		bExternal: boolean;
		/**
		 * Entry URL.
		 */
		strURL: string;
	};
}

export interface SteamBrowserHistory {
	entries: SteamBrowserHistoryEntry[];
	index: number;
}

export interface SteamBrowserHistory_Full extends SteamBrowserHistory {
	action: SteamBrowserAction;
	block(param0: any): any;
	canGo(index: number): boolean;
	createHref(entry: SteamBrowserHistoryEntry): string;
	go(param0: any): any;
	goBack(): void;
	goForward(): void;

	/** `entries` length. */
	length: number;

	listen(param0: any): any;

	/** Current location. */
	location: SteamBrowserHistoryEntry;

	push(param0: any, param1: any): any;
	replace(param0: any, param1: any): any;
}

export interface TabbedBrowserWebPageRequest {
	requestid: number;
	strLastURL: string;
	strTitle: string;
	strURL: string;
}

export interface CTabbedBrowserStore {
	m_cbWebPageRequestsChanged: CCallbackList;
	m_nActiveWebpageRequestID: number;
	m_nWebPageRequestID: number;
	m_rgWebPageRequests: TabbedBrowserWebPageRequest[];

	/**
	 * @param url Web page's URL. `data:text/html,<body></body>` by default.
	 */
	AddWebPageRequest(url?: string, param1?: any): void;

	GetWebPageRequestsChangedCallbackList(): CCallbackList;

	/**
	 * Exactly what its name says. Closes the browser, too.
	 */
	RemoveAllRequests(): void;

	/**
	 * Exactly what its name says.
	 */
	RemoveWebPageRequest(requestId: number): boolean;

	ReorderWebPageRequest(param0: any, param1: any): void;

	/**
	 * @todo Probably used to init this.
	 */
	Set(
		activeWebpageRequestId: number,
		webPageRequestId: number,
		webPageRequests: TabbedBrowserWebPageRequest[],
	): void;

	/**
	 * @param requestId Web page request ID, like in {@link TabbedBrowserWebPageRequest.requestid}}.
	 * @param url Web page's URL.
	 * @param title Web page's `<title>`.
	 *
	 * @returns Whether the request ID exists.
	 */
	UpdateWebPageRequest(
		requestId?: number,
		url?: string,
		title?: string,
	): boolean;
}

export default interface MainWindowBrowserManager {
	/** Current URL. */
	m_URL: string;

	/** Current URL. */
	m_URLRequested: string;

	m_bExpectImportantReplace: boolean;

	/** Whether the page is loading or not. */
	m_bLoading: boolean;

	m_bRouterChangeTroggeredBySync: boolean;

	/** `BrowserViewPopup` */
	m_browser: any;

	/** Browser history. */
	m_browserHistory: SteamBrowserHistory;

	/** Browser history. */
	m_history: SteamBrowserHistory_Full;

	m_lastActiveTab: SteamBrowserTab;
	m_lastActiveTabURLs: {
		community: string;
		me: string;
		store: string;
	};
	m_lastLocation: SteamBrowserHistoryEntry;
	m_loadErrorCode: any | null;
	m_loadErrorDesc: any | null;
	m_loadErrorURL: any | null;

	/** `BrowserViewPageSecurity` */
	m_pageSecurity: any | null;

	m_rootTabURLs: {
		store: "StoreFrontPage";
		community: "CommunityFrontPage";
		me: "SteamIDMyProfile";
	};

	/** Current location's `<title>`. */
	m_strTitle: string;

	m_tabbedBrowserStore: CTabbedBrowserStore;
	m_tsWaitingForBrowserChange: number | undefined;

	ActivateTab(tab: SteamBrowserTab): void;
	BIsWaitingForHistoryCallback(): boolean;
	GetLastActiveTab(): SteamBrowserTab;
	GetTabForURL(url: string): SteamBrowserTab | "ignore" | "maintain";

	/**
	 * @todo Loads a URL, but `bExternal` is `false`.
	 */
	LoadURL(url: string): void;

	/**
	 * Reloads the current page.
	 */
	Reload(): void;

	/**
	 * @todo Loads a URL, but `bExternal` is `true`.
	 */
	ShowURL(url: string, param1: any): void;
	SyncWithNewBrowserHistory(entry: SteamBrowserHistory): void;
	SyncWithNewRouterEvent(
		entry: SteamBrowserHistoryEntry,
		action: SteamBrowserAction,
	): void;
	UpdateActiveTab(url: string): void;
}
