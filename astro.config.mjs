import { defineConfig } from 'astro/config';
import node from "@astrojs/node";
import mdx from '@astrojs/mdx';
import embeds from 'astro-embed/integration';
import tailwind from "@astrojs/tailwind";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const isNetlify = process.env.NETLIFY_BUILD === 'true';

export default defineConfig({
  output: 'static',

  // Default for local development
  site: isGitHubPages ? 'https://dnewms.github.io' : 
        isNetlify ? 'https://umrob.netlify.com' : 
        'http://localhost:4321',

  base: isGitHubPages ? '/rob-astro-23' : '/',

  integrations: [
    icon(),
    tailwind(), 
    preact(), 
    sitemap(), 
    embeds(), 
    mdx()
  ],

  markdown: {
    remarkPlugins: [
      () => (tree, file) => {
        const courseMatch = file.history[0].match(/courses\/([^/]+)/);
        const courseId = courseMatch ? courseMatch[1] : '';
        
        function visitLinks(tree) {
          if (tree.type === 'link' && !tree.url.startsWith('/') && !tree.url.startsWith('http')) {
            tree.url = `${import.meta.env.BASE_URL}/academics/courses/online-courses/${courseId}/${tree.url}`;
          }
          
          if (tree.children) {
            tree.children.forEach(visitLinks);
          }
        }
        
        visitLinks(tree);
      }
    ],
  },

  vite: {
    define: {
      'import.meta.env.BASE_URL': isGitHubPages ? '"/rob-astro-23"' : '"/"',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        }
      },
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    }
  },

  image: {
    domains: [
      'events.umich.edu',
      'robotics.umich.edu',
      'www.umich.edu',
      'news.engin.umich.edu',
      'i.ytimg.com',
      'img.youtube.com',
      'cdninstagram.com',
      'scontent.cdninstagram.com',
      'pbs.twimg.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.umich.edu'
      },
      {
        protocol: 'https',
        hostname: '**.engineering'
      },
      { protocol: 'https', hostname: '**.ytimg.com' },
      { protocol: 'https', hostname: '**.youtube.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.twimg.com' },
      {  protocol: "https",
        hostname: "events.umich.edu",
        pathname: "/media/*"
      }
    ],
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    format: ['webp', 'avif', 'png', 'jpg'],
    fallbackFormat: 'png',
    defaultQuality: 80
  },
});