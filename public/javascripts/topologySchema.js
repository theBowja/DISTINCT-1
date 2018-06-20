var topologySchema = {
	"type": "object",
	"properties": {
		"toponame": {
			"type": "string",
			"minlength": 1,
			"maxlength": 50
		},
		"nodes": {
			"type": "array",
			"items": {
				//"additionalProperties": false,
			    "type": "object",
			    "properties": {
			    	"name": { "type": "string" },
			    	"nodetype": { "enum": ["XO Medium", "XO Extra large", "XO Large", "XO Small"] },
			    	"image": {
			    		"type": "string",
			    		"format": "url"
			    	}
			    },
			    "required": ["name", "nodetype", "image"]
			}
		},
		"links": {
			"type": "array",
			"items": {
			   	"type": "object",
			   	"properties": {
			   		"source": {
			   			"type": "string",
			   			"containsNodeName": { "$data": "0"}
			   		},
			   		"target": {
			   			"type": "string",
			   			"containsNodeName": { "$data": "0"}
			   		}
			   	},
			   	"required": ["source", "target"]
			}
		}
	},
	"required": ["toponame", "nodes", "links"]
};

// should show as an error in browser and hopefully not affect anything then
module.exports = topologySchema;