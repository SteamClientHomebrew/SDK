declare global {
    interface Window {
        Millennium: Millennium
    }
}

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
};

// callable function definition
declare const callable: <Args extends any[] = [], Return = void | IPC_types>(
    route: string
) => (...args: Args) => Promise<Return>;

declare global {
    interface Window {
        Millennium: Millennium;
    }
}

const Millennium: Millennium = window.Millennium;
export { Millennium, callable };
