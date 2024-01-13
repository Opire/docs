import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  search: {
    placeholder: 'Search',
  },
  logo: <span>Opire</span>,
  // project: {
  //   link: 'https://github.com/shuding/nextra-docs-template',
  // },
  chat: {
    link: 'https://opire.discord.com', // FIXME: add correct link
  },
  editLink: {
    text: '',
  },
  feedback: {
    content: ''
  },
  useNextSeoProps() {
    return {
      titleTemplate: 'Opire Docs'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Opire" />
      <meta property="og:description" content="Learn all about how Opire works to use rewards in your projects" /> {/** TODO: change description */}
    </>
  ),
  // primaryHue: 279, // 84? 180?
  // docsRepositoryBase: 'https://github.com/shuding/nextra-docs-template',
  // banner: {
  //   dismissible: true,
  //   key: 'example-banner',
  //   text: ''
  // },
  sidebar: {
    defaultMenuCollapseLevel: 2,
    autoCollapse: false,
    titleComponent: ({ title, type, route }) => {
      return <>{title}</>
    }
  },
  gitTimestamp: '',
  footer: {
    text: 'Opire with 💙',
  },
  i18n: [
    { locale: 'en', text: 'English' },
    { locale: 'es', text: 'Español' }
  ]
}

export default config
