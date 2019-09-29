const axios = require('axios')
const urlCode = `https://gist.githubusercontent.com/ssskip/5a94bfcd2835bf1dea52/raw/1c16c6ab66eb72e47401110bc977977970238877/ISO3166-1.alpha2.json`
const kiwiFlight = `https://api.skypicker.com/flights`
searchFlight = (data) => {
  return new Promise((resolve, reject) => {
    axios({
      url: `${kiwiFlight}`,
      method : 'get',
      params: data,
      responseType: 'application/json'
    }).then(res => {
      const { data } = res    
      resolve(data.data)
    }).catch(err => reject(err))
  })
}
getCodeCountry = (country) => {
  return new Promise((resolve, reject) => {
    axios({
      url: urlCode,
      method : 'get',
      responseType: 'application/json'
    }).then(res => {
      const { data } = res
      for( key in data){
          if(data[key].toLowerCase() == country.toLowerCase()){
            console.log('codeCountry:',key)
            resolve(key)
          }
       }
      reject('try again')
    })
  }) 
}
module.exports = { getCodeCountry, searchFlight }