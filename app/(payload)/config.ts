// payload.config.ts already calls buildConfig(), which returns a
// Promise<SanitizedConfig> — i.e. the config is ALREADY built and sanitized.
// So here we simply re-export that promise. (An earlier version wrongly called
// sanitizeConfig() again on it, which sanitized a Promise object instead of a
// config and produced an empty secret → the "missing secret key" error.)
import config from "@/payload.config";

export const configPromise = config;
