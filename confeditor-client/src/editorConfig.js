const editorConfig = window.require("config").default;

export function editorConfigOf(fileName: string) {
  const config = editorConfig[fileName] || (editorConfig[fileName] = {});
  if (!config.columns) {
    config.columns = {}
  }
  return config;
}

export function isEditorConfigured(fileName: string) {
  const config = editorConfig[fileName];
  if (config && config.columns) {
    for (const key in config.columns) {
      return true;
    }
  }

  return false;
}

export default editorConfig;
