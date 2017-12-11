import {Animated} from 'react-native';

export type ImageFit = 'fit' | 'fill';

export interface ImageGallerySource {
  readonly description?: string;
  readonly id: string;
  readonly title?: string;
  readonly url: string;
}

export interface ImageGalleryMeasurements {
  readonly height: number;
  readonly scale: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

export interface ImageGallerySize {
  readonly containerHeight: number;
  readonly containerWidth: number;
  readonly imageHeight: number;
  readonly imageWidth: number;
  readonly mode: ImageFit;
}

export interface ImageGalleryScrollProps {
  readonly width: Animated.Value;
  readonly height: Animated.Value;
  readonly imageSource?: ImageGallerySource;
  readonly openImageMeasurements?: ImageGalleryMeasurements;
  readonly openProgress?: any;
  readonly dismissProgress?: any;
  readonly transitionProgress?: any;
}

export interface ImageGalleryMeasureFunctions {
  readonly imageSizeMeasurer: () => ImageGalleryMeasurements;
  readonly measurer: () => ImageGalleryMeasurements;
}

export interface ImageGalleryContext {
  onSourceContext: (imageId: string, cellMeasurer: any, imageMeasurer: any) => void;
}

export interface ImageGalleryViewableItem {
  readonly index: number;
  readonly item: ImageGallerySource;
  readonly key: string;
  readonly isViewable: boolean;
}
