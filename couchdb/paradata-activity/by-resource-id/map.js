function(doc) {
	if (doc.doc_type == "resource_data" && doc.resource_data_type == "paradata" &&
			doc.resource_data && doc.resource_locator) {
		try {
			var res = doc.resource_data;
			var action = res.verb.action;
			var isparadata = false;
			for (var i=0; i < doc.payload_schema.length; i++) {
				if (doc.payload_schema[i] === "LR Paradata 1.0") {
					try {
						if (res.content) {
							isparadata = true;
						}
						break;
					} catch (e0) {}
				}
			}

			if (isparadata) {
				var emitted = {};
				emit([doc.resource_locator, action, res.content], null);
				emitted[doc.resource_locator] = true;
				
				try {
					if (!emitted[res.verb.context.id]) {
						emit([res.verb.context.id, action, res.content],null);
						emitted[res.verb.context.id] = true;
					}
				} catch (e1) {}

				try {
					if (!emitted[res.object.id]) {
						emit([res.verb.context.id, action, res.content],null);
						emitted[res.verb.context.id] = true;
					}
				} catch (e1) {}

			}
  			
		} catch (error) {
			log("error:"+error);
		}
	}
}