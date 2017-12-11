import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Animated, StyleSheet} from 'react-native';

export interface ViewerBackgroundProps {
  readonly opacityProgress: Animated.Value;
  readonly inputRange: number[];
  readonly outputRange: number[];
}

export class ViewerBackground extends React.PureComponent<ViewerBackgroundProps> {
  static propTypes: object = {
    inputRange: PropTypes.arrayOf(PropTypes.number).isRequired,
    opacityProgress: PropTypes.instanceOf(Animated.Value).isRequired,
    outputRange: PropTypes.arrayOf(PropTypes.number).isRequired
  };

  render(): JSX.Element {
    const {
      inputRange,
      opacityProgress,
      outputRange
    } = this.props;

    const backgroundStyle = {
      opacity: opacityProgress.interpolate({inputRange, outputRange})
    };

    return <Animated.View style={[StyleSheet.absoluteFill, viewStyles.background, backgroundStyle]} />;
  }
}

const viewStyles = StyleSheet.create({
  background: {
    backgroundColor: 'black'
  }
});
