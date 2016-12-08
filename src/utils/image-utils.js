export function createImageCache() {
	let imgs = new Map();
	let tms = new Map();
	
	
	// setInterval(function(){
		// tms.forEach(function(value, key, map) {
			// if(new Date().now - value >= 60000) {
				// imgs.delete(key);
				// tms.delete(key);
			// }
		// })
	// }, 6000);

	function addImg(src) {
		if(typeof src !== "string") {
			return;
		}
		
		let img = new Image();
		img.onload = function() {
			imgs.set(src, img);
			tms.set(src, new Date().now);
		};
		img.src = src;
	}
	
	function getImg(src) {
		if(typeof src !== "string") {
			return null;
		}
		
		let tm = tms.get(src);
		if(tm === undefined) {
			return tm;
		}
		tm = new Date().now;

		return imgs.get(src);
	}
	
	return {
		addImg,
		getImg
	}
}
