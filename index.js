const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const beersListRanker = [];
const beersListWikiliq = [];
const beersListEBG = [];

//MULTIPLE SITE SCRAPPING
//(keep in mind that you have to check that all site has the same tag or html element to get the right data)

// const beerWebSites = [
//   {
//     name: 'ranker',
//     url: 'https://www.ranker.com/list/top-beers-from-denmark/reference',
//   },
//   {
//     name: 'wikiliq',
//     url: 'https://wikiliq.org/best-beer/',
//   },
// ];

// const beersList = [];

// beerWebSites.forEach(site => {
//   axios.get(site.url).then(response => {
//         const html = response.data;
//         const $ = cheerio.load(html);

//         // Tag and HTML elements to fit the website
//             $('li[role="listitem"]', html).each(function () {
//               const title = $('h2', this).text();
//               const id = $(this).attr('data-item-id');
//               const alchool = $('div.NodeName_firstProperties__xGMas', this).text();

//               beersList.push({ title, alchool, id, source: site.name });
//             });

//   })
// });

// app.get('/beers', (req,res) => {
//   res.json(beerList)
// })

//* INDIVIDUAL BEER BY PARAM */

// app.get('/beers/:beerId', (req, res) => {
//   const beerId = req.params.beerId;

//   const siteAddress = beerWebSites.filter((beerWebSite) => beerWebSite.name == beerId)[0].name;

//   axios.get(siteAddress).then((response) => {
//     const html = response.data;
//     const $ = cheerio.load(html);

//     const specificSite = [];

//     // Tag and HTML elements to fit the website
//     $('li[role="listitem"]', html).each(function () {
//       const title = $('h2', this).text();
//       const id = $(this).attr('data-item-id');
//       const alchool = $('div.NodeName_firstProperties__xGMas', this).text();

//       specificSite.push({
//         title,
//         alchool,
//         id,
//         source: site.name,
//       });
//     });
//     res.json(specificSite);
//   });
// });

app.get('/', (req, res) => {
  res.json('Welcome to my Beer API');
});

app.get('/ranker', (req, res) => {
  axios.get('https://www.ranker.com/list/top-beers-from-denmark/reference').then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('li[role="listitem"]', html).each(function () {
      const title = $('h2', this).text();
      const id = $(this).attr('data-item-id');
      const alchool = $('div.NodeName_firstProperties__xGMas', this).text();
      beersListRanker.push({
        title,
        alchool,
        id,
      });
    });
  });

  res.json(beersListRanker);
});

app.get('/wikiliq', (req, res) => {
  axios.get('https://wikiliq.org/best-beer/').then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('tbody.desktop', html).each(function () {
      const title = $('img', this).attr('alt');
      const image = $('img', this).attr('src');
      const brand = $('tr td', this).eq(5).text();
      const country = $('tr td', this).eq(6).children('a').text();

      beersListWikiliq.push({
        title,
        image,
        brand,
        country,
      });
    });
  });

  res.json(beersListWikiliq);
});

app.get('/EBG', (req, res) => {
  axios.get('http://www.europeanbeerguide.net/denbrew.htm').then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    console.log(convertText('Aarhus Bryghus Rød Ale'));

    $('tr', html)
      .has('td > b')
      .each(function () {
        const title = $('tr td', this).eq(0).text();
        const alchool = $('tr td', this).eq(1).text();
        const descriptionOne = $('tr td', this).eq(2).text();
        const descriptionTwo = $('tr td', this).eq(3).text();

        const description = descriptionOne.length > 2 ? descriptionOne : descriptionTwo;

        convertText(title);

        if (alchool.includes('%') && !alchool.includes('-') && convertText(description) != '') {
          beersListEBG.push({
            title,
            alchool,
            description,
          });
        }
      });
  });

  res.json(beersListEBG);
});

app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`);
});

function convertText(text) {
  const convertedText = [];

  [...text].forEach((e) => {
    if (e.includes('ø')) {
      e = e.replace('ø', 'o');
    }
    if (e.includes('æ')) {
      e = e.replace('æ', 'ae');
    }
    if (e.includes('å')) {
      e = e.replace('å', 'o');
    }
    if (e.includes('ä')) {
      e = e.replace('ä', 'o');
    }
    convertedText.push(e);
  });
  return convertedText.join('').toString();
}
