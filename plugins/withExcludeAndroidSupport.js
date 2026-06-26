const { withProjectBuildGradle } = require('expo/config-plugins');

const exclusionBlock = `
// Exclude legacy Android Support libraries pulled by older native modules.
// Expo SDK 54 / React Native 0.81 use AndroidX, and mixing both breaks manifest merging.
subprojects {
    configurations.all {
        exclude group: "com.android.support"
    }
}
`;

module.exports = function withExcludeAndroidSupport(config) {
  return withProjectBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('exclude group: "com.android.support"')) {
      config.modResults.contents += exclusionBlock;
    }

    return config;
  });
};
