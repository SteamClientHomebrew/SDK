export enum EBrowserType {
	OffScreen,
	OpenVROverlay,
	OpenVROverlay_Dashboard,
	DirectHWND,
	DirectHWND_Borderless,
	DirectHWND_Hidden,
	ChildHWNDNative,
	Transparent_Toplevel,
	OffScreen_SharedTexture,
	OffScreen_GameOverlay,
	OffScreen_GameOverlay_SharedTexture,
	Offscreen_FriendsUI,
	Offscreen_SteamUI,
	OpenVROverlay_Subview,
}

export enum EUIMode {
	Unknown = -1,
	GamePad = 4,
	Desktop = 7,
}

export enum ESteamRealm {
	Unknown,
	Global,
	China,
}
