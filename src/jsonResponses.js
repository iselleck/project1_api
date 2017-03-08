
const crypto = require('crypto');

let drinks = {};

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
    message: 'Name and age are both required.',
  };

  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;


  if (drinks[body.name]) {
    responseCode = 204;
  } else {
    drinks[body.name] = {};
  }

  drinks[body.name].name = body.name;
  drinks[body.name].age = body.age;
    drinks[body.name].imgurl = body.imgurl;

  
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
