import React, { useState, useEffect } from "react";
import Loader from "react-loader-spinner";
import axios from "axios";

// Scss
import "./LegislatorsPage.scss";

const LegislatorsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
    amtOfLegislatorsPerPage: 10,
    currentPage: 1,
    party: "all",
    state: "all",
    sortBy: "nameASC",
  });
  const [currentAmtOfPages, setCurrentAmtOfPages] = useState(0);
  const [legislators, setLegislators] = useState([]);
  const [filteredLegislators, setFilteredLegislators] = useState(legislators);
  const [paginatedLegislators, setPaginatedLegislators] = useState([]);

  // UseEffect to make inital api call to get InitalLegislators
  useEffect(() => {
    getInitalLegislators(filterSettings);
  }, []);

  // Function used to get all legislators, sort them, filter them and then paginated them based on the amtOfLegislatorsPerPage setting
  const getInitalLegislators = async (filterSettings) => {
    setIsLoading(true);

    // Setting array of all legislators
    const legislators = await fetchLegislators();
    setLegislators(legislators);

    const sortedLegislators = sortLegislators(filterSettings, legislators);

    const filteredLegislators = filterLegislators(
      filterSettings,
      sortedLegislators
    );
    setFilteredLegislators(filteredLegislators);

    const paginatedLegislators = getPaginatedLegislators(
      filterSettings,
      filteredLegislators
    );
    setPaginatedLegislators(paginatedLegislators);

    setIsLoading(false);
  };

  // async function get make a get request to get all Legislators
  const fetchLegislators = async () => {
    const legislatorsResponse = await axios.get(
      `http://localhost:5000/get-legislators`
    );

    return legislatorsResponse.data.legislators;
  };

  ///////////////////////////////////////////////////////////////////
  // paginating, filtering and sorting functions are below are below
  ///////////////////////////////////////////////////////////////////

  // function get an array of paginatedLegislators
  const getPaginatedLegislators = (filterSettings, legislators) => {
    const { amtOfLegislatorsPerPage, currentPage } = filterSettings;

    let paginatedLegislators = [];

    let firstItemOfPage =
      currentPage * amtOfLegislatorsPerPage - amtOfLegislatorsPerPage;
    let lastItemOfPage = currentPage * amtOfLegislatorsPerPage;

    for (let i = firstItemOfPage; i < lastItemOfPage; i++) {
      if (legislators[i]) {
        paginatedLegislators.push(legislators[i]);
      }
    }

    // Setting amount Of Pages for this search (maybe move this to a different place)
    setCurrentAmtOfPages(
      Math.round(legislators.length / filterSettings.amtOfLegislatorsPerPage)
    );
    return paginatedLegislators;
  };

  // filter function below
  const filterLegislators = (filterSettings, legislators) => {
    setIsLoading(true);

    // Setting new array of all legislators ready to be filtered
    let newfilteredLegislators = [...legislators];

    // Filtering by party below
    if (filterSettings.party === "all") {
      // do nothing
    } else {
      newfilteredLegislators = newfilteredLegislators.filter(
        (item) => item.terms[0].party === filterSettings.party
      );
    }

    // Filtering by state below
    if (filterSettings.state === "all") {
      // do nothing
    } else {
      newfilteredLegislators = newfilteredLegislators.filter(
        (item) => item.terms[0].state === filterSettings.state
      );
    }

    setIsLoading(false);
    return newfilteredLegislators;
  };

  const sortLegislators = (filterSettings, legislators) => {
    setIsLoading(true);
    // Setting new array of all legislators ready to be filtered
    let newSortedLegislators = [...legislators];

    // Filtering by party below
    if (filterSettings.sortBy === "na") {
      // do nothing
    } else if (filterSettings.sortBy === "nameASC") {
      newSortedLegislators.sort(function (a, b) {
        let item1 = a.name.first.toLowerCase();
        let item2 = b.name.first.toLowerCase();
        if (item1 < item2) return -1;
        if (item1 > item2) return 1;
        return 0; //default return value (no sorting)
      });
    } else if (filterSettings.sortBy === "nameDESC") {
      newSortedLegislators.sort(function (a, b) {
        let item1 = a.name.first.toLowerCase();
        let item2 = b.name.first.toLowerCase();
        if (item1 > item2) return -1;
        if (item1 < item2) return 1;
        return 0;
      });
    } else if (filterSettings.sortBy === "state") {
      newSortedLegislators.sort(function (a, b) {
        let item1 = a.terms[0].state.toLowerCase();
        let item2 = b.terms[0].state.toLowerCase();
        if (item1 < item2) return -1;
        if (item1 > item2) return 1;
        return 0;
      });
    } else if (filterSettings.sortBy === "party") {
      newSortedLegislators.sort(function (a, b) {
        let item1 = a.terms[0].party.toLowerCase();
        let item2 = b.terms[0].party.toLowerCase();
        if (item1 < item2) return -1;
        if (item1 > item2) return 1;
        return 0;
      });
    } else if (filterSettings.sortBy === "numOfTermsASC") {
      newSortedLegislators.sort(function (a, b) {
        let item1 = a.terms.length;
        let item2 = b.terms.length;
        if (item1 < item2) return -1;
        if (item1 > item2) return 1;
        return 0;
      });
    } else if (filterSettings.sortBy === "numOfTermsDESC") {
      newSortedLegislators.sort(function (a, b) {
        let item1 = a.terms.length;
        let item2 = b.terms.length;
        if (item1 > item2) return -1;
        if (item1 < item2) return 1;
        return 0;
      });
    }

    setIsLoading(false);
    return newSortedLegislators;
  };

  ////////////////////////////////////////////////////
  // On input change functions are below
  ////////////////////////////////////////////////////
  const changePage = (filterSettings, legislators) => {
    setFilterSettings(filterSettings);

    const paginatedLegislators = getPaginatedLegislators(
      filterSettings,
      legislators
    );

    setPaginatedLegislators(paginatedLegislators);
  };

  const onFilterChange = (event, filterSettings, legislators) => {
    const { value, name } = event.target;
    let newfilterSettings = {
      ...filterSettings,
      [name]: value,
      currentPage: 1,
    };
    setFilterSettings(newfilterSettings);

    const newSortedLegislators = sortLegislators(
      newfilterSettings,
      legislators
    );

    const filteredLegislators = filterLegislators(
      newfilterSettings,
      newSortedLegislators
    );
    setFilteredLegislators(filteredLegislators);

    const paginatedLegislators = getPaginatedLegislators(
      newfilterSettings,
      filteredLegislators
    );
    setPaginatedLegislators(paginatedLegislators);
  };

  const onSortingTypeChange = (event, filterSettings, legislators) => {
    const { value, name } = event.target;

    let newfilterSettings = {
      ...filterSettings,
      [name]: value,
      currentPage: 1,
    };
    setFilterSettings(newfilterSettings);

    const sortedLegislators = sortLegislators(newfilterSettings, legislators);

    const filteredLegislators = filterLegislators(
      newfilterSettings,
      sortedLegislators
    );
    setFilteredLegislators(filteredLegislators);

    const paginatedLegislators = getPaginatedLegislators(
      newfilterSettings,
      filteredLegislators
    );
    setPaginatedLegislators(paginatedLegislators);
  };

  console.log("currentAmtOfPages", currentAmtOfPages);
  return (
    <div className="LegislatorsPage">
      <div className="LegislatorsPage__container container">
        <section className="LegislatorsPage__filter-and-sorting-area">
          <div className="LegislatorsPage__filterBy-area">
            <span className="LegislatorsPage__filterBy-span">Filter By: </span>

            {/* Below is the party filter select and option tags */}
            <label
              htmlFor="LegislatorsPage__filterBy-select"
              className="LegislatorsPage__filterBy-label"
            >
              <select
                name="party"
                className="LegislatorsPage__filterBy-select"
                onChange={(event) =>
                  onFilterChange(event, filterSettings, legislators)
                }
              >
                <option value="all">All</option>
                <option value="Republican">Republican</option>
                <option value="Democrat">Democrat</option>
                <option value="Independent">Independent</option>
              </select>
            </label>

            {/* Below is the state filter select and option tags */}
            <label
              htmlFor="LegislatorsPage__filterBy-select"
              className="LegislatorsPage__filterBy-label"
            >
              <select
                name="state"
                className="LegislatorsPage__filterBy-select"
                onChange={(event) =>
                  onFilterChange(event, filterSettings, legislators)
                }
              >
                <option value="all">All</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="DC">District Of Columbia</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
              </select>
            </label>
          </div>
          <div className="LegislatorsPage__sortBy-wrapper">
            <label htmlFor="sort-by-select" className="sort-by-label">
              <span className="sort-by-title">Sort By: </span>

              <select
                autoComplete="off"
                id="sort-by-select"
                name="sortBy"
                className="sortby"
                onChange={(event) => {
                  onSortingTypeChange(event, filterSettings, legislators);
                }}
              >
                <option value="nameASC">Name (A to Z)</option>

                <option value="nameDESC">Name (Z to A)</option>
                <option value="state">State</option>
                <option value="party">Party</option>
                <option value="numOfTermsASC">Num Of Terms Served (ASC)</option>
                <option value="numOfTermsDESC">
                  Num Of Terms Served (DESC)
                </option>
              </select>
            </label>
          </div>
        </section>
        <section className="col-sm-12 col-md-12 col-lg-12 LegislatorsPage__legislators">
          {isLoading && (
            <div className="LegislatorsPage__loader-wrapper">
              <Loader
                className="LegislatorsPage__loader"
                type="Puff"
                color="#808080"
                height={100}
                width={100}
              />
            </div>
          )}
          <section className="LegislatorsPage__legislators-section">
            <div className="LegislatorsPage__container container">
              <div className="LegislatorsPage__row LegislatorsPage__legislators-row row">
                {paginatedLegislators &&
                  paginatedLegislators.map((legislator, index) => {
                    return (
                      <div
                        className="LegislatorsPage__col col-sm-12 col-md-6 col-lg-4 col-xl-3"
                        key={index}
                      >
                        <div className="LegislatorsPage__legislator">
                          <div
                            className="LegislatorsPage__legislator-img"
                            style={{
                              background: `url("http://localhost:5000/get-legislator-img/${legislator.id.bioguide}") no-repeat center center`,
                            }}
                          ></div>
                          <div className="LegislatorsPage__bottom-info">
                            <span className="LegislatorsPage__legislator-field">
                              Name: {legislator.name.official_full}
                            </span>
                            <span className="LegislatorsPage__legislator-field">
                              State: {legislator.terms[0].state}
                            </span>
                            <span className="LegislatorsPage__legislator-field">
                              Party: {legislator.terms[0].party}
                            </span>
                            <span className="LegislatorsPage__legislator-field">
                              Type:&nbsp;
                              {(() => {
                                let termType;

                                if (legislator.terms[0].type === "rep") {
                                  termType = "Representative";
                                } else if (legislator.terms[0].type === "sen") {
                                  termType = "Senator";
                                }

                                return termType;
                              })()}
                            </span>
                            <span className="LegislatorsPage__legislator-field">
                              Number Of Terms Served: {legislator.terms.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        </section>

        <section
          id="pagination"
          className="LegislatorsPage__pagination-section"
        >
          <div className="LegislatorsPage__row LegislatorsPage__pagination-row row">
            <ul className="LegislatorsPage__pagination-ul">
              <li
                className="LegislatorsPage__pagination-li"
                onClick={() => {
                  changePage(
                    {
                      ...filterSettings,
                      currentPage: filterSettings.currentPage - 1,
                    },
                    filteredLegislators
                  );
                }}
              >
                Prev
              </li>
              <li
                className={`LegislatorsPage__pagination-li ${
                  filterSettings.currentPage === 1 ? "active" : ""
                }`}
                onClick={() => {
                  changePage(
                    { ...filterSettings, currentPage: 1 },
                    filteredLegislators
                  );
                }}
              >
                1
              </li>
              <li
                className={`LegislatorsPage__pagination-li ${
                  filterSettings.currentPage === 2 ? "active" : ""
                }`}
                onClick={() => {
                  changePage(
                    { ...filterSettings, currentPage: 2 },
                    filteredLegislators
                  );
                }}
              >
                2
              </li>
              <li
                className={`LegislatorsPage__pagination-li ${
                  filterSettings.currentPage === 3 ? "active" : ""
                }`}
                onClick={() => {
                  changePage(
                    { ...filterSettings, currentPage: 3 },
                    filteredLegislators
                  );
                }}
              >
                3
              </li>
              <li
                className={`LegislatorsPage__pagination-li ${
                  filterSettings.currentPage === 4 ? "active" : ""
                }`}
                onClick={() => {
                  changePage(
                    { ...filterSettings, currentPage: 4 },
                    filteredLegislators
                  );
                }}
              >
                4
              </li>
              <li
                className={`LegislatorsPage__pagination-li ${
                  filterSettings.currentPage === 5 ? "active" : ""
                }`}
                onClick={() => {
                  changePage(
                    { ...filterSettings, currentPage: 5 },
                    filteredLegislators
                  );
                }}
              >
                5
              </li>
              <li
                onClick={() => {
                  changePage(
                    {
                      ...filterSettings,
                      currentPage: filterSettings.currentPage + 1,
                    },
                    filteredLegislators
                  );
                }}
              >
                Next
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LegislatorsPage;
