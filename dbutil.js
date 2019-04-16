const util = require('util');
const _ = require('lodash');

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const queryAsync = util.promisify(connection.query.bind(connection));
connection.connect();


exports.saveBibleVerses = (verses, tableName) => {
    return new Promise((resolve, reject) => {
        let fields = _.keys(_.first(verses));
        let values = _.map(verses, p => _.values(p));
        const query = {
            sql: 'INSERT INTO ??(??) VALUES ?',
            values: [tableName, fields, values]
        }
        connection.query(query, (error, products) => {
            if (error) reject(error);
            else resolve();
        })
    })
}

exports.saveIntoTable = (verses, tableName) => {
    return new Promise((resolve, reject) => {
        if (_.size(verses)) {
            let fields = _.keys(_.first(verses));
            let values = _.map(verses, p => _.values(p));
            const query = {
                sql: 'INSERT INTO ??(??) VALUES ?',
                values: [tableName, fields, values]
            }
            connection.query(query, (error, products) => {
                if (error) reject(error);
                else resolve();
            })
        } else {
            resolve();
        }
    })
}

exports.saveNotes = (notes) => {
    return new Promise((resolve, reject) => {
        if (!_.size(notes)) {
            resolve();
        } else {
            let fields = _.keys(_.first(notes));
            let values = _.map(notes, p => _.values(p));
            const query = {
                sql: 'INSERT INTO ??(??) VALUES ?',
                values: ['notes', fields, values]
            }
            connection.query(query, (error, products) => {
                if (error) reject(error);
                else resolve(products);
            })
        }
    })
}

exports.createBibleVersionKey = verses => {
    return new Promise((resolve, reject) => {
        let fields = _.keys(_.first(verses));
        let values = _.map(verses, p => _.values(p));
        const query = {
            sql: 'INSERT INTO ??(??) VALUES ?',
            values: ['bible_version_key', fields, values]
        }
        connection.query(query, (error, products) => {
            if (error) reject(error);
            else resolve();
        })
    })
}

exports.getBibleVersionKey = verses => {
    return new Promise((resolve, reject) => {
        const query = {
            sql: 'SELECT ??, ??, ?? FROM ??',
            values: ['id', 'table', 'abbreviation', 'bible_version_key']
        }
        connection.query(query, (error, products) => {
            if (error) reject(error);
            else resolve(products);
        })
    })
}

