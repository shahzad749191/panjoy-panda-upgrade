const crypto = require('crypto');









async function panjoy_1(){

    const userid = '11654823';

const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOjExNjU0ODIzLCJjb3VudHJ5IjoiUEsiLCJnZW5kZXIiOjEsImlzcyI6ImF1dGgwIiwiY3VycmVudFBrZ0lkIjoyLCJwa2dJZCI6MiwiZXhwIjoyMTAxNzY5NTY2LCJkZXZpY2VJZCI6ImM1ZjI3YzU5LTAyYWItNDM4OC1hYmJjLTEzYTAzN2I4N2E5YiIsImlhdCI6MTc4NjQwOTU2NiwiY2xpZW50X2lkIjoieGNoYXQiLCJqdGkiOiJmZmI0Zjk2ZS0zMjkzLTQ2ZDQtODM5Zi05M2FiZjkwYjE1MmQifQ.cBvt-EjdaWkJl9BoR6UiNUO6ARL8oBYIrwN-2sqCZYxOIG-HWN1dXj5K62kZHNT8adN581Vf6KsKJT_vJYeqFoMadGEuw5-s32MZq2TwunCSbkoSdZOdpTq8wKw0QgNgwlI7Kox1oMvbZrdQ0VAIkao85iCdXuQUnUJGraMbuBqPSVcfHZsTvs5XGB28puqlD0q88OrA1xD-13J5BYc-vA_Mmioz4Ype1at7u3Nz7dUWXJwbv4w3jcxkR0AcXBw4VbLx6IWYlE3n8sb71YHbqnLEkeJIoBfPbP3wrnlItbETxRb64G5NhaVCWphNVfdBgJWNgF6guPxXKrPDfjpHTg';

const FAMILY_ID = 1373;

const BASE_QUERY =
    'userId=11654823' +
    '&deviceId=c5f27c59-02ab-4388-abbc-13a037b87a9b' +
    '&bundleId=com.panjoy.android' +
    '&appVersion=1.7.6' +
    '&osVersion=14' +
    '&locale=en-US' +
    '&lang=en' +
    '&area=US' +
    '&channel=STORE' +
    '&platform=Android' +
    '&timezone=Asia%2FKarachi';


// ============================================================
// HELPERS
// ============================================================

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function generateTraceparent(recorded = true) {

    const version = '00';

    const traceId =
        crypto.randomBytes(16).toString('hex');

    const parentId =
        crypto.randomBytes(8).toString('hex');

    const flags = recorded ? '01' : '00';

    return `${version}-${traceId}-${parentId}-${flags}`;
}


function getHeaders() {

    return {
        'Accept': 'application/json',
        'Accept-Charset': 'UTF-8',
        'Accept-Encoding': 'gzip',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'traceparent': generateTraceparent(),
        'User-Agent': 'ktor-client'
    };
}


// ============================================================
// 1. PLOT SETTLE
//
// Gets:
// - farm amount
// - farm level
// - panda HP
// - panda next amount
// ============================================================

async function sendPlotSettleRequest() {

    const url =
        `https://api.penjoycloud.com/api/v1/homestead/plot/settle?${BASE_QUERY}`;

    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({})
        });

        const res = await response.json();

        const farmAmount =
            Number(
                res.data?.homesteadDto?.account?.farmAmount || 0
            );

        const farmLevel =
            res.data?.homesteadDto?.farmLevel?.level;

        const hp =
            res.data?.homesteadDto?.pandaAttributeDto?.hp;

        const pandaNextAmount =
            Number(
                res.data?.homesteadDto?.pandaLevel?.nextAmount || 0
            );

        const cashDisplay =
            res.data?.cashWallet?.amountDisplay;

        const currency =
            res.data?.cashWallet?.currency || 'PKR';


        console.log('');
        console.log('======================================================');
        console.log(
            `[Plot Settle ${new Date().toLocaleTimeString()}]`
        );
        console.log('HTTP Status:', response.status);
        console.log('Farm Level:', farmLevel ?? 'N/A');
        console.log('Panda HP:', hp ?? 'N/A');
        console.log('Farm Amount:', farmAmount);
        console.log('Panda Next Amount:', pandaNextAmount);
        console.log(
            'Cash Wallet:',
            cashDisplay ?? 'N/A',
            currency
        );
        console.log('======================================================');


        return {
            farmAmount,
            farmLevel,
            hp,
            pandaNextAmount
        };

    } catch (error) {

        console.error(
            '[Plot Settle] Error:',
            error.message
        );

        return null;
    }
}


// ============================================================
// 2. FAMILY RESOURCE OVERVIEW
// ============================================================

async function getFamilyOverview() {

    const url =
        `https://api.penjoycloud.com/api/v1/facade/family/v2/resource/overview` +
        `?familyId=${FAMILY_ID}`;

    try {

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });

        const res = await response.json();

        if (res.status !== 0) {

            console.log(
                '[Family Overview] API error:',
                JSON.stringify(res, null, 2)
            );

            return null;
        }

        const data = res.data;

        console.log('');
        console.log('---------------- FAMILY OVERVIEW ----------------');
        console.log('Family ID:', data?.familyId);
        console.log(
            'Family Bamboo:',
            data?.resourceAmount
        );
        console.log(
            'Donations Used:',
            data?.todayDonateUsed
        );
        console.log(
            'Donations Remaining:',
            data?.todayDonateRemaining
        );
        console.log(
            'Next Donation #:',
            data?.nextDonateNth
        );
        console.log('--------------------------------------------------');

        return data;

    } catch (error) {

        console.error(
            '[Family Overview] Error:',
            error.message
        );

        return null;
    }
}


// ============================================================
// 3. DONATION PREVIEW
// ============================================================

async function getDonationPreview() {

    const url =
        `https://api.penjoycloud.com/api/v1/facade/family/v2/resource/donate/preview` +
        `?familyId=${FAMILY_ID}` +
        `&resourceType=BAMBOO`;

    try {

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });

        const res = await response.json();

        if (res.status !== 0) {

            console.log(
                '[Donation Preview] API error:',
                JSON.stringify(res, null, 2)
            );

            return null;
        }

        const data = res.data;

        console.log('');
        console.log('--------------- DONATION PREVIEW ---------------');
        console.log('Donation #:', data?.nth);
        console.log('Required Bamboo:', data?.costAmount);
        console.log(
            'Reward Bamboo:',
            data?.rewards?.find(
                r => r.rewardType === 'FAMILY_RESOURCE'
            )?.rewardAmount ?? 'N/A'
        );
        console.log(
            'Reward Coins:',
            data?.rewards?.find(
                r => r.rewardType === 'FAMILY_COIN'
            )?.rewardAmount ?? 'N/A'
        );
        console.log(
            'Preview Expires:',
            data?.previewExpiresAt
        );
        console.log('------------------------------------------------');

        return data;

    } catch (error) {

        console.error(
            '[Donation Preview] Error:',
            error.message
        );

        return null;
    }
}


// ============================================================
// 4. FAMILY BAMBOO DONATION
// ============================================================

