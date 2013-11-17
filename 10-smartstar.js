/**
 * Copyright 2013 Freak Enterprises
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// SmartStar Node-RED node file
var util = require('util');

// Require main module
var RED = require(process.env.NODE_RED_HOME+"/red/red");

// The main node definition - most things happen in here
function SmartstarNode(n) {
    // Create a RED node
    RED.nodes.createNode(this,n);

    // Store local copies of the node configuration (as defined in the .html)
    var node = this;
    this.topic = n.topic;
    
    node.lights = { red: false, blue: false, green: false }
    
    function lightUp() {
//    	node.log(util.format("Lights: ", node.lights));
//TODO: use GPIO to switch relays
    	
    }
    
    this.on("input", function(msg) {  
    
    	for (light in node.lights) {
    		node.lights[light] = false;
    	}
      
      msg.payload.forEach(function(light) {
        //console.log("we got light " + light);
        if (light == 'red' || light == 'purple') { node.lights.red = true } 
        if (light == 'green') { node.lights.green = true } 
        if (light == 'blue') { node.lights.blue = true } 
      });   
         
    	node.log((node.lights.red ? "1" : "0") + 
    					 (node.lights.blue ? "1" : "0") + 
    					 (node.lights.green ? "1" : "0") + 
    					 " - " + msg.payload); 

      lightUp();
    });

    this.on("close", function() {
        // Called when the node is shutdown - eg on redeploy.
        // Allows ports to be closed, connections dropped etc.
        // eg: this.client.disconnect();
        for(light in node.lights) {
        	node.lights[light] = false;
        }
        lightUp()
    });
}

// Register the node by name. This must be called before overriding any of the
// Node functions.
RED.nodes.registerType("smartstar",SmartstarNode);
