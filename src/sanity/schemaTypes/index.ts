import type { SchemaTypeDefinition } from 'sanity';

import { guideType } from './guideType';
import { imageGalleryType } from './imageGalleryType';
import { youtubeType } from './youtubeType';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [guideType, imageGalleryType, youtubeType],
};
