export const pageBySlugQuery = `
  *[_type == "localizedPage" && slug.current == $slug][0] {
    _id,
    _updatedAt,
    slug,
    order,
    parentPage->{
      _id,
      slug,
      en { title },
      kn { title }
    },
    en {
      title,
      subtitle,
      metaTitle,
      metaDescription,
      sections[] {
        heading,
        content
      }
    },
    kn {
      title,
      subtitle,
      metaTitle,
      metaDescription,
      sections[] {
        heading,
        content
      }
    }
  }
`

export const allPagesQuery = `
  *[_type == "localizedPage"] | order(order asc) {
    _id,
    slug,
    order,
    navigationOnly,
    parentPage->{
      _id,
      slug
    },
    en { title },
    kn { title }
  }
`