async function donateBamboo(amount, previewToken) {

    const url =
        `https://api.penjoycloud.com/api/v1/facade/family/v2/resource/donate`;

    const payload = {
        familyId: FAMILY_ID,
        amount: amount,
        resourceType: 'BAMBOO',
        previewToken: previewToken
    };

    try {

        console.log('');
        console.log('**************** DONATING BAMBOO ****************');
        console.log('Family ID:', FAMILY_ID);
        console.log('Amount:', amount);
        console.log('**************************************************');

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        const res = await response.json();

        console.log('');
        console.log('--------------- DONATION RESULT ----------------');
        console.log(JSON.stringify(res, null, 2));
        console.log('-------------------------------------------------');


        if (
            response.ok &&
            res.status === 0 &&
            res.data?.status === 'SUCCESS'
        ) {

            console.log(
                `✅ Donation #${res.data.nth} successful`
            );

            console.log(
                `Bamboo donated: ${res.data.costAmount}`
            );

            console.log(
                `Remaining donations today: ${res.data.todayDonateRemaining}`
            );

            return res.data;
        }

        console.log('❌ Donation was not successful.');

        return null;

    } catch (error) {

        console.error(
            '[Donation] Error:',
            error.message
        );

        return null;
    }
}


// ============================================================
// 5. PANDA ADD EXP
//
// Logic taken from your multi-account code:
//
// if farmAmount > panda_next_amount + 500
//     ↓
// add-exp
// ============================================================

async function addPandaExp(amount) {

    const url =
        `https://api.penjoycloud.com/api/v1/homestead/panda/level/add-exp?${BASE_QUERY}`;

    const payload = {
        userId: userid,
        amount: amount
    };

    try {

        console.log('');
        console.log('**************** PANDA ADD EXP ****************');
        console.log('User ID:', userid);
        console.log('Amount:', amount);
        console.log('************************************************');

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        const res = await response.json();

        console.log(
            '[Panda Add EXP]',
            JSON.stringify(res, null, 2)
        );

        if (!response.ok) {

            console.log(
                '❌ Panda EXP request failed:',
                response.status
            );

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            '[Panda Add EXP] Error:',
            error.message
        );

        return false;
    }
}


// ============================================================
// 6. PANDA UPGRADE
// ============================================================

async function upgradePanda() {

    const url =
        `https://api.penjoycloud.com/api/v1/homestead/panda/level/upgrade?${BASE_QUERY}`;

    try {

        console.log('');
        console.log('**************** PANDA UPGRADE ****************');
        console.log('************************************************');

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({})
        });

        const res = await response.json();

        console.log(
            '[Panda Upgrade]',
            JSON.stringify(res, null, 2)
        );

        if (!response.ok) {

            console.log(
                '❌ Panda upgrade failed:',
                response.status
            );

            return false;
        }

        console.log('✅ Panda upgrade request completed.');

        return true;

    } catch (error) {

        console.error(
            '[Panda Upgrade] Error:',
            error.message
        );

        return false;
    }
}


// ============================================================
// 7. PANDA DECISION
//
// IMPORTANT:
//
// Panda is checked ONLY after the daily family donation
// limit has been completed.
//
// Condition from your original code:
//
// farmAmount > pandaNextAmount + 500
//
// Then:
//     add EXP
//     wait 5 seconds
//     upgrade Panda
// ============================================================

async function checkAndUpgradePanda(
    farmAmount,
    pandaNextAmount
) {

    const currentBamboo =
        Number(farmAmount || 0);

    const requiredPandaAmount =
        Number(pandaNextAmount || 0);


    if (
        !Number.isFinite(currentBamboo) ||
        !Number.isFinite(requiredPandaAmount) ||
        requiredPandaAmount <= 0
    ) {

        console.log(
            '[Panda] Invalid bamboo or next amount.'
        );

        return;
    }


    console.log('');
    console.log('=============== PANDA CHECK ===============');
    console.log('Current Bamboo:', currentBamboo);
    console.log('Panda Next Amount:', requiredPandaAmount);
    console.log(
        'Required With Safety Buffer:',
        requiredPandaAmount + 500
    );
    console.log('===========================================');


    // Same condition from your original code.
    if (
        currentBamboo <=
        requiredPandaAmount + 500
    ) {

        console.log(
            `⏳ Panda upgrade skipped. Need more bamboo.`
        );

        return;
    }


    console.log(
        '🐼 Enough bamboo for Panda upgrade.'
    );


    // --------------------------------------------------------
    // Add EXP
    // --------------------------------------------------------

    const expAdded =
        await addPandaExp(
            requiredPandaAmount
        );


    if (!expAdded) {

        console.log(
            '❌ Panda EXP was not added.'
        );

        return;
    }


    // --------------------------------------------------------
    // Same 5 second wait from your original code
    // --------------------------------------------------------

    console.log(
        '⏳ Waiting 5 seconds before Panda upgrade...'
    );

    await wait(5000);


    // --------------------------------------------------------
    // Upgrade
    // --------------------------------------------------------

    await upgradePanda();
}


// ============================================================
// 8. DONATION + PANDA DECISION
//
// Main logic:
//
// A) Get family overview
// B) If daily limit NOT complete:
//      attempt family donation
// C) After donation:
//      if remaining becomes 0,
//      Panda check runs
//
// If daily limit was already 0 when this function starts,
// Panda check runs immediately.
// ============================================================

async function checkAndDonate(
    initialFarmAmount,
    pandaNextAmount
) {

    let currentBamboo =
        Number(initialFarmAmount || 0);


    if (!Number.isFinite(currentBamboo)) {

        console.log(
            '[Donation] Invalid bamboo amount.'
        );

        return;
    }


    console.log('');
    console.log(
        `🌿 Current Bamboo: ${currentBamboo}`
    );


    // --------------------------------------------------------
    // Get family status
    // --------------------------------------------------------

    let overview =
        await getFamilyOverview();


    if (!overview) {
        return;
    }


    let donationsRemaining =
        Number(
            overview.todayDonateRemaining || 0
        );


    // --------------------------------------------------------
    // DAILY LIMIT ALREADY COMPLETE
    // --------------------------------------------------------

    if (donationsRemaining <= 0) {

        console.log(
            '⛔ Daily family donation limit is already complete.'
        );

        console.log(
            '🐼 Checking Panda upgrade...'
        );

        await checkAndUpgradePanda(
            currentBamboo,
            pandaNextAmount
        );

        return;
    }


    // --------------------------------------------------------
    // Get donation preview
    // --------------------------------------------------------

    const preview =
        await getDonationPreview();


    if (!preview) {
        return;
    }


    const requiredAmount =
        Number(preview.costAmount || 0);


    if (
        !Number.isFinite(requiredAmount) ||
        requiredAmount <= 0
    ) {

        console.log(
            '[Donation] Invalid costAmount.'
        );

        return;
    }


    console.log('');
    console.log('============== DONATION CHECK ==============');
    console.log(
        'Current Bamboo:',
        currentBamboo
    );
    console.log(
        'Required Bamboo:',
        requiredAmount
    );
    console.log(
        'Donation #:',
        preview.nth
    );
    console.log(
        'Difference:',
        currentBamboo - requiredAmount
    );
    console.log('============================================');


    // --------------------------------------------------------
    // Not enough bamboo
    // --------------------------------------------------------

    if (
        currentBamboo <
        requiredAmount
    ) {

        console.log(
            `⏳ Not enough bamboo. Need ${
                requiredAmount - currentBamboo
            } more.`
        );

        return;
    }


    // --------------------------------------------------------
    // Preview expiry
    // --------------------------------------------------------

    if (preview.previewExpiresAt) {

        const expiresAt =
            Number(preview.previewExpiresAt);

        if (
            Number.isFinite(expiresAt) &&
            Date.now() >= expiresAt
        ) {

            console.log(
                '⚠️ Preview expired. Getting fresh preview...'
            );

            const freshPreview =
                await getDonationPreview();

            if (!freshPreview) {
                return;
            }

            return await checkAndDonate(
                currentBamboo,
                pandaNextAmount
            );
        }
    }


    // --------------------------------------------------------
    // FAMILY DONATION
    // --------------------------------------------------------

    const donation =
        await donateBamboo(
            requiredAmount,
            preview.previewToken
        );


    if (!donation) {
        return;
    }


    // --------------------------------------------------------
    // Update local bamboo
    // --------------------------------------------------------

    currentBamboo -=
        Number(
            donation.costAmount ||
            requiredAmount
        );


    donationsRemaining =
        Number(
            donation.todayDonateRemaining ?? 0
        );


    console.log('');
    console.log(
        `🌿 Estimated Bamboo after donation: ${currentBamboo}`
    );

    console.log(
        'Donations remaining:',
        donationsRemaining
    );


    // --------------------------------------------------------
    // DAILY LIMIT COMPLETED AFTER DONATION
    //
    // This is the important added logic.
    // --------------------------------------------------------

    if (
        donationsRemaining <= 0
    ) {

        console.log('');
        console.log(
            '🎯 Daily family donation limit completed.'
        );

        console.log(
            '🐼 Starting Panda check...'
        );


        await checkAndUpgradePanda(
            currentBamboo,
            pandaNextAmount
        );

    } else {

        console.log(
            'ℹ️ Daily family donation limit is not complete yet.'
        );

    }


    console.log(
        '✅ Donation cycle completed.'
    );
}


