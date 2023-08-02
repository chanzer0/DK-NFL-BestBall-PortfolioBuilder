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

    const [successMsg, setSuccessMsg] = useState<string>("");
    const [infoMsg, setInfoMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    // Sync methods.
    const syncDKPortfolio = async () => {
        setErrorMsg("");
        setInfoMsg(
            "Syncing DK Portfolio... Estimated wait time is about half a second per contest you've entered."
        );
        const resp = await chrome.runtime.sendMessage({
            message: "sync_dk_bestball",
        });
        console.log({ resp });
        setInfoMsg("");
        if (resp.message.toLowerCase().indexOf("success") >= 0) {
            setUserContests(resp.data);
            saveToJSONFile(
                resp.data,
                `dk_bestball_portfolio_${moment().format()}.json`
            );
            setSuccessMsg(resp.message);
            setErrorMsg("");
        } else {
            setSuccessMsg("");
            setErrorMsg(resp.message);
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
                setSuccessMsg(
                    `Successfully loaded ${data.length} contest from your file!`
                );
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
                                Begin by ensuring you are logged into
                                DraftKings, and are not actively in a BestBall
                                draft.
                            </li>
                            <li>
                                If this is your first time using the extension,
                                click "SYNC DK PORTFOLIO". If you alreayd have a
                                file to upload, click "UPLOAD FROM .JSON"
                            </li>
                            <li>
                                After the extension syncs your data, you will
                                receive a .json file that represents all your
                                contest data. Keep that file safe and upload it
                                back here on subsequent visits as its quicker
                                and less error-prone than syncing with DK
                            </li>
                            <li>
                                Upon completion of syncing or uploading, you may
                                view either of the other pages with all the
                                relevant information on them. :)
                            </li>
                            <li>
                                If you have any questions, comments, or feature
                                suggestions, feel free to reach out to me on{" "}
                                <a href="https://twitter.com/chan0_">Twitter</a>
                                ,{" "}
                                <a href="https://github.com/chanzer0">Github</a>{" "}
                                or on Discord (username: chanzero, userID:
                                112803416689963008)
                            </li>
                        </ol>
                    </div>
                    {successMsg.length > 0 && (
                        <div className="success-msg">{successMsg}</div>
                    )}
                    {infoMsg.length > 0 && (
                        <div className="info-msg">{infoMsg}</div>
                    )}
                    {errorMsg.length > 0 && (
                        <div className="error-msg">{errorMsg}</div>
                    )}
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

                    <small className="dono-txt">
                        Are you finding value in this tool? It's made possible
                        by the generosity of users like you. If you're able to,
                        a small donation can make a big difference in helping me
                        maintain and enhance this open-source resource. No
                        obligation, only if you feel inclined to do so. Paypal:{" "}
                        <a href="https://paypal.me/seansailer?country.x=US&locale.x=en_US">
                            https://paypal.me/seansailer?country.x=US&locale.x=en_US
                        </a>
                    </small>
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
