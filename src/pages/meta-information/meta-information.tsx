import React, { useState, ReactElement, useEffect } from "react";
import "./meta-information.css";
import { Player, UserEnteredContest } from "../options/options";

interface IMetaInformationProps {
    userContests: UserEnteredContest[];
}

export enum RosterConstructionType {
    // QB1 in rounds 6-11, QB2 in rounds 8-12, 2 total QBs
    TwoQBInWindow = "2QB in window",

    // QB1 in rounds 6-11, QB2 and QB2 in rounds 8-12, 3 total QBs
    ThreeQBInWindow = "3QB in window",

    // First QB drafted in round 4 or earlier
    EliteQB = "Elite QB",

    // First QB drafted after round 10, 3 total QBs
    PuntQBx3 = "Punt QB x3",

    // 1 RB in first 3 rounds, no additional RBs until round 9 or later
    HeroRB = "Hero RB",

    // No RBs drafted until round 6 or later
    ZeroRB = "Zero RB",

    // 2 RBs in the first 3 rounds, no additional RBs until round 9 or later
    DoubleRB = "Double RB",

    // RB3 by round 5, maximum 4 total RBs
    HyperFragileRB = "Hyper Fragile RB",

    // RB2 by round 2, RB3 after round 5
    DoubleHeroRB = "Double Hero RB",

    // RB4 by round 7
    RobustRB = "Robust RB",

    // First TE drafted in round 4 or earlier
    EliteTE = "Elite TE",

    // First TE drafted in rounds 5-8
    TETier2 = "TE Tier 2",

    // QB after round 12
    LateRoundQB = "Late Round QB",

    // TE after round 12
    LateRoundTE = "Late Round TE",

    // 3 TEs drafted after round 12
    PuntTEx3 = "Punt TE x 3",

    // 5 WRs drafted by round 10
    WR5byRound10 = "WR5 by Round 10",
}

export interface Draft {
    numEntries: number;
    entryFees: number;
}

export interface DraftSpots {
    [draftSpot: number]: Draft;
}

export interface DraftMonths {
    [month: string]: Draft;
}

export type RosterConstruction = {
    [type in RosterConstructionType]: Draft;
};

export interface TeamStack {
    [stackNumber: number]: number;
    totalDrafts: number;
}

export interface TeamStackDict {
    [team: string]: TeamStack;
}

export interface MetaInformation {
    slowDrafts: Draft;
    fastDrafts: Draft;
    draftSpots: DraftSpots;
    numDrafts: number;
    draftMonths: DraftMonths;
    rosterConstruction: RosterConstruction;
    teamStacks: TeamStackDict;
}

