declare global {
  interface Window {
    webpackJsonp: any;
    webpackChunksteamui: any;
  }
}

// TODO
export type Module = any;
type FilterFn = (module: any) => boolean;
type FindFn = (module: any) => any;

export let webpackCache: any = {};

const id = Math.random();
  let initReq: any;
  window.webpackChunksteamui.push([
    [id],
    {},
    (r: any) => {
      initReq = r;
    },
  ]);
  for (let i of Object.keys(initReq.m)) {
    try {
      webpackCache[i] = initReq(i);
    } catch (e) {
      console.debug("[DFL:Webpack]: Ignoring require error for module", i, e);
    }
  }

export const allModules: Module[] = Object.values(webpackCache).filter((x) => x)

export const findModule = (filter: FilterFn) => {
  for (const m of allModules) {
    if (m.default && filter(m.default)) return m.default;
    if (filter(m)) return m;
  }
};

export const findModuleChild = (filter: FindFn) => {
  for (const m of allModules) {
    for (const mod of [m.default, m]) {
      const filterRes = filter(mod);
      if (filterRes) {
        return filterRes;
      } else {
        continue;
      }
    }
  }
};

export const findAllModules = (filter: FilterFn) => {
  const out = [];

  for (const m of allModules) {
    if (m.default && filter(m.default)) out.push(m.default);
    if (filter(m)) out.push(m);
  }

  return out;
};

export const CommonUIModule = allModules.find((m: Module) => {
  if (typeof m !== 'object') return false;
  for (let prop in m) {
    if (m[prop]?.contextType?._currentValue && Object.keys(m).length > 60) return true;
  }
  return false;
});

export const IconsModule = findModule((m: Module) => {
  if (typeof m !== 'object') return false;
  for (let prop in m) {
    if (m[prop]?.toString && /Spinner\)}\),.\.createElement\(\"path\",{d:\"M18 /.test(m[prop].toString())) return true;
  }
  return false;
});

export const ReactRouter = allModules.find((m: Module) => {
  if (typeof m !== 'object') return undefined;
  for (let prop in m) {
    if (m[prop]?.computeRootMatch) return true;
  }
  return false;
});
