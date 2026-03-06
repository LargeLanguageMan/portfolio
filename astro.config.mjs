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
      sidebar: [
        { label: 'About', link: '/' },
      ],
    }),
  ],
});
