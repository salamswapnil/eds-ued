// blocks/hero-banner/hero-banner.js
export default function decorate(block) {
  const rows = [...block.children];

  const imageRow = rows[0];
  const titleRow = rows[1];
  const descRow = rows[2];
  const ctaRow = rows[3];

  block.classList.add('hero-banner-initialized');

  // Create hero structure
  const mediaWrapper = document.createElement('div');
  mediaWrapper.classList.add('hero-banner-media');

  const contentWrapper = document.createElement('div');
  contentWrapper.classList.add('hero-banner-content');

  // 1. Move picture into media wrapper
  if (imageRow) {
    const picture = imageRow.querySelector('picture');
    if (picture) {
      mediaWrapper.appendChild(picture);
    }
  }

  // 2. Title
  if (titleRow) {
    const titleInner = titleRow.firstElementChild || titleRow;
    titleInner.classList.add('hero-banner-title');
    contentWrapper.appendChild(titleInner);
  }

  // 3. Description
  if (descRow) {
    const descInner = descRow.firstElementChild || descRow;
    descInner.classList.add('hero-banner-description');
    contentWrapper.appendChild(descInner);
  }

  // 4. CTA (your existing button)
  if (ctaRow) {
    const ctaInner = ctaRow.firstElementChild || ctaRow;
    // keep existing markup, just add a wrapper class
    const ctaWrapper = document.createElement('div');
    ctaWrapper.classList.add('hero-banner-ctas');

    ctaWrapper.append(...ctaInner.childNodes); // move <p class="button-container">...
    contentWrapper.appendChild(ctaWrapper);
  }

  // Rebuild block
  block.innerHTML = '';
  block.appendChild(mediaWrapper);
  block.appendChild(contentWrapper);
}
