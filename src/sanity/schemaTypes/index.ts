import type { SchemaTypeDefinition } from 'sanity';

import { articleType } from './articleType';
import { guideType } from './guideType';
import { imageGalleryType } from './imageGalleryType';
import { youtubeType } from './youtubeType';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [articleType, guideType, imageGalleryType, youtubeType],
};
