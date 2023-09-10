import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>MakeMyChange</span>,
  // project: {
  //   link: 'https://github.com/shuding/nextra-docs-template',
  // },
  chat: {
    link: 'https://makemychange.discord.com', // FIXME: add correct link
  },
  editLink: {
    text: '',
  },
  feedback: {
    content: ''
  },
  useNextSeoProps() {
    return {
      titleTemplate: 'MakeMyChange Docs'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="MakeMyChange" />
      <meta property="og:description" content="Learn all about how MakeMyChange works to use rewards in your projects" /> {/** TODO: change description */}
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

      if (title === 'Authorization') return <>🔐 {title}</>
      if (title === 'Organizations') return <>🏢 {title}</>
      if (title === 'Users') return <>🙋‍♂️ {title}</>
      if (title === 'Rewards') return <>💰 {title}</>
      if (title === 'Tips') return <>💸 {title}</>
      if (title === 'Payments') return <>💳 {title}</>
      if (title === 'Notifications') return <>💌 {title}</>

      return <>{title}</>
    }
  },
  gitTimestamp: '',
  footer: {
    text: 'MakeMyChange',
  },
}

export default config