const MetaInformationView = ({
    userContests,
}: IMetaInformationProps): ReactElement => {
    // Init JSS.
    const [metaInformation, setMetaInformation] = useState<MetaInformation>();

    // Init useEffects.
    useEffect(() => {
        if (userContests != null && userContests.length > 0) {
            let metaInformation: MetaInformation = {
                teamStacks: {},
                numDrafts: userContests.length,
            } as MetaInformation;

            let slowContests = userContests.filter(
                (c) => c.draftType === "slow"
            );
            metaInformation.slowDrafts = {
                numEntries: slowContests.length,
                entryFees: slowContests.reduce((a, b) => a + b.entryFee, 0),
            };

            let fastContests = userContests.filter(
                (c) => c.draftType === "fast"
            );
            metaInformation.fastDrafts = {
                numEntries: fastContests.length,
                entryFees: fastContests.reduce((a, b) => a + b.entryFee, 0),
            };

            let draftSpots: DraftSpots = {};
            let draftMonths: DraftMonths = {};
            let rosterConstruction: RosterConstruction = {
                [RosterConstructionType.TwoQBInWindow]: {
                    numEntries: 0,
                    entryFees: 0,
                },
                [RosterConstructionType.ThreeQBInWindow]: {
                    numEntries: 0,
                    entryFees: 0,
                },
                [RosterConstructionType.EliteQB]: {
                    numEntries: userContests.filter(
                        (c) =>
                            c.userDraftboard
                                .sort((a, b) => a.roundNumber - b.roundNumber)
                                .findIndex((p) => p.position === "QB") <= 3
                    ).length,
                    entryFees: userContests
                        .filter(
                            (c) =>
                                c.userDraftboard
                                    .sort(
                                        (a, b) => a.roundNumber - b.roundNumber
                                    )
                                    .findIndex((p) => p.position === "QB") <= 3
                        )
                        .reduce((a, b) => a + b.entryFee, 0),
                },
                [RosterConstructionType.PuntQBx3]: {
                    numEntries: 0,
                    entryFees: 0,
                },
                [RosterConstructionType.HeroRB]: {
                    numEntries: 0,
                    entryFees: 0,
                },
                [RosterConstructionType.ZeroRB]: {
                    numEntries: userContests.filter(
                        (c) =>
                            c.userDraftboard
                                .sort((a, b) => a.roundNumber - b.roundNumber)
                                .findIndex((p) => p.position === "RB") > 5
                    ).length,
                    entryFees: userContests
                        .filter(
                            (c) =>
                                c.userDraftboard
                                    .sort(
                                        (a, b) => a.roundNumber - b.roundNumber
                                    )
                                    .findIndex((p) => p.position === "RB") > 5
                        )
                        .reduce((a, b) => a + b.entryFee, 0),
                },
                [RosterConstructionType.DoubleHeroRB]: {
                    numEntries: 0,
                    entryFees: 0,
                },
                [RosterConstructionType.DoubleRB]: {
                    numEntries: 0,
                    entryFees: 0,
                },
                [RosterConstructionType.HyperFragileRB]: {
                    numEntries: 0,
                    entryFees: 0,
                },
                [RosterConstructionType.LateRoundQB]: {
                    numEntries: userContests.filter(
                        (c) =>
                            c.userDraftboard
                                .sort((a, b) => a.roundNumber - b.roundNumber)
                                .findIndex((p) => p.position === "QB") > 10
                    ).length,
                    entryFees: userContests
                        .filter(
                            (c) =>
                                c.userDraftboard
                                    .sort(
                                        (a, b) => a.roundNumber - b.roundNumber
                                    )
                                    .findIndex((p) => p.position === "QB") > 10
                        )
                        .reduce((a, b) => a + b.entryFee, 0),
                },
                [RosterConstructionType.LateRoundTE]: {
                    numEntries: userContests.filter(
                        (c) =>
                            c.userDraftboard
                                .sort((a, b) => a.roundNumber - b.roundNumber)
                                .findIndex((p) => p.position === "TE") > 10
                    ).length,
                    entryFees: userContests
                        .filter(
                            (c) =>
                                c.userDraftboard
                                    .sort(
                                        (a, b) => a.roundNumber - b.roundNumber
                                    )
                                    .findIndex((p) => p.position === "TE") > 10
                        )
                        .reduce((a, b) => a + b.entryFee, 0),
                },
                [RosterConstructionType.RobustRB]: {
                    numEntries: 0,
                    entryFees: 0,
                },
                [RosterConstructionType.EliteTE]: {
                    numEntries: userContests.filter(
                        (c) =>
                            c.userDraftboard
                                .sort((a, b) => a.roundNumber - b.roundNumber)
                                .findIndex((p) => p.position === "TE") <= 3
                    ).length,
                    entryFees: userContests
                        .filter(
                            (c) =>
                                c.userDraftboard
                                    .sort(
                                        (a, b) => a.roundNumber - b.roundNumber
                                    )
                                    .findIndex((p) => p.position === "TE") <= 3
                        )
                        .reduce((a, b) => a + b.entryFee, 0),
                },
                [RosterConstructionType.TETier2]: {
                    numEntries: 0,
                    entryFees: 0,
                },
                [RosterConstructionType.PuntTEx3]: {
                    numEntries: 0,
                    entryFees: 0,
                },
                [RosterConstructionType.WR5byRound10]: {
                    numEntries: 0,
                    entryFees: 0,
                },
            } as RosterConstruction;
            userContests.forEach((contest) => {
                draftSpots[contest.userDraftPosition] = {
                    numEntries:
                        draftSpots[contest.userDraftPosition] == null
                            ? 1
                            : draftSpots[contest.userDraftPosition].numEntries +
                              1,
                    entryFees:
                        draftSpots[contest.userDraftPosition] == null
                            ? contest.entryFee
                            : draftSpots[contest.userDraftPosition].entryFees +
                              contest.entryFee,
                };
                metaInformation.draftSpots = draftSpots;
                const month = contest.draftDate.split(" ")[0];
                draftMonths[month] = {
                    numEntries:
                        draftMonths[month] == null
                            ? 1
                            : draftMonths[month].numEntries + 1,
                    entryFees:
                        draftMonths[month] == null
                            ? contest.entryFee
                            : draftMonths[month].entryFees + contest.entryFee,
                };
                metaInformation.draftMonths = draftMonths;

                let sortedPlayers = contest.userDraftboard.sort(
                    (a, b) => a.roundNumber - b.roundNumber
                );
                // Get the indexes of first two QBs
                let firstQBIndex = sortedPlayers.findIndex(
                    (item) => item.position === "QB"
                );
                let secondQBIndex =
                    sortedPlayers
                        .slice(firstQBIndex + 1)
                        .findIndex((item) => item.position === "QB") +
                    firstQBIndex +
                    1;

                // Check if they fall in the correct ranges
                let isFirstQBIn6To11 = firstQBIndex >= 5 && firstQBIndex <= 10;
                let isSecondQBIn8To12 =
                    secondQBIndex >= 7 && secondQBIndex <= 11;

                // Count total QBs
                let totalQBs = sortedPlayers.filter(
                    (item) => item.position === "QB"
                ).length;
                if (isFirstQBIn6To11 && isSecondQBIn8To12) {
                    if (totalQBs === 2) {
                        rosterConstruction[
                            RosterConstructionType.TwoQBInWindow
                        ] = {
                            numEntries:
                                rosterConstruction[
                                    RosterConstructionType.TwoQBInWindow
                                ].numEntries + 1,
                            entryFees:
                                rosterConstruction[
                                    RosterConstructionType.TwoQBInWindow
                                ].entryFees + contest.entryFee,
                        };
                    }
                    if (totalQBs === 3) {
                        rosterConstruction[
                            RosterConstructionType.ThreeQBInWindow
                        ] = {
                            numEntries:
                                rosterConstruction[
                                    RosterConstructionType.ThreeQBInWindow
                                ].numEntries + 1,
                            entryFees:
                                rosterConstruction[
                                    RosterConstructionType.ThreeQBInWindow
                                ].entryFees + contest.entryFee,
                        };
                    }
                }
                let isFirstQBAfter10 = firstQBIndex > 9;
                if (isFirstQBAfter10 && totalQBs === 3) {
                    rosterConstruction[RosterConstructionType.PuntQBx3] = {
                        numEntries:
                            rosterConstruction[RosterConstructionType.PuntQBx3]
                                .numEntries + 1,
                        entryFees:
                            rosterConstruction[RosterConstructionType.PuntQBx3]
                                .entryFees + contest.entryFee,
                    };
                }

                // Get the number of 'rb' in the first 3 items
                let firstThreeRBs = sortedPlayers
                    .slice(0, 3)
                    .filter((item) => item.position === "RB").length;

                // Check if there are any 'rb' from item 4 to item 8
                let nextRBs = sortedPlayers
                    .slice(3, 8)
                    .filter((item) => item.position === "RB").length;

                // Check if the conditions are met
                if (firstThreeRBs > 0 && nextRBs === 0) {
                    rosterConstruction[RosterConstructionType.HeroRB] = {
                        numEntries:
                            rosterConstruction[RosterConstructionType.HeroRB]
                                .numEntries + 1,
                        entryFees:
                            rosterConstruction[RosterConstructionType.HeroRB]
                                .entryFees + contest.entryFee,
                    };
                }

                // Get the count of 'rb' in the first 2 items
                let firstTwoRBs = sortedPlayers
                    .slice(0, 2)
                    .filter((item) => item.position === "RB").length;

                // Check if there are any 'rb' from item 3 to item 5
                let nextRBs2 = sortedPlayers
                    .slice(2, 5)
                    .filter((item) => item.position === "RB").length;

                if (firstTwoRBs === 2 && nextRBs2 === 0) {
                    rosterConstruction[RosterConstructionType.DoubleHeroRB] = {
                        numEntries:
                            rosterConstruction[
                                RosterConstructionType.DoubleHeroRB
                            ].numEntries + 1,
                        entryFees:
                            rosterConstruction[
                                RosterConstructionType.DoubleHeroRB
                            ].entryFees + contest.entryFee,
                    };
                }

                let firstSevenRBs = sortedPlayers
                    .slice(0, 7)
                    .filter((item) => item.position === "RB").length;
                if (firstSevenRBs === 4) {
                    rosterConstruction[RosterConstructionType.RobustRB] = {
                        numEntries:
                            rosterConstruction[RosterConstructionType.RobustRB]
                                .numEntries + 1,
                        entryFees:
                            rosterConstruction[RosterConstructionType.RobustRB]
                                .entryFees + contest.entryFee,
                    };
                }
                let afterTwelveTEs = sortedPlayers
                    .slice(12)
                    .filter((item) => item.position === "TE").length;
                if (afterTwelveTEs === 3) {
                    rosterConstruction[RosterConstructionType.PuntTEx3] = {
                        numEntries:
                            rosterConstruction[RosterConstructionType.PuntTEx3]
                                .numEntries + 1,
                        entryFees:
                            rosterConstruction[RosterConstructionType.PuntTEx3]
                                .entryFees + contest.entryFee,
                    };
                }

                // Get the count of 'wr' in the first 10 items
                let firstTenWRs = sortedPlayers
                    .slice(0, 10)
                    .filter((item) => item.position === "WR").length;
                if (firstTenWRs === 5) {
                    rosterConstruction[RosterConstructionType.WR5byRound10] = {
                        numEntries:
                            rosterConstruction[
                                RosterConstructionType.WR5byRound10
                            ].numEntries + 1,
                        entryFees:
                            rosterConstruction[
                                RosterConstructionType.WR5byRound10
                            ].entryFees + contest.entryFee,
                    };
                }

                let firstFiveRBs = sortedPlayers
                    .slice(0, 5)
                    .filter((item) => item.position === "RB").length;
                let totalRBs = sortedPlayers.filter(
                    (item) => item.position === "RB"
                ).length;
                if (firstFiveRBs === 3 && totalRBs <= 4) {
                    rosterConstruction[RosterConstructionType.HyperFragileRB] =
                        {
                            numEntries:
                                rosterConstruction[
                                    RosterConstructionType.HyperFragileRB
                                ].numEntries + 1,
                            entryFees:
                                rosterConstruction[
                                    RosterConstructionType.HyperFragileRB
                                ].entryFees + contest.entryFee,
                        };
                }

                if (
                    sortedPlayers
                        .slice(4, 8)
                        .findIndex((item) => item.position === "TE") !== -1
                ) {
                    rosterConstruction[RosterConstructionType.TETier2] = {
                        numEntries:
                            rosterConstruction[RosterConstructionType.TETier2]
                                .numEntries + 1,
                        entryFees:
                            rosterConstruction[RosterConstructionType.TETier2]
                                .entryFees + contest.entryFee,
                    };
                }

                let qbs = sortedPlayers.filter(
                    (item) => item.position === "QB"
                );
                qbs.forEach((qb) => {
                    let numStack = sortedPlayers.filter(
                        (item) => item.team === qb.team
                    ).length;
                    if (numStack > 4) {
                        numStack = 4;
                    }
                    if (metaInformation.teamStacks.hasOwnProperty(qb.team)) {
                        metaInformation.teamStacks[qb.team].totalDrafts += 1;
                        metaInformation.teamStacks[qb.team][numStack] += 1;
                    } else {
                        metaInformation.teamStacks[qb.team] = {
                            totalDrafts: 1,
                            0: 0,
                            1: 0,
                            2: 0,
                            3: 0,
                            4: 0,
                        };
                        metaInformation.teamStacks[qb.team][numStack] += 1;
                    }
                });
            });
            metaInformation.rosterConstruction = rosterConstruction;
            setMetaInformation(metaInformation);
        }
    }, [userContests]);

    // Init TSX.
    if (metaInformation == null) {
        return <div>No information...</div>;
    }
    return (
        <div className="metaViewContainer">
            <div className="metaHeader">
                <div>
                    Fast Draft Entries: {metaInformation.fastDrafts.numEntries}{" "}
                    (${metaInformation.fastDrafts.entryFees})
                </div>
                <div>
                    Slow Draft Entries: {metaInformation.slowDrafts.numEntries}{" "}
                    (${metaInformation.slowDrafts.entryFees})
                </div>
            </div>
            <div className="metaContent">
                <div className="sidebar">
                    <div className="draftSpot">
                        <div className="sectionHeader">Draft Spots</div>
                        {Object.keys(metaInformation.draftSpots).map(
                            (draftSpot) => {
                                return (
                                    <div className="tableGrid">
                                        <div>#{draftSpot}: </div>
                                        <div>
                                            {
                                                metaInformation.draftSpots[
                                                    +draftSpot
                                                ].numEntries
                                            }{" "}
                                            ($
                                            {
                                                metaInformation.draftSpots[
                                                    +draftSpot
                                                ].entryFees
                                            }
                                            )
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                    <div className="draftMonths">
                        <div className="sectionHeader">Draft Months</div>
                        {Object.keys(metaInformation.draftMonths).map(
                            (month) => {
                                return (
                                    <div className="tableGrid">
                                        <div>{month}: </div>
                                        <div>
                                            {
                                                metaInformation.draftMonths[
                                                    month
                                                ].numEntries
                                            }{" "}
                                            ($
                                            {
                                                metaInformation.draftMonths[
                                                    month
                                                ].entryFees
                                            }
                                            )
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                    <div className="rosterConstruction">
                        <div className="sectionHeader">Roster Construction</div>
                        {Object.keys(metaInformation.rosterConstruction).map(
                            (rosterConstructionType) => {
                                return (
                                    <div className="tableGrid">
                                        <div>{rosterConstructionType}: </div>
                                        <div>
                                            {
                                                metaInformation
                                                    .rosterConstruction[
                                                    rosterConstructionType as keyof typeof metaInformation.rosterConstruction
                                                ].numEntries
                                            }{" "}
                                            ($
                                            {
                                                metaInformation
                                                    .rosterConstruction[
                                                    rosterConstructionType as keyof typeof metaInformation.rosterConstruction
                                                ].entryFees
                                            }
                                            )
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
                <div>
                    <div className="stackInfo">
                        <div className="sectionHeader">Stack Info</div>
                        <div className="stackGridContainer">
                            {Object.keys(metaInformation.teamStacks).map(
                                (team) => {
                                    return (
                                        <div className="stackGrid" key={team}>
                                            <div
                                                style={{ textAlign: "center" }}
                                            >
                                                <img
                                                    src={`${team}.webp`}
                                                    alt="teamLogo"
                                                    width={128}
                                                />
                                            </div>
                                            <div>
                                                Total Stacks:{" "}
                                                {
                                                    metaInformation.teamStacks[
                                                        team
                                                    ].totalDrafts
                                                }{" "}
                                                <div>
                                                    QB+0:{" "}
                                                    {
                                                        metaInformation
                                                            .teamStacks[team][0]
                                                    }
                                                </div>
                                                <div>
                                                    QB+1:{" "}
                                                    {
                                                        metaInformation
                                                            .teamStacks[team][1]
                                                    }
                                                </div>
                                                <div>
                                                    QB+2:{" "}
                                                    {
                                                        metaInformation
                                                            .teamStacks[team][2]
                                                    }
                                                </div>
                                                <div>
                                                    QB+3:{" "}
                                                    {
                                                        metaInformation
                                                            .teamStacks[team][3]
                                                    }
                                                </div>
                                                <div>
                                                    QB+4:{" "}
                                                    {
                                                        metaInformation
                                                            .teamStacks[team][4]
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetaInformationView;
