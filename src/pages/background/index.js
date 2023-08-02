import moment from "moment";

/* Launch options page when chrome extension icon is clicked */
chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

/* Get logging from client scripts */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request, sender, sendResponse);
    if (request.message == null) {
        sendResponse("Invalid request, no message detected");
        return true;
    }
    if (request.message === "sync_dk_bestball") {
        syncDKBestball(sendResponse);
        return true;
    }
});

/* Fetch DK Bestball files */
const syncDKBestball = async (callback) => {
    console.log("syncing dk bestball");

    let returnData = [];

    try {
        const userResp = await fetch(
            "https://api.draftkings.com/sites/US-DK/dashes/v1/dashes/siteNav/users/me.json?format=json&includeTickets=true"
        );
        const user = await userResp.json();

        const userProfileResp = await fetch(
            `https://api.draftkings.com/contests/v1/users/${user.userName}?format=json`
        );
        const userProfile = await userProfileResp.json();

        const enteredContests = userProfile.userProfile.enteredContests;

        let userKey = "";
        for (const contest of enteredContests) {
            const contestDetailUrl = `https://api.draftkings.com/contests/v1/contests/${contest.contestKey}?format=json`;
            const contestDetailResp = await fetch(contestDetailUrl);
            const contestDetail = await contestDetailResp.json();
            console.log({ contestDetail });

            const draftStatusUrl = `https://api.draftkings.com/drafts/v1/${contest.contestKey}/entries/${contest.entryKey}/draftStatus?format=json`;
            const draftStatusResp = await fetch(draftStatusUrl);
            const draftStatus = await draftStatusResp.json();
            console.log({ draftStatus });

            // This is not a bestball contest
            if (draftStatus.errorStatus != null) {
                continue;
            }

            userKey = draftStatus.users.find(
                (userInQuestion) => userInQuestion.displayName === user.userName
            ).userKey;

            const draftablesUrl = `https://api.draftkings.com/draftgroups/v1/draftgroups/${contest.draftGroupId}/draftables?format=json`;
            const draftablesResp = await fetch(draftablesUrl);
            const draftables = await draftablesResp.json();
            // console.log({ draftables });

            // Array of dicts: [{draftableId: 27770201, overallSelectionNumber: 1, playerId: 1069535, roundNumber: 1, selectionNumber: 1, teamPositionId: 3, userKey: <GUID FOR USER>}, ...]
            let draftBoard = draftStatus.draftBoard;
            let userDraftboard = draftBoard
                .filter((db) => db.userKey === userKey)
                .reduce((acc, obj) => {
                    let key = obj["draftableId"];
                    acc[key] = obj[key] || [];
                    acc[key] = obj;
                    return acc;
                }, {});

            // Array of dicts: [{draftableId: 27770321, displayName: 'DeAndre Hopkins', draftStatusAttributes: [{value: '17.6'}, {value: '9th', quality: 'Low}], playerImage50: <URL>}, ...]
            let players = draftables.draftables;
            let filteredPlayers = players.filter((player) =>
                userDraftboard.hasOwnProperty(player.draftableId)
            );

            Object.keys(userDraftboard).forEach((playerDraftableId) => {
                var draftBoardPlayer = userDraftboard[playerDraftableId];
                // console.log({ draftBoardPlayer });

                var foundPlayer = filteredPlayers.find(
                    (p) => p.draftableId === +playerDraftableId
                );
                // console.log({ foundPlayer });

                var adpInfoItem = draftStatus.playerPool.draftablePlayers.find(
                    (p) => p.playerId === foundPlayer.playerId
                );
                // console.log({ adpInfoItem });

                draftBoardPlayer.playerName = foundPlayer.displayName;
                draftBoardPlayer.playerImage50 = foundPlayer.playerImage50;
                draftBoardPlayer.team = foundPlayer.teamAbbreviation;
                draftBoardPlayer.position = foundPlayer.position;
                if (
                    foundPlayer.playerAttributes != null &&
                    foundPlayer.playerAttributes.length > 0
                ) {
                    draftBoardPlayer.byeWeek =
                        foundPlayer.playerAttributes[0].value;
                }

                draftBoardPlayer.adp = adpInfoItem.averageDraftPosition;
                draftBoardPlayer.draftPercentage = adpInfoItem.draftPercentage;
            });

            let bestballDraftItem = {
                draftType:
                    contestDetail.contestDetail.draftSpeedDetail ===
                    "30 sec/pick"
                        ? "fast"
                        : "slow",
                contestName: contestDetail.contestDetail.name,
                entryFee: contestDetail.contestDetail.entryFee,
                draftDate: moment(draftStatus.draftStartTime).format(
                    "MMMM Do YYYY, h:mm:ss a"
                ),
                userDraftboard: Object.values(userDraftboard),
                userDraftPosition:
                    draftBoard.findIndex((db) => db.userKey === userKey) + 1,
            };
            returnData.push(bestballDraftItem);
        }
        callback({
            message: `Successfully fetched ${enteredContests.length} bestball contests for user: ${user.userName}`,
            data: returnData,
        });
    } catch (err) {
        callback({
            message: `An error occurred while syncing your portfolio: ${err}`,
            data: null,
        });
    }
};
