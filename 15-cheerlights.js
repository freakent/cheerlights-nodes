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
function CheerlightsNode(n) {
    // Create a RED node
    RED.nodes.createNode(this,n);

    // Store local copies of the node configuration (as defined in the .html)
    var node = this;
    this.topic = n.topic;
    
    node.regexp = /\b(red|blue|green|purple)\b/g;

		node.patterns = [];    
		if (typeof n.pattern == "string" && n.pattern.length > 0) {
			node.default_pattern = JSON.parse("[" + n.pattern + "]");
		} else {
		  node.default_pattern = [['red', 'blue', 'green'], [], ['red', 'blue'], ['blue'], ['green']];
		}
		node.current_step = 0;
    node.current_pattern = node.default_pattern;
    
    nextStep();

    function nextStep() {
    	//console.log(util.format("Step %d, %j", node.current_step, node.current_pattern[node.current_step]));
      msg = {};
      msg.payload = node.current_pattern[node.current_step];
    	node.send(msg);
    	node.current_step++;
      if (node.current_step >= node.current_pattern.length) { node.current_step = 0 };        
      node.stepTimer = setTimeout(nextStep, 1000);
    }
    
    function switchPattern() {
      if (node.patterns.length > 0) {
      	node.current_pattern =  node.patterns.shift();
    		node.log(util.format("Switching pattern to custom pattern: %j", node.current_pattern));
      	node.patternTimer = setTimeout(switchPattern, 30000);
      } else {
      	node.log("Switching to default pattern");
        node.current_pattern = node.default_pattern;
      }    	
      node.current_step = 0;
    }
    
    this.on("input", function(msg) {
      var colours = msg.payload.toLowerCase().match(node.regexp);
      
      if (!colours) { 
      	node.log(util.format("Ignoring message, no colours found.\n%s", msg.payload));
      	return;
      }
      
      var pattern = colours.map(function(colour) { return [ colour ] } );    	
      	
      //console.log(util.format("start: '%s' == end: '%s' (%s)", pattern[0], pattern[pattern.length -1], pattern[0] == pattern[pattern.length -1]));
      if (pattern[0].toString() == pattern[pattern.length -1].toString()) {
        //console.log("Adding a blank");
      	pattern.push([]);
      }
    	node.patterns.push(pattern);
    	node.log(util.format("New pattern %j", pattern)); 
    	if (node.current_pattern == node.default_pattern) {
    		switchPattern();
    	} 
    });

    this.on("close", function() {
        // Called when the node is shutdown - eg on redeploy.
        // Allows ports to be closed, connections dropped etc.
        // eg: this.client.disconnect();
        clearTimeout(node.patternTimer);
        clearTimeout(node.stepTimer);
    });
}

// Register the node by name. This must be called before overriding any of the
// Node functions.
RED.nodes.registerType("cheerlights",CheerlightsNode);
