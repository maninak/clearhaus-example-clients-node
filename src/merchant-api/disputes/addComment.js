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
        qs: { query: 'status:open' },                         // query for specific resources using TQL
      })
      .follow('ch:accounts', 'ch:accounts', 'ch:disputes', 'ch:disputes', 'ch:comments')  // follow specified links
      .post({ body: 'Please see attached files.' }, (error, firstResource) => {
        if (error) {
          console.error('Adding comment failed with error:\n', error)
        } else {
          console.log(firstResource.body);  // we have our resource, let's print it!
        }
      });
  })
  .catch( (error) => {
      console.error('Authentication failed with error:\n', error);
  });