exports.tableExists = tableName => {
    return new Promise((resolve, reject) => {
        const query = {
            sql: 'SHOW TABLES LIKE ?',
            values: [tableName]
        }
        connection.query(query, (error, table) => {
            if (error) reject(error);
            else if (_.size(table)) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    })
}
exports.createTable = tableName => {
    return new Promise((resolve, reject) => {
        const query = {
            sql: 'CREATE TABLE ?? ( ?? int(8) unsigned zerofill NOT NULL, ?? int(11) NOT NULL, ?? int(11) NOT NULL, ?? int(11) NOT NULL, ?? text NOT NULL, PRIMARY KEY (??), UNIQUE KEY ?? (??), KEY ?? (??) ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci',
            values: [tableName, 'id', 'b', 'c', 'v', 't', 'id', 'id_2', 'id', 'id', 'id']
        }
        connection.query(query, (error, table) => {
            if (error) reject(error);
            resolve(table)
        })
    })
}

exports.getLastRow = tableName => {
    return new Promise((resolve, reject) => {
        const query = {
            sql: 'SELECT * FROM ?? ORDER BY ?? DESC LIMIT 1',
            values: [tableName, 'id']
        }
        connection.query(query, (error, verses) => {
            if (error) reject(error);
            else if (_.size(verses)) {
                resolve(_.first(verses));
            } else {
                resolve([]);
            }
        })
    })
}

exports.books = {
    "GEN": { "human": "Genesis", "short": "GEN", "bookId": 1, "g": 1 },
    "EXO": { "human": "Exodus", "short": "EXO", "bookId": 2, "g": 1 },
    "LEV": { "human": "Leviticus", "short": "LEV", "bookId": 3, "g": 1 },
    "NUM": { "human": "Numbers", "short": "NUM", "bookId": 4, "g": 1 },
    "DEU": { "human": "Deuteronomy", "short": "DEU", "bookId": 5, "g": 1 },
    "JOS": { "human": "Joshua", "short": "JOS", "bookId": 6, "g": 2 },
    "JDG": { "human": "Judges", "short": "JDG", "bookId": 7, "g": 2 },
    "RUT": { "human": "Ruth", "short": "RUT", "bookId": 8, "g": 2 },
    "1SA": { "human": "1 Samuel", "short": "1SA", "bookId": 9, "g": 2 },
    "2SA": { "human": "2 Samuel", "short": "2SA", "bookId": 10, "g": 2 },
    "1KI": { "human": "1 Kings", "short": "1KI", "bookId": 11, "g": 2 },
    "2KI": { "human": "2 Kings", "short": "2KI", "bookId": 12, "g": 2 },
    "1CH": { "human": "1 Chronicles", "short": "1CH", "bookId": 13, "g": 2 },
    "2CH": { "human": "2 Chronicles", "short": "2CH", "bookId": 14, "g": 2 },
    "EZR": { "human": "Ezra", "short": "EZR", "bookId": 15, "g": 2 },
    "NEH": { "human": "Nehemiah", "short": "NEH", "bookId": 16, "g": 2 },
    "EST": { "human": "Esther", "short": "EST", "bookId": 17, "g": 2 },
    "JOB": { "human": "Job", "short": "JOB", "bookId": 18, "g": 3 },
    "undefined": { "human": "Song of Solomon", "bookId": 22, "g": 3 }, 
    "PRO": { "human": "Proverbs", "short": "PRO", "bookId": 20, "g": 3 },
    "ECC": { "human": "Ecclesiastes", "short": "ECC", "bookId": 21, "g": 3 },
    "ISA": { "human": "Isaiah", "short": "ISA", "bookId": 23, "g": 4 },
    "JER": { "human": "Jeremiah", "short": "JER", "bookId": 24, "g": 4 },
    "LAM": { "human": "Lamentations", "short": "LAM", "bookId": 25, "g": 4 },
    "EZK": { "human": "Ezekiel", "short": "EZK", "bookId": 26, "g": 4 },
    "DAN": { "human": "Daniel", "short": "DAN", "bookId": 27, "g": 4 },
    "HOS": { "human": "Hosea", "short": "HOS", "bookId": 28, "g": 4 },
    "JOL": { "human": "Joel", "short": "JOL", "bookId": 29, "g": 4 },
    "AMO": { "human": "Amos", "short": "AMO", "bookId": 30, "g": 4 },
    "OBA": { "human": "Obadiah", "short": "OBA", "bookId": 31, "g": 4 },
    "JON": { "human": "Jonah", "short": "JON", "bookId": 32, "g": 4 },
    "MIC": { "human": "Micah", "short": "MIC", "bookId": 33, "g": 4 },
    "NAM": { "human": "Nahum", "short": "NAM", "bookId": 34, "g": 4 },
    "HAB": { "human": "Habakkuk", "short": "HAB", "bookId": 35, "g": 4 },
    "ZEP": { "human": "Zephaniah", "short": "ZEP", "bookId": 36, "g": 4 },
    "HAG": { "human": "Haggai", "short": "HAG", "bookId": 37, "g": 4 },
    "ZEC": { "human": "Zechariah", "short": "ZEC", "bookId": 38, "g": 4 },
    "MAL": { "human": "Malachi", "short": "MAL", "bookId": 39, "g": 4 },
    "MAT": { "human": "Matthew", "short": "MAT", "bookId": 40, "g": 5 },
    "MRK": { "human": "Mark", "short": "MRK", "bookId": 41, "g": 5 },
    "LUK": { "human": "Luke", "short": "LUK", "bookId": 42, "g": 5 },
    "JHN": { "human": "John", "short": "JHN", "bookId": 43, "g": 5 },
    "ACT": { "human": "Acts", "short": "ACT", "bookId": 44, "g": 6 },
    "ROM": { "human": "Romans", "short": "ROM", "bookId": 45, "g": 7 },
    "1CO": { "human": "1 Corinthians", "short": "1CO", "bookId": 46, "g": 7 },
    "2CO": { "human": "2 Corinthians", "short": "2CO", "bookId": 47, "g": 7 },
    "GAL": { "human": "Galatians", "short": "GAL", "bookId": 48, "g": 7 },
    "EPH": { "human": "Ephesians", "short": "EPH", "bookId": 49, "g": 7 },
    "PHP": { "human": "Philippians", "short": "PHP", "bookId": 50, "g": 7 },
    "COL": { "human": "Colossians", "short": "COL", "bookId": 51, "g": 7 },
    "1TH": { "human": "1 Thessalonians", "short": "1TH", "bookId": 52, "g": 7 },
    "2TH": { "human": "2 Thessalonians", "short": "2TH", "bookId": 53, "g": 7 },
    "1TI": { "human": "1 Timothy", "short": "1TI", "bookId": 54, "g": 7 },
    "2TI": { "human": "2 Timothy", "short": "2TI", "bookId": 55, "g": 7 },
    "TIT": { "human": "Titus", "short": "TIT", "bookId": 56, "g": 7 },
    "PHM": { "human": "Philemon", "short": "PHM", "bookId": 57, "g": 7 },
    "HEB": { "human": "Hebrews", "short": "HEB", "bookId": 58, "g": 7 },
    "JAS": { "human": "James", "short": "JAS", "bookId": 59, "g": 7 },
    "1PE": { "human": "1 Peter", "short": "1PE", "bookId": 60, "g": 7 },
    "2PE": { "human": "2 Peter", "short": "2PE", "bookId": 61, "g": 7 },
    "1JN": { "human": "1 John", "short": "1JN", "bookId": 62, "g": 7 },
    "2JN": { "human": "2 John", "short": "2JN", "bookId": 63, "g": 7 },
    "3JN": { "human": "3 John", "short": "3JN", "bookId": 64, "g": 7 },
    "JUD": { "human": "Jude", "short": "JUD", "bookId": 65, "g": 7 },
    "REV": { "human": "Revelation", "short": "REV", "bookId": 66, "g": 8 }
};

exports.bookIdToShorts = {
    "1": "GEN",
    "2": "EXO",
    "3": "LEV",
    "4": "NUM",
    "5": "DEU",
    "6": "JOS",
    "7": "JDG",
    "8": "RUT",
    "9": "1SA",
    "10": "2SA",
    "11": "1KI",
    "12": "2KI",
    "13": "1CH",
    "14": "2CH",
    "15": "EZR",
    "16": "NEH",
    "17": "EST",
    "18": "JOB",
    "20": "PRO",
    "21": "ECC",
    "23": "ISA",
    "24": "JER",
    "25": "LAM",
    "26": "EZK",
    "27": "DAN",
    "28": "HOS",
    "29": "JOL",
    "30": "AMO",
    "31": "OBA",
    "32": "JON",
    "33": "MIC",
    "34": "NAM",
    "35": "HAB",
    "36": "ZEP",
    "37": "HAG",
    "38": "ZEC",
    "39": "MAL",
    "40": "MAT",
    "41": "MRK",
    "42": "LUK",
    "43": "JHN",
    "44": "ACT",
    "45": "ROM",
    "46": "1CO",
    "47": "2CO",
    "48": "GAL",
    "49": "EPH",
    "50": "PHP",
    "51": "COL",
    "52": "1TH",
    "53": "2TH",
    "54": "1TI",
    "55": "2TI",
    "56": "TIT",
    "57": "PHM",
    "58": "HEB",
    "59": "JAS",
    "60": "1PE",
    "61": "2PE",
    "62": "1JN",
    "63": "2JN",
    "64": "3JN",
    "65": "JUD",
    "66": "REV"
};

exports.versionFromIds = {
    "1": "kjv",
    "8": "AMPC",
    "12": "ASV",
    "31": "books",
    "37": "ceb",
    "42": "cpdv",
    "55": "DRC1752",
    "59": "ESV",
    "68": "GNT",
    "69": "GNTD",
    "70": "gw",
    "72": "hcsb",
    "90": "leb",
    "97": "msg",
    "100": "NASB",
    "105": "ncv",
    "107": "net",
    "110": "nirv-eng",
    "111": "NIV11",
    "113": "NIVUK",
    "114": "nkjv",
    "116": "nlt",
    "130": "ojb",
    "206": "web",
    "294": "CEVUK",
    "296": "GNB",
    "303": "CEVDC",
    "314": "TLV",
    "316": "TS2009",
    "392": "CEV",
    "406": "ERV",
    "416": "GNBDC",
    "431": "GNBDK",
    "463": "NABRE",
    "477": "RV1885",
    "478": "DARBY",
    "547": "KJVA",
    "821": "YLT1898",
    "1047": "GWC",
    "1077": "jub",
    "1171": "mev",
    "1204": "WEBBE",
    "1207": "WMBBE",
    "1209": "WMB",
    "1275": "CJB",
    "1359": "ICB",
    "1365": "MP1650",
    "1588": "AMP",
    "1713": "CSB",
    "1849": "TPT",
    "1922": "RV1895",
    "1932": "FBVNTPsalms",
    "2015": "NRSVCI",
    "2016": "NRSV",
    "2017": "RSVCI",
    "2020": "RSV",
    "2079": "EASY",
    "2135": "NMV",
    "2163": "enggnv"
};

exports.versionsToIds = {
    "kjv": 1,
    "ampc": 8,
    "asv": 12,
    "books": 31,
    "ceb": 37,
    "cpdv": 42,
    "drc1752": 55,
    "esv": 59,
    "gnt": 68,
    "gntd": 69,
    "gw": 70,
    "hcsb": 72,
    "leb": 90,
    "msg": 97,
    "nasb": 100,
    "ncv": 105,
    "net": 107,
    "nirv-eng": 110,
    "niv11": 111,
    "nivuk": 113,
    "nkjv": 114,
    "nlt": 116,
    "ojb": 130,
    "web": 206,
    "cevuk": 294,
    "gnb": 296,
    "cevdc": 303,
    "tlv": 314,
    "ts2009": 316,
    "cev": 392,
    "erv": 406,
    "gnbdc": 416,
    "gnbdk": 431,
    "nabre": 463,
    "rv1885": 477,
    "darby": 478,
    "kjva": 547,
    "ylt1898": 821,
    "gwc": 1047,
    "jub": 1077,
    "mev": 1171,
    "webbe": 1204,
    "wmbbe": 1207,
    "wmb": 1209,
    "cjb": 1275,
    "icb": 1359,
    "mp1650": 1365,
    "amp": 1588,
    "csb": 1713,
    "tpt": 1849,
    "rv1895": 1922,
    "fbvntpsalms": 1932,
    "nrsvci": 2015,
    "nrsv": 2016,
    "rsvci": 2017,
    "rsv": 2020,
    "easy": 2079,
    "nmv": 2135,
    "enggnv": 2163
};

exports.transLangs = {
    "kjv": { "title": "King James Version", "abbr": "kjv", "id": 1 },
    "ampc": { "title": "Amplified Bible, Classic Edition", "abbr": "AMPC", "id": 8 },
    "asv": { "title": "American Standard Version", "abbr": "ASV", "id": 12 },
    "books": { "title": "The Books of the Bible NT", "abbr": "books", "id": 31 },
    "ceb": { "title": "Common English Bible", "abbr": "ceb", "id": 37 },
    "cpdv": { "title": "Catholic Public Domain Version", "abbr": "cpdv", "id": 42 },
    "drc1752": { "title": "Douay-Rheims Challoner Revision 1752", "abbr": "DRC1752", "id": 55 },
    "esv": { "title": "English Standard Version", "abbr": "ESV", "id": 59 },
    "gnt": { "title": "Good News Translation", "abbr": "GNT", "id": 68 },
    "gntd": { "title": "Good News Translation (US Version)", "abbr": "GNTD", "id": 69 },
    "gw": { "title": "GOD'S WORD Translation", "abbr": "gw", "id": 70 },
    "hcsb": { "title": "Holman Christian Standard Bible", "abbr": "hcsb", "id": 72 },
    "leb": { "title": "Lexham English Bible", "abbr": "leb", "id": 90 },
    "msg": { "title": "The Message", "abbr": "msg", "id": 97 },
    "nasb": { "title": "New American Standard Bible", "abbr": "NASB", "id": 100 },
    "ncv": { "title": "New Century Version", "abbr": "ncv", "id": 105 },
    "net": { "title": "New English Translation", "abbr": "net", "id": 107 },
    "nirv-eng": { "title": "New International Reader's Version", "abbr": "nirv-eng", "id": 110 },
    "niv11": { "title": "New International Version 2011", "abbr": "NIV11", "id": 111 },
    "nivuk": { "title": "New International Version (Anglicised)", "abbr": "NIVUK", "id": 113 },
    "nkjv": { "title": "New King James Version", "abbr": "nkjv", "id": 114 },
    "nlt": { "title": "New Living Translation", "abbr": "nlt", "id": 116 },
    "ojb": { "title": "Orthodox Jewish Bible", "abbr": "ojb", "id": 130 },
    "web": { "title": "World English Bible", "abbr": "web", "id": 206 },
    "cevuk": { "title": "Contemporary English Version (Anglicised) 2012", "abbr": "CEVUK", "id": 294 },
    "gnb": { "title": "Good News Bible", "abbr": "GNB", "id": 296 },
    "cevdc": { "title": "Contemporary English Version", "abbr": "CEVDC", "id": 303 },
    "tlv": { "title": "Tree of Life Version", "abbr": "TLV", "id": 314 },
    "ts2009": { "title": "The Scriptures 2009", "abbr": "TS2009", "id": 316 },
    "cev": { "title": "Contemporary English Version", "abbr": "CEV", "id": 392 },
    "erv": { "title": "Holy Bible: Easy-to-Read Version", "abbr": "ERV", "id": 406 },
    "gnbdc": { "title": "Good News Bible (Anglicised)", "abbr": "GNBDC", "id": 416 },
    "gnbdk": { "title": "Good News Bible (Catholic edition in Septuagint order)", "abbr": "GNBDK", "id": 431 },
    "nabre": { "title": "New American Bible, revised edition", "abbr": "NABRE", "id": 463 },
    "rv1885": { "title": "Revised Version 1885", "abbr": "RV1885", "id": 477 },
    "darby": { "title": "Darby's Translation 1890", "abbr": "DARBY", "id": 478 },
    "kjva": { "title": "King James Version, American Edition", "abbr": "KJVA", "id": 547 },
    "ylt1898": { "title": "Young's Literal Translation 3rd Revision 1898", "abbr": "YLT1898", "id": 821 },
    "gwc": { "title": "St Paul from the Trenches 1916", "abbr": "GWC", "id": 1047 },
    "jub": { "title": "Jubilee Bible", "abbr": "jub", "id": 1077 },
    "mev": { "title": "Modern English Version", "abbr": "mev", "id": 1171 },
    "webbe": { "title": "World English Bible British Edition", "abbr": "WEBBE", "id": 1204 },
    "wmbbe": { "title": "World Messianic Bible British Edition", "abbr": "WMBBE", "id": 1207 },
    "wmb": { "title": "World Messianic Bible", "abbr": "WMB", "id": 1209 },
    "cjb": { "title": "Complete Jewish Bible", "abbr": "CJB", "id": 1275 },
    "icb": { "title": "International Children’s Bible", "abbr": "ICB", "id": 1359 },
    "mp1650": { "title": "Metrical Psalms 1650", "abbr": "MP1650", "id": 1365 },
    "amp": { "title": "The Amplified Bible", "abbr": "AMP", "id": 1588 },
    "csb": { "title": "Christian Standard Bible", "abbr": "CSB", "id": 1713 },
    "tpt": { "title": "The Passion Translation", "abbr": "TPT", "id": 1849 },
    "rv1895": { "title": "Revised Version with Apocrypha 1895", "abbr": "RV1895", "id": 1922 },
    "fbvntpsalms": { "title": "Free Bible Version New Testament with Psalms", "abbr": "FBVNTPsalms", "id": 1932 },
    "nrsvci": { "title": "New Revised Standard Version", "abbr": "NRSVCI", "id": 2015 },
    "nrsv": { "title": "New Revised Standard Version", "abbr": "NRSV", "id": 2016 },
    "rsvci": { "title": "Revised Standard Version", "abbr": "RSVCI", "id": 2017 },
    "rsv": { "title": "Revised Standard Version", "abbr": "RSV", "id": 2020 },
    "easy": { "title": "EasyEnglish Bible 2018", "abbr": "EASY", "id": 2079 },
    "nmv": { "title": "New Messianic Version Bible", "abbr": "NMV", "id": 2135 },
    "enggnv": { "title": "Geneva Bible", "abbr": "enggnv", "id": 2163 }
};

exports.log = data => console.log(JSON.stringify(data, null, 2));
exports.logErr = error => console.log("ERROR: ", error.message);
exports.cleanText = data => data.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');