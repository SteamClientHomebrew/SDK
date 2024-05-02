import { CSteamID } from "./CSteamID";
import { EBrowserType, EUIMode } from "./enums";

export type AFunction = (...args: any[]) => any;

export interface BrowserContext {
	/**
	 * Window type.
	 */
	m_eBrowserType?: EBrowserType;
	/**
	 * The UI mode in use.
	 */
	m_eUIMode: EUIMode;
	/**
	 * @todo Appears when EBrowserType == 0 ?
	 */
	m_gameID?: string;
	/**
	 * @todo Same as `SteamClient.Browser.GetBrowserID()` ?
	 */
	m_nBrowserID: number;
	/**
	 * Game's app ID.
	 */
	m_unAppID?: number;
	/**
	 * If overlay, game's PID.
	 */
	m_unPID: number;
}

export interface Unregisterable {
	unregister(): void;
}

export interface WebSocketConnection {
	m_bDisconnectRequested: boolean;
	m_bReconnectOnFailure: boolean;
	m_bReconnecting: boolean;
	m_nConnectionTimeoutMs: number;
	m_nMaximumConnectAttempt: number;
	m_sName: string;
	m_sURL: string;
	m_socket: WebSocket;

	BCanSendMessages(): boolean;
	BShouldReconnect(): boolean;
	Connect(url: string): Promise<any>; // OperationResponse
	Disconnect(): void;
	InternalConnect(url: string, retries: number): Promise<any>; // OperationResponse
	PrepareForShutdown(): void;
	SendSerializedMessage(param0: any): any;
	StartReconnect(): Promise<void>;
	WaitForSocketOpen(ws: WebSocket, retries: number): Promise<boolean>;
}

export interface CurrentUser {
	NotificationCounts: {
		async_game_updates: number;
		comments: number;
		gifts: number;
		help_request_replies: number;
		inventory_items: number;
		invites: number;
		moderator_messages: number;
		offline_messages: number;
		trade_offers: number;
	};
	bHWSurveyPending: boolean;
	bIsLimited: boolean;
	bIsOfflineMode: boolean;
	bPromptToChangePassword: boolean;
	bSupportAckOnlyMessages: boolean;
	bSupportAlertActive: boolean;
	bSupportPopupMessage: boolean;
	clientinstanceid: string;
	strAccountBalance: string;
	strAccountBalancePending: string;
	strAccountName: string;
	strFamilyGroupID: string;
	/**
	 * @todo unused /
	 */
	strFamilyGroupName: string;
	strSteamID: string;
	/**
	 * @todo unused ?
	 */
	rgFamilyGroupMembers: any[];
}

interface Unsubscribable {
	Unsubscribe(): void;
}

// @v
/**
 * Interface to register and unregister callbacks from, with ability to dispatch.
 */
export interface CCallbackList {
	m_vecCallbacks: AFunction[];

	/**
	 * Empties {@link m_vecCallbacks}.
	 */
	ClearAllCallbacks(): void;
	/**
	 * Length of {@link m_vecCallbacks}.
	 */
	CountRegistered(): number;
	Dispatch(...args: any[]): void;
	Register(callback: AFunction): Unsubscribable;
}

// @v
export interface SubscribableValue<T> {
	m_callbacks: CCallbackList;
	m_currentValue: T;
	m_fnEquals: any;

	/** Sets a new value and notifies Subscribers of the new value.  */
	Set(newValue: T): void;
	/** Adds a subscription to the backing CCallbackList.  */
	Subscribe(subscriber: AFunction): Unsubscribable;
	/** A snapshot of the current value which can change at any time.  */
	get Value(): T;
}

export interface CMInterfaceCallbacks {
	m_ClientConnectionCallbacks: CCallbackList;
	m_bRunOnce: boolean;
	m_mapServerTypeCallbacks: Map<any, any>;

	AddCallback(e: any, t: any): any;
	RunAllCallbacks(e: any, ...t: any): any;
	RunCallbacks(e: any, ...t: any): any;
}

export interface ErrorReportingStore {
	m_bEnabled: boolean;
	m_bInitialized: boolean;
	m_rgErrorQueue: any[];
	m_sendTimer: any;
	m_strProduct: string;
	m_strVersion: string;
	m_transport: ServiceTransport;

	BIsBlacklisted(e: any): any;
	Init(e: any, t: any, n: any): any;
	QueueSend(e: any): any;
	ReportError(e: any, t: any): any;
	SendErrorReport(e: any): any;
	SendErrorReports(e: any): any;
}

