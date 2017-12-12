import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Animated, StyleSheet} from 'react-native';

export interface ViewerBackgroundProps {
  readonly opacityProgress: Animated.Value;
  readonly inputRange: number[];
  readonly outputRange: number[];
  readonly theme: any;
}

export class ViewerBackground extends React.PureComponent<ViewerBackgroundProps> {
  static propTypes: object = {
    inputRange: PropTypes.arrayOf(PropTypes.number).isRequired,
    opacityProgress: PropTypes.instanceOf(Animated.Value).isRequired,
    outputRange: PropTypes.arrayOf(PropTypes.number).isRequired,
    theme: PropTypes.object
  };

  static defaultProps: object = {
    theme: {}
  };

  render(): JSX.Element {
    const {
      inputRange,
      opacityProgress,
      outputRange,
      theme
    } = this.props;
    const {imageGalleryBgColor = '#000'} = theme;
    const viewStyle = {
      backgroundColor: imageGalleryBgColor,
      opacity: opacityProgress.interpolate({inputRange, outputRange})
    };
    return <Animated.View style={[StyleSheet.absoluteFill, viewStyle]} />;
  }
}
