var gplay = require('google-play-scraper');
const json2csv = require('json2csv');
const fs = require('fs');
const json2xls = require('json2xls');

// const fields = ['field1', 'field2', 'field3'];


// gplay.list({
//     category: gplay.category.GAME_ACTION,
//     collection: gplay.collection.TOP_FREE,
//     num: 1
// })
//     .then(console.log, console.log);

async function getCategories() {
    const categories = await gplay.categories();
    console.log(categories, categories.length);
    return categories;
}

async function getTopFreeAppsFromCategory(category, numberOfApps) {
    const apps = await gplay.list({
        category: category,
        collection: gplay.collection.TOP_FREE,
        num: numberOfApps
    });

    console.log(apps);
}

// getCategories();
// getTopFreeAppsFromCategory("gplay.category."+"GAME_ACTION", 2);

// gplay.categories().then(
//     function (data) {
//         console.log(data)
//     });

// gplay.categories().then(
//     function (data) {
//         cat = data[0];
//         gplay.list({
//         category: "gplay.category." + cat,
//         collection: gplay.collection.TOP_FREE,
//         num: 10
//     })
//         .then(console.log, console.log);
//     });

// FUNCIONA
// for (let categoryKey in gplay.category) {
//     gplay.list({
//     category: categoryKey,
//     collection: gplay.collection.TOP_FREE,
//     num: 1
// })
//         .then(console.log);
// }

const desiredFields = [
    'appId',
    'title',
    'genre',
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
    return await gplay.app({appId: appId})
        .then(data => {
            return Object.assign({},
                ...desiredFields.map(key => ({[key]:data[key]})),
                {updated : new Date(data.updated).toLocaleDateString("en-US")}
            )
        });
}

// getSingleAppCustomInfos("com.nintendo.zaka").then(console.log);
// getSingleAppCustomInfos("com.nintendo.zaka").then(exportToCsv);

const opts = { desiredFields };

// function exportToCsv(data) {
//     try {
//         const csv = parse(data, opts);
//         console.log(csv);
//         fs.writeFile("appInfos/"+data.appId+".csv", csv, function(err) {
//             if (err) throw err;
//             console.log(data.appId + ' salvo.');
//         });
//     } catch (err) {
//         console.error(err);
//     }
// }

function exportToCsv(data) {
    let xls = json2xls(data);
    fs.writeFileSync('appInfos/infos.xlsx', xls, 'binary');
}

function exportToJson(data) {
    let jsonData = JSON.stringify(data);
    fs.writeFileSync('appInfos/infos.json', jsonData);
}

// gplay.app({appId: appId}).then(console.log);

let selectedApps = [];

// FUNCIONANDO
// async function getAppsFromAllCategories(numberOfApps) {
//     for (let categoryKey in gplay.category) {
//         Promise.all(await gplay.list({
//             category: categoryKey,
//             collection: gplay.collection.TOP_FREE,
//             num: numberOfApps
//         })
//         ).then(function (values) {
//             return selectedApps.push(values);
//         })
//     }
//     console.log(selectedApps);
//     exportToJson(selectedApps);
// }

async function getAppsFromAllCategories(numberOfApps) {
    for (let categoryKey in gplay.category) {
        await gplay.list({
                category: categoryKey,
                collection: gplay.collection.TOP_FREE,
                num: numberOfApps
            }).then(function (data) {
                return {
                    genre : categoryKey,
                    appData : data
                }
        })
            .then(data => selectedApps.push(data))
            .then(console.log)
    }
    console.log(selectedApps);
    exportToJson(selectedApps);
    // exportToCsv(selectedApps);
}

getAppsFromAllCategories(10);


