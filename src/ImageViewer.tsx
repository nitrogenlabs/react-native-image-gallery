import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Animated, Dimensions, Easing, Platform, StyleSheet, ViewStyle} from 'react-native';

import {HorizontalContainer} from './HorizontalContainer';
import {ImagePaner} from './ImagePaner';
import {ImageTransitionView} from './ImageTransitionView';
import {ScrollSpacerView} from './ScrollSpacerView';
import {
  ImageGalleryMeasureFunctions,
  ImageGalleryMeasurements,
  ImageGalleryScrollProps,
  ImageGallerySource
} from './types/image';
import {Utils} from './Utils';
import {ViewerBackground} from './ViewerBackground';

export interface ImageViewerProps {
  readonly getSourceContext: (imageId: string) => ImageGalleryMeasureFunctions;
  readonly imageId: string;
  readonly images: ImageGallerySource[];
  readonly infoDescriptionStyles?: ViewStyle;
  readonly infoTitleStyles?: ViewStyle;
  readonly onChange: (imageId: string) => void;
  readonly onClose: () => void;
  readonly theme?: any;
}

export interface ImageViewerState {
  readonly width?: any;
  readonly height?: any;
  readonly openProgress?: any;
  readonly dismissProgress?: any;
  readonly dismissScrollProgress: any;
  readonly initialImageMeasurements?: ImageGalleryMeasurements;
  readonly openImageMeasurements?: ImageGalleryMeasurements;
  readonly zoomedImageMeasurements?: ImageGalleryMeasurements;
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly zoomTransition: any;
  readonly zoomState: 'closed' | 'opening' | 'opened' | 'closing';
}

export class ImageViewer extends React.Component<ImageViewerProps, ImageViewerState> {
  static propTypes: object = {
    getSourceContext: PropTypes.func,
    imageId: PropTypes.string,
    images: PropTypes.array,
    infoDescriptionStyles: PropTypes.object,
    infoTitleStyles: PropTypes.object,
    onChange: PropTypes.func,
    onClose: PropTypes.func,
    theme: PropTypes.object
  };

  static defaultProps: object = {
    images: [],
    theme: {}
  };

  constructor(props: ImageViewerProps) {
    super(props);

    // Methods
    this.getTransitionProgress = this.getTransitionProgress.bind(this);
    this.handleRef = this.handleRef.bind(this);
    this.measurePhotoSize = this.measurePhotoSize.bind(this);
    this.onPressImage = this.onPressImage.bind(this);
    this.onPressPaner = this.onPressPaner.bind(this);
    this.onScroll = this.onScroll.bind(this);

    // Initial state
    this.state = {
      dismissProgress: null,
      dismissScrollProgress: new Animated.Value(Dimensions.get('window').height),
      height: new Animated.Value(Dimensions.get('window').height),
      imageHeight: 0,
      imageWidth: 0,
      initialImageMeasurements: null,
      openImageMeasurements: null,
      openProgress: new Animated.Value(0),
      width: new Animated.Value(Dimensions.get('window').width),
      zoomState: 'closed',
      zoomTransition: new Animated.Value(0),
      zoomedImageMeasurements: null
    };
  }

  componentDidMount(): void {
    this.measurePhotoSize();
  }

  componentWillReceiveProps(nextProps: ImageViewerProps): void {
    // Measure photo on horizontal scroll change
    if(this.props.imageId !== nextProps.imageId) {
      // TOOD: add opacity effect (original LOC: 225-238)
      this.setState(
        {
          initialImageMeasurements: null,
          openImageMeasurements: null
        },
        () => this.measurePhotoSize()
      );
    }
  }

  componentDidUpdate(prevProps: ImageViewerProps, prevState: ImageViewerState): void {
    const {openProgress, zoomState, zoomTransition} = this.state;

    if(openProgress) {
      Animated.timing(openProgress, {
        duration: 300,
        easing: Easing.inOut(Easing.quad),
        toValue: 1,
        useNativeDriver: true
      })
        .start(() => this.setState({openProgress: null}));
    }

    if(zoomState === 'opening') {
      Animated.timing(zoomTransition, {
        duration: 300,
        toValue: 1,
        useNativeDriver: true
      }).start(() => this.setState({zoomState: 'opened'}));
    } else if(zoomState === 'closing') {
      Animated.timing(zoomTransition, {
        duration: 300,
        toValue: 0,
        useNativeDriver: true
      }).start(() => this.setState({zoomState: 'closed'}));
    }
  }

  getTransitionProgress = () => {
    const {dismissScrollProgress, height, openProgress} = this.state;
    let gestureDismissProgress;

    if(dismissScrollProgress && Platform.OS === 'ios') {
      gestureDismissProgress = dismissScrollProgress.interpolate({
        inputRange: [
          0,
          height._value,
          height._value * 2
        ],
        outputRange: [0.02, 1, 0.02]
      });
    }

    return openProgress || gestureDismissProgress || new Animated.Value(1);
  }

