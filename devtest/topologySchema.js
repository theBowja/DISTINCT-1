var topologySchema = {
	"type": "object",
	"properties": {
		"nodes": {
			"type": "array",
			"items": {
				//"additionalProperties": false,
			    "type": "object",
			    "properties": {
			    	"name": { "type": "string" },
			    	"color": { "type": "string" }
			    },
			    "required": ["name", "color"]
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
	"required": ["nodes", "links"]
};