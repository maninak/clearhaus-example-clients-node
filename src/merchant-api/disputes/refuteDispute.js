// Unfortunately regular `request` lib is needed here as well for the file data upload,
// because `request-promise` cannot handle incoming streams e.g. from `fs`.
const req = require('request');
const request = require('request-promise');
const traverson = require('traverson');
const JsonHalAdapter = require('traverson-hal');
const find = require('lodash/find');
const fs = require('fs');

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
      })
      .follow('ch:accounts', 'ch:accounts', 'ch:disputes', 'ch:disputes', 'ch:files')
      .post({
          name: 'CustomerInvoice.pdf',
          label: 'customer invoice',
          content_type: 'application/pdf'
        },
        (error, firstResource) => {
          if (error) {
            console.error('Adding file metadata failed with error:\n', error)
          } else {
            let invoice = JSON.parse(firstResource.body);
            
            // STEP 3: PUT the binary content to ch:data upload href
            // find the ch:data object with name 'refuted' and store it's associated href
            let uploadHref = find(invoice['_links']['ch:data'], ['name', 'upload']).href;
            // then make the PUT request to it uploading the file's actual binary data
            fs.createReadStream(`${__dirname}/../../assets/CustomerInvoice.pdf`)
              .pipe(
                req.put({
                    url: uploadHref,
                    headers: { 'Authorization': `Bearer ${oauthToken}` },
                  },
                  (error, response, body) => {
                    if (error) {
                      console.error('Uploading file data failed with error:\n', error);
                    } else {
                      
                      // STEP 4: PUT the `refuted` stamp to mark the dispute as refuted
                      traverson
                        .from(CONFIG.API_ROOT)
                        .jsonHal()
                        .withRequestOptions({ headers: { 'Authorization': `Bearer ${oauthToken}` } })
                        .follow('ch:accounts', 'ch:accounts', 'ch:disputes', 'ch:disputes')
                        .getResource( (error, firstResource) => {  // get the dispute as a resource
                          if (error) {
                            console.error('Getting resource failed with error:\n', error)
                          } else {
                            // find the ch:stamp object with name 'refuted' and store it's associated href
                            let refuteHref = find(firstResource['_links']['ch:stamps'], ['name', 'refuted']).href;
                            // then make the PUT request to it
                            request.put({
                                url: refuteHref,
                                headers: { 'Authorization': `Bearer ${oauthToken}` },
                            })
                              .then( (response) => { console.log('Refuting the dispute resulted in:\n', response); })
                              .catch( (error) => { console.error('Refuting the dispute failed with error:\n', error) });
                          }
                        });
                    }
                  }
                )
              );    
          }
        }
      );      
  })
  .catch( (error) => {
      console.error('Authentication failed with error:\n', error);
  });
