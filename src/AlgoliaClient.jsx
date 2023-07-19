import algoliaSearch from 'algoliasearch';

const indexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME;
const searchClient = algoliaSearch(import.meta.env.VITE_ALGOLIA_APP_ID, import.meta.env.VITE_ALGOLIA_API_KEY);

export { indexName, searchClient };
  
