export * from './custom-components';
export * from './custom-hooks';
export * from './components';
export * from './deck-hooks';
export * from './modules';
export * from './globals';
export * from './webpack';
export * from './utils';
export * from './class-mapper';
export * from './millennium-api';

import ErrorBoundaryHook from './hooks/error-boundary-hook';
import RouterHook from './hooks/router/router-hook';
import Toaster from './hooks/toaster-hook';

export const errorBoundaryHook: ErrorBoundaryHook = new ErrorBoundaryHook();
export const routerHook: RouterHook = new RouterHook();
export const toaster: Toaster = new Toaster();
