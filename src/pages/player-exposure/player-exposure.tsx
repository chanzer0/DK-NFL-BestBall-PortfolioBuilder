import React, { useState, ReactElement, useEffect } from "react";
import "./player-exposure.css";
import { UserEnteredContest } from "../options/options";

interface IPlayerExposureViewProps {
    userContests: UserEnteredContest[];
}

interface PlayerExposureDict {
    [playerName: string]: PlayerExposure;
}

export interface PlayerExposure {
    team: string;
    position: string;
    imageUrl: string;
    numEntries: number;
    entryFees: number;
    averageAdp: number;
    myAverageAdp: number;
}

const PlayerExposureView = ({
    userContests,
}: IPlayerExposureViewProps): ReactElement => {
    // Init JSS.
    const [playerExposures, setPlayerExposures] =
        useState<PlayerExposureDict>();

    // Init useEffect
    useEffect(() => {
        if (userContests != null && userContests.length > 0) {
            let playerExposureDict: PlayerExposureDict = {};

            userContests.forEach((contest) => {
                contest.userDraftboard.forEach((player) => {
                    if (!(player.playerName in playerExposureDict)) {
                        playerExposureDict[player.playerName] = {
                            team: player.team,
                            position: player.position,
                            imageUrl: player.playerImage50,
                            numEntries: 1,
                            entryFees: contest.entryFee,
                            averageAdp: player.adp,
                            myAverageAdp: player.overallSelectionNumber,
                        } as PlayerExposure;
                    } else {
                        playerExposureDict[player.playerName].numEntries += 1;
                        playerExposureDict[player.playerName].entryFees +=
                            contest.entryFee;
                        playerExposureDict[player.playerName].myAverageAdp =
                            playerExposureDict[player.playerName].myAverageAdp +
                            (player.overallSelectionNumber -
                                playerExposureDict[player.playerName]
                                    .myAverageAdp) /
                                (playerExposureDict[player.playerName]
                                    .numEntries +
                                    1);
                        playerExposureDict[player.playerName].averageAdp =
                            player.adp;
                    }
                });
            });
            setPlayerExposures(playerExposureDict);
        }
    }, [userContests]);

    // Init helpers.
    const sortPlayers = (sortKey: string) => {
        if (playerExposures == null) return;

        let entries = Object.entries(playerExposures);
        switch (sortKey) {
            case "name":
                entries.sort((a, b) => {
                    if (a[0] < b[0]) return -1;
                    if (a[0] > b[0]) return 1;
                    return 0;
                });
                break;
            case "team":
                entries.sort((a, b) => {
                    if (a[1].team < b[1].team) return -1;
                    if (a[1].team > b[1].team) return 1;
                    return 0;
                });
                break;
            case "position":
                entries.sort((a, b) => {
                    if (a[1].position < b[1].position) return -1;
                    if (a[1].position > b[1].position) return 1;
                    return 0;
                });
                break;
            case "numEntries":
                entries.sort((a, b) => {
                    if (a[1].numEntries < b[1].numEntries) return 1;
                    if (a[1].numEntries > b[1].numEntries) return -1;
                    return 0;
                });
                break;
            case "entryFees":
                entries.sort((a, b) => {
                    if (a[1].entryFees < b[1].entryFees) return 1;
                    if (a[1].entryFees > b[1].entryFees) return -1;
                    return 0;
                });
                break;
            case "averageAdp":
                entries.sort((a, b) => {
                    if (a[1].averageAdp < b[1].averageAdp) return -1;
                    if (a[1].averageAdp > b[1].averageAdp) return 1;
                    return 0;
                });
                break;
            case "myAdp":
                entries.sort((a, b) => {
                    if (a[1].myAverageAdp < b[1].myAverageAdp) return -1;
                    if (a[1].myAverageAdp > b[1].myAverageAdp) return 1;
                    return 0;
                });
                break;
            default:
                break;
        }
        setPlayerExposures(Object.fromEntries(entries));
    };

    // Init TSX.
    return (
        <div className="playerContainer">
            <div className="playerExposureHeader">
                <div>Player Image</div>
                <div onClick={() => sortPlayers("name")}>Player Name</div>
                <div onClick={() => sortPlayers("team")}>Team</div>
                <div onClick={() => sortPlayers("position")}>Position</div>
                <div onClick={() => sortPlayers("numEntries")}># Entries</div>
                <div onClick={() => sortPlayers("entryFees")}>Entry Fees</div>
                <div onClick={() => sortPlayers("averageAdp")}>Average ADP</div>
                <div onClick={() => sortPlayers("myAdp")}>My Average ADP</div>
            </div>
            {playerExposures != null &&
                Object.keys(playerExposures).map((playerName) => {
                    return (
                        <div
                            className={`playerExposureContainer ${playerExposures[
                                playerName
                            ].team.toLowerCase()}`}
                            key={playerName}
                        >
                            <div className="playerExposureImageContainer">
                                <img
                                    className="playerExposureImage"
                                    src={playerExposures[playerName].imageUrl}
                                    alt="playerImage"
                                />
                            </div>
                            <div className="playerExposureName">
                                {playerName}
                            </div>
                            <div className="playerExposureTeam">
                                <img
                                    width="100%"
                                    alt="teamLogo"
                                    src={`${playerExposures[
                                        playerName
                                    ].team.toLowerCase()}.webp`}
                                />
                            </div>
                            <div className="playerExposurePosition">
                                {playerExposures[playerName].position}
                            </div>
                            <div className="playerExposureNumEntries">
                                {playerExposures[playerName].numEntries}
                            </div>
                            <div className="playerExposureEntryFees">
                                ${playerExposures[playerName].entryFees}
                            </div>
                            <div className="playerExposureAverageAdp">
                                {playerExposures[playerName].averageAdp != null
                                    ? playerExposures[
                                          playerName
                                      ].averageAdp.toFixed(2)
                                    : "N/A"}
                            </div>
                            {playerExposures[playerName].myAverageAdp !=
                                null && (
                                <div className="playerExposureMyAverageAdp">
                                    {playerExposures[
                                        playerName
                                    ].myAverageAdp.toFixed(2)}{" "}
                                    (
                                    {playerExposures[playerName].myAverageAdp -
                                        playerExposures[playerName].averageAdp >
                                        0 && "+"}
                                    {(
                                        playerExposures[playerName]
                                            .myAverageAdp -
                                        playerExposures[playerName].averageAdp
                                    ).toFixed(2)}
                                    )
                                </div>
                            )}
                        </div>
                    );
                })}
        </div>
    );
};

export default PlayerExposureView;
