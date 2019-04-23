require('dotenv').config()
const rp = require('request-promise');
const $ = require('cheerio');
const _ = require('lodash');
const async = require('async');

const {
    saveIntoTable,
    saveBibleVerses, 
    getBibleVersionKey,
    tableExists,
    createTable,
    getLastRow,
    saveNotes,
    bookIdToShorts,
    tablesToCreate,
    createBibleVersionKey,
    versionFromIds,
    versionsToIds,
    debugData,
    debugJson,
    debugErr,
    books, 
    log, 
    logErr,
    cleanText 
}  = require('./dbutil.js');


let url = 'https://www.bible.com/en-GB/bible/111/GEN.1.niv';
url = 'https://www.bible.com/en-GB/bible/1/GEN.1.KJV';
// Notes
// url = 'https://www.bible.com/en-GB/bible/1/JHN.3.KJV'
// url = 'https://www.bible.com/en-GB/bible/1588/GEN.1.AMP';


const getBiblePage = (url, book, bookId, chapter, version, versionId) => {
    debugData("\nGetting URL: " + url);
    debugJson({url, book, bookId, chapter, version, versionId});
    let nextLink;

    return new Promise((resolve, reject) => {
        rp(url)
        .then(async html => {
            const chapterUsfm = $(".reader .chapter", html).attr("data-usfm");
            const chapterClass = $(".reader .chapter", html).attr("class");
            let verses = {};
            const notes = [];

            let heading = {};
            let $heading = $(".book .chapter .s .heading", html);
            if ($heading.length) {
                heading.t = $heading.text();
                heading.c = chapter;
                heading.b = bookId;
                heading.v = 0;
                heading.id = `${String(bookId).padStart(2,'0')}${String(chapter).padStart(3,'0')}000`;
            }

            const $verses = $("span.verse", html);
            $verses.each(function (i, elem) {
                let $this = $(this);

                let label = $this.find(".label").text();
                if (!label) return;

                const verseUsfmRegExp = /([A-Z]+)\.(\d{1,})\.(\d{1,})/;
                let verseUsfm = $this.attr('data-usfm');
                let match = verseUsfm.match(verseUsfmRegExp);
                let symbol, c, verse, theBook, id;
                if (match) {
                    symbol = match[1];
                    c = match[2];
                    verse = match[3];
                    theBook = String(_.get(books, `${symbol}.bookId`));
                    id = `${String(theBook).padStart(2,'0')}${String(c).padStart(3,'0')}${String(verse).padStart(3,'0')}`;

                    // Main Content
                    const $content = $this.find(".content");
                    let content = '';
                    $content.each(function(i, elem) {
                        const $parentWj = $(this).parent(".wj");
                        const c = $(this).text();
                        if ($parentWj.length) {
                            content += `<red>${c}</red>`;
                        } else {
                            content += c;
                        }
                    });
                    let v = {
                        id,
                        b: theBook,
                        c: c,
                        v: verse,
                        // t: cleanText($this.find(".content").text()),
                        t: content,
                    };
                    // debugJson(JSON.stringify(v));

                    // Notes
                    const $note = $this.find(".note.f");
                    $note.each(function(i, elem) {
                        let n = {};
                        n.book_id = theBook;
                        n.chapter_id = c;
                        n.verse_id = verse;
                        n.created_at = new Date();
                        n.t = $(this).find(".body").text();
                        n.position_count = _.size($(this).prevAll(".content").text());
                        notes.push(n);
                    })
                    
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
            debugData(
                "Total verses are", _.size(verses), 
                ", total notes are", _.size(notes),
                ", heading is", heading && heading.t || '-- none --',
            );;

            // log({verses, notes, heading})

            // Saving headings
            await saveIntoTable(heading, `t_${version.toLowerCase()}`).catch(logErr);
            // Saving verses
            await saveIntoTable(verses, `t_${version.toLowerCase()}`).catch(logErr);
            // Saving notes
            await saveIntoTable(notes, 'notes').catch(logErr);

            // Next Link
            let $nextLink = $(".next-arrow a", html);
            if (!$nextLink) $nextLink = $(".bible-nav-button.nav-right", html);
            
            if ($nextLink) {
                nextLink = $nextLink.attr("href");
                if (nextLink.indexOf('bible.com') == -1) {
                    nextLink = `${'https://www.bible.com'}${nextLink}`;
                }
            }
            resolve(nextLink);
        })
        .catch(err => {
            debugErr('There was error in the request, ', err.message);
            debugErr('Had problem with URL', url);
            resolve();
        })
    })
}

/** 
 *
 */
const getBible = async (url, book, bookId, chapter, version, versionId) => {
    let nextUrl = url;
    while (nextUrl) {
        nextUrl = await getBiblePage(nextUrl, book, bookId, chapter, version, versionId).catch(error => console.warn(error.message))
    }
}

const updateStartUrls = tablesToCreate => {
    return new Promise((resolve, reject) => {
        async.mapLimit(tablesToCreate, 10, (table, tableCb) => {
            debugData("Getting start url from", table.info_url);
            rp(table.info_url)
            .then(html => {
                let $linkReadBible = $("a.solid-button.mobile-full.blue", html);
                if ($linkReadBible) {
                    table.firstPage = `${'https://www.bible.com'}${$linkReadBible.attr("href")}`;
                }
                tableCb(null, table);
            })
            .catch(err => {
                logErr(err);
                tableCb();
            });
        }, (error, results) => {
            if (error) reject(err)
            else resolve(results);
        })
    })
}

const scrapeVersion = table => {
    return new Promise(async (resolve, reject) => {
        const version = table.abbreviation;
        const versionId = versionsToIds[version.toLowerCase()];
        
        // Get last row, for starting/resuming part
        let urlStartOrResume = `https://www.bible.com/en-GB/bible/${versionId}/GEN.1.${version}`;
        let lastRow = await getLastRow(table.table).catch(logErr);
        debugJson({lastRow})
        let book = 'GEN';
        let bookId = 1;
        let chapter = 1;
        if (lastRow && lastRow.id <= 66022021) {
            bookId = lastRow.b;
            book = bookIdToShorts[bookId];
            chapter = lastRow.c;

            urlStartOrResume = `https://www.bible.com/en-GB/bible/${versionId}/${book}.${chapter}.${version}`;

        }
        if ('firstPage' in table) {
            urlStartOrResume = table.firstPage;
        }
        await getBible(urlStartOrResume, book, bookId, chapter, version, versionId).catch(logErr);

        resolve();
    })
}

const getLiveTablesToCreate = () => {
    return new Promise((resolve, reject) => {
        const urlVersions = 'https://www.bible.com/en-GB/versions';
        debugData("Requesting", urlVersions)
        rp(urlVersions)
        .then(html => {
            let $lists = $("article ul.no-bullet li", html).first();
            // let langTitle = $lists.find("a").first().text();

            const tablesToCreate = [];

            const $langLinks = $lists.find("ul li a");
            $langLinks.each(function (i, elem) {
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
            })
            return tablesToCreate;
        })
        .then(resolve)
        .catch(reject)
    })
}

const scrapeFromVersions = () => {
    // FIXME: only for testing
    let theTable = _.find(tablesToCreate, { table: 't_mp1650' });

    async.eachLimit(tablesToCreate, 5, async table => {
        const exists = await tableExists(table.table).catch(logErr);
        // Create table, it does not exist
        if (!exists) {
            debugData("\nAdding to bible_version_key");
            await saveIntoTable([table], 'bible_version_key').catch(logErr);

            debugData("Creating table", table.table);
            await createTable(table.table).catch(logErr);
        }
        await scrapeVersion(table);
        debugData('DONE FOR VERSION', table.abbreviation);
    }, error => {
        debugData("\nDone all tables")
        if (error) {
            debugData("Got some errors");
        }
    })
}
scrapeFromVersions();

// TODO: testing only
// (url, book, bookId, chapter, version, versionId)
// url = 'https://www.bible.com/en-GB/bible/2163/GEN.1.GNV';
// getBiblePage(url, 'PSA', 19, 5, 'MP1650', 1365)
// .then(log)
// .catch(logErr);