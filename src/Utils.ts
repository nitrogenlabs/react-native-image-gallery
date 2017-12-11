import {Dimensions, Platform} from 'react-native';
import {ImageGalleryMeasurements, ImageGallerySize} from './types/image';

const X_WIDTH: number = 375;
const X_HEIGHT: number = 812;

export class Utils {
  static getImageMeasurements(sizes: ImageGallerySize): ImageGalleryMeasurements {
    const {
      containerHeight,
      containerWidth,
      imageHeight,
      imageWidth,
      mode
    } = sizes;
    const imageAspectRatio: number = imageWidth / imageHeight;
    const containerAspectRatio: number = containerWidth / containerHeight;
    let width: number;
    let height: number;

    if(mode === 'fit') {
      width = containerWidth;
      height = containerWidth / imageAspectRatio;

      if(imageAspectRatio - containerAspectRatio < 0) {
        height = containerHeight;
        width = containerHeight * imageAspectRatio;
      }
    } else {
      width = containerHeight * imageAspectRatio;
      height = containerHeight;

      if(imageAspectRatio - containerAspectRatio < 0) {
        height = containerWidth;
        width = containerWidth / imageAspectRatio;
      }
    }

    const x: number = (containerWidth - width) * 0.5;
    const y: number = (containerHeight - height) * 0.5;
    const scale: number = width / containerWidth;

    return {
      height,
      scale,
      width,
      x,
      y
    };
  }

  static isIPhoneX(): boolean {
    return (
      Platform.OS === 'ios' &&
      ((Dimensions.get('window').height === X_HEIGHT &&
        Dimensions.get('window').width === X_WIDTH) ||
        (Dimensions.get('window').height === X_WIDTH &&
          Dimensions.get('window').width === X_HEIGHT))
    );
  }
}
