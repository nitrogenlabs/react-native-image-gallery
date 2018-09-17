import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Animated, Dimensions, Easing, Image, ImageURISource, StyleSheet, TouchableOpacity, View} from 'react-native';

const windowWidth: number = Dimensions.get('window').width * 0.5;

export interface ImageCellProps {
  readonly imageHeight: number;
  readonly imageId: string;
  readonly imageWidth: number;
  readonly source: ImageURISource;
  readonly onPress: (imageId: string) => void;
  readonly shouldHideDisplayedImage: boolean;
  readonly theme?: any;
  readonly topMargin: number;
  readonly selectable?: boolean;
  readonly onCheckImage?: (imageId: string) => void;
  readonly onUncheckImage?: (imageId: string) => void;
  readonly selectMode?: boolean;
  readonly onStartSelectMode?: () => void;
  readonly selected: boolean;
}

export interface ImageCellState {
  readonly opacity: Animated.Value;
  readonly imageLoaded: boolean;
}

export class ImageCell extends React.Component<ImageCellProps, ImageCellState> {
  private imageRef;
  private readyToMeasure: boolean = false;

  static propTypes: object = {
    imageHeight: PropTypes.number,
    imageId: PropTypes.string.isRequired,
    imageWidth: PropTypes.number,
    onPress: PropTypes.func.isRequired,
    shouldHideDisplayedImage: PropTypes.bool.isRequired,
    source: PropTypes.any.isRequired,
    theme: PropTypes.object,
    topMargin: PropTypes.number.isRequired,
    selectable: PropTypes.bool,
    onCheckImage: PropTypes.func,
    onUncheckImage: PropTypes.func,
    selectMode: PropTypes.bool,
    onStartSelectMode: PropTypes.func,
    selected: PropTypes.bool,
  };

  static defaultProps: object = {
    imageHeight: windowWidth,
    imageWidth: windowWidth,
    theme: {},
    selectMode: false,
    selectable: false,
    selected: false,
  };

  static contextTypes = {
    onSourceContext: PropTypes.func.isRequired
  };

  constructor(props: ImageCellProps) {
    super(props);

    // Methods
    this.measureImageSize = this.measureImageSize.bind(this);
    this.measurePhoto = this.measurePhoto.bind(this);
    this.onPress = this.onPress.bind(this);
    this.onLongPress = this.onLongPress.bind(this);

    // Initial state
    this.state = {
      imageLoaded: false,
      opacity: new Animated.Value(1),
    };
  }

  componentWillMount(): void {
    this.context.onSourceContext(
      this.props.imageId,
      this.measurePhoto,
      this.measureImageSize
    );
  }

  shouldComponentUpdate(nextProps: ImageCellProps, nextState: ImageCellState): boolean {
    const {shouldHideDisplayedImage, selected} = this.props;
    const {imageLoaded} = this.state;

    if(shouldHideDisplayedImage !== nextProps.shouldHideDisplayedImage 
      || imageLoaded !== nextState.imageLoaded
      || selected !== nextProps.selected) {
      return true;
    }

    return false;
  }

  componentDidUpdate(prevProps: ImageCellProps, prevState: ImageCellState): void {
    if(prevState.imageLoaded === false && this.state.imageLoaded) {
      Animated.timing(this.state.opacity, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        toValue: 1
      }).start();
    } else {
      const {shouldHideDisplayedImage} = this.props;
      const {opacity} = this.state;

      if(shouldHideDisplayedImage) {
        opacity.setValue(0);
      } else {
        opacity.setValue(1);
      }
    }
  }

  measurePhoto = async () => {
    const {topMargin} = this.props;

    if(!this.imageRef || !this.readyToMeasure) {
      console.warn('measurePhoto: Trying to measure image without ref or layout');
    }

    return new Promise((resolve, reject) => {
      this.imageRef
        .getNode()
        .measure((imgX: number,
          imgY: number,
          imgWidth: number,
          imgHeight: number,
          imgPageX: number,
          imgPageY: number) => {
          resolve({
            height: imgHeight,
            width: imgWidth,
            x: imgPageX,
            y: imgPageY + topMargin
          });
        }, reject);
    });
  }

  async measureImageSize(): Promise<object> {
    const {source} = this.props;
    const {imageLoaded} = this.state;

    if(!imageLoaded) {
      console.warn('measureImageSize: Undefined image size');
    }

    return new Promise((resolve, reject) => {
      Image.getSize(source.uri, (width: number, height: number) => {
        resolve({width, height});
      },
        (error: Error) => {
          console.warn('measureImageSize: Error trying to get image size', JSON.stringify(error.message));
          resolve({width: 0, height: 0});
        }
      );
    });
  }

  onPress(): void {
    const {imageId, onPress, selectable, selectMode} = this.props;
    const {imageLoaded} = this.state;

    if(selectable && selectMode){
      this.toggleImageSelection();
    }else{
      // Wait for the image to load before reacting to press events
      if(imageLoaded && onPress) {
        onPress(imageId);
      }
    }
  }
  
  selectImage(imagePath: string): void {
    const {onCheckImage} = this.props;
    if(onCheckImage){
      onCheckImage(imagePath);
    }
  }

  uncheckImage(imagePath: string): void {
    const {onUncheckImage} = this.props;
    if(onUncheckImage){
      onUncheckImage(imagePath);
    }
  }

  onLongPress(): void{
    const {selectable, selectMode, onStartSelectMode} = this.props;
    if(selectable){
      if(!selectMode){
        onStartSelectMode();
      }
      this.toggleImageSelection();
    }
  }

  toggleImageSelection(): void{
    const {imageId, selected} = this.props;
    if(selected){
      this.uncheckImage(imageId)
    }else{
      this.selectImage(imageId);
    }
    this.setState( Object.assign({}, this.state, {selected: !selected}) );
  }

  render(): JSX.Element {
    const {
      imageHeight,
      imageId,
      imageWidth,
      source,
      theme,
      selectable,
      selectMode,
      selected,
    } = this.props;
    const {imageGalleryImageColor = '#f1f1f1'} = theme;
    const imageStyle = {
      backgroundColor: imageGalleryImageColor,
      height: imageHeight,
      opacity: this.state.opacity,
      width: imageWidth
    };
    const selectedImageStyle = {
      height: imageHeight/5,
      width: imageWidth/5
    };

    return (
      <TouchableOpacity
        key={imageId}
        style={{backgroundColor: imageGalleryImageColor}}
        onPress={this.onPress}
        onLongPress={this.onLongPress}>
        <Animated.Image
          onLayout={() => this.readyToMeasure = true}
          onLoad={() => this.setState({imageLoaded: true})}
          ref={(r) => this.imageRef = r}
          source={source}
          resizeMode="cover"
          style={imageStyle} />
        <View style={ selectable && selected && selectMode ? styles.overlay : styles.hidden } >
          <Image 
            source={require('../assets/tick.png')}
            style={selectedImageStyle}
          />
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(69,85,117,0.7)',
  },
  absoluteFillObject: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  hidden: {
    display: 'none'
  }
});