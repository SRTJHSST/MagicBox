import * as os from "os";
import * as settings from "electron-settings";
import * as SVGO from "svgo";
import { systemPreferences } from "electron";

export const SKETCH_APP_ROOT =
  os.homedir() + "/Library/Application Support/MagicBox/";

const SVGO_SETTINGS = {
  removeDoctype: true,
  removeXMLProcInst: true,
  removeComments: true,
  removeMetadata: true,
  removeEditorsNSData: true,
  cleanupAttrs: true,
  inlineStyles: true,
  minifyStyles: true,
  convertStyleToAttrs: true,
  cleanupIDs: true,
  removeUselessDefs: true,
  cleanupListOfValues: true,
  cleanupNumericValues: true,
  convertColors: true,
  removeUnknownsAndDefaults: true,
  removeNonInheritableGroupAttrs: true,
  removeUselessStrokeAndFill: true,
  removeViewBox: true,
  cleanupEnableBackground: true,
  removeHiddenElems: true,
  removeEmptyText: true,
  convertShapeToPath: true,
  moveElemsAttrsToGroup: true,
  moveGroupAttrsToElems: true,
  collapseGroups: true,
  convertPathData: true,
  convertTransform: true,
  removeEmptyAttrs: true,
  removeEmptyContainers: true,
  mergePaths: true,
  removeUnusedNS: true,
  sortAttrs: true,
  removeTitle: true,
  removeDesc: true,
  removeDimensions: true,
  removeStyleElement: true,
  removeScriptElement: true,
};

export const DEFAULT_APP_SETTINGS = {
  app: {
    // notification: true,
    suffix: true,
    // updateCheck: true,
    // clipboardWatcher: false,
    // fileWatcher: false,
  },
  appearance: {
    theme: "ultra-dark",
    // theme: systemPreferences.getEffectiveAppearance() === "light" ? "light" : "ultra-dark",
    smallNav: false,
  },
  // Image Settings
  images: {
    jpeg: {
      quality: 56,
    },
    webp: {
      quality: 55,
      alpha: 55,
    },
    tiff: {
      quality: 55,
    },
    svg: {
      precision: 1,
    },
  },
  other: {
    // The last user session router path
    path: "",
  },
  sets: [
  ],
}

export const svgoPluginSettings = (): SVGO => {
  const plugins = Object.keys(SVGO_SETTINGS).map((item) => {
    return {
      [item]: {
        active: SVGO_SETTINGS[item],
      },
    };
  });
  return new SVGO({
    floatPrecision: settings.getSync("images.svg.precision"),
    plugins,
  });
};

export function settingsInitialization() {
  // settings.unsetSync();
  if (!Object.keys(settings.getSync()).length) {
    settings.setSync(DEFAULT_APP_SETTINGS);
  }
}
