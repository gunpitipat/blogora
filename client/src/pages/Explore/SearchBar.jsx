import "./SearchBar.css"
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ searchInput, setSearchInput }) => {
    return(
        <div className="search-bar">
            <div className="container">
                <span className="search-icon">
                    <FaSearch/>
                </span>
                <input type="text" 
                    value={searchInput} 
                    onChange={(e) => setSearchInput(e.target.value)} 
                />
            </div>
        </div>
    )
}

export default SearchBar

// © 2025 Pitipat Pattamawilai. All Rights Reserved.