import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Animated, ImageStyle, TouchableWithoutFeedback, ViewStyle} from 'react-native';

export interface OpenedImageViewProps {
  readonly height: number;
  readonly imageHeight: number;
  readonly imageWidth: number;
  readonly onPress: () => void;
  readonly realImageHeight: number;
  readonly realImageWidth: number;
  readonly transitionProgress: any;
  readonly url: string;
  readonly width: number;
}

export interface OpenedImageViewState {
  readonly containerHeight: number;
  readonly containerWidth: number;
}

export class OpenedImageView extends React.PureComponent<OpenedImageViewProps, OpenedImageViewState> {
  static propTypes: object = {
    height: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    imageWidth: PropTypes.number.isRequired,
    onPress: PropTypes.func.isRequired,
    realImageHeight: PropTypes.number.isRequired,
    realImageWidth: PropTypes.number.isRequired,
    transitionProgress: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
    url: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired
  };

  constructor(props: OpenedImageViewProps) {
    super(props);

    // Methods
    this.onPressImage = this.onPressImage.bind(this);

    // Initial state
    this.state = {
      containerHeight: props.height,
      containerWidth: props.width
    };
  }

  onPressImage(): void {
    const {onPress} = this.props;

    if(onPress) {
      onPress();
    }
  }

  render(): JSX.Element {
    const {imageWidth, imageHeight, transitionProgress, url} = this.props;
    const {containerWidth, containerHeight} = this.state;
    const containerStyle: ViewStyle = {
      alignItems: 'center',
      flexDirection: 'row',
      height: containerHeight,
      opacity: transitionProgress.interpolate({inputRange: [0.998, 0.999], outputRange: [0, 1]}),
      width: containerWidth
    };
    const imageStyle: ImageStyle = {
      height: imageHeight,
      opacity: transitionProgress.interpolate({inputRange: [0.998, 0.999], outputRange: [0, 1]}),
      width: imageWidth
    };

    return (
      <Animated.View style={containerStyle}>
        <TouchableWithoutFeedback onPress={this.onPressImage}>
          <Animated.Image
            source={{uri: url}}
            resizeMode="contain"
            style={imageStyle} />
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }
}
