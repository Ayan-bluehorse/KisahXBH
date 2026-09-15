if (!customElements.get('search-suggestions')) {
  const SearchSuggestions = class extends HTMLElement {
    connectedCallback() {
      this.searchTimeoutID = -1;
      this.searchInput = this.closest('form').querySelector('input[name="q"]');
      this.searchInput.addEventListener('keyup', this.handleInputChange.bind(this));
      this.searchInput.addEventListener('change', this.handleInputChange.bind(this));
    }

    handleInputChange() {
      const valueToSearch = this.searchInput.value;

      if (valueToSearch.length && valueToSearch !== this.oldSearchValue) {
        clearTimeout(this.searchTimeoutID);

        this.searchTimeoutID = setTimeout(() => {
          this.fetchSuggestions(valueToSearch);
        }, 500);
      } else if (!valueToSearch.length) {
        clearTimeout(this.searchTimeoutID);

        if (this.searchSuggestionsAbortController) {
          this.searchSuggestionsAbortController.abort();
          this.searchSuggestionsAbortController = null;
        }

        this.innerHTML = '';
      }

      this.oldSearchValue = valueToSearch;
    }

    fetchSuggestions(terms) {
      if (this.searchSuggestionsAbortController) {
        this.searchSuggestionsAbortController.abort();
      }
      this.searchSuggestionsAbortController = new AbortController();
      const signal = this.searchSuggestionsAbortController.signal;

      const runPredictiveSuggestions = () => {
        fetch(`${theme.routes.predictiveSearch}?q=${encodeURIComponent(terms)}&section_id=search-suggestions`, {
          signal,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(response.status);
            }
            return response.text();
          })
          .then((text) => {
            const results = new DOMParser()
              .parseFromString(text, 'text/html')
              .querySelector('.search-suggestions-wrapper');

            this.innerHTML = '';
            if (results && results.firstElementChild) {
              this.insertAdjacentElement('beforeend', results.firstElementChild);
            }
          })
          .catch((error) => {
            if (error.code === 20) {
              return; // aborted
            }
            throw error;
          });
      };

      const collectionSearch = window.CollectionSearchOverride;

      if (collectionSearch && collectionSearch.matchesTerms(terms)) {
        collectionSearch
          .fetchProductsForTerms(terms, 8, signal)
          .then((products) => {
            if (products.length) {
              const heading = collectionSearch.headingForTerms(terms) || 'Products';
              const wrap = collectionSearch.buildSuggestionsWrapper(products, 8, heading);
              this.innerHTML = '';
              this.appendChild(wrap);
              return;
            }
            runPredictiveSuggestions();
          })
          .catch(() => {
            runPredictiveSuggestions();
          });
        return;
      }

      runPredictiveSuggestions();
    }
  };

  window.customElements.define('search-suggestions', SearchSuggestions);
}
