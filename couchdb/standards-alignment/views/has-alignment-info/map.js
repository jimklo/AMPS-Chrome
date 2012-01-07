function(doc) {
	if (doc.doc_type == "resource_data" && doc.resource_data && doc.resource_locator) {
		try {
			var nsdl = eval(doc.resource_data);
			var dct = new Namespace("http://purl.org/dc/terms/");

			var stds = nsdl..dct::conformsTo

			for (idx in stds) {
				emit(doc.resource_locator,null);
				break;
			}
  			
		} catch (error) {
			log("error:"+error);
		}
	}
}