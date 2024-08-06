import React, { useCallback, useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import { useLocation, useNavigate } from "react-router";
import { DatePicker } from "@mui/x-date-pickers";
import {
    Slider,
    Autocomplete,
    Box,
    TextField,
    Checkbox,
    FormControlLabel,
    Divider,
    Collapse,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import fx from "money";

import { conversionRates } from "../utils/conversionRates";

import "../App.css";
import "../styles.css";

const theme = createTheme({
    typography: {
        fontFamily: "Circular-Std",
        fontSize: 14,
    },
});

fx.base = "USD";
fx.rates = conversionRates;

function Results() {
    const location = useLocation();
    const navigate = useNavigate();
    const initialEvents = useMemo(() => {
        return location.state.events || [];
    }, [location.state.events]);
    const [events, setEvents] = useState(initialEvents);
    const { artists } = location.state || [];
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDate1, setSelectedDate1] = useState(null);
    const [selectedDate2, setSelectedDate2] = useState(null);
    const [ticketPrice, setTicketPrice] = useState([0, 300]);
    const [includeUnlisted, setIncludeUnlisted] = useState(true);
    const [openDate, setOpenDate] = useState(false);
    const [openLocation, setOpenLocation] = useState(false);
    const [openPrice, setOpenPrice] = useState(false);
    const [openGenre, setOpenGenre] = useState(false);
    const [openArtist, setOpenArtist] = useState(false);
    const [countryList, setCountryList] = useState({});
    const [stateList, setStateList] = useState({});
    const [genreList, setGenreList] = useState({});
    const [filteredGenres, setFilteredGenres] = useState({});
    const [artistList, setArtistList] = useState([]);
    const [filteredArtists, setFilteredArtists] = useState([]);
    const accentGreen = "#5339f8";
    const lightColor = "#fefefe";

    const addGenres = useCallback(() => {
        const genres = {};
        for (const artist in initialEvents) {
            initialEvents[artist].forEach((e) => {
                let g = e.classifications[0].genre?.name;
                let sg = e.classifications[0].subGenre?.name;
                if (g in genres) {
                    genres[g] += 1;
                } else {
                    genres[g] = 1;
                }
                if (sg in genres) {
                    genres[sg] += 1;
                } else {
                    genres[sg] = 1;
                }
            });
        }
        delete genres["Undefined"];
        delete genres["undefined"];
        setGenreList(genres);
        const filt = {};
        for (const gen in genres) {
            filt[gen] = true;
        }
        setFilteredGenres(filt);
    }, [initialEvents]);

    const addArtists = useCallback(() => {
        const artists = [];
        for (const artist in initialEvents) {
            if (!artists.includes(artist)) {
                artists.push(artist);
            }
        }
        setArtistList(artists);
        const filt = {};
        console.log(artists);
        for (const a in artists) {
            console.log(artists[a]);
            filt[artists[a]] = true;
        }
        setFilteredArtists(filt);
        console.log(filt);
    }, [initialEvents]);

    const filterCountries = useCallback(() => {
        const countries = {};
        const states = {};
        for (const artist in initialEvents) {
            initialEvents[artist].filter((e) => {
                let c = e._embedded.venues[0].country.name;

                if (c === "United States Of America") {
                    c = "United States";
                    let s = e._embedded.venues[0].state.name;
                    if (s in states) {
                        states[s] += 1;
                    } else {
                        states[s] = 1;
                    }
                }
                if (c in countries) {
                    countries[c] += 1;
                } else {
                    countries[c] = 1;
                }
                return true;
            });
        }
        const sortedCountries = Object.fromEntries(
            Object.entries(countries).sort((a, b) => b[1] - a[1])
        );
        const sortedStateKeys = Object.keys(states).sort();
        const sortedStates = Object.fromEntries(
            sortedStateKeys.map((key) => [key, states[key]])
        );

        setCountryList(sortedCountries);
        setStateList(sortedStates);
    }, [initialEvents]);

    const handleFilterChange = (fieldName, newValue) => {
        const updatedFilters = {
            selectedCountry: selectedCountry,
            selectedState: selectedState,
            selectedDate1: selectedDate1,
            selectedDate2: selectedDate2,
            lowPrice: ticketPrice[0],
            highPrice: ticketPrice[1],
            includeUnlisted: includeUnlisted,
            filteredGenres: filteredGenres,
            filteredArtists: filteredArtists,
        };
        if (fieldName === "date1") {
            updatedFilters.selectedDate1 = newValue;
            setSelectedDate1(newValue);
            if (newValue > selectedDate2) {
                updatedFilters.selectedDate2 = null;
                setSelectedDate2(null);
            }
        } else if (fieldName === "date2") {
            updatedFilters.selectedDate2 = newValue;
            setSelectedDate2(newValue);
        } else if (fieldName === "country") {
            updatedFilters.selectedCountry = newValue;
            if (newValue !== "United States") {
                updatedFilters.selectedState = null;
                setSelectedState(null);
            }
            setSelectedCountry(newValue);
        } else if (fieldName === "state") {
            updatedFilters.selectedState = newValue;
            setSelectedState(newValue);
        } else if (fieldName === "priceslider") {
            updatedFilters.lowPrice = newValue[0];
            updatedFilters.highPrice = newValue[1];
            setTicketPrice(newValue);
        } else if (fieldName === "pricetext1") {
            updatedFilters.lowPrice = newValue;
            setTicketPrice([newValue, updatedFilters.highPrice]);
        } else if (fieldName === "pricetext2") {
            updatedFilters.highPrice = newValue;
            setTicketPrice([updatedFilters.lowPrice, newValue]);
        } else if (fieldName === "checkbox") {
            updatedFilters.includeUnlisted = !includeUnlisted;
            setIncludeUnlisted(!includeUnlisted);
        } else if (fieldName === "genreCheckbox") {
            updatedFilters.filteredGenres[newValue] =
                !updatedFilters.filteredGenres[newValue];
            setFilteredGenres(updatedFilters.filteredGenres);
        } else if (fieldName === "artistCheckbox") {
            updatedFilters.filteredArtists[newValue] =
                !updatedFilters.filteredArtists[newValue];
            setFilteredArtists(updatedFilters.filteredArtists);
            console.log(updatedFilters.filteredArtists);
        }
        const filteredEvents = {};
        for (const artist in initialEvents) {
            const artistEvents = initialEvents[artist].filter((e) => {
                let date = new Date(e.dates.start.localDate);
                let adjustedPrice;
                if ("priceRanges" in e) {
                    adjustedPrice = fx(e.priceRanges[0].min)
                        .from(e.priceRanges[0].currency)
                        .to("USD");
                }
                return (
                    (!updatedFilters.selectedCountry ||
                        e._embedded.venues[0].country.name ===
                            updatedFilters.selectedCountry ||
                        (e._embedded.venues[0].country.name ===
                            "United States Of America" &&
                            updatedFilters.selectedCountry ===
                                "United States")) &&
                    (!updatedFilters.selectedDate1 ||
                        date >= updatedFilters.selectedDate1) &&
                    (!updatedFilters.selectedDate2 ||
                        date <= updatedFilters.selectedDate2) &&
                    (!updatedFilters.selectedState ||
                        (e._embedded.venues[0].country.name ===
                            "United States Of America" &&
                            e._embedded.venues[0].state.name ===
                                updatedFilters.selectedState)) &&
                    (("priceRanges" in e &&
                        adjustedPrice <= updatedFilters.highPrice &&
                        adjustedPrice >= updatedFilters.lowPrice) ||
                        (!("priceRanges" in e) &&
                            updatedFilters.includeUnlisted)) &&
                    (updatedFilters.filteredGenres[
                        e.classifications[0].genre?.name
                    ] ||
                        updatedFilters.filteredGenres[
                            e.classifications[0].subGenre?.name
                        ] ||
                        e.classifications.genre === undefined) &&
                    updatedFilters.filteredArtists[artist]
                );
            });
            if (artistEvents.length > 0) {
                filteredEvents[artist] = artistEvents;
            }
        }
        setEvents(filteredEvents);
    };

    useEffect(() => {
        filterCountries();
        addGenres();
        addArtists();
        console.log(events);
    }, [location, events, filterCountries, addGenres, addArtists]); // deleted events from this array to solve constant reassignment, maybe causes issues later idk

    return (
        <ThemeProvider theme={theme}>
            <div className={"resultsBackground"}>
                <div className={"resultsSidebar"}>
                    <div
                        className={"resultsTitle"}
                        onMouseDown={() => {
                            navigate("/");
                        }}
                    >
                        concerto
                    </div>
                    <div className={"resultsFilterTitle"}>Filters</div>

                    <div className={"resultsFilterMenu"}>
                        <div className={"filterText"}>
                            <div
                                className={"filter"}
                                onClick={() => {
                                    setOpenArtist(!openArtist);
                                }}
                            >
                                <div>Artist</div>
                                <div
                                    style={{
                                        alignItems: "center",
                                        display: "flex",
                                    }}
                                >
                                    {openArtist ? (
                                        <ExpandLess />
                                    ) : (
                                        <ExpandMore />
                                    )}
                                </div>
                            </div>

                            <Collapse in={openArtist}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    {artistList.map((artist) => {
                                        return (
                                            <FormControlLabel
                                                sx={{
                                                    "& .MuiTypography-root": {
                                                        fontSize: 16,
                                                        color: lightColor,
                                                    },
                                                }}
                                                key={artist}
                                                control={
                                                    <Checkbox
                                                        disableRipple
                                                        disableTouchRipple
                                                        disableFocusRipple
                                                        style={{
                                                            color: accentGreen,
                                                        }}
                                                    />
                                                }
                                                label={artist}
                                                checked={
                                                    filteredArtists[artist]
                                                }
                                                onChange={() =>
                                                    handleFilterChange(
                                                        "artistCheckbox",
                                                        artist
                                                    )
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            </Collapse>
                        </div>
                        <Divider
                            variant="middle"
                            flexItem
                            sx={{
                                marginTop: 2,
                                background: "#e2e2e2",
                            }}
                        />
                        <div className={"filterText"}>
                            <div
                                className={"filter"}
                                onClick={() => {
                                    setOpenLocation(!openLocation);
                                }}
                            >
                                <div>Location</div>
                                <div
                                    style={{
                                        alignItems: "center",
                                        display: "flex",
                                    }}
                                >
                                    {openLocation ? (
                                        <ExpandLess />
                                    ) : (
                                        <ExpandMore />
                                    )}
                                </div>
                            </div>
                            <Collapse in={openLocation}>
                                <Autocomplete
                                    size="medium"
                                    options={Object.keys(countryList)}
                                    value={selectedCountry}
                                    onChange={(event, newValue) => {
                                        handleFilterChange("country", newValue);
                                    }}
                                    autoHighlight
                                    sx={{
                                        marginTop: 2,
                                    }}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props}>
                                            {option}
                                            {` (${countryList[option]})`}
                                        </Box>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Country"
                                            inputProps={{
                                                ...params.inputProps,
                                                autoComplete: "off", // disable autocomplete and autofill
                                                style: {
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                },
                                            }}
                                            sx={{
                                                "& .MuiInputLabel-root": {
                                                    color: "#757575",
                                                    "&.Mui-focused": {
                                                        color: lightColor,
                                                    },
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: lightColor,
                                                },
                                                "& .MuiSvgIcon-root": {
                                                    color: lightColor,
                                                },
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: lightColor,
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: lightColor,
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: lightColor,
                                                    },
                                                },
                                            }}
                                        />
                                    )}
                                />
                                {selectedCountry === "United States" ? (
                                    <Autocomplete
                                        options={Object.keys(stateList)}
                                        value={selectedState}
                                        onChange={(event, newValue) => {
                                            handleFilterChange(
                                                "state",
                                                newValue
                                            );
                                        }}
                                        autoHighlight
                                        sx={{
                                            marginTop: 2,
                                        }}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props}>
                                                {option}
                                                {` (${stateList[option]})`}
                                            </Box>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="State"
                                                inputProps={{
                                                    ...params.inputProps,
                                                    autoComplete: "off", // disable autocomplete and autofill
                                                }}
                                                sx={{
                                                    "& .MuiInputLabel-root": {
                                                        color: "#757575",
                                                        "&.Mui-focused": {
                                                            color: lightColor,
                                                        },
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        color: lightColor,
                                                    },
                                                    "& .MuiSvgIcon-root": {
                                                        color: lightColor,
                                                    },
                                                    "& .MuiOutlinedInput-root":
                                                        {
                                                            "& fieldset": {
                                                                borderColor:
                                                                    lightColor,
                                                            },
                                                            "&:hover fieldset":
                                                                {
                                                                    borderColor:
                                                                        lightColor,
                                                                },
                                                            "&.Mui-focused fieldset":
                                                                {
                                                                    borderColor:
                                                                        lightColor,
                                                                },
                                                        },
                                                }}
                                            />
                                        )}
                                    />
                                ) : (
                                    <></>
                                )}
                            </Collapse>
                        </div>
                        <Divider
                            variant="middle"
                            flexItem
                            sx={{ marginTop: 2, background: "#e2e2e2" }}
                        />
                        <div className={"filterText"}>
                            <div
                                className={"filter"}
                                onClick={() => {
                                    setOpenDate(!openDate);
                                }}
                            >
                                <div>Date</div>
                                <div
                                    style={{
                                        alignItems: "center",
                                        display: "flex",
                                    }}
                                >
                                    {openDate ? <ExpandLess /> : <ExpandMore />}
                                </div>
                            </div>

                            <Collapse in={openDate}>
                                <DatePicker
                                    size="small"
                                    label="Earliest Date"
                                    value={selectedDate1}
                                    onChange={(newValue) => {
                                        handleFilterChange("date1", newValue);
                                    }}
                                    disablePast={true}
                                    sx={{
                                        marginTop: 2,
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: lightColor,
                                        },
                                        "& .MuiInputBase-input": {
                                            color: lightColor,
                                        },
                                        "& .MuiSvgIcon-root": {
                                            color: lightColor,
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&:hover fieldset": {
                                                borderColor: lightColor, // Change color on hover
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: lightColor, // Change color on focus
                                            },
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "#757575",
                                            "&.Mui-focused": {
                                                color: lightColor,
                                            },
                                        },
                                    }}
                                    slotProps={{
                                        field: {
                                            clearable: true,
                                        },
                                    }}
                                />
                                <DatePicker
                                    label="Latest Date"
                                    value={selectedDate2}
                                    minDate={selectedDate1}
                                    onChange={(newValue) => {
                                        handleFilterChange("date2", newValue);
                                    }}
                                    sx={{
                                        marginTop: 2,
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: lightColor,
                                        },
                                        "& .MuiInputBase-input": {
                                            color: lightColor,
                                        },
                                        "& .MuiSvgIcon-root": {
                                            color: lightColor,
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            "&:hover fieldset": {
                                                borderColor: lightColor, // Change color on hover
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: lightColor, // Change color on focus
                                            },
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "#757575",
                                            "&.Mui-focused": {
                                                color: lightColor,
                                            },
                                        },
                                    }}
                                    slotProps={{
                                        field: {
                                            clearable: true,
                                        },
                                    }}
                                />
                            </Collapse>
                        </div>
                        <Divider
                            variant="middle"
                            flexItem
                            sx={{ marginTop: 2, background: "#e2e2e2" }}
                        />
                        <div className={"filterText"}>
                            <div
                                className={"filter"}
                                onClick={() => {
                                    setOpenPrice(!openPrice);
                                }}
                            >
                                <div>Price</div>
                                <div
                                    style={{
                                        alignItems: "center",
                                        display: "flex",
                                    }}
                                >
                                    {openPrice ? (
                                        <ExpandLess />
                                    ) : (
                                        <ExpandMore />
                                    )}
                                </div>
                            </div>
                            <Collapse in={openPrice}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Slider
                                        size="small"
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={500}
                                        value={ticketPrice}
                                        onChange={(event, newValue) =>
                                            handleFilterChange(
                                                "priceslider",
                                                newValue
                                            )
                                        }
                                        step={10}
                                        sx={{
                                            width: "90%",
                                            color: lightColor,
                                            "& .MuiSlider-thumb": {
                                                width: 12,
                                                height: 12,
                                                color: lightColor,
                                                "&:before": {
                                                    boxShadow: "none",
                                                },
                                                "&:hover, &.Mui-focusVisible, &.Mui-active":
                                                    {
                                                        boxShadow:
                                                            "0 2px 3px rgba(0,0,0,0.4)",
                                                    },
                                            },
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <TextField
                                        style={{
                                            width: 120,
                                            marginRight: 20,
                                        }}
                                        sx={{
                                            "& .MuiInputLabel-root": {
                                                color: "#757575",
                                                "&.Mui-focused": {
                                                    color: lightColor,
                                                },
                                            },
                                            "& .MuiInputBase-input": {
                                                color: lightColor,
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": {
                                                    borderColor: lightColor,
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: lightColor,
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: lightColor,
                                                },
                                            },
                                        }}
                                        value={ticketPrice[0]}
                                        onChange={(event) =>
                                            handleFilterChange(
                                                "pricetext1",
                                                event.target.value
                                            )
                                        }
                                        onFocus={(event) =>
                                            event.target.select()
                                        }
                                        variant="outlined"
                                        inputProps={{
                                            inputMode: "numeric",
                                            pattern: "[0-9]*",
                                            style: {
                                                textAlign: "right",
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        lineHeight: 1,
                                                        fontFamily:
                                                            "Circular-Std",
                                                        color: lightColor,
                                                    }}
                                                >
                                                    $
                                                </div>
                                            ),
                                            style: {
                                                height: 30,
                                                fontSize: 16,
                                                fontFamily: "Circular-Std",
                                            },
                                        }}
                                    />
                                    <div
                                        style={{
                                            fontSize: 18,
                                            color: lightColor,
                                        }}
                                    >
                                        to
                                    </div>

                                    <TextField
                                        style={{
                                            width: 120,
                                            marginLeft: 20,
                                        }}
                                        sx={{
                                            "& .MuiInputLabel-root": {
                                                color: "#757575",
                                                "&.Mui-focused": {
                                                    color: lightColor,
                                                },
                                            },
                                            "& .MuiInputBase-input": {
                                                color: lightColor,
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": {
                                                    borderColor: lightColor,
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: lightColor,
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: lightColor,
                                                },
                                            },
                                        }}
                                        value={ticketPrice[1]}
                                        onChange={(event) =>
                                            handleFilterChange(
                                                "pricetext2",
                                                event.target.value
                                            )
                                        }
                                        onFocus={(event) =>
                                            event.target.select()
                                        }
                                        variant="outlined"
                                        inputProps={{
                                            inputMode: "numeric",
                                            pattern: "[0-9]*",
                                            style: { textAlign: "right" },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        lineHeight: 1,
                                                        fontFamily:
                                                            "Circular-Std",
                                                        color: lightColor,
                                                    }}
                                                >
                                                    $
                                                </div>
                                            ),
                                            style: {
                                                height: 30,
                                                fontSize: 16,
                                                fontFamily: "Circular-Std",
                                            },
                                        }}
                                    />
                                </div>
                                <FormControlLabel
                                    sx={{
                                        "& .MuiTypography-root": {
                                            fontSize: 16,
                                            color: lightColor,
                                        },
                                    }}
                                    control={
                                        <Checkbox
                                            disableRipple
                                            disableTouchRipple
                                            disableFocusRipple
                                            style={{ color: accentGreen }}
                                        />
                                    }
                                    label="Include unlisted prices"
                                    checked={includeUnlisted}
                                    onChange={() =>
                                        handleFilterChange("checkbox", null)
                                    }
                                />
                            </Collapse>
                        </div>
                        <Divider
                            variant="middle"
                            flexItem
                            sx={{
                                marginTop: 2,
                                background: "#e2e2e2",
                            }}
                        />
                        <div className={"filterText"}>
                            <div
                                className={"filter"}
                                onClick={() => {
                                    setOpenGenre(!openGenre);
                                }}
                            >
                                <div>Genre</div>
                                <div
                                    style={{
                                        alignItems: "center",
                                        display: "flex",
                                    }}
                                >
                                    {openGenre ? (
                                        <ExpandLess />
                                    ) : (
                                        <ExpandMore />
                                    )}
                                </div>
                            </div>

                            <Collapse in={openGenre}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    {Object.keys(genreList)
                                        .sort()
                                        .map((g) => {
                                            return (
                                                <FormControlLabel
                                                    sx={{
                                                        "& .MuiTypography-root":
                                                            {
                                                                fontSize: 16,
                                                                color: lightColor,
                                                            },
                                                    }}
                                                    key={g}
                                                    control={
                                                        <Checkbox
                                                            disableRipple
                                                            disableTouchRipple
                                                            disableFocusRipple
                                                            style={{
                                                                color: accentGreen,
                                                            }}
                                                        />
                                                    }
                                                    label={`${g} (${genreList[g]})`}
                                                    checked={filteredGenres[g]}
                                                    onChange={() =>
                                                        handleFilterChange(
                                                            "genreCheckbox",
                                                            g
                                                        )
                                                    }
                                                />
                                            );
                                        })}
                                </div>
                            </Collapse>
                        </div>
                    </div>
                </div>
                {Object.keys(events).length ? (
                    <div
                        style={{
                            paddingTop: 40,
                            paddingLeft: 40,
                            overflowY: "scroll",
                        }}
                    >
                        {Object.entries(artists)
                            .filter((a) => a[1].name in events)
                            .map(([key, value]) => {
                                let currArtistName = value.name;
                                const compareDates = (dateStr1, dateStr2) =>
                                    new Date(dateStr1) - new Date(dateStr2);
                                events[currArtistName].sort((a, b) =>
                                    compareDates(
                                        a.dates.start.localDate,
                                        b.dates.start.localDate
                                    )
                                );
                                return (
                                    <div
                                        key={currArtistName}
                                        style={{
                                            fontFamily: "Circular-Std",
                                            maxWidth: "100%",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                            }}
                                        >
                                            <span
                                                className={"resultArtistName"}
                                            >
                                                {currArtistName}
                                            </span>
                                            <span
                                                style={{
                                                    backgroundColor:
                                                        accentGreen,
                                                    color: lightColor,
                                                    fontSize: 12,
                                                    padding: "4px 12px",
                                                    borderRadius: 8,
                                                }}
                                            >
                                                {currArtistName in events
                                                    ? events[currArtistName]
                                                          .length
                                                    : 0}
                                                {events[currArtistName]
                                                    .length !== 1
                                                    ? " events"
                                                    : " event"}
                                            </span>
                                        </div>
                                        <div className={"concertCardInfo"}>
                                            {events[currArtistName].map(
                                                (e, index) => {
                                                    return (
                                                        <Card
                                                            key={index}
                                                            // name={e.name}
                                                            venue={
                                                                e._embedded
                                                                    .venues[0]
                                                                    .name
                                                            }
                                                            time={
                                                                e.dates.start
                                                                    .localTime
                                                            }
                                                            localDate={
                                                                e.dates.start
                                                                    .localDate
                                                            }
                                                            // address={
                                                            //     "address" in
                                                            //     e._embedded
                                                            //         .venues[0]
                                                            //         ? e
                                                            //               ._embedded
                                                            //               .venues[0]
                                                            //               .address
                                                            //               .line1
                                                            //         : -1
                                                            // }
                                                            city={
                                                                e._embedded
                                                                    .venues[0]
                                                                    .city.name
                                                            }
                                                            state={
                                                                e._embedded
                                                                    .venues[0]
                                                                    .country
                                                                    .name ===
                                                                "United States Of America"
                                                                    ? e
                                                                          ._embedded
                                                                          .venues[0]
                                                                          .state
                                                                          .name
                                                                    : e
                                                                          ._embedded
                                                                          .venues[0]
                                                                          .country
                                                                          .name
                                                            }
                                                            prices={
                                                                "priceRanges" in
                                                                e
                                                                    ? e.priceRanges
                                                                    : -1
                                                            }
                                                            url={
                                                                "url" in e
                                                                    ? e.url
                                                                    : "google.com"
                                                            }
                                                            genre={
                                                                e
                                                                    .classifications
                                                                    .genre
                                                            }
                                                            subgenre={
                                                                e
                                                                    .classifications
                                                                    .subgenre
                                                            }
                                                        />
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : (
                    <div>
                        We're sorry, we couldn't find any results for that
                        playlist. Please try again.
                    </div>
                )}
            </div>
        </ThemeProvider>
    );
}

export default Results;
