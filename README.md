Example Node.js Clients for the Clearhaus API
=============================================

This repository aims to guide you on how to access and traverse the Clearhaus API via any client implemented in JavaScript and specifically Node.js.

The example clients range from implementing simple scenarios like listing all transactions to more complex ones like accessing latest open disputes, uploading files supporting your case and subsequently refuting the dispute.

The code examples could just as easily be used in any popular front-end framework like Angular or React with minimal or no change.

Documentation
-------------

See the [Clearhaus API documentation](http://developer.clearhaus.com/) for an in depth view.

Requirements
------------

In order to run these example clients on your machine you will need:

 1. A Clearhaus account ([create a staging account](https://identity-staging.clrhs.dk/signup) for development)
 2. Node.js installed on your machine ([download](https://nodejs.org/en/))

Usage
-----

 1. Edit `src/common/config.js` with your private credentials corresponding to your Clearhaus account
 2. Execute in your terminal any of the scenarios that interests you, using node. For example to list all transactions:
 
 ```shell
$ node src/merchant-api/transactions/listTransactions.js
```
