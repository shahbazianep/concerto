import React, { useState, useEffect } from "react";
import { artistsDictionary } from "../utils/artistsDictionary";
import anime from "animejs";
import "../App.css";
import {
    FastRewindRounded,
    FastForwardRounded,
    PauseRounded,
} from "@mui/icons-material";

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

const randomArray = generateRandomArray(400, 1, 100, 40);

function getRandomSongDetails(c, randomIndex) {
    const i = randomArray[c] - 1;
    let featuredArtists = artistsDictionary[i].songs[randomIndex].featured;
    let songTitle = artistsDictionary[i].songs[randomIndex].title;
    let artistName = artistsDictionary[i].name;

    if (featuredArtists.length !== 0) {
        let newArtists =
            artistsDictionary[i].name + ", " + featuredArtists.join(", ");
        if (featuredArtists.length === 1) {
            return [`${songTitle} (feat. ${featuredArtists[0]})`, newArtists];
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
            return [`${songTitle} (feat. ${featuredArtistString})`, newArtists];
        }
    } else {
        return [songTitle, artistName];
    }
}

const ImageRotator = ({ images }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(1);
    const [randomIndex, setRandomIndex] = useState(0);
    const [currentImageSource, setCurrentImageSource] = useState(
        images[`${randomArray[1]}.jpg`]
    );

    useEffect(() => {
        setCurrentImageSource(images[`${randomArray[currentImageIndex]}.jpg`]);
    }, [currentImageIndex, images]);

    const changeAlbum = () => {
        setTimeout(() => {
            setRandomIndex(Math.floor(Math.random() * 3));
            setCurrentImageIndex((prevIndex) => prevIndex + 1);
        }, 2000);
        anime({
            targets: ["#album-cover", "#song-details"],
            keyframes: [
                { opacity: 0, easing: "easeInCubic" },
                { opacity: 1, easing: "easeInOutCubic" },
            ],
            duration: 4000,
        });
    };

    useEffect(() => {
        anime({
            targets: "#loading-title",
            translateX: { value: [-120, 0], delay: 3000 },
            translateY: { value: [70, 0], delay: 4200 },
            delay: 4000,
            duration: 1000,
            easing: "easeInOutExpo",
        });
        anime({
            targets: ".loadingTimer",
            translateX: [-150, 0],
            delay: 3000,
            duration: 1000,
            easing: "easeInOutExpo",
        });
        anime({
            targets: "#album-cover",
            opacity: [0, 1],
            duration: 1000,
            delay: 3500,
            easing: "easeInOutExpo",
        });
        anime({
            targets: ["#song-details", ".loadingButtons"],
            opacity: [0, 1],
            delay: 5000,
            duration: 1000,
            easing: "easeInOutExpo",
        });
        let intervalId = null;
        setTimeout(() => {
            intervalId = setInterval(changeAlbum, 4000);
        }, 5200);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                flexDirection: "row",
            }}
        >
            <img
                src={currentImageSource}
                alt="Album Cover"
                style={{
                    width: 270,
                    height: 270,
                    borderRadius: 10,
                }}
                id={"album-cover"}
            />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: 40,
                    marginLeft: 30,
                }}
            >
                <div
                    style={{
                        fontFamily: "Circular-Std",
                        fontSize: 16,
                        color: "#757575",
                    }}
                    id={"loading-title"}
                >
                    NOW LOADING CONCERTS
                </div>
                <div
                    style={{
                        width: 270,
                        height: 60,
                        opacity: 1,
                    }}
                    id={"song-details"}
                >
                    <div
                        style={{
                            fontFamily: "Circular-Std",
                            color: "#fefefe",
                            fontSize: 24,
                            paddingTop: 4,
                            paddingBottom: 4,
                            textWrap: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {
                            getRandomSongDetails(
                                currentImageIndex,
                                randomIndex
                            )[0]
                        }
                    </div>
                    <div
                        style={{
                            fontFamily: "Circular-Std",
                            color: "#e2e2e2",
                            fontSize: 18,
                            textWrap: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {
                            getRandomSongDetails(
                                currentImageIndex,
                                randomIndex
                            )[1]
                        }
                    </div>
                </div>
                <div className={"loadingButtons"}>
                    <FastRewindRounded
                        sx={{ color: "#fefefe", fontSize: 48 }}
                    />
                    <PauseRounded sx={{ color: "#fefefe", fontSize: 48 }} />
                    <FastForwardRounded
                        sx={{ color: "#fefefe", fontSize: 48 }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ImageRotator;
