import { PureComponent, Component } from "react";
import { artistsDictionary } from "../utils/artistsDictionary";
import anime from "animejs";

function generateRandomArray(length, min, max, minDistance) {
    const result = [];

    for (let i = 0; i < length; i++) {
        let randomValue;
        do {
            randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (isTooClose(result, randomValue, minDistance));

        result.push(randomValue);
    }
    return result;
}

function isTooClose(array, value, minDistance) {
    const lastIndex = array.lastIndexOf(value);
    return lastIndex !== -1 && array.length - lastIndex <= minDistance;
}

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

const randomArray = generateRandomArray(400, 1, 100, 40);

class ImageCarousel extends PureComponent {
    constructor(props) {
        super(props);
        this.state = { counter: 1 };
        this.randIndex = Math.floor(Math.random() * 3);
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            this.setState((prevState) => ({
                counter: prevState.counter + 1,
            }));
        }, 6000);
    }

    getRandomSongDetails = (c) => {
        const i = randomArray[c] - 1;

        let featuredArtists =
            artistsDictionary[i].songs[this.randIndex].featured;
        let songTitle = artistsDictionary[i].songs[this.randIndex].title;
        let artistName = artistsDictionary[i].name;

        if (featuredArtists.length !== 0) {
            let newArtists =
                artistsDictionary[i].name + ", " + featuredArtists.join(", ");
            if (featuredArtists.length === 1) {
                return [
                    `${songTitle} (feat. ${featuredArtists[0]})`,
                    newArtists,
                ];
            } else if (featuredArtists.length === 2) {
                return [
                    `${songTitle} (feat. ${featuredArtists[0]} & ${featuredArtists[1]})`,
                    newArtists,
                ];
            } else {
                const lastArtist = featuredArtists.pop(); // Remove the last artist from the array
                const featuredArtistString = `${featuredArtists.join(
                    ", "
                )}, & ${lastArtist}`;
                return [
                    `${songTitle} (feat. ${featuredArtistString})`,
                    newArtists,
                ];
            }
        } else {
            return [songTitle, artistName];
        }
    };

    switchImages = (imageIndex) => {
        if (imageIndex === 1) {
            anime({
                targets: ["#coverart1"],
                opacity: [0, 1],
                duration: 1000,
                delay: 500,
                easing: "easeOutExpo",
            });
            anime({
                targets: ["#coverart1"],
                opacity: [1, 0],
                duration: 1000,
                delay: 4800,
                easing: "easeOutExpo",
            });
            anime({
                targets: "#coverart2blur",
                opacity: [0, 1],
                duration: 1000,
                delay: 4800,
                easing: "easeOutExpo",
            });
            anime({
                targets: "#songDetails1",
                opacity: [0, 1],
                duration: 500,
                easing: "easeOutExpo",
            });
        } else if (imageIndex === 2) {
            anime({
                targets: ["#coverart2"],
                opacity: [0, 1],
                duration: 1000,
                delay: 1500,
                easing: "easeOutExpo",
            });
        }
    };

    render() {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: 350,
                    justifyContent: "center",
                    backgroundColor: "#1f1f1f",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        height: 270,
                        width: 270,
                        marginTop: -50,
                    }}
                >
                    <img
                        style={{
                            width: 270,
                            height: 270,
                            position: "absolute",
                            top: 0,
                            left: 0,
                            borderRadius: 10,
                            filter: "blur(10px)",
                            opacity: 0,
                        }}
                        src={
                            images[`${randomArray[this.state.counter + 1]}.jpg`]
                        }
                        id="coverart2blur"
                    />
                    <img
                        style={{
                            width: 270,
                            height: 270,
                            top: 0,
                            left: 0,
                            borderRadius: 10,
                            position: "absolute",
                            opacity: 0,
                        }}
                        src={
                            images[`${randomArray[this.state.counter + 1]}.jpg`]
                        }
                        onLoad={this.switchImages(1)}
                        id="coverart2"
                    />
                    <div id="coverart1" style={{ opacity: 0 }}>
                        <img
                            style={{
                                width: 270,
                                height: 270,
                                position: "absolute",
                                top: 0,
                                left: 0,
                                borderRadius: 10,
                                filter: "blur(10px)",
                            }}
                            src={
                                images[`${randomArray[this.state.counter]}.jpg`]
                            }
                        />
                        <img
                            style={{
                                width: 270,
                                height: 270,
                                top: 0,
                                left: 0,
                                borderRadius: 10,
                                position: "absolute",
                            }}
                            src={
                                images[`${randomArray[this.state.counter]}.jpg`]
                            }
                            onLoad={this.switchImages(2)}
                        />
                        <div
                            style={{
                                backgroundColor: "#1f1f1f",
                                position: "absolute",
                                top: 290,
                                height: 60,
                                width: 270,
                                textAlign: "left",
                                left: 0,
                                opacity: 0,
                            }}
                            id="songDetails1"
                        >
                            <div
                                style={{
                                    fontFamily: "Nunito-Medium",
                                    color: "#FFF",
                                    fontSize: 20,
                                }}
                            >
                                {
                                    this.getRandomSongDetails(
                                        this.state.counter
                                    )[0]
                                }
                            </div>
                            <div
                                style={{
                                    fontFamily: "Nunito-Light",
                                    color: "#BBB",
                                    fontSize: 16,
                                }}
                            >
                                {
                                    this.getRandomSongDetails(
                                        this.state.counter
                                    )[1]
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ImageCarousel;