  async measurePhotoSize(): Promise<any> {
    const {
      getSourceContext,
      imageId,
      images
    } = this.props;
    const {measurer, imageSizeMeasurer} = getSourceContext(imageId);

    // Measure opened photo size
    const image: ImageGallerySource = images.find(
      (img: ImageGallerySource) => img.id === imageId
    );

    if(!image) {
      throw new Error(
        `Fatal error, impossible to find image with id: ${imageId}`
      );
    }

    const imageSize: {
      width: number,
      height: number
    } = await imageSizeMeasurer();

    const imageAspectRatio: number = imageSize.width / imageSize.height;
    const height: number = this.state.height._value;
    const width: number = this.state.width._value;
    const screenAspectRatio: number = width / height;
    let finalWidth: number = width;
    let finalHeight: number = width / imageAspectRatio;

    if(imageAspectRatio - screenAspectRatio < 0) {
      finalHeight = height;
      finalWidth = height * imageAspectRatio;
    }

    const finalX: number = (width - finalWidth) * 0.5;
    const finalY: number = (height - finalHeight) * 0.5;
    const openImageMeasurements: ImageGalleryMeasurements = {
      height: finalHeight,
      scale: finalWidth / width,
      width: finalWidth,
      x: finalX,
      y: finalY
    };

    // Measure initial photo size
    const initialImageMeasurements: ImageGalleryMeasurements = await measurer();

    // Measure zoomed image size
    const zoomedImageMeasurements: ImageGalleryMeasurements = Utils.getImageMeasurements({
      containerHeight: Dimensions.get('window').height,
      containerWidth: Dimensions.get('window').width,
      imageHeight: imageSize.height,
      imageWidth: imageSize.width,
      mode: 'fill'
    });

    this.setState({
      imageHeight: imageSize.height,
      imageWidth: imageSize.width,
      initialImageMeasurements,
      openImageMeasurements,
      zoomedImageMeasurements
    });
  }

  handleRef(ref: any): void {
    if(ref) {
      // Hack to enable scroll when the ref callback is called
      setTimeout(() => {
        if(ref) {
          ref.getNode().scrollResponderScrollTo({y: this.state.height._value, animated: false});
        }
      }, 0);
    }
  }

  onScroll(e): void {
    const yOffset = e.nativeEvent.contentOffset.y;
    const heightValue = this.state.height._value;
    const {onClose} = this.props;

    if((yOffset <= 0 || yOffset >= 2 * heightValue) && onClose) {
      onClose();
    }
  }

  onPressImage(): void {
    this.setState({zoomState: 'opening'});
  }

  onPressPaner(): void {
    this.setState({zoomState: 'closing'});
  }

  renderZoomTransition(): JSX.Element {
    const {
      zoomState,
      zoomTransition,
      openImageMeasurements,
      zoomedImageMeasurements
    } = this.state;

    if(
      openImageMeasurements &&
      zoomedImageMeasurements &&
      (zoomState === 'opening' || zoomState === 'closing')
    ) {
      const {
        imageId,
        images
      } = this.props;

      // TODO: improve this using Map
      const imageSource: ImageGallerySource = images.find((img: ImageGallerySource) => img.id === imageId);
      const imageStyle = {
        height: openImageMeasurements.height,
        left: openImageMeasurements.x,
        opacity: zoomTransition.interpolate({
          extrapolate: 'clamp',
          inputRange: [0.01, 0.015, 0.998, 1],
          outputRange: [0, 1, 1, 0]
        }),
        position: 'absolute',
        top: openImageMeasurements.y,
        transform: [
          {
            scale: zoomTransition.interpolate({
              inputRange: [0.02, 0.998],
              outputRange: [1, zoomedImageMeasurements.scale]
            })
          }
        ],
        width: openImageMeasurements.width
      };

      return (
        <Animated.Image
          pointerEvents="none"
          source={{uri: imageSource && imageSource.url}}
          resizeMode="contain"
          style={imageStyle} />
      );
    }

    return null;
  }

  renderImagePaner(): JSX.Element {
    const {
      zoomState,
      zoomTransition,
      openImageMeasurements,
      zoomedImageMeasurements
    } = this.state;

    if(openImageMeasurements && zoomedImageMeasurements && (zoomState === 'opened' || zoomState === 'closing' ||
      zoomState === 'opening')) {
      const {
        images,
        imageId,
        infoDescriptionStyles,
        infoTitleStyles,
        theme
      } = this.props;
      // TODO: improve this using Map
      const imageSource: ImageGallerySource = images.find(
        (img: ImageGallerySource) => img.id === imageId
      );

      return (
        <ImagePaner
          source={{uri: imageSource && imageSource.url}}
          imageWidth={openImageMeasurements.width}
          imageHeight={openImageMeasurements.height}
          onPress={this.onPressPaner}
          transition={zoomTransition}
          zoomedImageMeasurements={zoomedImageMeasurements}
          infoView={null}
          infoTitle={imageSource && imageSource.title}
          infoTitleStyles={infoTitleStyles}
          infoDescription={imageSource && imageSource.description}
          infoDescriptionStyles={infoDescriptionStyles}
          theme={theme} />
      );
    }

    return null;
  }

