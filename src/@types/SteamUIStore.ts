import {
	BrowserContext,
	CCallbackList,
	SubscribableValue,
} from "./shared/interfaces";

export enum ENotificationPosition {
	TopLeft,
	TopRight,
	BottomLeft,
	BottomRight,
}

export enum EWindowType {
	MainGamepadUI,
	OverlayGamepadUI,
	Keyboard,
	ControllerConfigurator,
	VR,
	MainDesktopUI,
	DesktopLogin,
	OverlayDesktopUI,
	SteamChinaReviewLauncher,
}

type SteamWindowSettingsSection =
	| "Account"
	| "Audio"
	| "Bluetooth"
	| "Broadcast"
	| "Cloud"
	| "Compatibility"
	| "Controller"
	| "Customization"
	| "DesktopSecurity"
	| "Developer"
	| "Display"
	| "Downloads"
	| "Family"
	| "Friends"
	| "General"
	| "Home"
	| "InGame"
	| "InGameVoice"
	| "Interface"
	| "Internal"
	| "Internet"
	| "Keyboard"
	| "Library"
	| "Music"
	| "Notifications"
	| "Power"
	| "RemotePlay"
	| "Root"
	| "Security"
	| "Storage"
	| "System"
	| "Voice";

export interface SteamWindowMediaState {
	state: {
		strScreenshotHandle: string;
		nAppID: number;
	};
}

export interface SteamWindowNavigator {
	type: "desktop" | "desktopoverlay" | "gamepad";
	setNavigatingToInitialRoute(value: boolean): void;

	AllCollections(): void;
	App(appId: number): void;
	AppProperties(appId: number): void;
	Chat(): void;
	Collection(name: string): void;
	Console(): void;
	Downloads(): void;
	ExternalWeb(url: string): void;
	GlobalAchievements(): void;
	Home(): void;
	Media(state: SteamWindowMediaState): void;
	MyAchievements(appId: number): void;
	Settings(section: SteamWindowSettingsSection): void;
	SteamWeb(param0: any, param1: any): void;
	SteamWebTab(url: string): void;
}

export interface SteamWindowNavigator_Gamepad extends SteamWindowNavigator {
	Account(): void;
	ControllerConfigurator: {
		Main(appId: number): void;
	};
	Invites(): void;
	LibraryTab(): void;
	Login(): void;
	MTXAuth(): void;
	Reauthentication(): void;
}

export interface SteamWindowNotificationPosition {
	horizontalInset: number;
	position: ENotificationPosition;
	verticalInset: number;
}

/**
 * @todo the first 2 do say `k_`, but maybe use their types instead
 */
export interface VirtualKeyboardManager {
	k_nKeyboardWindowOffset: 10;
	k_rgKeyboardLocations: [
		"center-bottom",
		"lower-left",
		"upper-left",
		"center-top",
		"upper-right",
		"lower-right",
	];
	m_OnActiveElementChanged: CCallbackList;
	m_OnActiveElementClicked: CCallbackList;
	m_bDismissOnEnter: boolean;
	m_bIsInlineVirtualKeyboardOpen: SubscribableValue<boolean>;
	m_bIsVirtualKeyboardModal: SubscribableValue<boolean>;
	m_currentVirtualKeyboardRef: any;
	m_iKeyboardLocation: number;
	m_lastActiveVirtualKeyboardRef: any;
	m_strDeadKeyCombined: any;
	m_strDeadKeyNext: any;
	m_strDeadKeyPending: any;
	m_textFieldLocation: any;

	ClearCurrentVirtualKeyboardRef(): any;
	CreateVirtualKeyboardRef(e: any, t: any): any;
	GetDeadKeyPending(): any;
	GetEnterKeyLabel(): any;
	HandleDeadKeyDown(e: any, t: any, n: any): any;
	HandleNavOut(e: any): any;
	HandleVirtualKeyDown(e: any, t: any): any;
	Init(): any;
	InitKeyboardLocation(e: any, t: any, n: any): any;
	ResetDeadKeyState(): any;
	RestoreVirtualKeyboardForLastActiveElement(): any;
	/**
	 * @param n -1 by default
	 */
	RotateKeyboardLocation(e: any, t: any, n: any): any;
	SelectBestModalPosition(e: any): any;
	SendClientPasteCommand(): any;
	SetActiveVirtualKeyboardTarget(e: any, t: any, n: any): any;
	SetDismissOnEnterKey(e: any): any;
	SetTextFieldLocation(e: any, t: any, n: any, o: any): any;
	SetVirtualKeyboardActiveRef(e: any): any;
	SetVirtualKeyboardDone(e: any): any;
	SetVirtualKeyboardHidden(e: any): any;
	SetVirtualKeyboardShownInternal(e: any, t: any): any;
	SetVirtualKeyboardVisible(e: any): any;
	ShowVirtualKeyboard(e: any, t: any, n: any, o: any): any;
}

