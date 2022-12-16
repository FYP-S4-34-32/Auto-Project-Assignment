const SearchBar = () => (
    <form action="/" method="get" className="search">
        <input
            type="text"
            id="header-search"
            placeholder="Search users"
            name="s" 
        />
        <button type="submit">Search</button>
    </form>
);

export default SearchBar;