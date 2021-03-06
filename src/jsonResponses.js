
const crypto = require('crypto');

const drinks = {
    "Allagash White": {
    "name": "Allagash White",
    "company": "Allagash Brewery",
    "imgurl": "http://www.allagash.com/wp-content/uploads/Yearly_White12ozAdjusted-02.png",
        "desc": "Excellent  Belgian white beer. One of my personal favorites.",
        "type": "beer",
    },
    "No. 9":{
	"imgurl": "http://www.magichat.net/img/elixirs/bottleswithpints/9.png",
    "name": "No. 9",
	"company": "Magic Hat Brewery",
        "desc": "Not quite a pale ale from Vermont. It's tasty.",
        "type": "beer",
    },
     "orange juice": {
    "name": "orange juice",
    "company": "Tropicana",
    "imgurl": "http://www.theyoungmommylife.com/wp-content/uploads/2012/06/4850030102CF.png",
         "desc": "On the first sip I wasn't sold. As a proponent of pulp I felt cheated. After the second sip my life has totally  changed and its safe to say this is the nectar of the gods.",
         "type": "juice",
    },
    "Cranberry":{
	"imgurl": "http://supplybox.ca/media/catalog/product/cache/1/image/600x600/9df78eab33525d08d6e5fb8d27136e95/o/c/ocean-spray-cranberry.png",
    "name": "Cranberry",
	"company": "Ocean Spray",
        "desc": "Its cranberry juice... its pretty good",
        "type": "juice",
    },
       "Chardonnay": {
    "name": "Chardonnay",
    "company": "Cupcake",
    "imgurl": "http://2.bp.blogspot.com/-fUEQ1T-q9so/T-pHNHW4N3I/AAAAAAAACPc/07bz5r_BxQc/s1600/wine-chardonnay.png",
    "desc": "I have very little knowledge  of wine. I didn't mind this one",
           "type": "wine",
    },
    "Hendrick's":{
	"imgurl": "https://www.laithwaites.co.uk/images/uk/en/law/product/73152b.png",
    "name": "Hendrick's",
	"company": "William Grant & Sons",
    "desc": "It's a gin. Tastes like pine needles with a hint of cucumber",
    "type": "liquor",
    },
     "Coke":{
	"imgurl": "http://www.pngpix.com/wp-content/uploads/2016/03/Coca-Cola-Bottle-PNG-image.png",
    "name": "Coke",
	"company": "Coca-Cola",
    "desc": "I can't get enough of this stuff!!! It's slowly dissolving my teeth but I want more!",
    "type": "soda",
    },
      "Mountain Dew":{
	"imgurl": "http://vignette2.wikia.nocookie.net/mountaindew/images/9/91/Mdbottle_zps52ac0b35.png/revision/latest?cb=20140727190433",
    "name": "Mountain Dew",
	"company": "PepsiCo",
    "desc": "Paired with nacho chees doritos, would highly recomend.",
    "type": "soda",
    }
};

let etag = crypto.createHash('sha1').update(JSON.stringify(drinks));
let digest = etag.digest('hex');

const respondJSON = (request, response, status, object) => {
    
    const headers = {
        'Content-Type': 'application/json',
        etag: digest,
    };
    
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
    
};


const respondJSONMeta = (request, response, status) => {
    
      const headers = {
        'Content-Type': 'application/json',
        etag: digest,
    };
    
  response.writeHead(status, headers);
  response.end();
    
};


const getDrinks = (request, response) => {
    
  const responseJSON = {
    drinks,
  };
 return respondJSON(request, response, 200, responseJSON);
};

const getDrinksMeta = (request, response) => {
  if(request.headers['if-none-match'] === digest){
      return respondJSONMeta(request, response, 304);
  }  
};


const notFound = (request, response) => {
  const responseJSON = {
      message: 'Cannot find the page you are looking for',
      id:'notFound',
  } 
  
  respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => {
    respondJSONMeta(request, response, 404);
}


const addDrink = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Name and company are both required.',
  };

  if (!body.name || !body.company) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;


  if (drinks[body.name]) {
    responseCode = 204;
  } else {
    drinks[body.name] = {};
        drinks[body.name].name = body.name;
  drinks[body.name].company = body.company;
  drinks[body.name].imgurl = body.imgurl;
  drinks[body.name].desc = body.desc;
  drinks[body.name].type = body.type;
  }



  
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
    
  return respondJSONMeta(request, response, responseCode);
};


const getDrinkPage = (request, response, typ) => {
    
    let fixedType = decodeURI(typ);
    
    const requestedDrink = drinks[fixedType];
    
    const responseJSON = {
      requestedDrink,
    };
    return respondJSON(request, response, 200, responseJSON);
};

const sortDrinks = (request, response, query) => {
    const querys = query.split('=');
    let sortedDrinks = {}; 
    
    let keys = Object.keys(drinks);
    
    if(querys[1] === 'all'){
        return getDrinks(request, response);
    } else {
    
    for(let i = 0; i < keys.length; i++){
    
        if(drinks[keys[i]].type === querys[1]){
            
            if(sortedDrinks[drinks[keys[i]].name]){
               // empty
            }else{
            sortedDrinks[drinks[keys[i]].name] = drinks[keys[i]];
            }
        }
    };
    }
    
     const responseJSON = {
         sortedDrinks,
     };
    
     return respondJSON(request, response, 200, responseJSON);
};



// public exports
module.exports = {
    getDrinkPage,
  getDrinks,
    getDrinksMeta,
    notFound,
    notFoundMeta,
    addDrink,
    sortDrinks,
};