// ============================================================
// 9. PRESENCE HEARTBEAT
// ============================================================

async function sendHeartbeatRequest() {

    const url =
        `https://api.penjoycloud.com/api/v1/user/presence/heartbeat?${BASE_QUERY}`;

    const payload = {

        appState: 'FOREGROUND',

        scene: 'IDLE',

        rtm: {

            links: [
                {
                    provider: 'NETEASE',
                    connected: true,
                    pingMs: -1
                },
                {
                    provider: 'EMQX',
                    connected: true,
                    pingMs: -1
                }
            ]

        }
    };


    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        await response.json();

        console.log(
            `[${new Date().toLocaleTimeString()}] [Heartbeat] Status: ${response.status}`
        );

    } catch (error) {

        console.error(
            '[Heartbeat] Error:',
            error.message
        );
    }
}


// ============================================================
// 10. PLOT SETTLE LOOP
// ============================================================

async function startPlotSettleLoop() {

    let secondsToWait1 = 0;

    const DEFAULT_INTERVAL_MS =
        150 * 1000;


    while (true) {

        try {

            const startTime =
                Math.floor(
                    Math.random() * 5
                ) + 1;


            // ------------------------------------------------
            // Plot settle
            // ------------------------------------------------

            const result =
                await sendPlotSettleRequest();


            // ------------------------------------------------
            // Donation + Panda logic
            // ------------------------------------------------

            if (
                result &&
                result.farmAmount !== undefined &&
                result.farmAmount !== null
            ) {

                await checkAndDonate(
                    result.farmAmount,
                    result.pandaNextAmount
                );
            }


            // ------------------------------------------------
            // Plot timing
            // ------------------------------------------------

            let nextIntervalMs =
                DEFAULT_INTERVAL_MS;


            if (
                result &&
                typeof result.farmLevel === 'number'
            ) {

                const level =
                    result.farmLevel;


                if (level < 5) {

                    secondsToWait1 = 30;

                } else if (level === 5) {

                    secondsToWait1 = 40;

                } else if (level === 6) {

                    secondsToWait1 = 60;

                } else if (
                    level > 6 &&
                    level < 20
                ) {

                    secondsToWait1 =
                        90 +
                        (level - 7) * 30;

               }
                else if (level >= 20 && level < 30) {

    secondsToWait1 =
        510 +
        (level - 20) * 60;

} else if (level >= 30) {

    // Level 30 = 13:30
    // Each next level adds 30 seconds
    secondsToWait1 =
        810 +
        (level - 30) * 30;
}

                


                const secondsToWait =
                    secondsToWait1 +
                    startTime;


                nextIntervalMs =
                    secondsToWait * 1000;


                const mins =
                    Math.floor(
                        secondsToWait / 60
                    );

                const secs =
                    secondsToWait % 60;


                console.log(
                    `[Level ${level}] Next Plot Settle in ${mins}m ${secs}s`
                );

            } else {

                console.log(
                    `[Farm Level missing] Fallback: ${
                        DEFAULT_INTERVAL_MS / 1000
                    }s`
                );
            }


            await wait(
                nextIntervalMs
            );

        } catch (error) {

            console.error(
                '[Plot Loop] Unexpected error:',
                error.message
            );

            await wait(
                DEFAULT_INTERVAL_MS
            );
        }
    }
}


// ============================================================
// 11. HEARTBEAT LOOP
// ============================================================

async function startHeartbeatLoop() {

    const INTERVAL_30_SECS =
        30 * 1000;


    while (true) {

        try {

            await sendHeartbeatRequest();

        } catch (error) {

            console.error(
                '[Heartbeat Loop] Error:',
                error.message
            );
        }

        await wait(
            INTERVAL_30_SECS
        );
    }
}


// ============================================================
// START
// ============================================================

console.log('');
console.log('======================================================');
console.log('          PENJOY SINGLE ACCOUNT BOT');
console.log('======================================================');
console.log('User ID:', userid);
console.log('Family ID:', FAMILY_ID);
console.log('Family Donation: ENABLED');
console.log('Panda Upgrade: AFTER DAILY DONATION LIMIT');
console.log('======================================================');
console.log('');


startPlotSettleLoop();
startHeartbeatLoop();






}

