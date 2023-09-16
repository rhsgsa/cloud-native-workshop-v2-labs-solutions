//  OpenShift sample Node application
var express = require('express'),
    http = require('http'),
    request = require('request'),
    fs = require('fs'),
    app = express(),
    path = require("path"),
    keycloakConfig = require('./app/keycloak.config.js'),
    coolstoreConfig = require('./app/coolstore.config.js'),
    Keycloak = require('keycloak-connect'),
    cors = require('cors');
    const fetch = require('node-fetch');
    const https = require('https');


var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    secport = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8443;

// Enable CORS support
app.use(cors());

// error handling
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something bad happened!');
});

// keycloak config server
app.get('/keycloak.json', function (req, res, next) {
    res.json(keycloakConfig);
});
// coolstore config server
app.get('/coolstore.json', function (req, res, next) {
    res.json(coolstoreConfig);
});

//https://kubernetes.io/docs/tasks/run-application/access-api-from-pod/
async function getKubernetesNodeInfo(nodeName) {

  const  apiServer = 'https://kubernetes.default.svc';
    // Read the Kubernetes service account token from the file
  const tokenPath = '/var/run/secrets/kubernetes.io/serviceaccount/token';
  let token;
  try {
    token = fs.readFileSync(tokenPath, 'utf8');
  } catch (error) {
    throw new Error(`Error reading service account token: ${error.message}`);
  }

  // Read the CA certificate from the file
  const caCertPath = '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt';
  let caCert;
  try {
    caCert = fs.readFileSync(caCertPath, 'utf8');
  } catch (error) {
    throw new Error(`Error reading CA certificate: ${error.message}`);
  }

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    //https://stackoverflow.com/questions/52478069/node-fetch-disable-ssl-verification
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
  
    const requestOptions = {
      method: 'GET',
      headers: headers,
      ca: caCert,
      agent: httpsAgent,
    };
  
    
    try {
      const response = await fetch(`${apiServer}/api/v1/nodes/${nodeName}`, requestOptions);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const nodeInfo = await response.json();
      return nodeInfo;
    } catch (error) {
      throw new Error(`Error fetching Kubernetes node info for ${nodeName}: ${error.message}`);
    }
  }
  

app.get('/info.js', async function (req, res, next) {
    var info = {};
    //demo purpose only. poorman solution for reading node label topology.kubernetes.io/zone
    var nodeName = process.env.MY_NODE_NAME;

    if(nodeName){
        var zoneLabel = '';
        try {
            const nodeInfo = await getKubernetesNodeInfo(nodeName);
            console.log(`Kubernetes Node Info for ${nodeName}:`);
            console.log(`Name: ${nodeInfo.metadata.name}`);
            console.log(`Labels:`, nodeInfo.metadata.labels);

            zoneLabel = nodeInfo.metadata.labels['topology.kubernetes.io/zone'];
            console.log(`Zone:`, zoneLabel);
            console.log('---');
        } catch (error) {
            console.error(error.message);
        }
        
        if(nodeName.startsWith("aro")){
            //example aro-cluster-85bzn-6s6c2-worker-eastus1-fl9vq
            info.provider = 'azure';
            info.zone = zoneLabel;
        }else if(nodeName.startsWith("gcp")){
            //gcp-ocp-cluster-1-b54lg-worker-c-6qdtp.c.openenv-nh86r.internal
            info.provider = 'gcp';
            info.zone = zoneLabel;
            
        }else if(nodeName.indexOf("compute.internal")>0) {
            info.provider = 'aws';
            info.zone = zoneLabel;
        }else{
            
        }
    }else{
            
    }
    info.provider = process.env.PROVIDER?process.env.PROVIDER:info.provider;
    info.region = process.env.REGION?process.env.REGION:info.region;
    info.zone = process.env.ZONE?process.env.ZONE:info.zone;
    console.log('var info = ' + JSON.stringify(info));
    res.send('var info = ' +  JSON.stringify(info));
});

app.use(express.static(path.join(__dirname, '/views')));
app.use('/app', express.static(path.join(__dirname, '/app')));
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

console.log("coolstore config: " + JSON.stringify(coolstoreConfig));
console.log("keycloak config: " + JSON.stringify(keycloakConfig));


http.createServer(app).listen(port);

console.log('HTTP Server running on http://%s:%s', ip, port);

module.exports = app;