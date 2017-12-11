import * as React from 'react';
import {Animated, ViewStyle} from 'react-native';

export interface ScrollSpacerViewProps {
  readonly width: any;
  readonly height: any;
}

export const ScrollSpacerView = (props: ScrollSpacerViewProps): JSX.Element => {
  // This is a hack to add space above and below the image for
  // being able to paginate through the ScrollView component
  const {height, width} = props;
  const dynamicStyle: ViewStyle = {
    height: height._value,
    width: width._value
  };

  return <Animated.View style={dynamicStyle} />;
};
