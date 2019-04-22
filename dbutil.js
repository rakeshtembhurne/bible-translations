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

exports.saveIntoTable = (dataToSave, tableName) => {
    return new Promise((resolve, reject) => {
        if (_.size(dataToSave)) {
            let fields = _.keys(_.first(dataToSave));
            let values = _.map(dataToSave, p => _.values(p));
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
    "REV": { "human": "Revelation", "short": "REV", "bookId": 66, "g": 8 },
    
    "PSA": { "human": "PSALMS", "short": "PSA", "bookId": 19},

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
    "19": "PSA",
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

exports.tablesToCreate = [{
        "table": "t_ylt1898",
        "abbreviation": "YLT1898",
        "language": "english",
        "info_text": "Young's Literal Translation 3rd Revision 1898 (YLT1898)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/821-ylt1898-youngs-literal-translation-3rd-revision-1898",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/821/jhn.1.ylt1898"
    },
    {
        "table": "t_wmbbe",
        "abbreviation": "WMBBE",
        "language": "english",
        "info_text": "World Messianic Bible British Edition (WMBBE)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1207-wmbbe-world-messianic-bible-british-edition",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1207/jhn.1.wmbbe"
    },
    {
        "table": "t_wmb",
        "abbreviation": "WMB",
        "language": "english",
        "info_text": "World Messianic Bible (WMB)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1209-wmb-world-messianic-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1209/jhn.1.wmb"
    },
    {
        "table": "t_webbe",
        "abbreviation": "WEBBE",
        "language": "english",
        "info_text": "World English Bible British Edition (WEBBE)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1204-webbe-world-english-bible-british-edition",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1204/jhn.1.webbe"
    },
    {
        "table": "t_web",
        "abbreviation": "WEB",
        "language": "english",
        "info_text": "World English Bible (WEB)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/206-web-world-english-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/206/jhn.1.web"
    },
    {
        "table": "t_ts2009",
        "abbreviation": "TS2009",
        "language": "english",
        "info_text": "The Scriptures 2009 (TS2009)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/316-ts2009-the-scriptures-2009",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/316/jhn.1.ts2009"
    },
    {
        "table": "t_tpt",
        "abbreviation": "TPT",
        "language": "english",
        "info_text": "The Passion Translation (TPT)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1849-tpt-the-passion-translation",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1849/jhn.1.tpt"
    },
    {
        "table": "t_tlv",
        "abbreviation": "TLV",
        "language": "english",
        "info_text": "Tree of Life Version (TLV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/314-tlv-tree-of-life-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/314/jhn.1.tlv"
    },
    {
        "table": "t_rv1895",
        "abbreviation": "RV1895",
        "language": "english",
        "info_text": "Revised Version with Apocrypha 1895 (RV1895)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1922-rv1895-revised-version-with-apocrypha-1895",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1922/jhn.1.rv1895"
    },
    {
        "table": "t_rv1885",
        "abbreviation": "RV1885",
        "language": "english",
        "info_text": "Revised Version 1885 (RV1885)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/477-rv1885-revised-version-1885",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/477/jhn.1.rv1885"
    },
    {
        "table": "t_rsv-ci",
        "abbreviation": "RSV-CI",
        "language": "english",
        "info_text": "Revised Standard Version (RSV-CI)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/2017-rsv-ci-revised-standard-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/2017/jhn.1.rsv-ci"
    },
    {
        "table": "t_rsv",
        "abbreviation": "RSV",
        "language": "english",
        "info_text": "Revised Standard Version (RSV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/2020-rsv-revised-standard-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/2020/jhn.1.rsv"
    },
    {
        "table": "t_ojb",
        "abbreviation": "OJB",
        "language": "english",
        "info_text": "Orthodox Jewish Bible (OJB)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/130-ojb-orthodox-jewish-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/130/jhn.1.ojb"
    },
    {
        "table": "t_nrsv-ci",
        "abbreviation": "NRSV-CI",
        "language": "english",
        "info_text": "New Revised Standard Version Catholic Interconfessional (NRSV-CI)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/2015-nrsv-ci-new-revised-standard-version-catholic-interconfessional",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/2015/jhn.1.nrsv-ci"
    },
    {
        "table": "t_nrsv",
        "abbreviation": "NRSV",
        "language": "english",
        "info_text": "New Revised Standard Version (NRSV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/2016-nrsv-new-revised-standard-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/2016/jhn.1.nrsv"
    },
    {
        "table": "t_nmv",
        "abbreviation": "NMV",
        "language": "english",
        "info_text": "New Messianic Version Bible (NMV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/2135-nmv-new-messianic-version-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/2135/jhn.1.nmv"
    },
    {
        "table": "t_nlt",
        "abbreviation": "NLT",
        "language": "english",
        "info_text": "New Living Translation (NLT)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/116-nlt-new-living-translation",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/116/jhn.1.nlt"
    },
    {
        "table": "t_nkjv",
        "abbreviation": "NKJV",
        "language": "english",
        "info_text": "New King James Version (NKJV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/114-nkjv-new-king-james-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/114/jhn.1.nkjv"
    },
    {
        "table": "t_nivuk",
        "abbreviation": "NIVUK",
        "language": "english",
        "info_text": "New International Version (Anglicised) (NIVUK)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/113-nivuk-new-international-version-anglicised",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/113/jhn.1.nivuk"
    },
    {
        "table": "t_niv",
        "abbreviation": "NIV",
        "language": "english",
        "info_text": "New International Version (NIV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/111-niv-new-international-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/111/jhn.1.niv"
    },
    {
        "table": "t_nirv",
        "abbreviation": "NIRV",
        "language": "english",
        "info_text": "New International Reader's Version (NIRV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/110-nirv-new-international-readers-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/110/jhn.1.nirv"
    },
    {
        "table": "t_net",
        "abbreviation": "NET",
        "language": "english",
        "info_text": "New English Translation (NET)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/107-net-new-english-translation",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/107/jhn.1.net"
    },
    {
        "table": "t_ncv",
        "abbreviation": "NCV",
        "language": "english",
        "info_text": "New Century Version (NCV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/105-ncv-new-century-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/105/jhn.1.ncv"
    },
    {
        "table": "t_nasb",
        "abbreviation": "NASB",
        "language": "english",
        "info_text": "New American Standard Bible (NASB)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/100-nasb-new-american-standard-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/100/jhn.1.nasb"
    },
    {
        "table": "t_nabre",
        "abbreviation": "NABRE",
        "language": "english",
        "info_text": "New American Bible, revised edition (NABRE)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/463-nabre-new-american-bible-revised-edition",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/463/jhn.1.nabre"
    },
    {
        "table": "t_msg",
        "abbreviation": "MSG",
        "language": "english",
        "info_text": "The Message (MSG)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/97-msg-the-message",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/97/jhn.1.msg"
    },
    {
        "table": "t_mp1650",
        "abbreviation": "MP1650",
        "language": "english",
        "info_text": "Metrical Psalms 1650 (MP1650)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1365-mp1650-metrical-psalms-1650",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1365/PSA.1.MP1650"
    },
    {
        "table": "t_mev",
        "abbreviation": "MEV",
        "language": "english",
        "info_text": "Modern English Version (MEV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1171-mev-modern-english-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1171/jhn.1.mev"
    },
    {
        "table": "t_leb",
        "abbreviation": "LEB",
        "language": "english",
        "info_text": "Lexham English Bible (LEB)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/90-leb-lexham-english-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/90/jhn.1.leb"
    },
    {
        "table": "t_kjva",
        "abbreviation": "KJVA",
        "language": "english",
        "info_text": "King James Version, American Edition (KJVA)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/547-kjva-king-james-version-american-edition",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/547/jhn.1.kjva"
    },
    {
        "table": "t_kjva",
        "abbreviation": "KJVA",
        "language": "english",
        "info_text": "King James Version with Apocrypha, American Edition (KJVA)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/546-kjva-king-james-version-with-apocrypha-american-edition",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/546/jhn.1.kjva"
    },
    {
        "table": "t_kjv",
        "abbreviation": "KJV",
        "language": "english",
        "info_text": "King James Version (KJV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1-kjv-king-james-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1/jhn.1.kjv"
    },
    {
        "table": "t_jub",
        "abbreviation": "JUB",
        "language": "english",
        "info_text": "Jubilee Bible (JUB)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1077-jub-jubilee-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1077/jhn.1.jub"
    },
    {
        "table": "t_icb",
        "abbreviation": "ICB",
        "language": "english",
        "info_text": "International Children’s Bible (ICB)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1359-icb-international-childrens-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1359/jhn.1.icb"
    },
    {
        "table": "t_hcsb",
        "abbreviation": "HCSB",
        "language": "english",
        "info_text": "Holman Christian Standard Bible (HCSB)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/72-hcsb-holman-christian-standard-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/72/jhn.1.hcsb"
    },
    {
        "table": "t_gwc",
        "abbreviation": "GWC",
        "language": "english",
        "info_text": "St Paul from the Trenches 1916 (GWC)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1047-gwc-st-paul-from-the-trenches-1916",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1047/jhn.1.gwc"
    },
    {
        "table": "t_gw",
        "abbreviation": "GW",
        "language": "english",
        "info_text": "GOD'S WORD Translation (GW)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/70-gw-gods-word-translation",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/70/jhn.1.gw"
    },
    {
        "table": "t_gnv",
        "abbreviation": "GNV",
        "language": "english",
        "info_text": "Geneva Bible (GNV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/2163-gnv-geneva-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/2163/jhn.1.gnv"
    },
    {
        "table": "t_gntd",
        "abbreviation": "GNTD",
        "language": "english",
        "info_text": "Good News Translation (US Version) (GNTD)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/69-gntd-good-news-translation-us-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/69/jhn.1.gntd"
    },
    {
        "table": "t_gnt",
        "abbreviation": "GNT",
        "language": "english",
        "info_text": "Good News Translation (GNT)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/68-gnt-good-news-translation",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/68/jhn.1.gnt"
    },
    {
        "table": "t_gnbdk",
        "abbreviation": "GNBDK",
        "language": "english",
        "info_text": "Good News Bible (Catholic edition in Septuagint order) (GNBDK)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/431-gnbdk-good-news-bible-catholic-edition-in-septuagint-order",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/431/jhn.1.gnbdk"
    },
    {
        "table": "t_gnbdc",
        "abbreviation": "GNBDC",
        "language": "english",
        "info_text": "Good News Bible (Anglicised) (GNBDC)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/416-gnbdc-good-news-bible-anglicised",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/416/jhn.1.gnbdc"
    },
    {
        "table": "t_gnb",
        "abbreviation": "GNB",
        "language": "english",
        "info_text": "Good News Bible (GNB)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/296-gnb-good-news-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/296/jhn.1.gnb"
    },
    {
        "table": "t_fbvntpsalms",
        "abbreviation": "FBVNTPSALMS",
        "language": "english",
        "info_text": "Free Bible Version New Testament with Psalms (FBVNTPSALMS)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1932-fbvntpsalms-free-bible-version-new-testament-with-psalms",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1932/jhn.1.fbvntpsalms"
    },
    {
        "table": "t_esv",
        "abbreviation": "ESV",
        "language": "english",
        "info_text": "English Standard Version (ESV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/59-esv-english-standard-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/59/jhn.1.esv"
    },
    {
        "table": "t_erv",
        "abbreviation": "ERV",
        "language": "english",
        "info_text": "Holy Bible: Easy-to-Read Version (ERV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/406-erv-holy-bible-easy-to-read-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/406/jhn.1.erv"
    },
    {
        "table": "t_easy",
        "abbreviation": "EASY",
        "language": "english",
        "info_text": "EasyEnglish Bible 2018 (EASY)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/2079-easy-easyenglish-bible-2018",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/2079/jhn.1.easy"
    },
    {
        "table": "t_drc1752",
        "abbreviation": "DRC1752",
        "language": "english",
        "info_text": "Douay-Rheims Challoner Revision 1752 (DRC1752)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/55-drc1752-douay-rheims-challoner-revision-1752",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/55/jhn.1.drc1752"
    },
    {
        "table": "t_darby",
        "abbreviation": "DARBY",
        "language": "english",
        "info_text": "Darby's Translation 1890 (DARBY)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/478-darby-darbys-translation-1890",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/478/jhn.1.darby"
    },
    {
        "table": "t_csb",
        "abbreviation": "CSB",
        "language": "english",
        "info_text": "Christian Standard Bible (CSB)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1713-csb-christian-standard-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1713/jhn.1.csb"
    },
    {
        "table": "t_cpdv",
        "abbreviation": "CPDV",
        "language": "english",
        "info_text": "Catholic Public Domain Version (CPDV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/42-cpdv-catholic-public-domain-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/42/jhn.1.cpdv"
    },
    {
        "table": "t_cjb",
        "abbreviation": "CJB",
        "language": "english",
        "info_text": "Complete Jewish Bible (CJB)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1275-cjb-complete-jewish-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1275/jhn.1.cjb"
    },
    {
        "table": "t_cevuk",
        "abbreviation": "CEVUK",
        "language": "english",
        "info_text": "Contemporary English Version (Anglicised) 2012 (CEVUK)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/294-cevuk-contemporary-english-version-anglicised-2012",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/294/jhn.1.cevuk"
    },
    {
        "table": "t_cevdc",
        "abbreviation": "CEVDC",
        "language": "english",
        "info_text": "Contemporary English Version (CEVDC)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/303-cevdc-contemporary-english-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/303/jhn.1.cevdc"
    },
    {
        "table": "t_cev",
        "abbreviation": "CEV",
        "language": "english",
        "info_text": "Contemporary English Version (CEV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/392-cev-contemporary-english-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/392/jhn.1.cev"
    },
    {
        "table": "t_ceb",
        "abbreviation": "CEB",
        "language": "english",
        "info_text": "Common English Bible (CEB)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/37-ceb-common-english-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/37/jhn.1.ceb"
    },
    {
        "table": "t_books",
        "abbreviation": "BOOKS",
        "language": "english",
        "info_text": "The Books of the Bible NT (BOOKS)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/31-books-the-books-of-the-bible-nt",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/31/jhn.1.books"
    },
    {
        "table": "t_asv",
        "abbreviation": "ASV",
        "language": "english",
        "info_text": "American Standard Version (ASV)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/12-asv-american-standard-version",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/12/jhn.1.asv"
    },
    {
        "table": "t_ampc",
        "abbreviation": "AMPC",
        "language": "english",
        "info_text": "Amplified Bible, Classic Edition (AMPC)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/8-ampc-amplified-bible-classic-edition",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/8/jhn.1.ampc"
    },
    {
        "table": "t_amp",
        "abbreviation": "AMP",
        "language": "english",
        "info_text": "The Amplified Bible (AMP)",
        "version": "",
        "info_url": "https://www.bible.com/en-GB/versions/1588-amp-the-amplified-bible",
        "publisher": "",
        "copyright": "",
        "copyright_info": "",
        "firstPage": "https://www.bible.com/en-GB/bible/1588/jhn.1.amp"
    }
];

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

const debugData = require('debug')('debugData');
const debugErr = require('debug')('debugErr');
const debugJson = require('debug')('debugJSON');
const log = data => debugData(JSON.stringify(data, null, 2));
const logErr = error => debugErr("ERROR: ", error.message);

exports.debugData = debugData;
exports.debugErr = debugErr;
exports.debugJson = data => debugJson(JSON.stringify(data));
exports.log = log;
exports.logErr = logErr;

exports.cleanText = data => data.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');