export interface CMInterface {
	ClientServersAvailableHandler: {
		invoke(...args: any[]): any;
		unregister(): any;
	};
	m_ServiceTransport: ServiceTransport;
	m_bCompletedInitialConnect: boolean;
	m_bConnected: boolean;
	m_bConnectionFailed: boolean;
	m_bForceDisconnect: boolean;
	m_bLoggedOn: boolean;
	m_bPerformedInitialClockAdjustment: boolean;
	m_bShouldChangePersonaStatusOnDisconnect: boolean;
	m_callbacksOnConnect: CMInterfaceCallbacks;
	m_callbacksOnConnectOneTime: CMInterfaceCallbacks;
	m_callbacksOnDisconnect: CMInterfaceCallbacks;
	m_hEMsgRegistrationObserver(...args: any[]): any;
	m_hSharedConnection: number;
	m_messageHandlers: {
		m_ErrorReportingStore: ErrorReportingStore;
		m_mapCallbacks: {};
		m_mapServiceMethodHandlers: {};
		m_rgRegisteredEMsgs: number[];
		m_rgRegisteredServiceMethodHandlers: string[];

		AddCallback(e: any, t: any, n: any): any;
		AddServiceMethodHandler(e: any, t: any): any;
		AddServiceNotificationHandler(e: any, t: any): any;
		DEBUG_LogMessageDispatch(e: any, t: any): any;
		DispatchMsgToHandlers(e: any, t: any): any;
		InstallErrorReportingStore(e: any): any;
		RegisterBaseEMessageHandler(e: any, t: any): any;
		RegisterEMessageAction(e: any, t: any, n: any): any;
		RegisterEMessageHandler(e: any, t: any, n: any): any;
		RegisterServiceMethodHandler(e: any, t: any): any;
		RegisterServiceMethodHandlerAction(e: any, t: any): any;
		RegisterServiceNotificationHandler(e: any, t: any): any;
		RegisterServiceNotificationHandlerAction(e: any, t: any): any;
	};
	m_nPerfClockServerMSOffset: number;
	m_nWallClockDriftMS: number;
	m_onConnect: any;
	m_rtReconnectThrottleExpiration: number;
	m_rtReconnectThrottleStart: number;
	m_setConnectedServers: {};
	m_setEMsgHandlers: {};
	m_setServiceMethodHandlers: {};
	m_steamid: CSteamID;
	m_strIPCountry: string;
	m_strPersonaName: string;
	m_unAccountFlags: number;

	ClearHeartbeatInterval(): any;
	Connect(): any;
	Disconnect(): any;
	GetShouldChangePersonaStatusOnDisconnect(): any;
	OnConnect(): any;
	OnLogonInfoChanged(e: any): any;
	OnMsgRecvd(e: any): any;
	OnSharedConnectionClosed(): any;
	OnSharedConnectionEstablished(e: any): any;
	ResetHeartbeatInterval(): any;
	SendHeartbeat(): any;
	SendInternal(e: any): any;
	SendMsgAndAwaitResponse(e: any, t: any): any;
	SetShouldChangePersonaStatusOnDisconnect(e: any): any;
}

export interface ServiceTransport {
	MakeReady(...args: any[]): any;
	SendMsg(e: any, t: any, n: any): any;
	SendNotification(e: any, t: any): any;
}

export interface WebUIServiceTransport extends ServiceTransport {
	m_connectionClientdll: WebSocketConnection;
	m_connectionSteamUI: WebSocketConnection;
	m_iMsgSeq: number;
	m_mapPendingMethodRequests: Map<any, any>;
	m_mapServiceCallErrorCount: Map<any, any>;
	m_messageHandlers: {
		m_mapCallbacks: Map<any, any>;
		m_mapServiceMethodHandlers: Map<
			string,
			{
				invoke(...args: any[]): any;
				msgClass: any; // JsPbClass
			}
		>;
		m_rgRegisteredEMsgs: any[];
		m_rgRegisteredServiceMethodHandlers: string[];

		AddCallback(e: any, t: any, n: any): any;
		AddServiceMethodHandler(e: any, t: any): any;
		AddServiceNotificationHandler(e: any, t: any): any;
		DEBUG_LogMessageDispatch(e: any, t: any): any;
		DispatchMsgToHandlers(e: any, t: any): any;
		InstallErrorReportingStore(e: any): any;
		RegisterBaseEMessageHandler(e: any, t: any): any;
		RegisterEMessageAction(e: any, t: any, n: any): any;
		RegisterEMessageHandler(e: any, t: any, n: any): any;
		RegisterServiceMethodHandler(e: any, t: any): any;
		RegisterServiceMethodHandlerAction(e: any, t: any): any;
		RegisterServiceNotificationHandler(e: any, t: any): any;
		RegisterServiceNotificationHandlerAction(e: any, t: any): any;
	};
	m_transportInfo: any; // TransportInfo

	AuthConnection(e: any): any;
	DispatchMethodResponse(e: any): any;
	DispatchNotification(e: any): any;
	FailAllPendingRequests(): any;
	GetAuthInfoForConnection(e: any): any;
	ReportError(message: string): void;
	SendAuthMessage(e: any): any;
}
