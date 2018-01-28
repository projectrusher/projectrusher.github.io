let org;
let runner;
let loop;
const baseUrl = 'https://projectrusher.herokuapp.com';

const HttpClient = function() {
  this.get = function(aUrl, aCallback, errCallBack) {
      var anHttpRequest = new XMLHttpRequest();
      anHttpRequest.onreadystatechange = function() { 
          if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
            aCallback(anHttpRequest.responseText);
          else if(anHttpRequest.readyState == 4 && anHttpRequest.status == 404)
            errCallBack();
      }

      anHttpRequest.open( "GET", aUrl, true );            
      anHttpRequest.send( null );
  }
}

function activePoll(){ 
  const client2 = new HttpClient();
  client2.get(`${baseUrl}/runners/${runner.username}`, (response) => {
    let obj = JSON.parse(response);
    if(obj.meters !== runner.meters) {
      runner = obj;
      console.log(angular.element(document.getElementById('game')).scope());
      angular.element(document.getElementById('game')).scope().startfunction(runner.meters);
    }
  }, () => {
    console.log("CANNOT CONTACT SERVER OR RUNNER DOESN'T EXIST ANYMORE")
  })

  client2.get(`${baseUrl}/org/${org.name}`, (response) => {
    org = JSON.parse(response);
    insertTab();
  }, () => {
    console.log("CANNOT CONTACT SERVER OR RUNNER DOESN'T EXIST ANYMORE")
  })
}

function createRunner(run, xgender) {
  var xhr = new XMLHttpRequest();
  var url = `${baseUrl}/runners`;
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        runner = {username: run, meters: 0, gender: xgender}
        xhr = new XMLHttpRequest();
        url = `${baseUrl}/org/${org.name}`;
        xhr.open("PUT", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
              document.getElementById('formZone').innerHTML = '';
              org.members.push(runner);
              insertTab();
              loop = setInterval(activePoll, 5000);
              console.log("RUNNER AND ORG EXISTS")
            }
        };
      
        var data = runner.username;
        xhr.send(data);

      }
  };

  var data = JSON.stringify({username: run, meters: 0, gender: parseInt(xgender)});
  xhr.send(data);
}

function createOrg(orga, runName, gender) {
  var xhr = new XMLHttpRequest();
  var url = `${baseUrl}/org`;
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        org = {name: orga, members: []};
        createRunner(runName, gender);
      }
  };

  var data = JSON.stringify({name: orga, members: []});
  xhr.send(data);
}

function insertTab() {
  let table = '<table class="suptab"><tr style="color:red"><th>Username</th><th>Meters traveled</th><th>Gender</th></tr>'
  for(let i = 0; i < org.members.length; i++) {
    table += '<tr>';
    if(org.members[i].username === runner.username)
      table += `<td style="color:green">${org.members[i].username}</td>`;
    else
      table += `<td>${org.members[i].username}</td>`;
    table += `<td>${org.members[i].meters}m.</td>`;
    table += `<td><img src="../assets/gender${org.members[i].gender}.png" height="70px" height="50px"></img></td>`;
    table += '</tr>';
  }
  table += '</table>';

  document.getElementById('formZone').innerHTML = table;
}

function newUser() {
  const client = new HttpClient();
  const orgName = document.getElementById('org').value;
  const runName = document.getElementById('name').value;
  const gender = document.getElementById('gender').value;
  client.get(`${baseUrl}/org/${orgName}`, (response) => {
    client.get(`${baseUrl}/runners/${runName}`, (response) => {
      runner = JSON.parse(response);
      angular.element(document.getElementById('game')).scope().score = runner.meters;
      angular.element(document.getElementById('game')).scope().$apply();
      angular.element(document.getElementById('game')).scope().addGrant(runner.gender);      
      document.getElementById('formZone').innerHTML = '';
      insertTab();
      loop = setInterval(activePoll, 5000);
      console.log("RUNNER AND ORG EXISTS")
    }, () => {
      // WHEN NOT FOUND
      createRunner(runName, gender)
      console.log("RUNNER DOESN'T EXIST, NEED TO CREATE IT");
    });
    org = JSON.parse(response);
  }, () => {
    // WHEN NOT FOUND
    createOrg(orgName, runName, gender);
    console.log("RUNNER AND ORG DOESN'T EXIST, NEED TO CREATE THEM");
  });
}