/* PARSA — search + category filtering (works together)
   Requirements in HTML:
   - Search form id="searchForm" and input id="searchInput"
   - Category buttons: .category-btn with data-category="all|fried|sweets|frozen"
   - Product cards: .product-card with data-category="fried|sweets|frozen"
*/

(function(){
  // tiny debounce helper
  const debounce = (fn, wait=160) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
  };

  document.addEventListener('DOMContentLoaded', () => {
    // ELEMENTS
    const form   = document.getElementById('searchForm');
    const input  = document.getElementById('searchInput');
    const cards  = Array.from(document.querySelectorAll('.product-card'));
    const catBtns= Array.from(document.querySelectorAll('.category-btn'));

    // Bail early if not present
    if (!cards.length) return;
    // Create/ensure a no-results message just after the search form (if exists)
    let noResults = document.querySelector('.no-results');
    if (!noResults && form && form.parentNode) {
      noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No products found. Try another keyword or category.';
      noResults.style.display = 'none';
      form.parentNode.appendChild(noResults);
    }

    // STATE
    let activeCategory = 'all';
    let query = '';

    // HELPERS
    const getCardText = (card) => {
      const title = card.querySelector('.product-title')?.innerText || '';
      const desc  = card.querySelector('.product-desc')?.innerText || '';
      const alt   = card.querySelector('img')?.alt || '';
      const price = card.querySelector('.price-num')?.innerText || '';
      const tags  = card.dataset.tags || '';
      return `${title} ${desc} ${alt} ${price} ${tags}`.toLowerCase();
    };

    const matchesCategory = (card) => {
      if (activeCategory === 'all') return true;
      const c = card.dataset.category || '';
      return c === activeCategory;
    };

    const matchesQuery = (card) => {
      if (!query) return true;
      return getCardText(card).includes(query);
    };

    const applyFilters = () => {
      let shown = 0;
      cards.forEach(card => {
        const ok = matchesCategory(card) && matchesQuery(card);
        card.hidden = !ok;                    // accessibility-friendly toggle
        card.classList.toggle('matched', ok); // optional subtle outline
        if (ok) shown++;
      });
      if (noResults) noResults.style.display = shown ? 'none' : 'block';
      return shown;
    };

    const setActiveButton = (btn) => {
      catBtns.forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    };

    // INITIAL RENDER
    applyFilters();

    // CATEGORY EVENTS
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-category') || 'all';
        setActiveButton(btn);
        applyFilters();
      });
    });

    
    console.log('PARSA scripts.js loaded: search + category filtering active');
  });
})();

(function(){
  const debounce = (fn, wait=180) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(()=> fn(...args), wait); };
  };

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('searchForm') || document.querySelector('.search-form');
    const input = document.getElementById('searchInput') || document.querySelector('.search-input');
    const productCards = Array.from(document.querySelectorAll('.product-card'));
    if(!form || !input || productCards.length === 0) return; // nothing to do

    // Create a no-results element and insert after form
    let noResults = document.querySelector('.no-results');
    if(!noResults){
      noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.setAttribute('role','status');
      noResults.setAttribute('aria-live','polite');
      noResults.style.display = 'none';
      noResults.textContent = 'No products found. Try a different keyword.';
      form.parentNode.appendChild(noResults);
    }

    // Helper: get searchable text from a card
    function cardText(card){
      const title = card.querySelector('.product-title')?.innerText || '';
      const desc  = card.querySelector('.product-desc')?.innerText || '';
      const alt   = card.querySelector('img')?.alt || '';
      const price = card.querySelector('.price-num')?.innerText || '';
      const tags  = card.dataset.tags || ''; // optional data-tags attribute
      return `${title} ${desc} ${alt} ${price} ${tags}`.toLowerCase();
    }

    // Show all cards (reset)
    function showAll(){
      productCards.forEach(c => {
        c.hidden = false;
        c.classList.remove('matched');
      });
      noResults.style.display = 'none';
    }

    // Perform search & filter
    function performSearch(q){
      const query = (q || '').trim().toLowerCase();
      if(!query){
        showAll();
        return;
      }

      let matches = 0;
      productCards.forEach(card => {
        const hay = cardText(card);
        if(hay.includes(query)){
          card.hidden = false;
          card.classList.add('matched');
          matches++;
        } else {
          card.hidden = true;
          card.classList.remove('matched');
        }
      });

      if(matches === 0){
        noResults.style.display = 'block';
      } else {
        noResults.style.display = 'none';
      }
    }

    // Debounced input listener for live filtering
    const debounced = debounce((e) => performSearch(e.target.value));
    input.addEventListener('input', debounced);

    // On form submit: prevent reload. If exactly one match -> go to that product page.
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const q = input.value.trim();
      performSearch(q);

      const visible = productCards.filter(c => !c.hidden);
      if(visible.length === 1){
        // gentle delay so users see matches, then navigate:
        window.location.href = visible[0].href;
      } else {
        // Focus first visible card for keyboard users
        if(visible.length > 0){
          visible[0].focus();
        } else {
          input.focus();
        }
      }
    });

    // Optional: support quick searches via keyboard 'Escape' to clear
    input.addEventListener('keydown', (e) => {
      if(e.key === 'Escape') {
        input.value = '';
        showAll();
      }
    });

  });
})();

function goCart() {
  window.location.href = 'cart.html';
}

