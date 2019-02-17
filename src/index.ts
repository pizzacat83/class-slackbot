declare var global: any;

/// #if DEBUG
global.evalOnGAS = (code: string): string => {
  const res: any = eval(code);
  return JSON.stringify({ res });
};
/// #endif
