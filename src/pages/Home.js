import React, { Component } from "react";
import axios from "axios";

import Tile from "../components/Tile";
// import ImageCarousel from "../components/ImageCarousel";

import DominicFike from "../images/DominicFike.jpg";
import Drake from "../images/Drake.jpg";
import Confetti from "../images/Confetti.jpg";
import DuaLipa from "../images/DuaLipa.avif";
import Lasers from "../images/Lasers.jpg";
import LizzyMcalpine from "../images/LizzyMcalpine.jpg";
import Rave from "../images/Rave.webp";
import WestonEstate from "../images/WestonEstate.jpg";
import SZA from "../images/SZA.webp";
import OliviaRodrigo from "../images/OliviaRodrigo.jpg";
import Weeknd from "../images/Weeknd.webp";

import "../App.css";
import "../styles.css";
import "../fonts/Nunito-Medium.ttf";
import "../fonts/Nunito-Light.ttf";
import "../fonts/Nunito-ExtraLight.ttf";
import { Navigate } from "react-router";
import { Logout, PlayArrow, SkipPrevious, SkipNext } from "@mui/icons-material";
import {
    Button,
    ButtonBase,
    IconButton,
    InputAdornment,
    LinearProgress,
    TextField,
} from "@mui/material";
import { StyledEngineProvider } from "@mui/material/styles";
import ImageRotator from "../components/ImageRotator";

import { TICKETMASTER_KEY, CLIENT_ID } from "../keys.js";

const REDIRECT_URI = "http://localhost:3000";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";

function importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
}
const images = importAll(
    require.context("../images/albumcovers", false, /\.(png|jpe?g|svg)$/)
);

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            token: "",
            tokenIssuedTime: window.localStorage.getItem("tokenIssuedTime"),
            searchKey: "",
            artists: {},
            events: {},
            queried: false,
            reqPending: false,
            redirect: false,
            searchEnabled: true,
            searchError: false,
            counter: 1,
            sliderValue: 0,
            randomTime: this.generateRandomTime(),
        };
    }

    searchPlaylist = async (e) => {
        e.preventDefault();
        const searchKeyParts = this.state.searchKey.split("/");
        const playlistID = searchKeyParts[searchKeyParts.length - 1];
        try {
            const response = await axios.get(
                `https://api.spotify.com/v1/playlists/${playlistID}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.state.token}`,
                    },
                }
            );

            if (response.status < 200 || response.status >= 300) {
                throw new Error("HTTP error! Status: " + response.status);
            }

            const data = response.data;
            this.setState({ reqPending: true });

            let artists = {};
            data.tracks.items.forEach((t) => {
                t.track.artists.forEach((a) => {
                    if (!(a.id in artists)) {
                        artists[a.id] = {
                            name: a.name,
                            images: a.images,
                            pop: a.popularity,
                            followers: a.followers,
                            href: a.external_urls.spotify,
                            genres: a.genres,
                        };
                    }
                });
            });
            this.setState({ artists: artists }, async () => {
                console.log(artists);
                await this.searchConcerts();
            });
        } catch (error) {
            this.setState({ searchError: true });
            if (axios.isAxiosError(error)) {
                // Axios error (network error)
                console.error("Network error:", error.message);
            } else {
                // Other unexpected errors
                console.error("An unexpected error occurred:", error.message);
            }
        }
    };

    searchConcerts = async () => {
        const artistNames = Object.values(this.state.artists);
        let events = {};

        for (let i = 0; i < artistNames.length; i++) {
            const artistName = artistNames[i].name;
            const artistUrl = artistNames[i].href;
            const delay = 500; // Introduce a delay based on index

            this.setState({
                counter: this.state.counter + 1,
            });

            try {
                await new Promise((resolve) => setTimeout(resolve, delay));

                const response = await axios.get(
                    `https://app.ticketmaster.com/discovery/v2/attractions?apikey=${TICKETMASTER_KEY}&keyword=${artistName}&locale=*`
                );

                let attractionIndex = 0;
                let urlMatchError = false;
                let attractions = response.data._embedded.attractions;
                if (attractions.length === 1) {
                    if (
                        attractions[0].name.toLowerCase() !==
                        artistName.toLowerCase()
                    ) {
                        urlMatchError = true;
                    }
                } else {
                    while (attractionIndex < attractions.length) {
                        if (
                            "externalLinks" in attractions[attractionIndex] &&
                            "spotify" in
                                attractions[attractionIndex].externalLinks
                        ) {
                            let spotifyUrl =
                                attractions[attractionIndex].externalLinks
                                    .spotify[0].url;
                            if (spotifyUrl === artistUrl) {
                                break;
                            }
                        } else if (
                            attractions[attractionIndex].name === artistName
                        ) {
                            break;
                        }
                        attractionIndex += 1;
                        if (attractionIndex >= attractions.length) {
                            urlMatchError = true;
                        }
                    }
                }

                if (urlMatchError === true) {
                    console.log("URL matching error for " + artistName);
                }

                if ("_embedded" in response.data && urlMatchError === false) {
                    const concerts = await axios.get(
                        `https://app.ticketmaster.com/discovery/v2/events?apikey=${TICKETMASTER_KEY}&attractionId=${attractions[attractionIndex].id}&locale=*`
                    );

                    if (
                        "_embedded" in concerts.data &&
                        concerts.data._embedded.events[0]._embedded
                            .attractions[0].id ===
                            attractions[attractionIndex].id
                    ) {
                        events[artistName] = concerts.data._embedded.events;
                        console.log(events[artistName]);
                    }
                }
            } catch (error) {
                console.error(`An error occurred for ${artistName}:`, error);
            }
        }

        console.log(events);
        this.setState(
            { events: events, reqPending: false, redirect: true },
            () => {
                console.log("Updated local state: ", events);
                console.log("Updated state: ", this.state.events);
            }
        );
    };

    componentDidMount() {
        const hash = window.location.hash;
        let token = window.localStorage.getItem("token");
        let tokenIssuedTime = window.localStorage.getItem("tokenIssuedTime");

        if (!token && hash) {
            token = hash
                .substring(1)
                .split("&")
                .find((elem) => elem.startsWith("access_token"))
                .split("=")[1];

            window.location.hash = "";
            window.localStorage.setItem("token", token);
            window.localStorage.setItem(
                "tokenIssuedTime",
                new Date().getTime().toString()
            );
        }

        if (tokenIssuedTime) {
            const currentTime = new Date().getTime();
            const hourInMs = 60 * 60 * 1000;
            if (currentTime - parseInt(tokenIssuedTime) > hourInMs) {
                window.localStorage.removeItem("token");
                window.localStorage.removeItem("tokenIssuedTime");
                this.setState({ token: "", tokenIssuedTime: "" });
            }
        }

        const array = Array.from({ length: 100 }, (_, index) => index);
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        this.setState({ randomArray: array, token: token, tokenIssuedTime });
    }

    logout = () => {
        this.setState({ token: "", tokenIssuedTime: "" });
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("tokenIssuedTime");
    };

    generateRandomTime = () => {
        const randomMinutes = Math.floor(Math.random() * (4 - 2 + 1)) + 2;
        let randomSeconds;
        if (randomMinutes === 2) {
            randomSeconds = Math.floor(Math.random() * (59 - 30 + 1)) + 30;
        } else if (randomMinutes === 4) {
            randomSeconds = Math.floor(Math.random() * (15 - 0 + 1));
        } else {
            randomSeconds = Math.floor(Math.random() * 60);
        }
        return `${randomMinutes.toString().padStart(2, "0")}:${randomSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    getSongTime = (percentage) => {
        const [minutes, seconds] = this.state.randomTime.split(":").map(Number);
        const totalSeconds = seconds + (minutes * 60 * percentage) / 100;
        const finalMinutes1 = Math.floor(totalSeconds / 60);
        const finalSeconds1 = Math.floor(totalSeconds % 60);
        let finalMinutes2;
        let finalSeconds2 = seconds - finalSeconds1;
        if (finalSeconds2 < 0) {
            finalMinutes2 = minutes - finalMinutes1 - 1;
            finalSeconds2 = 60 + finalSeconds2;
        } else {
            finalMinutes2 = minutes - finalMinutes1;
        }

        return [
            `${finalMinutes1.toString().padStart(2, "0")}:${finalSeconds1
                .toString()
                .padStart(2, "0")}`,
            `${finalMinutes2.toString().padStart(2, "0")}:${finalSeconds2
                .toString()
                .padStart(2, "0")}`,
        ];
    };

    render() {
        if (this.state.reqPending) {
            return (
                <div className={"loadingBackground"}>
                    <ImageRotator images={images} interval={5000} />
                    <div className={"loadingTimer"}>
                        {
                            this.getSongTime(
                                ((this.state.counter - 1) * 100) /
                                    Object.keys(this.state.artists).length -
                                    1
                            )[0]
                        }
                        <LinearProgress
                            value={
                                ((this.state.counter - 1) * 100) /
                                    Object.keys(this.state.artists).length -
                                1
                            }
                            variant="determinate"
                            sx={{
                                height: 6,
                                width: 300,
                                borderRadius: 3,
                                backgroundColor: "rgba(31, 31, 31, 0.5)",
                                "& .MuiLinearProgress-bar1Determinate": {
                                    backgroundColor: "#1f1f1f",
                                    borderRadius: 3,
                                },
                            }}
                        />
                        {
                            this.getSongTime(
                                ((this.state.counter - 1) * 100) /
                                    Object.keys(this.state.artists).length -
                                    1
                            )[1]
                        }
                    </div>
                    <div className={"loadingButtons"}>
                        <SkipPrevious sx={{ color: "#5339f8", fontSize: 36 }} />
                        <PlayArrow sx={{ color: "#5339f8", fontSize: 48 }} />
                        <SkipNext sx={{ color: "#5339f8", fontSize: 36 }} />
                    </div>
                </div>
            );
        }
        if (this.state.redirect) {
            return (
                <Navigate
                    to="/results"
                    state={{
                        events: this.state.events,
                        artists: this.state.artists,
                    }}
                />
            );
        }
        return (
            <StyledEngineProvider injectFirst>
                <div className={"homeBackground"}>
                    {!this.state.token ? (
                        <></>
                    ) : (
                        <IconButton
                            className={"logoutButton"}
                            // style={{
                            //     padding: 10,
                            //     borderRadius: 50,
                            //     backgroundColor: "#fefefe",
                            //     border: "2px solid #5339f8",
                            //     cursor: "pointer",
                            //     position: "absolute",
                            //     left: 20,
                            //     top: 20,
                            // }}
                            onClick={this.logout}
                            disableRipple
                        >
                            <Logout />
                        </IconButton>
                    )}
                    <div className={"homeTitleText"}>concerto</div>

                    <div className={"homeSubtitleText"}>
                        Find concerts and events for all your <br /> favorite
                        artists in one search
                    </div>
                    {!this.state.token ? (
                        <div
                            className={"homeLoginText"}
                            onClick={() =>
                                (window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`)
                            }
                        >
                            Log in to Spotify
                        </div>
                    ) : (
                        <div>
                            <div className={"homeSearchText"}>
                                Spotify Link:
                            </div>

                            <TextField
                                value={this.state.searchKey}
                                onChange={(event) => {
                                    this.setState({
                                        searchKey: event.target.value,
                                        searchError: false,
                                    });
                                }}
                                variant="outlined"
                                sx={{
                                    marginTop: 1,
                                    backgroundColor: "transparent",
                                    width: "400px",
                                    "& .MuiOutlinedInput-root": {
                                        "& > fieldset": {
                                            borderColor: "#5339f8",
                                            borderWidth: "2px",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#5339f8",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#5339f8",
                                        },
                                    },
                                }}
                                inputProps={{ autoComplete: "off" }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <PlayArrow
                                                style={{
                                                    cursor: "pointer",
                                                    fontSize: 24,
                                                    color: "#5339f8",
                                                }}
                                                onClick={this.searchPlaylist}
                                            />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        borderRadius: "10px",
                                        backgroundColor: this.state.searchError
                                            ? "#fef6f9"
                                            : "#f9f9ff",
                                        fontFamily: "Nunito-Medium",
                                        color: "#1f1f1f",
                                    },
                                }}
                            />
                            {this.state.searchError ? (
                                <div className={"homeErrorText"}>
                                    Invalid search. Please try again
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    )}
                    <Tile image={DominicFike} coords={[0, 0]} zoom={"180%"} />
                    <Tile image={Drake} coords={[1, 1]} zoom={"215%"} />
                    <Tile
                        image={OliviaRodrigo}
                        coords={[2, 0]}
                        zoom={"280%"}
                        shift={80}
                    />
                    <Tile
                        image={Rave}
                        coords={[3, 1]}
                        zoom={"170%"}
                        shiftTop={-100}
                        shift={-100}
                    />
                    <Tile
                        image={Confetti}
                        coords={[3, -1]}
                        zoom={"170%"}
                        shiftTop={-150}
                        shift={-50}
                    />
                    <Tile
                        image={Lasers}
                        coords={[-1, -1]}
                        zoom={"350%"}
                        shift={100}
                    />
                    <Tile
                        image={WestonEstate}
                        coords={[-1, 1]}
                        zoom={"160%"}
                        shiftTop={80}
                    />
                    <Tile
                        image={DuaLipa}
                        coords={[1, -1]}
                        zoom={"220%"}
                        shiftTop={-120}
                        shift={140}
                    />
                    <Tile
                        image={SZA}
                        coords={[2, 2]}
                        zoom={"220%"}
                        shift={-150}
                        shiftTop={100}
                    />
                    <Tile
                        image={Weeknd}
                        coords={[3, 3]}
                        zoom={"220%"}
                        shift={-50}
                        shiftTop={-50}
                    />
                </div>
            </StyledEngineProvider>
        );
    }
}

export default Home;
