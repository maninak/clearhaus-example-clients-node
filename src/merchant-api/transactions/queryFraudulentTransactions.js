const request = require('request-promise');
const traverson = require('traverson');
const JsonHalAdapter = require('traverson-hal');

const CONFIG = require('../../common/config.js');
const OAUTH_REQ_OPTIONS = require('../../common/oauthReqOptions.js');

// register the traverson-hal plug-in for support of media type 'application/hal+json'
traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);


// STEP 0: request an API access token
request.post(OAUTH_REQ_OPTIONS)
  .then( (oauthResponse) => {
    let oauthToken = JSON.parse(oauthResponse).access_token;
    
    // STEP 1: traverse Clearhaus API
    traverson
      .from(CONFIG.API_ROOT)    // set API root URL
      .jsonHal()                // force media type to application/hal+json
      .withRequestOptions({
        headers: { 'Authorization': `Bearer ${oauthToken}` }, // set HTTP header with our granted OAuth token
        qs: { query: 'flag:fraud fraud.date:this_month' },    // query for specific resources using TQL
      })
      .follow('ch:transactions') // follow specified links or resources in succession
      .getResource( (error, firstResource) => {
        if (error) {
          console.error('Getting resource failed with error:\n', error)
        } else {
          console.log(JSON.stringify(firstResource)); // we have our resource, let's print it!
        }
      });
  })
  .catch( (error) => {
      console.error('Authentication failed with error:\n', error);
  });