//panjoy 2
async function panjoy_2(){

    const userid = 'panjoy_2';    //change karna

const TOKEN = 'panjoy_2';     //change karna

const FAMILY_ID = 1373;

const BASE_QUERY =
    'userId=panjoy_2' +   //change karna
    '&deviceId=c5f27c59-02ab-4388-abbc-13a037b87a9b' +    //change karna
    '&bundleId=com.panjoy.android' +
    '&appVersion=1.7.6' +
    '&osVersion=14' +
    '&locale=en-US' +
    '&lang=en' +
    '&area=US' +
    '&channel=STORE' +
    '&platform=Android' +
    '&timezone=Asia%2FKarachi';


// ============================================================
// HELPERS
// ============================================================

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function generateTraceparent(recorded = true) {

    const version = '00';

    const traceId =
        crypto.randomBytes(16).toString('hex');

    const parentId =
        crypto.randomBytes(8).toString('hex');

    const flags = recorded ? '01' : '00';

    return `${version}-${traceId}-${parentId}-${flags}`;
}


function getHeaders() {

    return {
        'Accept': 'application/json',
        'Accept-Charset': 'UTF-8',
        'Accept-Encoding': 'gzip',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'traceparent': generateTraceparent(),
        'User-Agent': 'ktor-client'
    };
}


// ============================================================
// 1. PLOT SETTLE
//
// Gets:
// - farm amount
// - farm level
// - panda HP
// - panda next amount
// ============================================================

async function sendPlotSettleRequest() {

    const url =
        `https://api.penjoycloud.com/api/v1/homestead/plot/settle?${BASE_QUERY}`;

    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({})
        });

        const res = await response.json();

        const farmAmount =
            Number(
                res.data?.homesteadDto?.account?.farmAmount || 0
            );

        const farmLevel =
            res.data?.homesteadDto?.farmLevel?.level;

        const hp =
            res.data?.homesteadDto?.pandaAttributeDto?.hp;

        const pandaNextAmount =
            Number(
                res.data?.homesteadDto?.pandaLevel?.nextAmount || 0
            );

        const cashDisplay =
            res.data?.cashWallet?.amountDisplay;

        const currency =
            res.data?.cashWallet?.currency || 'PKR';


        console.log('');
        console.log('======================================================');
        console.log(
            `[Plot Settle ${new Date().toLocaleTimeString()}]`
        );
        console.log('HTTP Status:', response.status);
        console.log('Farm Level:', farmLevel ?? 'N/A');
        console.log('Panda HP:', hp ?? 'N/A');
        console.log('Farm Amount:', farmAmount);
        console.log('Panda Next Amount:', pandaNextAmount);
        console.log(
            'Cash Wallet:',
            cashDisplay ?? 'N/A',
            currency
        );
        console.log('======================================================');


        return {
            farmAmount,
            farmLevel,
            hp,
            pandaNextAmount
        };

    } catch (error) {

        console.error(
            '[Plot Settle] Error:',
            error.message
        );

        return null;
    }
}


// ============================================================
// 2. FAMILY RESOURCE OVERVIEW
// ============================================================

async function getFamilyOverview() {

    const url =
        `https://api.penjoycloud.com/api/v1/facade/family/v2/resource/overview` +
        `?familyId=${FAMILY_ID}`;

    try {

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });

        const res = await response.json();

        if (res.status !== 0) {

            console.log(
                '[Family Overview] API error:',
                JSON.stringify(res, null, 2)
            );

            return null;
        }

        const data = res.data;

        console.log('');
        console.log('---------------- FAMILY OVERVIEW ----------------');
        console.log('Family ID:', data?.familyId);
        console.log(
            'Family Bamboo:',
            data?.resourceAmount
        );
        console.log(
            'Donations Used:',
            data?.todayDonateUsed
        );
        console.log(
            'Donations Remaining:',
            data?.todayDonateRemaining
        );
        console.log(
            'Next Donation #:',
            data?.nextDonateNth
        );
        console.log('--------------------------------------------------');

        return data;

    } catch (error) {

        console.error(
            '[Family Overview] Error:',
            error.message
        );

        return null;
    }
}


// ============================================================
// 3. DONATION PREVIEW
// ============================================================

async function getDonationPreview() {

    const url =
        `https://api.penjoycloud.com/api/v1/facade/family/v2/resource/donate/preview` +
        `?familyId=${FAMILY_ID}` +
        `&resourceType=BAMBOO`;

    try {

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });

        const res = await response.json();

        if (res.status !== 0) {

            console.log(
                '[Donation Preview] API error:',
                JSON.stringify(res, null, 2)
            );

            return null;
        }

        const data = res.data;

        console.log('');
        console.log('--------------- DONATION PREVIEW ---------------');
        console.log('Donation #:', data?.nth);
        console.log('Required Bamboo:', data?.costAmount);
        console.log(
            'Reward Bamboo:',
            data?.rewards?.find(
                r => r.rewardType === 'FAMILY_RESOURCE'
            )?.rewardAmount ?? 'N/A'
        );
        console.log(
            'Reward Coins:',
            data?.rewards?.find(
                r => r.rewardType === 'FAMILY_COIN'
            )?.rewardAmount ?? 'N/A'
        );
        console.log(
            'Preview Expires:',
            data?.previewExpiresAt
        );
        console.log('------------------------------------------------');

        return data;

    } catch (error) {

        console.error(
            '[Donation Preview] Error:',
            error.message
        );

        return null;
    }
}


// ============================================================
// 4. FAMILY BAMBOO DONATION
// ============================================================

async function donateBamboo(amount, previewToken) {

    const url =
        `https://api.penjoycloud.com/api/v1/facade/family/v2/resource/donate`;

    const payload = {
        familyId: FAMILY_ID,
        amount: amount,
        resourceType: 'BAMBOO',
        previewToken: previewToken
    };

    try {

        console.log('');
        console.log('**************** DONATING BAMBOO ****************');
        console.log('Family ID:', FAMILY_ID);
        console.log('Amount:', amount);
        console.log('**************************************************');

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        const res = await response.json();

        console.log('');
        console.log('--------------- DONATION RESULT ----------------');
        console.log(JSON.stringify(res, null, 2));
        console.log('-------------------------------------------------');


        if (
            response.ok &&
            res.status === 0 &&
            res.data?.status === 'SUCCESS'
        ) {

            console.log(
                `✅ Donation #${res.data.nth} successful`
            );

            console.log(
                `Bamboo donated: ${res.data.costAmount}`
            );

            console.log(
                `Remaining donations today: ${res.data.todayDonateRemaining}`
            );

            return res.data;
        }

        console.log('❌ Donation was not successful.');

        return null;

    } catch (error) {

        console.error(
            '[Donation] Error:',
            error.message
        );

        return null;
    }
}


// ============================================================
// 5. PANDA ADD EXP
//
// Logic taken from your multi-account code:
//
// if farmAmount > panda_next_amount + 500
//     ↓
// add-exp
// ============================================================

async function addPandaExp(amount) {

    const url =
        `https://api.penjoycloud.com/api/v1/homestead/panda/level/add-exp?${BASE_QUERY}`;

    const payload = {
        userId: userid,
        amount: amount
    };

    try {

        console.log('');
        console.log('**************** PANDA ADD EXP ****************');
        console.log('User ID:', userid);
        console.log('Amount:', amount);
        console.log('************************************************');

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        const res = await response.json();

        console.log(
            '[Panda Add EXP]',
            JSON.stringify(res, null, 2)
        );

        if (!response.ok) {

            console.log(
                '❌ Panda EXP request failed:',
                response.status
            );

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            '[Panda Add EXP] Error:',
            error.message
        );

        return false;
    }
}


// ============================================================
// 6. PANDA UPGRADE
// ============================================================

async function upgradePanda() {

    const url =
        `https://api.penjoycloud.com/api/v1/homestead/panda/level/upgrade?${BASE_QUERY}`;

    try {

        console.log('');
        console.log('**************** PANDA UPGRADE ****************');
        console.log('************************************************');

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({})
        });

        const res = await response.json();

        console.log(
            '[Panda Upgrade]',
            JSON.stringify(res, null, 2)
        );

        if (!response.ok) {

            console.log(
                '❌ Panda upgrade failed:',
                response.status
            );

            return false;
        }

        console.log('✅ Panda upgrade request completed.');

        return true;

    } catch (error) {

        console.error(
            '[Panda Upgrade] Error:',
            error.message
        );

        return false;
    }
}


// ============================================================
// 7. PANDA DECISION
//
// IMPORTANT:
//
// Panda is checked ONLY after the daily family donation
// limit has been completed.
//
// Condition from your original code:
//
// farmAmount > pandaNextAmount + 500
//
// Then:
//     add EXP
//     wait 5 seconds
//     upgrade Panda
// ============================================================

