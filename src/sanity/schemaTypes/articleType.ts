import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const articleType = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug', title: 'Slug', type: 'slug',
      description: 'Used in the article URL, e.g. /articles/code-of-conduct',
      options: { source: 'title', maxLength: 96 }, validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description', title: 'Description', type: 'text', rows: 3,
      description: 'Short summary used for SEO and link previews.',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'body', title: 'Body', type: 'array',
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
          type: 'image', options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.required() }),
            defineField({
              name: 'placement', title: 'Placement', type: 'string',
              options: { list: [{ title: 'Full width', value: 'full' }, { title: 'Wrapped left', value: 'left' }, { title: 'Wrapped right', value: 'right' }], layout: 'radio' },
              initialValue: 'full', validation: (rule) => rule.required(),
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
    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime', initialValue: () => new Date().toISOString(), validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: 'title', subtitle: 'description' } },
});