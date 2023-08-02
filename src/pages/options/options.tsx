import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import "./options.css";
import moment from "moment";
import PlayerExposureView from "../player-exposure/player-exposure";
import MetaInformationView from "../meta-information/meta-information";

export interface Player {
    id: number;
    adp: number;
    byeWeek: string;
    draftPercentage: number;
    draftableId: number;
    overallSelectionNumber: number;
    playerId: number;
    playerImage50: string;
    playerName: string;
    position: string;
    roundNumber: number;
    selectionNumber: number;
    selectionTime: string;
    team: string;
    teamPositionId: number;
}

export interface UserEnteredContest {
    contestName: string;
    draftDate: string;
    entryFee: number;
    userDraftPosition: number;
    userDraftboard: Player[];
    userKey: string;
    draftType: string;
}

const OptionsPage = () => {
    // Init state.
    const [userContests, setUserContests] = useState<UserEnteredContest[]>([]);
    const [page, setPage] = useState<string>("sync");

    // Sync methods.
    const syncDKPortfolio = async () => {
        console.log("syncing dk portfolio");
        const resp = await chrome.runtime.sendMessage({
            message: "sync_dk_bestball",
        });
        console.log({ resp });

        if (resp.message === "success") {
            setUserContests(resp.data);
            saveToJSONFile(
                resp.data,
                `dk_bestball_portfolio_${moment().format()}.json`
            );
        }
    };

    // Init helpers.
    const saveToJSONFile = (data: object[], fileName: string) => {
        const jsonString = JSON.stringify(data, null, 4);
        const blob = new Blob([jsonString], {
            type: "application/json;charset=utf-8;",
        });

        saveAs(blob, fileName);
    };

    const loadFile = () => {
        const input = document.getElementById("jsonFile") as HTMLInputElement;
        console.log({ input });
        const file = input!.files![0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (event) => {
                const contents = event.target!.result as string;
                const data = JSON.parse(contents);
                console.log({ data });

                setUserContests(data);
            };

            reader.readAsText(file);
        } else {
            console.log("No file selected");
        }
    };

    // Init tsx.
    return (
        <div className="pageContainer">
            <div className="navbar">
                <div
                    className={page === "sync" ? "active-nav-item" : "nav-item"}
                    onClick={() => setPage("sync")}
                >
                    Sync/Upload
                </div>

                <div
                    className={
                        page === "players" ? "active-nav-item" : "nav-item"
                    }
                    onClick={() => setPage("players")}
                >
                    Players
                </div>
                <div
                    className={page === "meta" ? "active-nav-item" : "nav-item"}
                    onClick={() => setPage("meta")}
                >
                    Meta Information
                </div>
            </div>
            {page === "sync" && (
                <>
                    <h1 className="title">
                        DraftKings NFL Best Ball Portfolio Builder
                    </h1>
                    <div className="explainer-text">
                        <ol>
                            <li>
                                Begin by ensuring you are logged into DraftKings
                            </li>
                            <li>
                                If this is your first time using the extension,
                                click Sync. If you alreayd have a file to
                                upload, choose that instead
                            </li>
                            <li>
                                After the extension syncs your data, you will
                                receive a .json file that represents all your
                                contest. Keep that file safe and upload it back
                                here on subsequent visits as its quicker and
                                less error-prone than syncing with DK
                            </li>
                            <li>
                                Upon completion of syncing or uploading, you may
                                view either of the other pages with all the
                                relevant information on them. :)
                            </li>
                        </ol>
                    </div>
                    <div
                        className="sync-button"
                        onClick={() => syncDKPortfolio()}
                    >
                        Sync DK Portfolio
                    </div>
                    <input
                        onChange={loadFile}
                        style={{ display: "none" }}
                        type="file"
                        id="jsonFile"
                        accept=".json"
                        hidden
                    />
                    <div
                        className="sync-button"
                        onClick={() =>
                            document.getElementById("jsonFile")?.click()
                        }
                    >
                        Upload from .JSON
                    </div>
                </>
            )}
            {page === "meta" && (
                <MetaInformationView userContests={userContests} />
            )}
            {page === "players" && (
                <PlayerExposureView userContests={userContests} />
            )}
        </div>
    );
};

export default OptionsPage;
