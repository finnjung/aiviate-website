#!/usr/bin/env node
/**
 * Aiviate Blog Builder
 * Reads JSON posts from blog/posts/, generates static HTML pages.
 * Run: node build-blog.js
 */
const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'blog', 'posts');
const BLOG_DIR = path.join(__dirname, 'blog');
const TEMPLATE = fs.readFileSync(path.join(__dirname, 'blog', 'post-template.html'), 'utf-8');
const INDEX_TEMPLATE = fs.readFileSync(path.join(__dirname, 'blog', 'index-template.html'), 'utf-8');

// Read all post JSON files
const postFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'));
const posts = postFiles.map(f => {
  const data = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8'));
  return data;
}).sort((a, b) => new Date(b.date) - new Date(a.date));

// Generate individual post pages
for (const post of posts) {
  const postDir = path.join(BLOG_DIR, post.slug);
  fs.mkdirSync(postDir, { recursive: true });

  // Build FAQ HTML
  let faqHtml = '';
  if (post.faq && post.faq.length > 0) {
    const faqItems = post.faq.map(qa =>
      `<div class="faq-item">
        <h3 class="faq-q">${qa.q}</h3>
        <p class="faq-a">${qa.a}</p>
      </div>`
    ).join('\n');
    faqHtml = `<section class="post-faq"><h2>Häufige Fragen</h2>${faqItems}</section>`;
  }

  // Build FAQ JSON-LD
  let faqJsonLd = '';
  if (post.faq && post.faq.length > 0) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": post.faq.map(qa => ({
        "@type": "Question",
        "name": qa.q,
        "acceptedAnswer": { "@type": "Answer", "text": qa.a }
      }))
    };
    faqJsonLd = `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`;
  }

  const formattedDate = new Date(post.date).toLocaleDateString('de-DE', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  let html = TEMPLATE
    .replace(/\{\{TITLE\}\}/g, post.title)
    .replace(/\{\{DESCRIPTION\}\}/g, post.description || '')
    .replace(/\{\{SLUG\}\}/g, post.slug)
    .replace(/\{\{DATE\}\}/g, post.date)
    .replace(/\{\{DATE_FORMATTED\}\}/g, formattedDate)
    .replace(/\{\{CATEGORY\}\}/g, post.category || '')
    .replace(/\{\{CONTENT\}\}/g, post.content)
    .replace(/\{\{FAQ\}\}/g, faqHtml)
    .replace(/\{\{FAQ_JSONLD\}\}/g, faqJsonLd)
    .replace(/\{\{FOCUS_KEYWORD\}\}/g, post.focus_keyword || '');

  fs.writeFileSync(path.join(postDir, 'index.html'), html);
  console.log(`  ✓ blog/${post.slug}/index.html`);
}

// Generate blog index page
const postCards = posts.map(post => {
  const formattedDate = new Date(post.date).toLocaleDateString('de-DE', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  return `<a href="/blog/${post.slug}/" class="blog-card">
    <span class="blog-card__cat">${post.category || 'Allgemein'}</span>
    <h2 class="blog-card__title">${post.title}</h2>
    <p class="blog-card__desc">${post.description || ''}</p>
    <span class="blog-card__date">${formattedDate}</span>
  </a>`;
}).join('\n');

const indexHtml = INDEX_TEMPLATE.replace('{{POSTS}}', postCards);
fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), indexHtml);
console.log(`  ✓ blog/index.html (${posts.length} posts)`);
console.log('Done.');
