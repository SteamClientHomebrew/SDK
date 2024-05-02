import {
	CMInterface,
	CurrentUser,
	WebUIServiceTransport,
} from "./shared/interfaces";

enum EUserConfigStoreNamespace {
	Invalid,
	Library,
}

enum EConflictResolutionMethod {
	LastWriteWins = "last-write",
	CustomMethod = "custom",
	InitializationOnly = "initial",
}

/**
 * @todo This whole thing
 * Will break the client if a key isn't a string.
 * Probably better to not look at this thing at all.
 */
interface CloudStorage {
	m_eNamespace: EUserConfigStoreNamespace;

	Get(key: string): string | null;
	GetByPrefix(prefix: string): Map<string, string>;
	GetMapForPrefix(prefix: string): any;
	GetObject(key: string): Promise<any | null>;
	GetString(key: string): Promise<string | null>;
	/**
	 * @param resolutionMethodId Must include if selecting {@link EConflictResolutionMethod.CustomMethod}.
	 */
	RemoveObject(
		key: string,
		resolutionMethod: EConflictResolutionMethod,
		resolutionMethodId?: any,
	): Promise<void>;
	StoreObject(key: string, value: any, param2: any, param3: any): Promise<void>;
	StoreString(key: string, value: string, param2: any, param3: any): Promise<void>;
}

export interface App {
	m_CurrentUser: CurrentUser;
	m_bFinishedStage1: boolean;
	m_bHaveShownSupportAlertModal: boolean;
	m_bServicesInitialized: boolean;
	m_bStartedStage2: boolean;
	m_bSupportAlertModalActive: boolean;
	/**
	 * @todo Does not seem to be used.
	 */
	m_bWasEverLoggedIn: boolean;
	m_cloudStorage: CloudStorage;
	m_cm: CMInterface;
	m_eLoginState: number;
	m_transportClient: WebUIServiceTransport;

	BFinishedInitStageOne(): boolean;
	BHardwareSurveyPending(): boolean;
	BHasAckOnlyActiveSupportAlerts(): boolean;
	BHasActiveSupportAlerts(): boolean;
	BHasCurrentUser(): boolean;
	BIsFamilyGroupMember(e: any): boolean;
	BIsInFamilyGroup(): boolean;
	BIsInOOBE(): boolean;
	BIsOfflineMode(): boolean;
	BMustShowSupportAlertDialog(): boolean;
	BSupportAlertDialogActive(): boolean;
	BWasEverLoggedIn(): boolean;
	CloseSupportAlertsModal(): void;
	GetCloudStorageForLibrary(): CloudStorage;
	GetCurrentUser(): CurrentUser;
	GetFamilyGroupID(): CurrentUser["strFamilyGroupID"];
	GetFamilyGroupName(): CurrentUser["strFamilyGroupName"];
	GetServicesInitialized(): boolean;
	Init(cm: CMInterface): Promise<void>;
	InitStage2(): Promise<void>;
	OptOutOfSurvey(): void;
	SendSurvey(): void;
	ShowSupportAlertsModal(): void;
	WaitForServicesInitialized(): Promise<boolean>;
}
