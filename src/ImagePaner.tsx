import * as React from 'react';
import {
  Animated,
  Dimensions,
  ImageURISource,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle
} from 'react-native';
import {default as Ionicons} from 'react-native-vector-icons/Ionicons';

import {ImageGalleryMeasurements} from './types/image';

export interface ImagePanerProps {
  readonly imageHeight: number;
  readonly imageWidth: number;
  readonly infoDescription?: string;
  readonly infoDescriptionStyles?: ViewStyle;
  readonly infoTitle?: string;
  readonly infoTitleStyles?: ViewStyle;
  readonly infoView?: React.Component;
  readonly onPress: () => void;
  readonly source: ImageURISource;
  readonly transition: Animated.Value;
  readonly zoomedImageMeasurements: ImageGalleryMeasurements;
}

export class ImagePaner extends React.PureComponent<ImagePanerProps> {
  private scroll = null;
  private buttonOpacity = new Animated.Value(0);
  private x = new Animated.Value(0);

  static defaultProps: object = {
    imageHeight: 750, // Arbitrary value
    imageWidth: 1129 // Arbitrary value
  };

  constructor(props: ImagePanerProps) {
    super(props);

    // Methods
    this.handleRef = this.handleRef.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onYawUpdate = this.onYawUpdate.bind(this);
  }

  onLoad(): void {
    const {zoomedImageMeasurements} = this.props;

    if(Platform.OS === 'android' && this.scroll) {
      this.scroll.scrollTo({
        animated: false,
        x: -zoomedImageMeasurements.x,
        y: 0
      });
    }

    Animated.timing(this.buttonOpacity, {
      duration: 500,
      toValue: 1,
      useNativeDriver: true
    }).start();
  }

  onYawUpdate(motion: {yaw: number}): void {
    this.x.setValue(motion.yaw);
  }

  handleRef(ref: any): void {
    if(ref) {
      this.scroll = ref.getNode();

      if(Platform.OS === 'ios') {
        this.scroll.scrollTo({
          animated: false,
          x: -this.props.zoomedImageMeasurements.x,
          y: 0
        });
      }
    }
  }

  renderInfoView(): JSX.Element {
    const {
      infoDescription,
      infoDescriptionStyles,
      infoTitle,
      infoTitleStyles,
      infoView,
      onPress
    } = this.props;

    if(infoView) {
      // TODO: add the possibility to use a custom info viewer
      return <Animated.View style={{opacity: this.buttonOpacity}}>{infoView}</Animated.View>;
    }

    if(infoTitle) {
      const smallCloseStyle = [viewStyles.closeIcon, viewStyles.textShadow, infoTitleStyles];

      return (
        <Animated.View style={[viewStyles.infoTextContainer, {opacity: this.buttonOpacity}]}>
          <Animated.View style={viewStyles.textContainer}>
            <Animated.Text
              style={[viewStyles.titleText, viewStyles.textShadow, infoTitleStyles]}
              numberOfLines={1}>
              {infoTitle.toUpperCase()}
            </Animated.Text>
            <Animated.Text
              style={[viewStyles.descText, viewStyles.textShadow, infoDescriptionStyles]}
              numberOfLines={0}>
              {infoDescription}
            </Animated.Text>
          </Animated.View>
          <TouchableWithoutFeedback onPress={onPress}>
            <Animated.View style={[viewStyles.closeTextContainer, {opacity: this.buttonOpacity}]}>
              <Ionicons name="ios-close-circle-outline" style={[viewStyles.textShadow, smallCloseStyle]} />
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      );
    } else {
      return (
        <TouchableWithoutFeedback onPress={onPress}>
          <Animated.View style={[viewStyles.closeContainer, {opacity: this.buttonOpacity}]}>
            <Ionicons name="ios-close-circle-outline" style={[viewStyles.textShadow, viewStyles.closeIcon]} />
          </Animated.View>
        </TouchableWithoutFeedback>
      );
    }
  }

  render(): JSX.Element {
    const {source, transition, zoomedImageMeasurements} = this.props;
    const {height, width} = Dimensions.get('window');
    const containerStyle = {
      backgroundColor: '#000',
      height,
      opacity: transition.interpolate({inputRange: [0.998, 1], outputRange: [0, 1]}),
      width
    };
    const imageStyle = {
      height: zoomedImageMeasurements.height,
      position: 'relative',
      transform: [{translateX: new Animated.Value(0)}],
      width: zoomedImageMeasurements.width
    };

    return (
      <Animated.View style={containerStyle}>
        <StatusBar animated={true} hidden={true} barStyle="light-content" />
        <Animated.ScrollView
          ref={this.handleRef}
          horizontal={true}
          bounces={true}
          style={viewStyles.scrollView}>
          <Animated.Image
            source={source}
            onLoad={this.onLoad}
            style={imageStyle} />
        </Animated.ScrollView>
        {this.renderInfoView()}
      </Animated.View>
    );
  }
}

const viewStyles = StyleSheet.create({
  closeContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    bottom: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0
  },
  closeIcon: {
    color: '#fff',
    fontSize: 50,
    padding: 5,
    textAlign: 'center'
  },
  closeTextContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row'
  },
  descText: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 11
  },
  infoTextContainer: {
    alignItems: 'center',
    bottom: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 25,
    minHeight: 60,
    position: 'absolute',
    width: Dimensions.get('window').width - 50
  },
  scrollView: {
    backgroundColor: '#000'
  },
  textContainer: {
    flex: 1
  },
  textShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3
  },
  titleText: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 11,
    fontWeight: '500'
  }
});
