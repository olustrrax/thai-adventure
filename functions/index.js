'use strict';

const {dialogflow, Permission, LinkOutSuggestion, Button, List, BrowseCarouselItem, Image, BrowseCarousel } = require('actions-on-google');
const functions = require('firebase-functions');
const { getCodeCountry, searchFlight } = require('./searchflight')
const moment = require('moment')
const app = dialogflow({ 
  debug: false 
});


app.intent('Ask Permission', (conv) => {
  const options = {
    context: 'To locate you',
    permissions: ['NAME', 'DEVICE_COARSE_LOCATION', 'UPDATE']
  };
  conv.ask(new Permission(options));
});

app.intent('Default Welcome Intent', (conv) => {
  console.log('HI')
  conv.close('Hello, World!');
});

app.intent('Search flight', async (conv) => {
  const { parameters, incoming } = conv
  
  if(parameters.location && (parameters.location.country || parameters.location.city) && parameters['date'] && parameters['date1'] && parameters['number-integer']){
    try{
      const codeCountry = await getCodeCountry(parameters.location.country)
      let data = {
        flyFrom: codeCountry,
        to: `BKK`,
        dateFrom: moment(parameters['date']).format("DD/MM/YYYY"),
        dateTo: moment(parameters['date1']).format("DD/MM/YYYY"),
        adult: parameters['number-integer'],
        curr: `THB`,
        partner: `picky`,
        limit: 10,
        sort: 'price'
      }
      const response = await searchFlight(data)
      console.log('INPUT:',data)      
      conv.ask(`Finally I found it!`)
      let table = response.reduce((o,e,i) => {
        let dTime = moment(e['dTime']*1000).format("DD/MM/YYYY HH:mm")
        let aTime = moment(e['aTime']*1000).format("DD/MM/YYYY HH:mm")
        let list = new BrowseCarouselItem({
          title: `${e.cityFrom} to ${e.cityTo}`,
          url: `${e.deep_link}`,
          description: `Price ${e.price.toLocaleString()} Duration ${e['fly_duration']}`,
          footer: `Depart time: ${dTime}, Arrival time: ${aTime}`,
        })
        o.push(list)
        return o;
      },[])
      conv.ask(new BrowseCarousel({
        items: [...table]
      }))
      let linkSuggestion = `https://www.kiwi.com/deep?from=${codeCountry}&to=BKK&departure=${moment(parameters['date']).format("YYYY-MM-DD")}
      &return=${moment(parameters['date1']).format("YYYY-MM-DD")}&passengers=${parameters['number-integer']}&currency=THB`
      conv.ask(new LinkOutSuggestion({
        name: 'See more flight',
        url: linkSuggestion
      }))
    }catch(err) {
      console.log('ERROR!:',err)
      conv.ask(`Sorry, I cannot find flight for ${parameters.location.country}`)
    }
  }
  else{
    console.log('conv!',JSON.stringify(parameters))
    conv.ask(incoming.parsed)
  }
});



exports.manow = functions.https.onRequest(app);

