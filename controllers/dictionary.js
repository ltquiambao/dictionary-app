const path = require("path");
const debug = require("debug")(
  `dictionary-app:${path.basename(__dirname)}\\${path.basename(__filename)}`
);
const axios = require("axios");
const DictRef = require("../db/models/DictRef");

class DictionaryRequest {
  static api =
    "https://www.dictionaryapi.com/api/v3/references/collegiate/json";

  constructor(id) {
    this.id = id;
    this.apiKey = process.env.DICT_API_KEY;
  }

  build() {
    return `${DictionaryRequest.api}/${this.id}?key=${this.apiKey}`;
  }
}

class DictionaryReference {
  static url = {
    mwAssetsArt: "https://www.merriam-webster.com/assets/mw/static/art/dict",
    noImageArt: "https://i.imgur.com/D1nM11A.png",
  };

  constructor(dictRef) {
    this.dictRef = dictRef;
    this.formattedDictRef = {
      id: null,
      stems: null,
      sort: null,
      shortdef: null,
      def: [],
      art: {},
    };
  }

  static generateArtUrl(artId = null) {
    let url = DictionaryReference.url.noImageArt;
    if (artId) {
      url = `${DictionaryReference.url.mwAssetsArt}/${artId}.gif`;
    }
    return url;
  }

  isFormattable() {
    return (
      typeof this.dictRef === "object" &&
      Object.keys(this.formattedDictRef)
        .map((prop) => Object.keys(this.dictRef).includes(prop))
        .reduce((acc, curr) => acc || curr, false)
    );
  }

  format() {
    try {
      // store id
      this.formattedDictRef.id = this.dictRef?.meta?.id;
      // store stems
      this.formattedDictRef.stems = this.dictRef?.meta?.stems;
      // store sort
      this.formattedDictRef.sort = this.dictRef?.meta?.sort;
      // store short def
      this.formattedDictRef.shortdef = this.dictRef?.shortdef;
      // store art
      this.formattedDictRef.art = this.dictRef?.art
        ? {
            ...this.dictRef.art,
            arturl: DictionaryReference.generateArtUrl(this.dictRef.art.artid),
          }
        : {
            arturl: DictionaryReference.generateArtUrl(),
          };

      // store def
      // def property is an array
      // if (this.dictRef?.def.length > 0) {
      //   const def = this.dictRef.def;
      //   debug(`[DictionaryReference][format] def length: ${def.length}`);
      //   if (def[0]?.sseq.length > 0) {
      //     const sseq = def[0]?.sseq;
      //     debug(
      //       `[DictionaryReference][format] def sseq length: ${sseq.length}`
      //     );
      //     sseq.forEach((sseqObj1) => {
      //       if (sseqObj1.length > 0) {
      //         debug(
      //           `[DictionaryReference][format] def sseq (level 1) length: ${sseqObj1.length}`
      //         );
      //         sseqObj1.forEach((sseqObj2) => {
      //           if (sseqObj2.length > 0) {
      //             debug(
      //               `[DictionaryReference][format] def sseq (level 2) length: ${sseqObj2.length}`
      //             );
      //             const sseqObj2Obj = sseqObj2.find(
      //               (sseqObj2Entry) => typeof sseqObj2Entry !== "string"
      //             );
      //             if (sseqObj2Obj?.dt.length > 0) {
      //               debug(
      //                 `[DictionaryReference][format] def sseq (level 2) dt length: ${sseqObj2Obj.dt.length}`
      //               );
      //               sseqObj2Obj?.dt.forEach((dtObj) => {
      //                 if (dtObj.length > 0) {
      //                   debug(
      //                     `[DictionaryReference][format] def sseq (level 2) dt (level 1) length: ${dtObj.length}`
      //                   );
      //                   if (dtObj[0] === "text") {
      //                     this.formattedDictRef.def.push(dtObj[1]);
      //                   }
      //                 }
      //               });
      //             }
      //           }
      //         });
      //       }
      //     });
      //   }
      // }
    } catch (err) {
      debug(`[DictionaryReference][format][failed] ${err.message}`);
      debug(`[DictionaryReference][format][failed] ${err.stack}`);
    }

    return this.formattedDictRef;
  }
}

/**
 * Check if the word is already in the database, if it is, return the word, if it isn't, return null.
 * @param word - the word to look up
 * @returns A promise that resolves to the data object.
 */
async function checkAvailableDictRef(word) {
  const dictRef = await DictRef.findOne({ stems: word }).sort({ sort: "asc" });
  debug("[checkAvailableDictRef] checked cached reference");
  return dictRef;
}

/**
 * It takes a word as an argument, sends a request to the api, and returns the response.
 * @param word - the word to look up
 * @returns A promise that resolves to the data object.
 */
async function getNewDictRef(word) {
  const request = new DictionaryRequest(word);
  const url = request.build();
  const response = await axios.get(url);
  const data = response.data;
  debug("[getNewDictRef] sent a request to api");
  return data;
}

/**
 * It takes an array of dictionary references, and returns an array of formatted dictionary references
 * @param data - an array of objects
 * @returns An array of formatted dictionary references.
 */
function formatDictRef(data) {
  const formattedDictRefs = data.map((dictRef) => {
    const dictReference = new DictionaryReference(dictRef);
    if (dictReference.isFormattable()) {
      return dictReference.format();
    } else {
      throw new Error("dictionary reference not formattable");
    }
  });
  return formattedDictRefs;
}

/**
 * It checks if the word is already in the cache, and if it is, it returns the cached version. If it
 * isn't, it fetches the new version, formats it, and returns it
 * @param word - the word to look up
 * @returns An object with two properties: isCached and formattedDictRefs.
 */
async function fetchAndFormatDictRef(word) {
  let formattedDictRefs;
  const cachedDictRef = await checkAvailableDictRef(word);
  if (!cachedDictRef) {
    debug("[fetchAndFormatDictRef] no available cached reference");
    const origDictRefs = await getNewDictRef(word);
    formattedDictRefs = formatDictRef(origDictRefs);
  } else {
    debug("[fetchAndFormatDictRef] available cached reference");
    formattedDictRefs = [cachedDictRef];
  }

  return { isCached: !!cachedDictRef, formattedDictRefs };
}

/**
 * It takes an array of objects, creates a new instance of a mongoose model for each object, and saves
 * each instance to the database
 * @param formattedDictRefs - An array of formatted dictionary references.
 */
async function cacheDictRefs(formattedDictRefs) {
  // save API result to database
  try {
    const savedDictRefs = await Promise.all(
      formattedDictRefs.map(async (formattedDictRef) => {
        // const dictRef = new DictRef(formattedDictRef);
        // await dictRef.save();
        await DictRef.updateMany(
          { id: formattedDictRef.id },
          formattedDictRef,
          { upsert: true }
        );
      })
    );
    debug(`[cacheDictRefs][save][success] count: ${savedDictRefs.length}`);
  } catch (err) {
    debug(`[cacheDictRefs][save][failed] ${err}`);
  }
}

/**
 * It fetches a dictionary reference from an external API, formats it, and returns it to the user
 * @param req - the request object
 * @param res - the response object
 */
async function getDictionaryReference(req, res) {
  const { word } = req.query;

  try {
    // fetch and format dictionary references
    const { isCached, formattedDictRefs } = await fetchAndFormatDictRef(word);
    res.status(200).json(formattedDictRefs[0]);
    if (!isCached) {
      await cacheDictRefs(formattedDictRefs);
    }
  } catch (err) {
    debug(`[getDictionaryReference][fetch][failed] ${err}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { getDictionaryReference };
