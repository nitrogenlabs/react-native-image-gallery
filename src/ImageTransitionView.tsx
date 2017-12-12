import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Animated, ImageURISource, StyleSheet} from 'react-native';
import {ImageGalleryMeasurements} from './types/image';

export interface Props {
  readonly source: ImageURISource;
  readonly transitionProgress: Animated.Value;
  readonly dismissScrollProgress: Animated.Value;
  readonly initialImageMeasurements: ImageGalleryMeasurements;
  readonly openImageMeasurements: ImageGalleryMeasurements;
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly width: number;
  readonly height: number;
}

const OPACITY_RANGE: number[] = [0.01, 0.015, 0.999, 1];
const TRANSITION_RANGE: number[] = [0.02, 0.998];

export class ImageTransitionView extends React.PureComponent<Props> {
  static propTypes: object = {
    dismissScrollProgress: PropTypes.instanceOf(Animated.Value).isRequired,
    height: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    imageWidth: PropTypes.number.isRequired,
    initialImageMeasurements: PropTypes.shape({
      height: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }).isRequired,
    openImageMeasurements: PropTypes.shape({
      height: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }).isRequired,
    source: PropTypes.any.isRequired,
    transitionProgress: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired
  };

  render(): JSX.Element {
    const {
      width,
      height,
      source,
      imageWidth,
      imageHeight,
      transitionProgress,
      dismissScrollProgress,
      openImageMeasurements,
      initialImageMeasurements
    } = this.props;
    let startScale: number = 0;
    let startTranslateX: number = 0;
    let startTranslateY: number = 0;
    let inlineAspectX: number = 1;
    let inlineAspectY: number = 1;
    const aspectRatio: number = imageWidth / imageHeight;
    const screenAspectRatio: number = width / height;

    if(aspectRatio - screenAspectRatio > 0) {
      const maxDim: number = openImageMeasurements.width;
      const srcShortDim: number = initialImageMeasurements.height;
      const srcMaxDim: number = srcShortDim * aspectRatio;
      startScale = srcMaxDim / maxDim;
      inlineAspectX = initialImageMeasurements.width / initialImageMeasurements.height / aspectRatio;
      inlineAspectY = aspectRatio;
    } else {
      const maxDim: number = openImageMeasurements.height;
      const srcShortDim: number = initialImageMeasurements.width;
      const srcMaxDim: number = srcShortDim / aspectRatio;
      startScale = srcMaxDim / maxDim;
      inlineAspectX = 1 / aspectRatio;
      inlineAspectY = aspectRatio * initialImageMeasurements.height / initialImageMeasurements.width;
    }

    const translateInitY: number = initialImageMeasurements.y + initialImageMeasurements.height * 0.5;
    const translateDestY: number = openImageMeasurements.y + openImageMeasurements.height * 0.5;
    startTranslateY = Math.floor(translateInitY - translateDestY);
    const translateInitX: number = initialImageMeasurements.x + initialImageMeasurements.width * 0.5;
    const translateDestX: number = openImageMeasurements.x + openImageMeasurements.width * 0.5;
    startTranslateX = Math.floor(translateInitX - translateDestX);

    const translateY = dismissScrollProgress
      ? Animated.add(
        transitionProgress.interpolate({inputRange: TRANSITION_RANGE, outputRange: [startTranslateY, 0]}),
        Animated.multiply(
          dismissScrollProgress.interpolate({inputRange: [0, height, height * 2], outputRange: [300, 0, -300]}),
          dismissScrollProgress.interpolate({
            inputRange: [0, height * 0.5, height, height * 1.5, height * 2],
            outputRange: [0, 1, 1, 1, 0]
          })
        )
      )
      : transitionProgress.interpolate({inputRange: TRANSITION_RANGE, outputRange: [startTranslateY, 0]});

    const containerStyle = {
      backgroundColor: 'transparent',
      height: openImageMeasurements.height,
      left: openImageMeasurements.x,
      opacity: transitionProgress.interpolate({inputRange: OPACITY_RANGE, outputRange: [0, 1, 1, 0]}),
      overflow: 'hidden',
      position: 'absolute',
      top: openImageMeasurements.y,
      transform: [
        {translateX: transitionProgress.interpolate({inputRange: TRANSITION_RANGE, outputRange: [startTranslateX, 0]})},
        {translateY},
        {scale: transitionProgress.interpolate({inputRange: TRANSITION_RANGE, outputRange: [startScale, 1]})},
        {scaleX: transitionProgress.interpolate({inputRange: TRANSITION_RANGE, outputRange: [inlineAspectX, 1]})},
        {scaleY: transitionProgress.interpolate({inputRange: TRANSITION_RANGE, outputRange: [inlineAspectY, 1]})}
      ],
      width: openImageMeasurements.width
    };

    const imageStyle = {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
      transform: [
        {scaleX: transitionProgress.interpolate({inputRange: TRANSITION_RANGE, outputRange: [1 / inlineAspectX, 1]})},
        {scaleY: transitionProgress.interpolate({inputRange: TRANSITION_RANGE, outputRange: [1 / inlineAspectY, 1]})}
      ]
    };

    return (
      <Animated.View pointerEvents="none" style={containerStyle}>
        <Animated.Image source={source} style={imageStyle} />
      </Animated.View>
    );
  }
}
