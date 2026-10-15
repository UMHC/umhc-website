import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const guideType = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Used in the guide URL, e.g. /guides/winter-hiking',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Short summary shown on the guides listing page and used for SEO.',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Important for accessibility and SEO.',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 1', value: 'h1' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Heading 4', value: 'h4' },
            { title: 'Heading 5', value: 'h5' },
            { title: 'Heading 6', value: 'h6' },
            { title: 'Quote', value: 'blockquote' },
            { title: 'Align left', value: 'alignLeft' },
            { title: 'Align center', value: 'alignCenter' },
            { title: 'Align right', value: 'alignRight' },
            { title: 'Justify', value: 'alignJustify' },
          ],
          lists: [
            { title: 'Bulleted', value: 'bullet' },
            { title: 'Numbered (1, 2, 3)', value: 'number' },
            { title: 'Lettered (a, b, c)', value: 'letter' },
            { title: 'Roman (i, ii, iii)', value: 'roman' },
          ],
        }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'placement',
              title: 'Placement',
              type: 'string',
              description:
                'How this image sits in the text. Wrapped images stack full width on mobile.',
              options: {
                list: [
                  { title: 'Full width - centred, no text wrap', value: 'full' },
                  { title: 'Wrapped left - text flows down the right', value: 'left' },
                  { title: 'Wrapped right - text flows down the left', value: 'right' },
                ],
                layout: 'radio',
              },
              initialValue: 'full',
              validation: (rule) => rule.required(),
            }),
          ],
        }),
        defineArrayMember({ type: 'imageGallery' }),
        defineArrayMember({ type: 'youtube' }),
      ],
      components: {
        portableText: {
          plugins: (props) =>
            props.renderDefault({
              ...props,
              plugins: {
                ...props.plugins,
                markdown: { enabled: false },
              },
            }),
        },
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      subtitle: 'description',
    },
  },
});
