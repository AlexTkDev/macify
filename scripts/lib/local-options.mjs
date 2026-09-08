import path from "node:path";

export function parseLocalOptions(arguments_, { allowFast = false } = {}) {
  let fast = false;
  let persistPath;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (allowFast && argument === "--fast") {
      fast = true;
    } else if (argument === "--persist-to") {
      const value = arguments_[index + 1];
      if (!value || value.startsWith("--")) throw new Error("--persist-to requires a directory.");
      persistPath = path.resolve(value);
      index += 1;
    } else {
      throw new Error(`Unknown local option: ${argument}`);
    }
  }
  return {
    fast,
    persistPath,
    persistenceArguments: persistPath ? ["--persist-to", persistPath] : [],
  };
}
