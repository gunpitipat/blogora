import { FaSearch } from "react-icons/fa";
import "./SearchFilter.css"

const SearchFilter = (props) => {
    const { searchInput, setSearchInput } = props
    return(
        <div className="SearchFilter">
            <div className="container">
                <span className="search-icon">
                    <FaSearch/>
                </span>
                <input type="text" value={searchInput} onChange={(e)=>setSearchInput(e.target.value)} />
            </div>
        </div>
    )
}

export default SearchFilter

// © 2025 Pitipat Pattamawilai. All Rights Reserved.