export interface SteamUIWindow {
	/** The window's {@link Window}. */
	m_BrowserWindow: Window;

	/** Whether the BPM UI is initialized. */
	m_bIsGamepadApplicationUIInitialized: boolean;

	/**
	 * The interface used depends on the {@link SteamWindowNavigator} type:
	 *
	 * `desktop` or `desktopoverlay` - {@link SteamWindowNavigator}
	 *
	 * `gamepad` - {@link SteamWindowNavigator_Gamepad}
	 */
	m_Navigator: SteamWindowNavigator;

	/** The notifications' position & offset. */
	m_notificationPosition: SteamWindowNotificationPosition;

	m_params: {
		/** @todo Appears only when overlay ? */
		appid: number;
		browserInfo: BrowserContext;
		eWindowType: EWindowType;
		/** @todo Appears only when overlay ? */
		flDisplayScale: number;
		/** @todo Appears only when overlay ? */
		gameid: string;
		/** @todo Appears only when overlay ? */
		nScreenHeight: number;
		/** @todo Appears only when overlay ? */
		nScreenWidth: number;
		strUserAgentIdentifier: string;
	};

	m_VirtualKeyboardManager: VirtualKeyboardManager;

	BCanPopVRDashboardForCurrentPath(): boolean;
	BHasMenus(): boolean;
	BIsFocusNavActive(): boolean;
	BIsGamepadApplicationUIInitialized(): boolean;
	BIsOverlayPath(): boolean;
	BRouteMatch(e: any): boolean;
	BUseSeparateOverlayWindows(): boolean;
	BViewingPreLoginRoute(): boolean;
	/**
	 * @todo Creates a browser view object similiar to the one in MainWindowBrowserManager
	 * @param name Browser name.
	 * @param options BrowserViewInit
	 */
	CreateBrowserView(name: string, options: any): any;
	FocusApplicationRoot(): void;
	GetMainVROverlayKey: any;
	GetShowingGlobalModal: any;
	GetStoreBrowser: any;
	Init: any;
	InitFocusNavContext: any;
	InitGamepadApplicationUI: any;
	InitNavigation: any;
	InitializeDefaultActions: any;
	IsControllerConfiguratorWindow: any;
	IsDesktopLoginWindow: any;
	IsDesktopOverlayWindow: any;
	IsDesktopUIWindow: any;
	IsGamepadUIOverlayWindow: any;
	IsGamepadUIWindow: any;
	IsMainDesktopWindow: any;
	IsMainGamepadUIWindow: any;
	IsStandaloneKeyboardWindow: any;
	IsSteamChinaReviewLauncher: any;
	IsVRSimulatedOnDesktopWindow: any;
	IsVRWindow: any;
	IsVRWindowInGamescope: any;
	Navigate(e: any, t: boolean, n: boolean, o?: any): void;
	NavigateBack: any;
	NavigateHistory: any;
	NavigateToRunningApp: any;
	NavigateToStandaloneAppRunningControls: any;
	NavigateToSteamWeb: any;
	NavigateWithoutChangingFocus: any;
	OnApplicationUIInitComplete: any;
	OnHomeButtonPressed: any;
	OnQuickAccessButtonPressed: any;
	OnVirtualKeyboardShown: any;
	SetBrowserWindow: any;
	SetNavigator: any;
	SetNotificationPosition: any;
	SetShowingGlobalModal: any;
	SetStoreBrowserGlass: any;
}

export default interface SteamUIStore {
	WindowStore: {
		OverlayWindows: SteamUIWindow[];
		SteamUIWindows: SteamUIWindow[];
	};
}
