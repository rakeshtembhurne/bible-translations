require('dotenv').config()
const rp = require('request-promise');
const $ = require('cheerio');
const _ = require('lodash');
const util = require('util');

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});
const queryAsync = util.promisify(connection.query.bind(connection));
connection.connect();

let url = 'https://www.bible.com/en-GB/bible/111/GEN.1.niv';
url = 'https://www.bible.com/en-GB/bible/111/JDG.18.NIV';
const log = data => console.log(JSON.stringify(data, null, 2));
const cleanText = data => data.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');


const books = {
    "GEN": {
        "human": "Genesis",
        "short": "GEN",
        "bookId": 1,
        "g": 1
    },
    "EXO": {
        "human": "Exodus",
        "short": "EXO",
        "bookId": 2,
        "g": 1
    },
    "LEV": {
        "human": "Leviticus",
        "short": "LEV",
        "bookId": 3,
        "g": 1
    },
    "NUM": {
        "human": "Numbers",
        "short": "NUM",
        "bookId": 4,
        "g": 1
    },
    "DEU": {
        "human": "Deuteronomy",
        "short": "DEU",
        "bookId": 5,
        "g": 1
    },
    "JOS": {
        "human": "Joshua",
        "short": "JOS",
        "bookId": 6,
        "g": 2
    },
    "JDG": {
        "human": "Judges",
        "short": "JDG",
        "bookId": 7,
        "g": 2
    },
    "RUT": {
        "human": "Ruth",
        "short": "RUT",
        "bookId": 8,
        "g": 2
    },
    "1SA": {
        "human": "1 Samuel",
        "short": "1SA",
        "bookId": 9,
        "g": 2
    },
    "2SA": {
        "human": "2 Samuel",
        "short": "2SA",
        "bookId": 10,
        "g": 2
    },
    "1KI": {
        "human": "1 Kings",
        "short": "1KI",
        "bookId": 11,
        "g": 2
    },
    "2KI": {
        "human": "2 Kings",
        "short": "2KI",
        "bookId": 12,
        "g": 2
    },
    "1CH": {
        "human": "1 Chronicles",
        "short": "1CH",
        "bookId": 13,
        "g": 2
    },
    "2CH": {
        "human": "2 Chronicles",
        "short": "2CH",
        "bookId": 14,
        "g": 2
    },
    "EZR": {
        "human": "Ezra",
        "short": "EZR",
        "bookId": 15,
        "g": 2
    },
    "NEH": {
        "human": "Nehemiah",
        "short": "NEH",
        "bookId": 16,
        "g": 2
    },
    "EST": {
        "human": "Esther",
        "short": "EST",
        "bookId": 17,
        "g": 2
    },
    "JOB": {
        "human": "Job",
        "short": "JOB",
        "bookId": 18,
        "g": 3
    },
    "undefined": {
        "human": "Song of Solomon",
        "bookId": 22,
        "g": 3
    },
    "PRO": {
        "human": "Proverbs",
        "short": "PRO",
        "bookId": 20,
        "g": 3
    },
    "ECC": {
        "human": "Ecclesiastes",
        "short": "ECC",
        "bookId": 21,
        "g": 3
    },
    "ISA": {
        "human": "Isaiah",
        "short": "ISA",
        "bookId": 23,
        "g": 4
    },
    "JER": {
        "human": "Jeremiah",
        "short": "JER",
        "bookId": 24,
        "g": 4
    },
    "LAM": {
        "human": "Lamentations",
        "short": "LAM",
        "bookId": 25,
        "g": 4
    },
    "EZK": {
        "human": "Ezekiel",
        "short": "EZK",
        "bookId": 26,
        "g": 4
    },
    "DAN": {
        "human": "Daniel",
        "short": "DAN",
        "bookId": 27,
        "g": 4
    },
    "HOS": {
        "human": "Hosea",
        "short": "HOS",
        "bookId": 28,
        "g": 4
    },
    "JOL": {
        "human": "Joel",
        "short": "JOL",
        "bookId": 29,
        "g": 4
    },
    "AMO": {
        "human": "Amos",
        "short": "AMO",
        "bookId": 30,
        "g": 4
    },
    "OBA": {
        "human": "Obadiah",
        "short": "OBA",
        "bookId": 31,
        "g": 4
    },
    "JON": {
        "human": "Jonah",
        "short": "JON",
        "bookId": 32,
        "g": 4
    },
    "MIC": {
        "human": "Micah",
        "short": "MIC",
        "bookId": 33,
        "g": 4
    },
    "NAM": {
        "human": "Nahum",
        "short": "NAM",
        "bookId": 34,
        "g": 4
    },
    "HAB": {
        "human": "Habakkuk",
        "short": "HAB",
        "bookId": 35,
        "g": 4
    },
    "ZEP": {
        "human": "Zephaniah",
        "short": "ZEP",
        "bookId": 36,
        "g": 4
    },
    "HAG": {
        "human": "Haggai",
        "short": "HAG",
        "bookId": 37,
        "g": 4
    },
    "ZEC": {
        "human": "Zechariah",
        "short": "ZEC",
        "bookId": 38,
        "g": 4
    },
    "MAL": {
        "human": "Malachi",
        "short": "MAL",
        "bookId": 39,
        "g": 4
    },
    "MAT": {
        "human": "Matthew",
        "short": "MAT",
        "bookId": 40,
        "g": 5
    },
    "MRK": {
        "human": "Mark",
        "short": "MRK",
        "bookId": 41,
        "g": 5
    },
    "LUK": {
        "human": "Luke",
        "short": "LUK",
        "bookId": 42,
        "g": 5
    },
    "JHN": {
        "human": "John",
        "short": "JHN",
        "bookId": 43,
        "g": 5
    },
    "ACT": {
        "human": "Acts",
        "short": "ACT",
        "bookId": 44,
        "g": 6
    },
    "ROM": {
        "human": "Romans",
        "short": "ROM",
        "bookId": 45,
        "g": 7
    },
    "1CO": {
        "human": "1 Corinthians",
        "short": "1CO",
        "bookId": 46,
        "g": 7
    },
    "2CO": {
        "human": "2 Corinthians",
        "short": "2CO",
        "bookId": 47,
        "g": 7
    },
    "GAL": {
        "human": "Galatians",
        "short": "GAL",
        "bookId": 48,
        "g": 7
    },
    "EPH": {
        "human": "Ephesians",
        "short": "EPH",
        "bookId": 49,
        "g": 7
    },
    "PHP": {
        "human": "Philippians",
        "short": "PHP",
        "bookId": 50,
        "g": 7
    },
    "COL": {
        "human": "Colossians",
        "short": "COL",
        "bookId": 51,
        "g": 7
    },
    "1TH": {
        "human": "1 Thessalonians",
        "short": "1TH",
        "bookId": 52,
        "g": 7
    },
    "2TH": {
        "human": "2 Thessalonians",
        "short": "2TH",
        "bookId": 53,
        "g": 7
    },
    "1TI": {
        "human": "1 Timothy",
        "short": "1TI",
        "bookId": 54,
        "g": 7
    },
    "2TI": {
        "human": "2 Timothy",
        "short": "2TI",
        "bookId": 55,
        "g": 7
    },
    "TIT": {
        "human": "Titus",
        "short": "TIT",
        "bookId": 56,
        "g": 7
    },
    "PHM": {
        "human": "Philemon",
        "short": "PHM",
        "bookId": 57,
        "g": 7
    },
    "HEB": {
        "human": "Hebrews",
        "short": "HEB",
        "bookId": 58,
        "g": 7
    },
    "JAS": {
        "human": "James",
        "short": "JAS",
        "bookId": 59,
        "g": 7
    },
    "1PE": {
        "human": "1 Peter",
        "short": "1PE",
        "bookId": 60,
        "g": 7
    },
    "2PE": {
        "human": "2 Peter",
        "short": "2PE",
        "bookId": 61,
        "g": 7
    },
    "1JN": {
        "human": "1 John",
        "short": "1JN",
        "bookId": 62,
        "g": 7
    },
    "2JN": {
        "human": "2 John",
        "short": "2JN",
        "bookId": 63,
        "g": 7
    },
    "3JN": {
        "human": "3 John",
        "short": "3JN",
        "bookId": 64,
        "g": 7
    },
    "JUD": {
        "human": "Jude",
        "short": "JUD",
        "bookId": 65,
        "g": 7
    },
    "REV": {
        "human": "Revelation",
        "short": "REV",
        "bookId": 66,
        "g": 8
    }
};

