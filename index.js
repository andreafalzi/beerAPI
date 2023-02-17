const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

//MULTIPLE SITE SCRAPPING
//(keep in mind that you have to check that all site has the same tag or html element to get the right data)

const beers = [
  {
    country: 'denmark',
    url: 'http://www.europeanbeerguide.net/denbrew.htm',
  },
  {
    country: 'sweden',
    url: 'http://www.europeanbeerguide.net/swedbrew.htm',
  },
  {
    country: 'belgium',
    url: 'http://www.europeanbeerguide.net/belgbrew.htm',
  },
  {
    country: 'spain',
    url: 'http://www.europeanbeerguide.net/spanbrew.htm',
  },
];

const beersList = [];

beers.forEach((country) => {
  axios
    .get(country.url)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      $('tr', html)
        .has('td > b')
        .each(function () {
          const title = $('tr td', this).eq(0).text();
          const alchool = $('tr td', this).eq(1).text();
          const descriptionOne = $('tr td', this).eq(2).text();
          const descriptionTwo = $('tr td', this).eq(3).text();

          const description = descriptionOne.length > 6 && !descriptionOne.includes('º') ? descriptionOne : descriptionTwo;

          convertText(title);

          if (alchool.includes('%') && !alchool.includes('-') && convertText(description) != '') {
            beersList.push({
              title,
              alchool,
              description,
              country: country.country,
            });
          }
        });
    })
    .catch((err) => console.log(err));
});

/* INDIVIDUAL BEER BY PARAM */

app.get('/beers/:beerId', (req, res) => {
  const beerId = req.params.beerId;

  const siteAddress = beers.filter((beer) => beer.country == beerId)[0].url;

  axios.get(siteAddress).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    const specificSite = [];

    // Tag and HTML elements to fit the website
    $('tr', html)
      .has('td > b')
      .each(function () {
        const title = $('tr td', this).eq(0).text();
        const alchool = $('tr td', this).eq(1).text();
        const descriptionOne = $('tr td', this).eq(2).text();
        const descriptionTwo = $('tr td', this).eq(3).text();

        const description = descriptionOne.length > 6 && !descriptionOne.includes('º') ? descriptionOne : descriptionTwo;

        convertText(title);

        if (alchool.includes('%') && !alchool.includes('-') && convertText(description) != '') {
          specificSite.push({
            title,
            alchool,
            description,
            country: beers.country,
          });
        }
      });
    res.json(specificSite);
  });
});

app.get('/beers', (req, res) => {
  const text = 'øøææåååasdø asdåøewr´ ør ñ æøløløp';
  console.log(convertText(text));

  res.json(beersList);
});

app.get('/', (req, res) => {
  res.json('Welcome to my Beer API');
});

// app.get('/ranker', (req, res) => {
//   axios.get('https://www.ranker.com/list/top-beers-from-denmark/reference').then((response) => {
//     const html = response.data;
//     const $ = cheerio.load(html);

//     $('li[role="listitem"]', html).each(function () {
//       const title = $('h2', this).text();
//       const id = $(this).attr('data-item-id');
//       const alchool = $('div.NodeName_firstProperties__xGMas', this).text();
//       beersListRanker.push({
//         title,
//         alchool,
//         id,
//       });
//     });
//     res.json(beersListRanker);
//   });
// });

app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`);
});

function convertText(text) {
  const convertedText = [];

  [...text].forEach((e) => {
    if (e.includes('ø')) {
      e = e.replace(/ø/g, 'o');
    }
    if (e.includes('æ')) {
      e = e.replace(/æ/g, 'ae');
    }
    if (e.includes('å')) {
      e = e.replace(/å/g, 'o');
    }
    if (e.includes('ä')) {
      e = e.replace('ä', 'o');
    }
    if (e.includes('ü')) {
      e = e.replace('ü', 'u');
    }
    if (e.includes('ñ')) {
      e = e.replace('ñ', 'n');
    }
    if (e.includes('´' || '`')) {
      e = e.replace('´' || '`', "'");
    }
    convertedText.push(e);
  });
  return convertedText.join('').toString();
}
