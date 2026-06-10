const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const sharedMobileEntry = path.resolve(workspaceRoot, 'shared/src/mobile.ts');

/** Expo monorepo: resolve hoisted deps + shared package from workspace root. */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force @code-on-go/shared to Metro-safe source entry (no .js import suffixes).
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@code-on-go/shared') {
    if (!fs.existsSync(sharedMobileEntry)) {
      throw new Error(
        `Missing ${sharedMobileEntry}. Run: npm install from code-on-go/`,
      );
    }
    return { type: 'sourceFile', filePath: sharedMobileEntry };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
