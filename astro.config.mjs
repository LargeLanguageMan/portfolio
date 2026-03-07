import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Wesley Hucker | Data Analytics & AI Specialist',
      description: 'AI & Data Specialist — guides on AI agents, local LLMs, analytics, and developer tooling.',
      plugins: [
        starlightBlog({
          authors: {
            wes: {
              name: 'Wes',
              title: 'AI & Data Specialist',
              url: 'https://github.com/LargeLanguageMan',
            },
          },
        }),
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/LargeLanguageMan' },
      ],
      head: [
        {
          tag: 'script',
          attrs: {
            async: true,
            src: 'https://www.googletagmanager.com/gtag/js?id=G-29H3KSNVGS',
          },
        },
        {
          tag: 'script',
          content: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-29H3KSNVGS');
          `,
        },
      ],
      sidebar: [
        { label: 'About', link: '/' },
      ],
    }),
  ],
});
