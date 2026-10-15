import { PlayIcon } from '@sanity/icons/Play';
import { defineField, defineType } from 'sanity';

// Accepts the usual YouTube link shapes: watch?v=, youtu.be/, /embed/ and /shorts/.
const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export const youtubeType = defineType({
  name: 'youtube',
  title: 'YouTube video',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'url',
      title: 'YouTube URL',
      type: 'url',
      description: 'Paste the full link, e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            typeof value === 'string' && YOUTUBE_ID_PATTERN.test(value)
              ? true
              : "That doesn't look like a YouTube link"
          ),
    }),
    defineField({
      name: 'title',
      title: 'Video title',
      type: 'string',
      description: 'Describes the video for screen reader users.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'url',
    },
  },
});
