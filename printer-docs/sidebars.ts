import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'installation',
    {
      type: 'category',
      label: 'Web App',
      items: [
        'web-app/overview',
        'web-app/text-mode',
        'web-app/image-mode',
        'web-app/icon-mode',
        'web-app/qr-mode',
        'web-app/barcode-mode',
        'web-app/datamatrix-mode',
        'web-app/printer-logs',
      ],
    },
    {
      type: 'category',
      label: 'REST API',
      items: [
        'api/overview',
        'api/print-endpoints',
        'api/render-endpoints',
        'api/printer-management',
        'api/parameters',
      ],
    },
    'architecture',
    'printer-specs',
  ],
};

export default sidebars;