async function checkAndUpgradePanda(
    farmAmount,
    pandaNextAmount
) {

    const currentBamboo =
        Number(farmAmount || 0);

    const requiredPandaAmount =
        Number(pandaNextAmount || 0);


    if (
        !Number.isFinite(currentBamboo) ||
        !Number.isFinite(requiredPandaAmount) ||
        requiredPandaAmount <= 0
    ) {

        console.log(
            '[Panda] Invalid bamboo or next amount.'
        );

        return;
    }


    console.log('');
    console.log('=============== PANDA CHECK ===============');
    console.log('Current Bamboo:', currentBamboo);
    console.log('Panda Next Amount:', requiredPandaAmount);
    console.log(
        'Required With Safety Buffer:',
        requiredPandaAmount + 500
    );
    console.log('===========================================');


    // Same condition from your original code.
    if (
        currentBamboo <=
        requiredPandaAmount + 500
    ) {

        console.log(
            `⏳ Panda upgrade skipped. Need more bamboo.`
        );

        return;
    }


    console.log(
        '🐼 Enough bamboo for Panda upgrade.'
    );


    // --------------------------------------------------------
    // Add EXP
    // --------------------------------------------------------

    const expAdded =
        await addPandaExp(
            requiredPandaAmount
        );


    if (!expAdded) {

        console.log(
            '❌ Panda EXP was not added.'
        );

        return;
    }


    // --------------------------------------------------------
    // Same 5 second wait from your original code
    // --------------------------------------------------------

    console.log(
        '⏳ Waiting 5 seconds before Panda upgrade...'
    );

    await wait(5000);


    // --------------------------------------------------------
    // Upgrade
    // --------------------------------------------------------

    await upgradePanda();
}


// ============================================================
// 8. DONATION + PANDA DECISION
//
// Main logic:
//
// A) Get family overview
// B) If daily limit NOT complete:
//      attempt family donation
// C) After donation:
//      if remaining becomes 0,
//      Panda check runs
//
// If daily limit was already 0 when this function starts,
// Panda check runs immediately.
// ============================================================

async function checkAndDonate(
    initialFarmAmount,
    pandaNextAmount
) {

    let currentBamboo =
        Number(initialFarmAmount || 0);


    if (!Number.isFinite(currentBamboo)) {

        console.log(
            '[Donation] Invalid bamboo amount.'
        );

        return;
    }


    console.log('');
    console.log(
        `🌿 Current Bamboo: ${currentBamboo}`
    );


    // --------------------------------------------------------
    // Get family status
    // --------------------------------------------------------

    let overview =
        await getFamilyOverview();


    if (!overview) {
        return;
    }


    let donationsRemaining =
        Number(
            overview.todayDonateRemaining || 0
        );


    // --------------------------------------------------------
    // DAILY LIMIT ALREADY COMPLETE
    // --------------------------------------------------------

    if (donationsRemaining <= 0) {

        console.log(
            '⛔ Daily family donation limit is already complete.'
        );

        console.log(
            '🐼 Checking Panda upgrade...'
        );

        await checkAndUpgradePanda(
            currentBamboo,
            pandaNextAmount
        );

        return;
    }


    // --------------------------------------------------------
    // Get donation preview
    // --------------------------------------------------------

    const preview =
        await getDonationPreview();


    if (!preview) {
        return;
    }


    const requiredAmount =
        Number(preview.costAmount || 0);


    if (
        !Number.isFinite(requiredAmount) ||
        requiredAmount <= 0
    ) {

        console.log(
            '[Donation] Invalid costAmount.'
        );

        return;
    }


    console.log('');
    console.log('============== DONATION CHECK ==============');
    console.log(
        'Current Bamboo:',
        currentBamboo
    );
    console.log(
        'Required Bamboo:',
        requiredAmount
    );
    console.log(
        'Donation #:',
        preview.nth
    );
    console.log(
        'Difference:',
        currentBamboo - requiredAmount
    );
    console.log('============================================');


    // --------------------------------------------------------
    // Not enough bamboo
    // --------------------------------------------------------

    if (
        currentBamboo <
        requiredAmount
    ) {

        console.log(
            `⏳ Not enough bamboo. Need ${
                requiredAmount - currentBamboo
            } more.`
        );

        return;
    }


    // --------------------------------------------------------
    // Preview expiry
    // --------------------------------------------------------

    if (preview.previewExpiresAt) {

        const expiresAt =
            Number(preview.previewExpiresAt);

        if (
            Number.isFinite(expiresAt) &&
            Date.now() >= expiresAt
        ) {

            console.log(
                '⚠️ Preview expired. Getting fresh preview...'
            );

            const freshPreview =
                await getDonationPreview();

            if (!freshPreview) {
                return;
            }

            return await checkAndDonate(
                currentBamboo,
                pandaNextAmount
            );
        }
    }


    // --------------------------------------------------------
    // FAMILY DONATION
    // --------------------------------------------------------

    const donation =
        await donateBamboo(
            requiredAmount,
            preview.previewToken
        );


    if (!donation) {
        return;
    }


    // --------------------------------------------------------
    // Update local bamboo
    // --------------------------------------------------------

    currentBamboo -=
        Number(
            donation.costAmount ||
            requiredAmount
        );


    donationsRemaining =
        Number(
            donation.todayDonateRemaining ?? 0
        );


    console.log('');
    console.log(
        `🌿 Estimated Bamboo after donation: ${currentBamboo}`
    );

    console.log(
        'Donations remaining:',
        donationsRemaining
    );


    // --------------------------------------------------------
    // DAILY LIMIT COMPLETED AFTER DONATION
    //
    // This is the important added logic.
    // --------------------------------------------------------

    if (
        donationsRemaining <= 0
    ) {

        console.log('');
        console.log(
            '🎯 Daily family donation limit completed.'
        );

        console.log(
            '🐼 Starting Panda check...'
        );


        await checkAndUpgradePanda(
            currentBamboo,
            pandaNextAmount
        );

    } else {

        console.log(
            'ℹ️ Daily family donation limit is not complete yet.'
        );

    }


    console.log(
        '✅ Donation cycle completed.'
    );
}


// ============================================================
// 9. PRESENCE HEARTBEAT
// ============================================================

async function sendHeartbeatRequest() {

    const url =
        `https://api.penjoycloud.com/api/v1/user/presence/heartbeat?${BASE_QUERY}`;

    const payload = {

        appState: 'FOREGROUND',

        scene: 'IDLE',

        rtm: {

            links: [
                {
                    provider: 'NETEASE',
                    connected: true,
                    pingMs: -1
                },
                {
                    provider: 'EMQX',
                    connected: true,
                    pingMs: -1
                }
            ]

        }
    };


    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        await response.json();

        console.log(
            `[${new Date().toLocaleTimeString()}] [Heartbeat] Status: ${response.status}`
        );

    } catch (error) {

        console.error(
            '[Heartbeat] Error:',
            error.message
        );
    }
}


// ============================================================
// 10. PLOT SETTLE LOOP
// ============================================================

