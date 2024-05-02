import { ESteamRealm } from "./enums";

export enum EAccountType {
	Invalid,
	Individual,
	Multiseat,
	GameServer,
	AnonGameServer,
	Pending,
	ContentServer,
	Clan,
	Chat,
	ConsoleUser,
	AnonUser,
	Max,
}

export interface CSteamID {
	m_ulSteamID: {
		high: number;
		low: number;
		unsigned: boolean;
	};

	BIsClanAccount(): boolean;
	BIsIndividualAccount(): boolean;
	BIsValid(): boolean;

	/**
	 * @returns community id
	 */
	ConvertTo64BitString(): string;

	GetAccountID(): number;
	GetAccountType(): EAccountType;
	/**
	 * @todo enum?
	 */
	GetInstance(): number;
	GetUniverse(): ESteamRealm;

	/**
	 * @returns Similiar to a string like `[U:1:xxxxxxxxx]`.
	 */
	Render(): string;

	SetAccountID(value: number): void;
	SetAccountType(value: number): void;
	SetFromComponents(
		accountId: number,
		instance: number,
		accountType: EAccountType,
		universe: ESteamRealm,
	): void;
	SetInstance(value: number): void;
	SetUniverse(value: ESteamRealm): void;
}
