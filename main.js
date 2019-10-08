var gplay = require('google-play-scraper').memoized();
const fs = require('fs');
const json2xls = require('json2xls');

const desiredFields = [
    'genre',
    'appId',
    'title',
    'installs',
    'url',
    'size',
    'score',
    'ratings',
    'developer',
    'version',
    'updated'
];

async function getSingleAppCustomInfos(appId) {
    return await gplay.app({appId: appId, throttle: 1})
        .then(data => {
            return Object.assign({},
                ...desiredFields.map(key => ({[key]:data[key]})),
                {updated : new Date(data.updated).toLocaleDateString("en-US")}
            )
        });
}

// getSingleAppCustomInfos("com.nintendo.zaka").then(console.log);
// getSingleAppCustomInfos("com.nintendo.zaka").then(exportToCsv);

function exportToCsv(data) {
    let xls = json2xls(data);
    fs.writeFileSync('appInfos/infos.xlsx', xls, 'binary');
}

function exportToJson(data) {
    let jsonData = JSON.stringify(data);
    fs.writeFileSync('appInfos/infos.json', jsonData);
}

async function getAppsFromAllCategories(numberOfApps) {
    let selectedApps = [];
    for (let categoryKey in gplay.category) await gplay.list({
        category: categoryKey,
        collection: gplay.collection.TOP_FREE,
        num: numberOfApps
    }).then(function (data) {
        return {
            genre: categoryKey,
            appData: data
        }
    })
        .then(data => selectedApps.push(data))
        .then(console.log('Terminando de mapear a categoria:', categoryKey))
        // .then(console.log(selectedApps))
    return selectedApps;
}


async function process(numberOfApps) {
    let result = [];
    let errors = 0;
    const selectedApps = await getAppsFromAllCategories(numberOfApps);

    for (const genre of selectedApps) {
        for (const app of genre.appData) {
            try {
                await getSingleAppCustomInfos(app.appId)
                    .then(data => {
                        //console.log("Buscando:", data)
                        result.push(data)
                    })
            } catch (e) {
                console.log(e)
                errors++;
                continue;
            }
        }
    }
    console.log('Exportando resultado para arquivo JSON.');
    exportToJson(result);
    console.log('Errors:', errors);
}

process(10);