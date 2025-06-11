import React, { Component } from "react";
import axios from "axios";

import Tile from "../components/Tile";

import "../App.css";
import "../styles.css";
import { Navigate } from "react-router";
import { PlayArrow } from "@mui/icons-material";
import { InputAdornment, LinearProgress, TextField } from "@mui/material";
import { StyledEngineProvider } from "@mui/material/styles";

import anime from "animejs";

const REDIRECT_URI = "https://concerto-phi.vercel.app/";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = "playlist-read-private playlist-read-collaborative";

function importAll(r) {
	let images = {};
	r.keys().forEach((item) => {
		images[item.replace("./", "")] = r(item);
	});
	return images;
}

const tiles = importAll(
	require.context("../images/tiles", false, /\.(png|jpe?g|svg)$/)
);

function getRandomIndices(num) {
	const numbers = Array.from({ length: num }, (_, i) => i);

	for (let i = numbers.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[numbers[i], numbers[j]] = [numbers[j], numbers[i]];
	}

	return numbers;
}

const centerCoords = [
	[-1, 1],
	[0, 0],
	[1, -1],
	[1, 1],
	[2, 0],
	[2, 2],
	[3, 1],
	[3, 3],
	// [-1, -1],
	// [3, -1],
];

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
			imageSources: getRandomIndices(30)
				.slice(0, centerCoords.length)
				.map((randIndex) => tiles[`${randIndex}.png`]),
			lastChangedTiles: [-1, -1],
		};
		this.firstAccess = true;
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
		let retries = 5;

		for (let i = 0; i < artistNames.length; i++) {
			this.setState({
				counter: this.state.counter + 1,
			});
			for (let j = 0; j < retries; j++) {
				const artistName = artistNames[i].name;
				const artistUrl = artistNames[i].href;
				const delay = 100;
				try {
					await new Promise((resolve) => setTimeout(resolve, delay));
					// const concerts = await axios.get(
					//     `https://app.ticketmaster.com/discovery/v2/events?`,
					//     {
					//         params: {
					//             keyword: artistName,
					//             apikey: process.env.REACT_APP_TICKETMASTER_KEY,
					//             size: 50,
					//         },
					//     }
					// );

					// console.log(concerts.data);
					// events[artistName] = [];

					// if ("_embedded" in concerts.data) {
					//     for (
					//         let i = 0;
					//         i < concerts.data._embedded.events.length;
					//         i++
					//     ) {
					//         if ("_embedded" in concerts.data._embedded.events[i]) {
					//             for (
					//                 let j = 0;
					//                 j <
					//                 concerts.data._embedded.events[i]._embedded
					//                     .attractions.length;
					//                 j++
					//             ) {
					//                 if (
					//                     concerts.data._embedded.events[i]._embedded
					//                         .attractions[j].name === artistName
					//                 ) {
					//                     events[artistName].push(
					//                         concerts.data._embedded.events[i]
					//                     );
					//                 }
					//             }
					//         }
					//     }
					//     // events[artistName] = concerts.data._embedded.events;
					//     console.log(events[artistName]);
					// }
					const response = await axios.get(
						`https://app.ticketmaster.com/discovery/v2/attractions`,
						{
							params: {
								apikey: process.env.REACT_APP_TICKETMASTER_KEY,
								keyword: artistName,
								locale: "*",
							},
						}
					);

					let attractionIndex = 0;
					let urlMatchError = false;
					let attractions = response.data._embedded?.attractions;
					if (attractions?.length === 1) {
						if (
							attractions[0].name
								.toLowerCase()
								.normalize("NFD")
								.replace(/[\u0300-\u036f]/g, "") !==
							artistName
								.toLowerCase()
								.normalize("NFD")
								.replace(/[\u0300-\u036f]/g, "")
						) {
							urlMatchError = true;
						}
					} else {
						while (attractionIndex < attractions?.length) {
							if (
								"externalLinks" in
									attractions[attractionIndex] &&
								"spotify" in
									attractions[attractionIndex]
										.externalLinks &&
								attractions[attractionIndex].externalLinks
									.spotify[0].url === artistUrl
							) {
								break;
							} else if (
								attractions[attractionIndex].name
									.toLowerCase()
									.normalize("NFD")
									.replace(/[\u0300-\u036f]/g, "") ===
								artistName
									.toLowerCase()
									.normalize("NFD")
									.replace(/[\u0300-\u036f]/g, "")
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
						break;
					}

					if ("_embedded" in response.data) {
						const concerts = await axios.get(
							`https://app.ticketmaster.com/discovery/v2/events?`,
							{
								params: {
									apikey: process.env
										.REACT_APP_TICKETMASTER_KEY,
									attractionId:
										attractions[attractionIndex].id,
									locale: "*",
									size: 100,
								},
							}
						);

						if (
							"_embedded" in concerts.data &&
							concerts.data._embedded.events[0]._embedded
								.attractions[0].id ===
								attractions[attractionIndex].id
						) {
							events[artistName] = concerts.data._embedded.events;
							break;
						}
					}
					break;
				} catch {
					console.warn(
						`Retrying ${artistName} due to 429 error code: Attempt ${
							j + 1
						}`
					);
					await new Promise((resolve) =>
						setTimeout(resolve, 1000 * Math.pow(2, j))
					);
				}
			}
		}

		this.setState({ events: events, reqPending: false, redirect: true });
	};

	componentDidMount() {
		const hash = window.location.hash;
		let token = window.localStorage.getItem("token");
		let tokenIssuedTime = window.localStorage.getItem("tokenIssuedTime");
		const currentTime = new Date().getTime();
		const hourInMs = 60 * 60 * 1000;

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

		this.setState({
			randomArray: array,
			token: token,
			tokenIssuedTime: currentTime,
		});
	}

	componentDidUpdate() {
		if (this.firstAccess) {
			[
				"#tile0",
				"#tile1",
				"#tile2",
				"#tile3",
				"#tile4",
				"#tile5",
				"#tile6",
				"#tile7",
			].forEach((tile) => {
				anime({
					targets: tile,
					opacity: [0, 1],
					easing: "easeInOutExpo",
					delay: Math.floor(Math.random() * 1000) + 500,
				});
			});
			setTimeout(() => {
				this.startInterval();
			}, 2000);
			this.firstAccess = false;
		}
	}

	startInterval() {
		if (this.interval) {
			clearInterval(this.interval);
		}
		this.interval = setInterval(this.changeTile, 3000);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
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

	changeTile = () => {
		if (document.hidden) {
			return;
		}
		let randIndex = Math.floor(Math.random() * centerCoords.length);
		while (this.state.lastChangedTiles.includes(randIndex)) {
			randIndex = Math.floor(Math.random() * centerCoords.length);
		}
		let randImage = `${Math.floor(Math.random() * 30)}.png`;
		let oldSources = [...this.state.imageSources];
		while (oldSources.includes(tiles[randImage])) {
			randImage = `${Math.floor(Math.random() * 30)}.png`;
		}
		oldSources[randIndex] = tiles[randImage];
		setTimeout(
			() =>
				this.setState({
					imageSources: oldSources,
					lastChangedTiles: [
						this.state.lastChangedTiles[1],
						randIndex,
					],
				}),
			1500
		);
		anime({
			targets: `#tile${randIndex}`,
			keyframes: [{ opacity: 0 }, { opacity: 1 }],
			duration: 3000,
			easing: "easeInOutExpo",
		});
	};

	render() {
		if (this.state.reqPending) {
			return (
				<div className={"loadingBackground"}>
					<div className="loadingContent">
						{this.props.children}
						<div className="loadingTimer">
							<LinearProgress
								value={
									((this.state.counter - 1) * 100) /
										Object.keys(this.state.artists).length -
									1
								}
								variant="determinate"
								sx={{
									height: 6,
									width: 268,
									borderRadius: 3,
									backgroundColor: "rgba(254, 254, 254, 0.5)",
									"& .MuiLinearProgress-bar1Determinate": {
										backgroundColor: "#fefefe",
										borderRadius: 3,
									},
								}}
							/>
						</div>
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
					<div className="homeContent">
						<div className={"homeTitleText"}>concerto</div>
						<div className={"homeSubtitleText"}>
							Discover concerts and events for all your <br />{" "}
							favorite artists in one search
						</div>
						{!this.state.token ? (
							<div
								className={"homeLoginText"}
								onClick={() =>
									(window.location.href = `${AUTH_ENDPOINT}?scope=${encodeURIComponent(
										SCOPES
									)}&client_id=${
										process.env.REACT_APP_CLIENT_ID
									}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`)
								}
							>
								Log in to Spotify
							</div>
						) : (
							<div className={"homeInput"}>
								<form onSubmit={this.searchPlaylist}>
									<TextField
										value={this.state.searchKey}
										onSubmit={this.searchPlaylist}
										onChange={(event) => {
											this.setState({
												searchKey: event.target.value,
												searchError: false,
											});
										}}
										variant="outlined"
										placeholder="Paste your Spotify playlist link here"
										sx={{
											backgroundColor: "transparent",
											width: "400px",
											fontFamily: "Circular-Std",
											"& .MuiOutlinedInput-root": {
												"& > fieldset": {
													borderColor: "#fefefe",
													borderWidth: "2px",
												},
												"&:hover fieldset": {
													borderColor: "#fefefe",
												},
												"&.Mui-focused fieldset": {
													borderColor: "#fefefe",
												},
												backgroundColor: "transparent",
												fontFamily: "Circular-Std",
												color: "#fefefe",
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
														onClick={
															this.searchPlaylist
														}
														type="submit"
													/>
												</InputAdornment>
											),
											sx: {
												borderRadius: "10px",
												backgroundColor: this.state
													.searchError
													? "#fef6f9"
													: "#f9f9ff",
												fontFamily: "Nunito-Medium",
												color: "#1f1f1f",
											},
										}}
									/>
								</form>
								{
									<div
										className={"homeErrorText"}
										style={{
											visibility: !this.state.searchError
												? "hidden"
												: "",
										}}
									>
										Invalid search. Please try again
									</div>
								}
							</div>
						)}
					</div>
					{this.state.token && (
						<div className={"logoutButton"} onClick={this.logout}>
							Log Out
						</div>
					)}
					{this.state.imageSources.map((src, index) => {
						return (
							<Tile
								image={src}
								coords={centerCoords[index]}
								key={index}
								id={`tile${index}`}
							/>
						);
					})}
				</div>
			</StyledEngineProvider>
		);
	}
}

export default Home;