async function startPlotSettleLoop() {

    let secondsToWait1 = 0;

    const DEFAULT_INTERVAL_MS =
        150 * 1000;


    while (true) {

        try {

            const startTime =
                Math.floor(
                    Math.random() * 5
                ) + 1;


            // ------------------------------------------------
            // Plot settle
            // ------------------------------------------------

            const result =
                await sendPlotSettleRequest();


            // ------------------------------------------------
            // Donation + Panda logic
            // ------------------------------------------------

            if (
                result &&
                result.farmAmount !== undefined &&
                result.farmAmount !== null
            ) {

                await checkAndDonate(
                    result.farmAmount,
                    result.pandaNextAmount
                );
            }


            // ------------------------------------------------
            // Plot timing
            // ------------------------------------------------

            let nextIntervalMs =
                DEFAULT_INTERVAL_MS;


            if (
                result &&
                typeof result.farmLevel === 'number'
            ) {

                const level =
                    result.farmLevel;


                if (level < 5) {

                    secondsToWait1 = 30;

                } else if (level === 5) {

                    secondsToWait1 = 40;

                } else if (level === 6) {

                    secondsToWait1 = 60;

                } else if (
                    level > 6 &&
                    level < 20
                ) {

                    secondsToWait1 =
                        90 +
                        (level - 7) * 30;

                } else if (level >= 20) {

                    secondsToWait1 =
                        510 +
                        (level - 20) * 60;
                }


                const secondsToWait =
                    secondsToWait1 +
                    startTime;


                nextIntervalMs =
                    secondsToWait * 1000;


                const mins =
                    Math.floor(
                        secondsToWait / 60
                    );

                const secs =
                    secondsToWait % 60;


                console.log(
                    `[Level ${level}] Next Plot Settle in ${mins}m ${secs}s`
                );

            } else {

                console.log(
                    `[Farm Level missing] Fallback: ${
                        DEFAULT_INTERVAL_MS / 1000
                    }s`
                );
            }


            await wait(
                nextIntervalMs
            );

        } catch (error) {

            console.error(
                '[Plot Loop] Unexpected error:',
                error.message
            );

            await wait(
                DEFAULT_INTERVAL_MS
            );
        }
    }
}


// ============================================================
// 11. HEARTBEAT LOOP
// ============================================================

async function startHeartbeatLoop() {

    const INTERVAL_30_SECS =
        30 * 1000;


    while (true) {

        try {

            await sendHeartbeatRequest();

        } catch (error) {

            console.error(
                '[Heartbeat Loop] Error:',
                error.message
            );
        }

        await wait(
            INTERVAL_30_SECS
        );
    }
}


// ============================================================
// START
// ============================================================

console.log('');
console.log('======================================================');
console.log('          PENJOY SINGLE ACCOUNT BOT');
console.log('======================================================');
console.log('User ID:', userid);
console.log('Family ID:', FAMILY_ID);
console.log('Family Donation: ENABLED');
console.log('Panda Upgrade: AFTER DAILY DONATION LIMIT');
console.log('======================================================');
console.log('');


startPlotSettleLoop();
startHeartbeatLoop();






}


async function panjoy_3(){

    const userid = 'panjoy_3';    //change karna

const TOKEN = 'panjoy_3';     //change karna

const FAMILY_ID = 1373;

const BASE_QUERY =
    'userId=panjoy_3' +   //change karna
    '&deviceId=c5f27c59-02ab-4388-abbc-13a037b87a9b' +    //change karna
    '&bundleId=com.panjoy.android' +
    '&appVersion=1.7.6' +
    '&osVersion=14' +
    '&locale=en-US' +
    '&lang=en' +
    '&area=US' +
    '&channel=STORE' +
    '&platform=Android' +
    '&timezone=Asia%2FKarachi';


// ============================================================
// HELPERS
// ============================================================

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function generateTraceparent(recorded = true) {

    const version = '00';

    const traceId =
        crypto.randomBytes(16).toString('hex');

    const parentId =
        crypto.randomBytes(8).toString('hex');

    const flags = recorded ? '01' : '00';

    return `${version}-${traceId}-${parentId}-${flags}`;
}


function getHeaders() {

    return {
        'Accept': 'application/json',
        'Accept-Charset': 'UTF-8',
        'Accept-Encoding': 'gzip',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'traceparent': generateTraceparent(),
        'User-Agent': 'ktor-client'
    };
}


// ============================================================
// 1. PLOT SETTLE
//
// Gets:
// - farm amount
// - farm level
// - panda HP
// - panda next amount
// ============================================================

async function sendPlotSettleRequest() {

    const url =
        `https://api.penjoycloud.com/api/v1/homestead/plot/settle?${BASE_QUERY}`;

    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({})
        });

        const res = await response.json();

        const farmAmount =
            Number(
                res.data?.homesteadDto?.account?.farmAmount || 0
            );

        const farmLevel =
            res.data?.homesteadDto?.farmLevel?.level;

        const hp =
            res.data?.homesteadDto?.pandaAttributeDto?.hp;

        const pandaNextAmount =
            Number(
                res.data?.homesteadDto?.pandaLevel?.nextAmount || 0
            );

        const cashDisplay =
            res.data?.cashWallet?.amountDisplay;

        const currency =
            res.data?.cashWallet?.currency || 'PKR';


        console.log('');
        console.log('======================================================');
        console.log(
            `[Plot Settle ${new Date().toLocaleTimeString()}]`
        );
        console.log('HTTP Status:', response.status);
        console.log('Farm Level:', farmLevel ?? 'N/A');
        console.log('Panda HP:', hp ?? 'N/A');
        console.log('Farm Amount:', farmAmount);
        console.log('Panda Next Amount:', pandaNextAmount);
        console.log(
            'Cash Wallet:',
            cashDisplay ?? 'N/A',
            currency
        );
        console.log('======================================================');


        return {
            farmAmount,
            farmLevel,
            hp,
            pandaNextAmount
        };

    } catch (error) {

        console.error(
            '[Plot Settle] Error:',
            error.message
        );

        return null;
    }
}


// ============================================================
// 2. FAMILY RESOURCE OVERVIEW
// ============================================================

async function getFamilyOverview() {

    const url =
        `https://api.penjoycloud.com/api/v1/facade/family/v2/resource/overview` +
        `?familyId=${FAMILY_ID}`;

    try {

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });

        const res = await response.json();

        if (res.status !== 0) {

            console.log(
                '[Family Overview] API error:',
                JSON.stringify(res, null, 2)
            );

            return null;
        }

        const data = res.data;

        console.log('');
        console.log('---------------- FAMILY OVERVIEW ----------------');
        console.log('Family ID:', data?.familyId);
        console.log(
            'Family Bamboo:',
            data?.resourceAmount
        );
        console.log(
            'Donations Used:',
            data?.todayDonateUsed
        );
        console.log(
            'Donations Remaining:',
            data?.todayDonateRemaining
        );
        console.log(
            'Next Donation #:',
            data?.nextDonateNth
        );
        console.log('--------------------------------------------------');

        return data;

    } catch (error) {

        console.error(
            '[Family Overview] Error:',
            error.message
        );

        return null;
    }
}


// ============================================================
// 3. DONATION PREVIEW
// ============================================================

