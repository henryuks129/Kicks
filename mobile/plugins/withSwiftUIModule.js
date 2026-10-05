const { withPodfile } = require('expo/config-plugins');

module.exports = function withSwiftUIModule(config) {
  return withPodfile(config, (result) => {
    const declaration = "  pod 'RCTSwiftUI', :path => '../node_modules/react-native/ReactApple/RCTSwiftUI', :modular_headers => true";
    if (!result.modResults.contents.includes(declaration)) {
      result.modResults.contents = result.modResults.contents.replace(
        '  use_react_native!(',
        `${declaration}\n\n  use_react_native!(`,
      );
    }
    return result;
  });
};
