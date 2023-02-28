import { insertCountryObject, startGame } from "./script.js";
// list of country from API, that according to different sources are NOT really country.
const NOTCountry = [
  "Svalbard and Jan Mayen",
  "Guernsey",
  "Belarus",
  "Russia",
  "Isle of Man",
  "Faroe Islands",
  "Gibraltar",
  "Jersey",
  "Åland Islands",
  "Réunion",
  "Western Sahara",
  "British Indian Ocean Territory",
  "Saint Helena, Ascension and Tristan da Cunha",
  "Mayotte",
  "Hong Kong",
  "Macau",
  "United States Minor Outlying Islands",
  "Cocos (Keeling) Islands",
  "Norfolk Island",
  "Solomon Islands",
  "Pitcairn Islands",
  "Christmas Island",
];

// fetch data
const getJSON = function (url, errMsg = "Something went wrong") {
  return fetch(url).then(response => {
    if (!response.ok) throw new Error(`${errMsg} (${response.status})`);
    return response.json();
  });
};

// https://restcountries.com/#api-endpoints-v3-region

// liczba państw
// europe 46
// afryka 54
// azja 48
// ameryka 55
// australia 22

export const errorMessage = function (err) {
  const errorDiv = document.querySelector(".error");
  errorDiv.classList.remove("hidden");
  errorDiv.innerText = `${err} \nPlease try again`;
};

// search region from given array
export const getCountries = async function (regionArr) {
  try {
    let dataToFetch = [];
    regionArr.forEach(reg =>
      dataToFetch.push(getJSON(`https://restcountries.com/v3.1/region/${reg}`))
    );

    //fetch data for all choosen continents
    const resultData = await Promise.all(dataToFetch);

    resultData.map(data => {
      data.forEach(dat => {
        //delete NOT country array before adding to game object
        let addCountry = true;
        for (let i = 0; i < NOTCountry.length; i++)
          if (NOTCountry[i] === dat.name.common) {
            addCountry = false;
            break;
          }
        if (addCountry) insertCountryObject(dat.name.common, dat.flags.svg);
      });
    });

    // for (let i = 0; i < 4000000000; i++) {}

    if (!resultData) throw new Error(`🔥 Data not found. 🔥`);
    else startGame();
  } catch (err) {
    // console.log(`🔥🔥 ${err} 🔥🔥`);
    errorMessage(err);
  }
};
