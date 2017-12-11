import * as PropTypes from 'prop-types';
import * as React from 'react';
import {FlatList, StyleSheet} from 'react-native';

import {OpenedImageView} from './OpenedImageView';
import {ImageGallerySource} from './types/image';

export interface HorizontalContainerProps {
  readonly dismissProgress?: any;
  readonly height: number;
  readonly images: ImageGallerySource[];
  readonly imageHeight: number;
  readonly imageId: string;
  readonly imageWidth: number;
  readonly openProgress?: any;
  readonly onChange: (id: string) => void;
  readonly onPressImage: (imageId: string) => void;
  readonly openImageMeasurements: object;
  readonly realImageHeight: number;
  readonly realImageWidth: number;
  readonly transitionProgress: any;
  readonly width: number;
}

export interface HorizontalContainerState {
  readonly imageHeight: number;
  readonly imageWidth: number;
}

export class HorizontalContainer extends React.PureComponent<HorizontalContainerProps, HorizontalContainerState> {
  static propTypes = {
    dismissProgress: PropTypes.object,
    height: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    imageId: PropTypes.string.isRequired,
    imageWidth: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired
      })
    ).isRequired,
    onChange: PropTypes.func,
    onPressImage: PropTypes.func.isRequired,
    openProgress: PropTypes.object,
    realImageHeight: PropTypes.number.isRequired,
    realImageWidth: PropTypes.number.isRequired,
    transitionProgress: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired
  };

  constructor(props: HorizontalContainerProps) {
    super(props);

    // Methods
    this.getItemLayout = this.getItemLayout.bind(this);
    this.onPressImage = this.onPressImage.bind(this);
    this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
    this.renderItem = this.renderItem.bind(this);

    // Initial state
    const {imageHeight, imageWidth} = props;
    this.state = {imageHeight, imageWidth};
  }

  componentWillReceiveProps(nextProps: HorizontalContainerProps): void {
    const {imageHeight, imageWidth} = nextProps;

    if(imageWidth > 0 && imageHeight > 0) {
      this.setState({imageWidth, imageHeight});
    }
  }

  onPressImage(): void {
    const {imageId, onPressImage} = this.props;

    if(onPressImage) {
      onPressImage(imageId);
    }
  }

  onViewableItemsChanged(params: {viewableItems: any[], changed: any[]}): void {
    const {item: {id = null} = {}} = params.viewableItems[0];
    const {dismissProgress, imageId, onChange, openProgress} = this.props;

    if(!openProgress && !dismissProgress && id !== imageId && onChange) {
      onChange(id);
    }
  }

  getItemLayout(items: any, index: number): any {
    const {width} = this.props;
    return {length: width, index, offset: index * width};
  }

  renderItem(listItem: {item: ImageGallerySource, index: number}): JSX.Element {
    const {height, realImageHeight, realImageWidth, transitionProgress, width} = this.props;
    const {imageHeight, imageWidth} = this.state;

    return (
      <OpenedImageView
        height={height}
        imageHeight={imageHeight}
        imageWidth={imageWidth}
        onPress={this.onPressImage}
        realImageWidth={realImageWidth}
        realImageHeight={realImageHeight}
        transitionProgress={transitionProgress}
        url={listItem.item.url}
        width={width} />
    );
  }

  render(): JSX.Element {
    const {imageId, images, transitionProgress} = this.props;
    const {imageHeight, imageWidth} = this.state;
    const initialScrollIndex: number = images.findIndex((img: ImageGallerySource) => img.id === imageId);

    return (
      <FlatList
        initialNumToRender={images.length}
        style={viewStyles.container}
        data={images}
        extraData={`w${imageWidth}-h${imageHeight}-t${transitionProgress._value}`}
        renderItem={this.renderItem}
        getItemLayout={this.getItemLayout}
        horizontal={true}
        pagingEnabled={true}
        keyExtractor={(item: ImageGallerySource) => `OpenedImageView-${item.id}`}
        initialScrollIndex={initialScrollIndex}
        onViewableItemsChanged={this.onViewableItemsChanged} />
    );
  }
}

const viewStyles = StyleSheet.create({
  container: {
    flex: 1
  }
});
