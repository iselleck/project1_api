
const crypto = require('crypto');

let drinks = {
    "White": {
    "name": "white",
    "company": "Allagash",
    "imgurl": "http://www.allagash.com/wp-content/uploads/Yearly_White12ozAdjusted-02.png"
    },
    "Magic":{
	"imgurl": "http://www.magichat.net/img/elixirs/bottleswithpints/9.png",
    "name": "No. 9",
	"company": "Magic Hat Brewery"
    },
     "Tropicana": {
    "name": "Orange Juice",
    "company": "Tropicana",
    "imgurl": "http://www.theyoungmommylife.com/wp-content/uploads/2012/06/4850030102CF.png"
    },
    "ocaen cran":{
	"imgurl": "http://supplybox.ca/media/catalog/product/cache/1/image/600x600/9df78eab33525d08d6e5fb8d27136e95/o/c/ocean-spray-cranberry.png",
    "name": "Cranberry",
	"company": "Ocean Spray"
    },
       "Cupcake Chardonnay": {
    "name": "Chardonay",
    "company": "Cupcake",
    "imgurl": "http://2.bp.blogspot.com/-fUEQ1T-q9so/T-pHNHW4N3I/AAAAAAAACPc/07bz5r_BxQc/s1600/wine-chardonnay.png"
    },
    "Hendrick's":{
	"imgurl": "https://www.laithwaites.co.uk/images/uk/en/law/product/73152b.png",
    "name": "Hendrick's gin",
	"company": "Hendricks"
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
  }



  
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
    
  return respondJSONMeta(request, response, responseCode);
};

// public exports
module.exports = {
  getDrinks,
    getDrinksMeta,
    notFound,
    notFoundMeta,
    addDrink,
};
