export function createImageCache() {
	let imgs = new Map();
	//let tms = new Map();
	
	/*
	setInterval(function(){
		tms.forEach(function(value, key, map) {
			if(new Date().now() - value >= 60000) {
				imgs.delete(key);
		//		tms.delete(key);
			}
		})
	}, 6000);
*/
	function addImg(src) {
		if(typeof src !== "string") {
			// console.log("invalid src");
			return;
		}
		
		console.log("trying to load: " + src);
		let img = new Image();
		img.onload = function() {
			imgs.set(src, img);
			console.log("Image loaded: " + src);
			//tms.set(src, new Date().now());
		};
		img.src = src;
	}
	
	function getImg(src) {
		if(typeof src !== "string") {
			// console.log("invalid src");
			return null;
		}
		
		console.log("returning image mapped to: " + src);
		//let tm = tms.get(src);
		//if(tm === undefined) return tm;
		//tm = new Date().now();
		return imgs.get(src);
	}
	
	return {
		addImg,
		getImg
	}
}
