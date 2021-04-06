export const SearchService = {
  all_artists: [],
  all_albums: [],
  all_genres: [],
  all_playlists: [],
  all_favorites: [],
  search: {
    artists: [],
    albums: [],
    songs: [],
    playlists: [],
  },
  searchTerm: '',
  lastRoute: 'Search',
  lastId: null,
  lastView: -1,
};

export default SearchService;
