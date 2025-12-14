interface PageTitleProps {
  title?: string
}

export function PageTitle({ title }: PageTitleProps) {
  const fullTitle = title ? `${title} | ViKa` : 'Vismaya Kalike Learning Centres'

  return <title>{fullTitle}</title>
}

export default PageTitle
