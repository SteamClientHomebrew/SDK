// export * from './deck-libs';
export * from './custom-components';
export * from './custom-hooks';
export * from './components';
export * from './deck-hooks';
export * from './modules';
export * from './globals';
export * from './webpack';
export * from './utils';
export * from './class-mapper';
export * from './api';
export * from './settings';

/**
 * @deprecated use @decky/api instead
 */
export const definePlugin = (fn: any): any => {
  return (...args: any[]) => {
    // TODO: Maybe wrap this
    return fn(...args);
  };
};
