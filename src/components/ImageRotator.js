import React, { useState, useEffect } from "react";
import { artistsDictionary } from "../utils/artistsDictionary";

import "../App.css";

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

const ImageRotator = ({ images, interval = 2000 }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(1);
    const [isLoadingNextImage, setIsLoadingNextImage] = useState(false);
    const [randomIndex, setRandomIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setIsLoadingNextImage(true);
            setTimeout(() => {
                setCurrentImageIndex((prevIndex) => prevIndex + 1);
                setIsLoadingNextImage(false);
                setRandomIndex(Math.floor(Math.random() * 3));
            }, 1000); // Delay to ensure the image is fully loaded before changing
        }, interval);
        return () => clearInterval(timer);
    }, [images, interval]);
    return (
        <div
            style={{
                position: "relative",
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: 390,
            }}
        >
            <img
                src={images[`${randomArray[currentImageIndex]}.jpg`]}
                alt="Rotating Image"
                className={`image-transition ${
                    isLoadingNextImage ? "hidden" : ""
                }`}
                style={{
                    width: 270,
                    borderRadius: 10,
                    height: 270,
                    position: "absolute",
                    filter: "blur(10px)",
                }}
            />
            <img
                src={images[`${randomArray[currentImageIndex]}.jpg`]}
                alt="Rotating Image"
                className={`image-transition ${
                    isLoadingNextImage ? "hidden" : ""
                }`}
                style={{
                    width: 270,
                    height: 270,
                    borderRadius: 10,
                    position: "absolute",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    top: 350,
                    height: 60,
                    width: 270,
                    textAlign: "left",
                    opacity: 1,
                }}
                className={`image-transition ${
                    isLoadingNextImage ? "hidden" : ""
                }`}
            >
                <div
                    style={{
                        fontFamily: "Nunito-Medium",
                        color: "#1f1f1f",
                        fontSize: 20,
                    }}
                >
                    {getRandomSongDetails(currentImageIndex, randomIndex)[0]}
                </div>
                <div
                    style={{
                        fontFamily: "Nunito-Light",
                        color: "#757575",
                        fontSize: 16,
                    }}
                >
                    {getRandomSongDetails(currentImageIndex, randomIndex)[1]}
                </div>
            </div>
        </div>
    );
};

export default ImageRotator;