  renderVerticalScrollView(scrollProps: ImageGalleryScrollProps): JSX.Element {
    const {
      dismissProgress,
      height,
      openImageMeasurements,
      openProgress,
      transitionProgress,
      width
    } = scrollProps;
    const {
      images,
      imageId,
      onChange
    } = this.props;
    const {
      dismissScrollProgress,
      imageHeight,
      imageWidth
    } = this.state;

    if(Platform.OS === 'ios') {
      const onContainerScroll = Animated.event([{nativeEvent: {contentOffset: {y: dismissScrollProgress}}}],
        {useNativeDriver: true, listener: this.onScroll}
      );

      return (
        <Animated.ScrollView
          ref={this.handleRef}
          onScroll={onContainerScroll}
          scrollEventThrottle={1}
          pagingEnabled={true}
          showsVerticalScrollIndicator={false}>
          <ScrollSpacerView width={width} height={height} />
          <HorizontalContainer
            images={images}
            imageId={imageId}
            height={height['_value']}
            imageHeight={openImageMeasurements ? openImageMeasurements.height : 0}
            imageWidth={openImageMeasurements ? openImageMeasurements.width : 0}
            realImageHeight={imageHeight}
            realImageWidth={imageWidth}
            openProgress={openProgress}
            dismissProgress={dismissProgress}
            transitionProgress={transitionProgress}
            onChange={onChange}
            onPressImage={this.onPressImage}
            openImageMeasurements={openImageMeasurements || {}}
            width={width['_value']} />
          <ScrollSpacerView width={width} height={height} />
        </Animated.ScrollView>
      );
    }

    return (
      <HorizontalContainer
        dismissProgress={dismissProgress}
        height={height['_value']}
        images={images}
        imageId={imageId}
        imageWidth={openImageMeasurements ? openImageMeasurements.width : 0}
        imageHeight={openImageMeasurements ? openImageMeasurements.height : 0}
        onChange={onChange}
        onPressImage={this.onPressImage}
        openImageMeasurements={openImageMeasurements || {}}
        openProgress={openProgress}
        realImageWidth={imageWidth}
        realImageHeight={imageHeight}
        transitionProgress={transitionProgress}
        width={width['_value']} />
    );
  }

  renderTransitionView(): JSX.Element {
    const {imageId, images} = this.props;
    const {
      dismissScrollProgress,
      height,
      imageHeight,
      imageWidth,
      initialImageMeasurements,
      openImageMeasurements,
      width
    } = this.state;

    if(initialImageMeasurements && openImageMeasurements) {
      const imageSource: ImageGallerySource = images.find((img: ImageGallerySource) => img.id === imageId);
      const transitionProgress: any = this.getTransitionProgress();

      return (
        <ImageTransitionView
          dismissScrollProgress={dismissScrollProgress}
          transitionProgress={transitionProgress}
          height={height._value}
          imageHeight={imageHeight}
          imageWidth={imageWidth}
          initialImageMeasurements={initialImageMeasurements}
          openImageMeasurements={openImageMeasurements}
          source={{uri: imageSource && imageSource.url}}
          width={width._value} />
      );
    }

    return null;
  }

  render(): JSX.Element {
    const {imageId, images, theme} = this.props;
    const {
      dismissProgress,
      dismissScrollProgress,
      height,
      openImageMeasurements,
      openProgress,
      width
    } = this.state;

    // TODO: improve this using Map
    const imageSource: ImageGallerySource = images.find((img: ImageGallerySource) => img.id === imageId);
    const transitionProgress: any = this.getTransitionProgress();
    const scrollProps = {
      dismissProgress,
      height,
      imageSource,
      openImageMeasurements,
      openProgress,
      transitionProgress,
      width
    };

    return (
      <Animated.View
        style={viewStyles.topContainer}
        onLayout={Animated.event([{nativeEvent: {layout: {width, height}}}])}>
        <Animated.View style={[viewStyles.topContainer, {opacity: openProgress || 1}]}>
          <ViewerBackground
            opacityProgress={dismissScrollProgress}
            inputRange={[0, height._value, height._value * 2]}
            outputRange={[0.02, 1, 0.02]}
            theme={theme} />
          {this.renderVerticalScrollView(scrollProps)}
        </Animated.View>
        {this.renderTransitionView()}
        {this.renderImagePaner()}
        {this.renderZoomTransition()}
      </Animated.View>
    );
  }
}

const viewStyles = StyleSheet.create({
  topContainer: {
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
  }
});