async function getDonationPreview() {

    const url =
        `https://api.penjoycloud.com/api/v1/facade/family/v2/resource/donate/preview` +
        `?familyId=${FAMILY_ID}` +
        `&resourceType=BAMBOO`;

    try {

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });

        const res = await response.json();

        if (res.status !== 0) {

            console.log(
                '[Donation Preview] API error:',
                JSON.stringify(res, null, 2)
            );

            return null;
        }

        const data = res.data;

        console.log('');
        console.log('--------------- DONATION PREVIEW ---------------');
        console.log('Donation #:', data?.nth);
        console.log('Required Bamboo:', data?.costAmount);
        console.log(
            'Reward Bamboo:',
            data?.rewards?.find(
                r => r.rewardType === 'FAMILY_RESOURCE'
            )?.rewardAmount ?? 'N/A'
        );
        console.log(
            'Reward Coins:',
            data?.rewards?.find(
                r => r.rewardType === 'FAMILY_COIN'
            )?.rewardAmount ?? 'N/A'
        );
        console.log(
            'Preview Expires:',
            data?.previewExpiresAt
        );
        console.log('------------------------------------------------');

        return data;

    } catch (error) {

        console.error(
            '[Donation Preview] Error:',
            error.message
        );

        return null;
    }
}


// ============================================================
// 4. FAMILY BAMBOO DONATION
// ============================================================

async function donateBamboo(amount, previewToken) {

    const url =
        `https://api.penjoycloud.com/api/v1/facade/family/v2/resource/donate`;

    const payload = {
        familyId: FAMILY_ID,
        amount: amount,
        resourceType: 'BAMBOO',
        previewToken: previewToken
    };

    try {

        console.log('');
        console.log('**************** DONATING BAMBOO ****************');
        console.log('Family ID:', FAMILY_ID);
        console.log('Amount:', amount);
        console.log('**************************************************');

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        const res = await response.json();

        console.log('');
        console.log('--------------- DONATION RESULT ----------------');
        console.log(JSON.stringify(res, null, 2));
        console.log('-------------------------------------------------');


        if (
            response.ok &&
            res.status === 0 &&
            res.data?.status === 'SUCCESS'
        ) {

            console.log(
                `✅ Donation #${res.data.nth} successful`
            );

            console.log(
                `Bamboo donated: ${res.data.costAmount}`
            );

            console.log(
                `Remaining donations today: ${res.data.todayDonateRemaining}`
            );

            return res.data;
        }

        console.log('❌ Donation was not successful.');

        return null;

    } catch (error) {

        console.error(
            '[Donation] Error:',
            error.message
        );

        return null;
    }
}


// ============================================================
// 5. PANDA ADD EXP
//
// Logic taken from your multi-account code:
//
// if farmAmount > panda_next_amount + 500
//     ↓
// add-exp
// ============================================================

async function addPandaExp(amount) {

    const url =
        `https://api.penjoycloud.com/api/v1/homestead/panda/level/add-exp?${BASE_QUERY}`;

    const payload = {
        userId: userid,
        amount: amount
    };

    try {

        console.log('');
        console.log('**************** PANDA ADD EXP ****************');
        console.log('User ID:', userid);
        console.log('Amount:', amount);
        console.log('************************************************');

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        const res = await response.json();

        console.log(
            '[Panda Add EXP]',
            JSON.stringify(res, null, 2)
        );

        if (!response.ok) {

            console.log(
                '❌ Panda EXP request failed:',
                response.status
            );

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            '[Panda Add EXP] Error:',
            error.message
        );

        return false;
    }
}


// ============================================================
// 6. PANDA UPGRADE
// ============================================================

async function upgradePanda() {

    const url =
        `https://api.penjoycloud.com/api/v1/homestead/panda/level/upgrade?${BASE_QUERY}`;

    try {

        console.log('');
        console.log('**************** PANDA UPGRADE ****************');
        console.log('************************************************');

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({})
        });

        const res = await response.json();

        console.log(
            '[Panda Upgrade]',
            JSON.stringify(res, null, 2)
        );

        if (!response.ok) {

            console.log(
                '❌ Panda upgrade failed:',
                response.status
            );

            return false;
        }

        console.log('✅ Panda upgrade request completed.');

        return true;

    } catch (error) {

        console.error(
            '[Panda Upgrade] Error:',
            error.message
        );

        return false;
    }
}


// ============================================================
// 7. PANDA DECISION
//
// IMPORTANT:
//
// Panda is checked ONLY after the daily family donation
// limit has been completed.
//
// Condition from your original code:
//
// farmAmount > pandaNextAmount + 500
//
// Then:
//     add EXP
//     wait 5 seconds
//     upgrade Panda
// ============================================================

async function checkAndUpgradePanda(
    farmAmount,
    pandaNextAmount
) {

    const currentBamboo =
        Number(farmAmount || 0);

    const requiredPandaAmount =
        Number(pandaNextAmount || 0);


    if (
        !Number.isFinite(currentBamboo) ||
        !Number.isFinite(requiredPandaAmount) ||
        requiredPandaAmount <= 0
    ) {

        console.log(
            '[Panda] Invalid bamboo or next amount.'
        );

        return;
    }


    console.log('');
    console.log('=============== PANDA CHECK ===============');
    console.log('Current Bamboo:', currentBamboo);
    console.log('Panda Next Amount:', requiredPandaAmount);
    console.log(
        'Required With Safety Buffer:',
        requiredPandaAmount + 500
    );
    console.log('===========================================');


    // Same condition from your original code.
    if (
        currentBamboo <=
        requiredPandaAmount + 500
    ) {

        console.log(
            `⏳ Panda upgrade skipped. Need more bamboo.`
        );

        return;
    }


    console.log(
        '🐼 Enough bamboo for Panda upgrade.'
    );


    // --------------------------------------------------------
    // Add EXP
    // --------------------------------------------------------

    const expAdded =
        await addPandaExp(
            requiredPandaAmount
        );


    if (!expAdded) {

        console.log(
            '❌ Panda EXP was not added.'
        );

        return;
    }


    // --------------------------------------------------------
    // Same 5 second wait from your original code
    // --------------------------------------------------------

    console.log(
        '⏳ Waiting 5 seconds before Panda upgrade...'
    );

    await wait(5000);


    // --------------------------------------------------------
    // Upgrade
    // --------------------------------------------------------

    await upgradePanda();
}


// ============================================================
// 8. DONATION + PANDA DECISION
//
// Main logic:
//
// A) Get family overview
// B) If daily limit NOT complete:
//      attempt family donation
// C) After donation:
//      if remaining becomes 0,
//      Panda check runs
//
// If daily limit was already 0 when this function starts,
// Panda check runs immediately.
// ============================================================

