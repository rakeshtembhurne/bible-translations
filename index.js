require('dotenv').config()
const rp = require('request-promise');
const $ = require('cheerio');
const _ = require('lodash');
const async = require('async');

const {
    saveBibleVerses, 
    getBibleVersionKey,
    tableExists,
    createTable,
    getLastRow,
    bookIdToShorts,
    createBibleVersionKey,
    versionFromIds,
    versionsToIds,
    books, 
    log, 
    logErr,
    cleanText 
}  = require('./dbutil.js');


let url = 'https://www.bible.com/en-GB/bible/111/GEN.1.niv';
url = 'https://www.bible.com/en-GB/bible/111/JDG.18.NIV';

const getBiblePage = (url, book, bookId, chapter, version, versionId) => {
    console.log("\nGetting URL", url);
    let nextLink;

    return new Promise((resolve, reject) => {
        rp(url)
        .then(async html => {
            const chapterUsfm = $(".reader .chapter", html).attr("data-usfm");
            const chapterClass = $(".reader .chapter", html).attr("class");
            let verses = {};
            const $verses = $("span.verse", html);
            $verses.each(function (i, elem) {
                let $this = $(this);

                let label = $this.find(".label").text();
                if (!label) return;

                const verseUsfmRegExp = /([A-Z]+)\.(\d{1,})\.(\d{1,})/;
                let verseUsfm = $this.attr('data-usfm');
                let match = verseUsfm.match(verseUsfmRegExp);
                let symbol, chapter, verse, book, id;
                if (match) {
                    symbol = match[1];
                    chapter = match[2];
                    verse = match[3];
                    book = String(_.get(books, `${symbol}.bookId`));
                    id = `${book.padStart(2,'0')}${chapter.padStart(3,'0')}${verse.padStart(3,'0')}`;

                    let v = {
                        id,
                        b: book,
                        c: chapter,
                        v: verse,
                        t: cleanText($this.find(".content").text()),
                    }
                    // If there's a paragraph in verse, verse appears twice. 
                    // In that case, combine both texts
                    if (id in verses) {
                        let vOld = verses[id];
                        vOld.t += v.t;
                        verses[id] = vOld;
                    } else {
                        verses[id] = v;
                    }
                }
            })
            verses = _.values(verses);
            console.log("Total verses are", _.size(verses));
            // log(verses);
            console.log("VERSEION", version, versionId)
            await saveBibleVerses(verses, `t_${version.toLowerCase()}`).catch(error => console.warn(error.message));

            // Next Link
            const $nextLink = $(".next-arrow a", html);
            if ($nextLink) {
                nextLink = $nextLink.attr("href");
                if (nextLink.indexOf('bible.com') == -1) {
                    nextLink = `${'https://www.bible.com'}${nextLink}`;
                }
            }
            resolve(nextLink);
        })
        .catch(err => {
            console.log('There was error in the request, ', err.message);
            console.log('Had problem with URL', nextLink);
            resolve('');
        })
    })
}

const getBible = async (url, book, bookId, chapter, version, versionId) => {
    let nextUrl = url;
    while (nextUrl) {
        nextUrl = await getBiblePage(nextUrl, book, bookId, chapter, version, versionId).catch(error => console.warn(error.message))
    }
}
// getBible();

const beginScraping = () => {
    getBibleVersionKey()
        .then(tables => {
        async.eachSeries(tables, async table => {
            
            return true;
            
        }, err => {
            console.log(err, "All done");
        })
    })
    .catch(logErr)
}

const scrapeVersion = table => {
    return new Promise(async (resolve, reject) => {
        const version = table.abbreviation;
        const versionId = versionsToIds[version.toLowerCase()];
        
        // Get last row, for starting/resuming part
        let urlStartOrResume = `https://www.bible.com/en-GB/bible/${versionId}/GEN.1.${version}`;
        let lastRow = await getLastRow(table.table).catch(logErr);
        log({ lastRow })
        let book = 'GEN';
        let bookId = 1;
        let chapter = 1;
        if (lastRow && lastRow.id <= 66022021) {
            bookId = lastRow.b;
            book = bookIdToShorts[bookId];
            chapter = lastRow.c;

            urlStartOrResume = `https://www.bible.com/en-GB/bible/${versionId}/${book}.${chapter}.${version}`;

        }
        console.log({version, versionId})
        await getBible(urlStartOrResume, book, bookId, chapter, version, versionId).catch(logErr);

        resolve();
    })
}

const scrapeFromVersions = () => {
    const urlVersions = 'https://www.bible.com/en-GB/versions';
    console.log("Requesting", urlVersions)
    rp(urlVersions)
    .then(html => {
        let $lists = $("article ul.no-bullet li", html).first();
        // let langTitle = $lists.find("a").first().text();

        const tablesToCreate = [];

        const $langLinks = $lists.find("ul li a");
        $langLinks.each(function(i, elem) {
            const $this = $(this);
            const title = $(this).text();
            const titleRegExp = /[a-zA-Z0-9\:\s\-\']+\(([a-zA-Z0-9\-]+)\)$/i;
            const match = title.match(titleRegExp);
            let version = '';
            if (match) {
                version = match[1];
            }
            const href = $this.attr("href");

            tablesToCreate.push({
                table: `t_${version.toLowerCase()}`,
                abbreviation: version,
                language: 'english',
                info_text: title,
                // FIXME: need other good name
                version: '',
                info_url: `https://www.bible.com${href}`,
                publisher: '',
                copyright: '',
                copyright_info: '',
            });
            
            // console.log("\n",{title, href, version});
        })
        // log(tablesToCreate);
        async.eachSeries(tablesToCreate, async table => {
            const exists = await tableExists(table.table).catch(logErr);
            // Create table, it does not exist
            if (!exists) {
                console.log("\nAdding to bible_version_key");
                await createBibleVersionKey([table]).catch(logErr);

                console.log("Creating table");
                await createTable(table.table).catch(logErr);
            }
            await scrapeVersion(table);
            console.log('DONE FOR VERSION', table.abbreviation);
        })

    })
    .catch(logErr);
}
scrapeFromVersions();