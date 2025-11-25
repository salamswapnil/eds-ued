import { moveInstrumentation } from '../../scripts/scripts.js';
import { getNewElem, $tag } from '../../scripts/utils.js';

export default function decorate(block) {
  const blockChildren = [...block.children];
  const container = $tag('div', { class: 'heroComponent align-items-center hero-section d-flex' });
  const row = $tag('div', { class: 'row g-4' });

  blockChildren.forEach((item) => {
    });
  block.innerHTML = '';
  container.appendChild(row);
  block.appendChild(container);
}
