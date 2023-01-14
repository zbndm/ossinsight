import dotenv from "dotenv";
import path from 'path';

export function configEnv (rootPath: string) {
  dotenv.config({ path: path.resolve(rootPath, ".env.template") });
  dotenv.config({ path: path.resolve(rootPath, ".env"), override: true });
}

// The key will be mapped to the regexp's 1st group or the whole string.
export function getEnv(envPattern: RegExp) {
  return Object.entries(process.env)
    .flatMap(([key, value]) => {
      const matched = envPattern.exec(key);
      if (matched) {
        return [[matched[1] ?? matched[0], value]] as const;
      } else {
        return [];
      }
    })
}
