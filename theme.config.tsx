import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import { useRouter } from 'next/router';

function SearchPlaceholder() {
  const { locale } = useRouter();

  const map = {
    es: 'Buscar',
    en: 'Search',
  }

  return map[locale] ?? map.en;
}

const config: DocsThemeConfig = {
  search: {
    placeholder: SearchPlaceholder
  },
  logo:
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <img src={'/opire_logo.svg'} style={{ width: '36px', height: '36px' }} />

      <span>
        Opire
      </span>
    </div >,
  chat: {
    link: 'https://discord.gg/jWwwsHRbnJ',
  },
  editLink: {
    component: () => <></>,
  },
  feedback: {
    content: ''
  },
  useNextSeoProps() {
    return {
      titleTemplate: 'Opire Docs - The Rewards Platform for Software Developers'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />

      <meta name="title" content="Opire - The Rewards Platform for Software Developers" />
      <meta name="description" content="With Opire, anyone can create rewards for open source projects and grow their community, while developers can solve issues and earn the associated rewards." />
      <meta name="keywords" content="opire, opiredev, reward, bounty, money, open source, software, programmer, community, dev, developement, issue, git, github, gitlab, pr, mr, pull request, merge request" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content="Opire - The Rewards Platform for Software Developers" />
      <meta property="og:description" content="With Opire, anyone can create rewards for open source projects and grow their community, while developers can solve issues and earn the associated rewards." />

      <link rel="canonical" href="https://docs.opire.dev/overview/introduction" />
      <link rel="shortcut icon" href="/opire_logo.svg" />
    </>
  ),
  // primaryHue: 279, // 84? 180?
  primaryHue: {
    dark: 190,
    light: 215,
  },
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
  ],
}

export default config
