import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'localizedPage',
  title: 'Localized Page',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier (e.g., "purpose", "getting-started")',
      options: {
        source: 'en.title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Order in navigation (lower numbers appear first)',
      initialValue: 0,
    }),
    defineField({
      name: 'parentPage',
      title: 'Parent Page',
      type: 'reference',
      to: [{ type: 'localizedPage' }],
      description: 'Optional parent page for nested navigation',
    }),
    defineField({
      name: 'navigationOnly',
      title: 'Navigation Only (No Page)',
      type: 'boolean',
      description: 'Check this if this should be a dropdown menu in navigation without its own page content',
      initialValue: false,
    }),
    defineField({
      name: 'en',
      title: 'English Content',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'subtitle',
          title: 'Subtitle',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'sections',
          title: 'Content Sections',
          type: 'array',
          of: [{ type: 'section' }],
        }),
        defineField({
          name: 'metaTitle',
          title: 'SEO Meta Title',
          type: 'string',
          description: 'Falls back to title if not set',
        }),
        defineField({
          name: 'metaDescription',
          title: 'SEO Meta Description',
          type: 'text',
          rows: 3,
          description: 'Falls back to subtitle if not set',
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'kn',
      title: 'Kannada Content (ಕನ್ನಡ)',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
        }),
        defineField({
          name: 'subtitle',
          title: 'Subtitle',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'sections',
          title: 'Content Sections',
          type: 'array',
          of: [{ type: 'section' }],
        }),
        defineField({
          name: 'metaTitle',
          title: 'SEO Meta Title',
          type: 'string',
        }),
        defineField({
          name: 'metaDescription',
          title: 'SEO Meta Description',
          type: 'text',
          rows: 3,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'en.title',
      slug: 'slug.current',
      parentTitle: 'parentPage.en.title',
    },
    prepare({ title, slug, parentTitle }) {
      return {
        title: title || 'Untitled',
        subtitle: parentTitle ? `${parentTitle} • /${slug}` : `/${slug}`,
      }
    },
  },
})
