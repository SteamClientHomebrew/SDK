import { FC, ReactNode, createContext, useContext, useState } from 'react';

const QuickAccessVisibleState = createContext<boolean>(false);

/** @component React Components */
export const useQuickAccessVisible = () => useContext(QuickAccessVisibleState);

/** @component React Components */
export const QuickAccessVisibleStateProvider: FC<{ tab: any; children: ReactNode }> = ({ children, tab }) => {
	const initial = tab.initialVisibility;
	const [visible, setVisible] = useState<boolean>(initial);
	// HACK but i can't think of a better way to do this
	tab.qAMVisibilitySetter = (val: boolean) => {
		if (val != visible) setVisible(val);
	};

	return <QuickAccessVisibleState.Provider value={visible}>{children}</QuickAccessVisibleState.Provider>;
};
