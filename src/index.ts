declare var global: any;

/// #if DEBUG
global.evalOnGAS = (code: string, token: string): string => {
  if (
    Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, token)) ===
    PropertiesService.getScriptProperties().getProperty('evalOnGAS-token')
  ) {
    const res: any = eval(code);
    return JSON.stringify({ res });
  } else {
    return '';
  }
};
/// #endif