async function checkAndDonate(
    initialFarmAmount,
    pandaNextAmount
) {

    let currentBamboo =
        Number(initialFarmAmount || 0);


    if (!Number.isFinite(currentBamboo)) {

        console.log(
            '[Donation] Invalid bamboo amount.'
        );

        return;
    }


    console.log('');
    console.log(
        `🌿 Current Bamboo: ${currentBamboo}`
    );


    // --------------------------------------------------------
    // Get family status
    // --------------------------------------------------------

    let overview =
        await getFamilyOverview();


    if (!overview) {
        return;
    }


    let donationsRemaining =
        Number(
            overview.todayDonateRemaining || 0
        );


    // --------------------------------------------------------
    // DAILY LIMIT ALREADY COMPLETE
    // --------------------------------------------------------

    if (donationsRemaining <= 0) {

        console.log(
            '⛔ Daily family donation limit is already complete.'
        );

        console.log(
            '🐼 Checking Panda upgrade...'
        );

        await checkAndUpgradePanda(
            currentBamboo,
            pandaNextAmount
        );

        return;
    }


    // --------------------------------------------------------
    // Get donation preview
    // --------------------------------------------------------

    const preview =
        await getDonationPreview();


    if (!preview) {
        return;
    }


    const requiredAmount =
        Number(preview.costAmount || 0);


    if (
        !Number.isFinite(requiredAmount) ||
        requiredAmount <= 0
    ) {

        console.log(
            '[Donation] Invalid costAmount.'
        );

        return;
    }


    console.log('');
    console.log('============== DONATION CHECK ==============');
    console.log(
        'Current Bamboo:',
        currentBamboo
    );
    console.log(
        'Required Bamboo:',
        requiredAmount
    );
    console.log(
        'Donation #:',
        preview.nth
    );
    console.log(
        'Difference:',
        currentBamboo - requiredAmount
    );
    console.log('============================================');


    // --------------------------------------------------------
    // Not enough bamboo
    // --------------------------------------------------------

    if (
        currentBamboo <
        requiredAmount
    ) {

        console.log(
            `⏳ Not enough bamboo. Need ${
                requiredAmount - currentBamboo
            } more.`
        );

        return;
    }


    // --------------------------------------------------------
    // Preview expiry
    // --------------------------------------------------------

    if (preview.previewExpiresAt) {

        const expiresAt =
            Number(preview.previewExpiresAt);

        if (
            Number.isFinite(expiresAt) &&
            Date.now() >= expiresAt
        ) {

            console.log(
                '⚠️ Preview expired. Getting fresh preview...'
            );

            const freshPreview =
                await getDonationPreview();

            if (!freshPreview) {
                return;
            }

            return await checkAndDonate(
                currentBamboo,
                pandaNextAmount
            );
        }
    }


    // --------------------------------------------------------
    // FAMILY DONATION
    // --------------------------------------------------------

    const donation =
        await donateBamboo(
            requiredAmount,
            preview.previewToken
        );


    if (!donation) {
        return;
    }


    // --------------------------------------------------------
    // Update local bamboo
    // --------------------------------------------------------

    currentBamboo -=
        Number(
            donation.costAmount ||
            requiredAmount
        );


    donationsRemaining =
        Number(
            donation.todayDonateRemaining ?? 0
        );


    console.log('');
    console.log(
        `🌿 Estimated Bamboo after donation: ${currentBamboo}`
    );

    console.log(
        'Donations remaining:',
        donationsRemaining
    );


    // --------------------------------------------------------
    // DAILY LIMIT COMPLETED AFTER DONATION
    //
    // This is the important added logic.
    // --------------------------------------------------------

    if (
        donationsRemaining <= 0
    ) {

        console.log('');
        console.log(
            '🎯 Daily family donation limit completed.'
        );

        console.log(
            '🐼 Starting Panda check...'
        );


        await checkAndUpgradePanda(
            currentBamboo,
            pandaNextAmount
        );

    } else {

        console.log(
            'ℹ️ Daily family donation limit is not complete yet.'
        );

    }


    console.log(
        '✅ Donation cycle completed.'
    );
}


// ============================================================
// 9. PRESENCE HEARTBEAT
// ============================================================

async function sendHeartbeatRequest() {

    const url =
        `https://api.penjoycloud.com/api/v1/user/presence/heartbeat?${BASE_QUERY}`;

    const payload = {

        appState: 'FOREGROUND',

        scene: 'IDLE',

        rtm: {

            links: [
                {
                    provider: 'NETEASE',
                    connected: true,
                    pingMs: -1
                },
                {
                    provider: 'EMQX',
                    connected: true,
                    pingMs: -1
                }
            ]

        }
    };


    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        await response.json();

        console.log(
            `[${new Date().toLocaleTimeString()}] [Heartbeat] Status: ${response.status}`
        );

    } catch (error) {

        console.error(
            '[Heartbeat] Error:',
            error.message
        );
    }
}


// ============================================================
// 10. PLOT SETTLE LOOP
// ============================================================

async function startPlotSettleLoop() {

    let secondsToWait1 = 0;

    const DEFAULT_INTERVAL_MS =
        150 * 1000;


    while (true) {

        try {

            const startTime =
                Math.floor(
                    Math.random() * 5
                ) + 1;


            // ------------------------------------------------
            // Plot settle
            // ------------------------------------------------

            const result =
                await sendPlotSettleRequest();


            // ------------------------------------------------
            // Donation + Panda logic
            // ------------------------------------------------

            if (
                result &&
                result.farmAmount !== undefined &&
                result.farmAmount !== null
            ) {

                await checkAndDonate(
                    result.farmAmount,
                    result.pandaNextAmount
                );
            }


            // ------------------------------------------------
            // Plot timing
            // ------------------------------------------------

            let nextIntervalMs =
                DEFAULT_INTERVAL_MS;


            if (
                result &&
                typeof result.farmLevel === 'number'
            ) {

                const level =
                    result.farmLevel;


                if (level < 5) {

                    secondsToWait1 = 30;

                } else if (level === 5) {

                    secondsToWait1 = 40;

                } else if (level === 6) {

                    secondsToWait1 = 60;

                } else if (
                    level > 6 &&
                    level < 20
                ) {

                    secondsToWait1 =
                        90 +
                        (level - 7) * 30;

                } else if (level >= 20) {

                    secondsToWait1 =
                        510 +
                        (level - 20) * 60;
                }


                const secondsToWait =
                    secondsToWait1 +
                    startTime;


                nextIntervalMs =
                    secondsToWait * 1000;


                const mins =
                    Math.floor(
                        secondsToWait / 60
                    );

                const secs =
                    secondsToWait % 60;


                console.log(
                    `[Level ${level}] Next Plot Settle in ${mins}m ${secs}s`
                );

            } else {

                console.log(
                    `[Farm Level missing] Fallback: ${
                        DEFAULT_INTERVAL_MS / 1000
                    }s`
                );
            }


            await wait(
                nextIntervalMs
            );

        } catch (error) {

            console.error(
                '[Plot Loop] Unexpected error:',
                error.message
            );

            await wait(
                DEFAULT_INTERVAL_MS
            );
        }
    }
}


// ============================================================
// 11. HEARTBEAT LOOP
// ============================================================

async function startHeartbeatLoop() {

    const INTERVAL_30_SECS =
        30 * 1000;


    while (true) {

        try {

            await sendHeartbeatRequest();

        } catch (error) {

            console.error(
                '[Heartbeat Loop] Error:',
                error.message
            );
        }

        await wait(
            INTERVAL_30_SECS
        );
    }
}


// ============================================================
// START
// ============================================================

console.log('');
console.log('======================================================');
console.log('          PENJOY SINGLE ACCOUNT BOT');
console.log('======================================================');
console.log('User ID:', userid);
console.log('Family ID:', FAMILY_ID);
console.log('Family Donation: ENABLED');
console.log('Panda Upgrade: AFTER DAILY DONATION LIMIT');
console.log('======================================================');
console.log('');


startPlotSettleLoop();
startHeartbeatLoop();






}









function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAllWithDelay() {
    console.time("Total Time");

    const functions = [
       panjoy_1,
      // panjoy_2,
     //  panjoy_3

        
    ];

    const promises = [];

    for (const fn of functions) {
        promises.push(fn());      // Start function
        await delay(3000);       // Wait 10 seconds before starting the next
    }

    // Wait for all functions to finish
    await Promise.all(promises);

    console.timeEnd("Total Time");
}

runAllWithDelay();