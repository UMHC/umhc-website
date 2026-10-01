import { ImagesIcon } from '@sanity/icons/Images';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const imageGalleryType = defineType({
  name: 'imageGallery',
  title: 'Image row',
  type: 'object',
  icon: ImagesIcon,
  description: 'Two to four images displayed side by side across the page.',
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
              description: 'Important for accessibility and SEO.',
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
      options: { layout: 'grid' },
      validation: (rule) => rule.required().min(2).max(4),
    }),
  ],
  preview: {
    select: {
      images: 'images',
      media: 'images.0',
    },
    prepare({ images, media }) {
      const count = Array.isArray(images) ? images.length : 0;
      return {
        title: 'Image row',
        subtitle: `${count} image${count === 1 ? '' : 's'} side by side`,
        media,
      };
    },
  },
});
