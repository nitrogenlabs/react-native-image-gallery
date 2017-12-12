import * as PropTypes from 'prop-types';
import * as React from 'react';
import {FlatList, StyleSheet} from 'react-native';

import {ImageCell} from './ImageCell';
import {ImageGallerySource} from './types/image';

export interface ImageListContainerProps {
  readonly activeId?: string;
  readonly imageHeight?: number;
  readonly imageWidth?: number;
  readonly images?: ImageGallerySource[];
  readonly onPress?: (imageId: string) => void;
  readonly showImageViewer?: boolean;
  readonly theme?: object;
  readonly topMargin?: number;
}

export class ImageListContainer extends React.PureComponent<ImageListContainerProps> {
  static propTypes = {
    activeId: PropTypes.string,
    imageHeight: PropTypes.number,
    imageWidth: PropTypes.number,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired
      })
    ),
    onPress: PropTypes.func.isRequired,
    showImageViewer: PropTypes.bool,
    theme: PropTypes.object,
    topMargin: PropTypes.number
  };

  static defaultProps: object = {
    images: [],
    showImageViewer: false,
    theme: {},
    topMargin: 0
  };

  constructor(props: ImageListContainerProps) {
    super(props);

    // Methods
    this.renderItem = this.renderItem.bind(this);
  }

  renderItem(item: {item: ImageGallerySource, index: number}): JSX.Element {
    const {
      activeId,
      imageHeight,
      imageWidth,
      onPress,
      showImageViewer,
      theme,
      topMargin
    } = this.props;

    return (
      <ImageCell
        key={`ImageCellId-${item.item.id}`}
        imageHeight={imageHeight}
        imageId={item.item.id}
        imageWidth={imageWidth}
        source={{uri: item.item.url}}
        onPress={onPress}
        shouldHideDisplayedImage={showImageViewer && activeId === item.item.id}
        theme={theme}
        topMargin={topMargin} />
    );
  }

  render(): JSX.Element {
    const {
      activeId,
      images
    } = this.props;

    return (
      <FlatList
        style={styles.container}
        data={images}
        extraData={activeId}
        numColumns={2}
        keyExtractor={(item: ImageGallerySource) => item.id}
        renderItem={this.renderItem}
        horizontal={false} />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
