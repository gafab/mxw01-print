import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'MXW01 Print',
  tagline: 'Web app & API for MXW01 thermal printer',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://mxw01-print.example.com',
  baseUrl: '/',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'MXW01 Print',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Getting Started', to: '/' },
            { label: 'Web App', to: '/web-app/overview' },
            { label: 'REST API', to: '/api/overview' },
          ],
        },
        {
          title: 'Reference',
          items: [
            { label: 'Print Modes', to: '/web-app/text-mode' },
            { label: 'API Endpoints', to: '/api/print-endpoints' },
            { label: 'Architecture', to: '/architecture' },
          ],
        },
      ],
      copyright: `MXW01 Print Documentation. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
