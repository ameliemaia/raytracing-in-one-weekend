import { FloatType } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import Loader from './loader';
import Asset from '../asset';

/**
 * Three HDR Loader
 *
 * @export
 * @class ThreeHDRLoader
 * @extends {Loader}
 */
export default class ThreeHDRLoader extends Loader {
  constructor(asset: Asset) {
    super();
    this.asset = asset;
  }

  load = () => {
    const loader = new RGBELoader().setDataType(FloatType);

    const onLoaded = (texture: Texture) => {
      this.asset.data = texture;
      this.emit('loaded', this.asset);
    };

    const onError = () => {
      this.emit('error', `Failed to load ${this.asset.src}`);
    };

    loader.load(this.asset.src, onLoaded, null, onError);
  };
}
