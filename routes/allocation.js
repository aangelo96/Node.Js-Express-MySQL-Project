var express = require('express');
var router = express.Router();

/* Single User Allocation */
router.post('/', function(req, res) {
  const caller = req.body.caller;
  let count = req.body.count;

  const token = 'a044b264-2fae-4460-987e-4dc160bcc18b';
  const auth = 'Bearer '+ token;
  const path = 'https://api.glideapp.io/api/function/queryTables';
  const pathEdit = 'https://api.glideapp.io/api/function/mutateTables';
  
  const body = {
    "appID": "Akn2Hw3S3NA6cYpTE7l5",
    "queries": [
      {
        "tableName": "Contacts",
        "utc": true
      }
    ]
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth
    },
    body: JSON.stringify(body)
  };

  fetch(path, options).then((response) => response.json()).then((resData) => {

    const filtered = resData[0].rows.filter((item) => {return !item.hasOwnProperty('Response')&&!item.hasOwnProperty('Caller')});
    let arr = [];
    console.log(filtered.length);
    if (filtered.length<count) {
      count = filtered.length;
    }

    for(var i=0; i<count; i++) {
      // action here

      const editBody = {
        "appID": "Akn2Hw3S3NA6cYpTE7l5",
        "mutations": [
          {
            "kind": "set-columns-in-row",
            "tableName": "Contacts",
            "columnValues": {
              "Caller": caller
            },
            "rowID": filtered[i]["🔒 Row ID"]
          }
        ]
      };

      const editOption = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth
        },
        body: JSON.stringify(editBody)
      };

      fetch(pathEdit, editOption);

      arr.push(filtered[i]);
    }

    const text = 'We have allocated '+arr.length+' contacts for you. Please wait for a couple of seconds for the contacts to appear in your app. If the contacts doesn\'t appear within 2 minutes, please try again.';

    res.send(text);
  });
});

/* All User Allocation */
router.post('/all', async function(req, res) {
  let count = req.body.count;
  let role = req.body.role;

  console.log(role);

  const token = 'a044b264-2fae-4460-987e-4dc160bcc18b';
  const auth = 'Bearer '+ token;
  const path = 'https://api.glideapp.io/api/function/queryTables';
  const pathEdit = 'https://api.glideapp.io/api/function/mutateTables';

  // Get all users

  const bodyUser = {
    "appID": "Akn2Hw3S3NA6cYpTE7l5",
    "queries": [
      {
        "tableName": "e3d0185c-39d9-431f-b650-f75ebd5bd489",
        "utc": true
      }
    ]
  };

  const optionsUser = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth
    },
    body: JSON.stringify(bodyUser)
  };

  let users = [];

  await fetch(path, optionsUser).then((response) => response.json()).then((resData) => {
    users = resData[0].rows.filter((item) => {return role ? item.Role === role : item.Role === 'Volunteer'});
  });

  // Get Contacts
  
  const body = {
    "appID": "Akn2Hw3S3NA6cYpTE7l5",
    "queries": [
      {
        "tableName": "Contacts",
        "utc": true
      }
    ]
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth
    },
    body: JSON.stringify(body)
  };

  let contacts = [];

  await fetch(path, options).then((response) => response.json()).then((resData) => {
    contacts = resData[0].rows.filter((item) => {return !item.hasOwnProperty('Response')&&!item.hasOwnProperty('Caller')});
  });
  
  // Check Amount of contacts

  if (contacts.length/users.length < count) {
    count = contacts.length/users.length;
  }

  // Allocation
  let itemIndex = 0;

  for (let i=0; i<users.length; i++) {
    for (let j=0; j<count; j++) {
      const editBody = {
        "appID": "Akn2Hw3S3NA6cYpTE7l5",
        "mutations": [
          {
            "kind": "set-columns-in-row",
            "tableName": "Contacts",
            "columnValues": {
              "Caller": users[i]['Email']
            },
            "rowID": contacts[itemIndex]["🔒 Row ID"]
          }
        ]
      };
  
      const editOption = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth
        },
        body: JSON.stringify(editBody)
      };
  
      fetch(pathEdit, editOption);
      itemIndex++;
    }
  }
  
  res.send({ 'users': users.length, 'allocation_per_user': count, 'allocation_total': itemIndex, 'role': role?role:'', 'message': 'Success' });
});

module.exports = router;
