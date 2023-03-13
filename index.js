const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

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
  {
    country: 'portugal',
    url: 'http://www.europeanbeerguide.net/portbrew.htm',
  },
  {
    country: 'ireland',
    url: 'http://www.europeanbeerguide.net/irlbrew.htm',
  },
  {
    country: 'luxembourg',
    url: 'http://www.europeanbeerguide.net/luxbrew.htm',
  },
  {
    country: 'norway',
    url: 'http://www.europeanbeerguide.net/norbrew.htm',
  },
  {
    country: 'finland',
    url: 'http://www.europeanbeerguide.net/finbrew.htm',
  },
  {
    country: 'switzerland',
    url: 'http://www.europeanbeerguide.net/swisbrew.htm',
  },
  {
    country: 'czech',
    url: 'http://www.europeanbeerguide.net/czecbrew.htm',
  },
  {
    country: 'italy',
    url: 'http://www.europeanbeerguide.net/italbrew.htm',
  },
  {
    country: 'poland',
    url: 'http://www.europeanbeerguide.net/polbrew.htm',
  },
  {
    country: 'malta',
    url: 'http://www.europeanbeerguide.net/maltbrew.htm',
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

  const siteAddress = beers.filter((beer) => beer.country == beerId.toLowerCase())[0].url;

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
  fs.writeFile('./data.json', JSON.stringify(beersList), (err) => {
    if (err) console.log(err);
    else {
      console.log('File written successfully\n');
    }
  });
  res.json(beersList);
});

app.get('/', (req, res) => {
  res.json('Welcome to my Beer API');
});

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