const getBiblePage = url => {
    console.log("\nGetting URL", url);
    let nextLink;

    return new Promise((resolve, reject) => {
        rp(url)
        .then(async html => {
            const version = $(".reader .version", html).attr("data-vid");
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
            // log(verses);
            await saveBibleVerses(verses).catch(console.log);

            // Next Link
            const $nextLink = $(".next-arrow a", html);
            if ($nextLink) {
                nextLink = $nextLink.attr("href");
                if (nextLink.indexOf('bible.com') == -1) {
                    nextLink = `${'https://www.bible.com'}${nextLink}`;
                }
            }
            resolve(nextLink);
            // log(verses);
        })
        .catch(err => {
            console.log('There was error in the request, ', err);
            console.log('Had problem with URL', nextLink);
            resolve('');
        })
    })
}

const saveBibleVerses = verses => {
    return new Promise((resolve, reject) => {
        let fields = _.keys(_.first(verses));
        let values = _.map(verses, p => _.values(p));
        const query = {
            sql: 'INSERT INTO ??(??) VALUES ?',
            values: ['t_niv', fields, values]
        }
        connection.query(query, (error, products) => {
            if (error) reject(error);
            else resolve(products);
        })
    })
}

const getBible = async () => {
    let nextUrl = url;

    while (nextUrl) {
        nextUrl = await getBiblePage(nextUrl).catch(console.error);
    }
    
}
getBible();