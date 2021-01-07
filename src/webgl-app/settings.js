import { getQueryFromParams } from './utils/query-params';

const settings = {};

// Enviroment setting
settings.isDevelopment = process.env.NODE_ENV !== 'production';

// Base url
settings.baseUrl = process.env.PUBLIC_URL || '';

// Show fps stats
settings.stats = true; //getQueryFromParams('stats') === null;

// Enable dev camera rendering
settings.devCamera = false; //getQueryFromParams('devCamera') === 'true';

// Enable helpers
settings.helpers = false; //getQueryFromParams('helpers') === 'true';

// Enable dat gui
settings.datGui = true; //getQueryFromParams('gui') === null;

// Skips all transitions
settings.skipTransitions = false; //getQueryFromParams('skipTransitions') === null;

// GUI Number precision
settings.guiPrecision = 0.001;

// Viewport preview scale (when using devCamera)
settings.viewportPreviewScale = 0.25;

// Unlock full render size (should be false for prod)
settings.renderBufferFullscreen = getQueryFromParams('hd') === null || false;

settings.postProcessing = true;

export default settings;
