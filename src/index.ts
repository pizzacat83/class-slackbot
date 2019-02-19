declare var global: any;

/// #if DEBUG
global.evalOnGAS = (code: string, token: string): string => {
  if (
    Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, token)) ===
    PropertiesService.getScriptProperties().getProperty('evalOnGAS-token')
  ) {
    try {
      const res: any = eval(code);
      return JSON.stringify({ res });
    } catch (err) {
      return JSON.stringify({ err });
    }
  } else {
    return '';
  }
};
/// #endif

import './todays_utas';

import './delete_old_messages';
