import { MillenniumModuleSettings, MillenniumSettingTabs } from '../settings';

/** Returnable IPC types */
type IPC_types = (string | number | boolean)

/*
 Global Millennium API for developers. 
*/
type Millennium = {
    /**
     * @brief Call a method on the backend
     * @deprecated Use `callable` instead. 
     * Example usage: 
     * ```typescript
     * // before
     * const result = await Millennium.callServerMethod('methodName', { arg1: 'value' });
     * // after
     * const method = callable<[{ arg1: string }]>("methodName");
     * 
     * const result1 = await method({ arg1: 'value1' });
     * const result2 = await method({ arg1: 'value2' });
     * ```
     */
    callServerMethod: (methodName: string, kwargs?: object) => Promise<any>,
    findElement: (privateDocument: Document, querySelector: string, timeOut?: number) => Promise<NodeListOf<Element>>,
    exposeObj?: <T extends object>(obj: T) => void,
    exposeSettings?: <T extends (MillenniumModuleSettings|MillenniumSettingTabs)>(settings: T) => T,
    AddWindowCreateHook?: (callback: (context: object) => void) => void
};

/**
 * Make reusable IPC call declarations
 * 
 * frontend:
 * ```typescript
 * const method = callable<[{ arg1: string }]>("methodName"); // declare the method
 * method({ arg1: 'value' }); // call the method
 * ```
 * 
 * backend:
 * ```python
 * def methodName(arg1: str):
 *    pass
 * ```
 */
declare const callable: <Args extends any[] = [], T = IPC_types>(route: string) => (...args: Args) => Promise<T>;

const m_private_context: any = undefined;
export const pluginSelf = m_private_context;


declare global {
    interface Window {
        Millennium: Millennium;
    }
}

const Millennium: Millennium = window.Millennium;
export { Millennium, callable };
