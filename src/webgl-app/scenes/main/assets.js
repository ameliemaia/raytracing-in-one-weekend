import Asset from '../../loading/asset';
import Loader from '../../loading/loaders/loader';
import settings from '../../settings';

const assets = settings.hdrEnabled
  ? [
      new Asset({
        id: 'glass-passage',
        src: `${settings.baseUrl}/assets/webgl/glass-passage.hdr`,
        type: Loader.threeHDRTexture
      }),
      new Asset({
        id: 'lilienstein',
        src: `${settings.baseUrl}/assets/webgl/lilienstein.hdr`,
        type: Loader.threeHDRTexture
      })
    ]
  : [];

export default assets;
