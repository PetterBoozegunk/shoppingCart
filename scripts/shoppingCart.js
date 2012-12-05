(function (window) {
	"use strict";

	var createShoppingCart,
		util;

	/* -- util -- */
	util = {
//		trim : function (str) {
//			return str.replace(/(^\s+|\s+$)/g, "");
//		},
//		cookie : {
//			get : function (cookieName) {
//				var cookies = document.cookie.split(";"),
//					i,
//					l = cookies.length,
//					ret = "",
//					split,
//					name,
//					value;

//				for (i = 0; i < l ; i += 1) {
//					split = util.trim(cookies[i]).split("=");
//					name = split[0];
//					value = split[1];

//					if (name === cookieName) {
//						ret = decodeURIComponent(value);
//						break;
//					}
//				}

//				return ret;
//			},
//			set : function (name, value, days, path) {
//				var d = days || 365,
//					p = path || "/",
//					date = new Date(),
//					expires;
//				
//				date.setTime(date.getTime() + (d * 24 * 60 * 60  *1000));
//				expires = "; expires=" + date.toGMTString();
//				
//				document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=" + p + ";";
//			},
//			remove : function (cookieName) {
//				util.cookie.set(cookieName, "", -1);
//			}
//		},
		updateElements : function (e) {
			var that = e.targetObject,
				property = e.property,
				value = that.get(property),
				elements = that.get("elements"),
				propertyElements,
				i,
				l;

			if (elements && property !== "elements") {
				propertyElements = elements.get(property);

				if (propertyElements && propertyElements.length) {

					l = propertyElements.length;

					for (i = 0; i < l; i += 1) {
						if (propertyElements[i].tagName === "INPUT") {
							propertyElements[i].setAttribute("value", value);
						} else {
							propertyElements[i].innerHTML = value;
						}
					}
				}
			}
		},
		addPropertyElement : function (propertyName, element) {
			var elements = this.get("elements"),
				elementArray = elements.get(propertyName),
				currentValue = this.get(propertyName);

			if (!elementArray) {
				elementArray = elements.set(propertyName, []);
			}

			if (element.tagName === "INPUT") {
				element.setAttribute("value", currentValue);
			} else {
				element.innerHTML = currentValue;
			}

			elementArray.push(element);
		},
		getProductOptions : function (parent, options) {
			var that = {},
				k,
				price = options.price ? options.price.toFixed(2) : (0).toFixed(2);

			for (k in options) {
				if (options.hasOwnProperty(k)) {
					if (price && k === "price") {
						that[k] = price;
					} else {
						that[k] = options[k];
					}
				}
			}

			that.parent = parent;

			if (!that.price) {
				that.price = (0).toFixed(2);
			}

			that.isProduct = true;
			that.nbrUnits = 0;

			that.addPropertyElement = util.addPropertyElement;

			return that;
		},
		removeProductWhenNbrUnitsIsZero : function (e) {
			if (e.value === 0) {
				var data = e.data,
					that = data.context,
					productId = data.productId;

				that.removeProduct(productId);
			}
		},
//		setCookie : function (productId, nbrUnits) {
//			var cookie = util.cookie.get("cart"),
//				re = new RegExp("(" + productId + "=)(\\d+)(;)");

//			if (nbrUnits) {
//				if ((re).test(cookie)) {
//					cookie = cookie.replace(re, "$1" + nbrUnits + "$3");
//				} else {
//					cookie += productId + "=" + nbrUnits + ";";
//				}
//			} else {
//				cookie = cookie.replace(re, "");
//			}

//			if (cookie) {
//				util.cookie.set("cart", cookie);
//			} else {
//				util.cookie.remove("cart");
//			}
//		},
		addProduct : function (productId, productObj) {
			var product = this.get(productId),
				productInCart = product,
				options,
				nbrUnits;

			if (!productInCart) {
				options = util.getProductOptions(this, productObj);
				product = this.set(productId, options);
				product.set("elements", {});

				product.addListener("change", "nbrUnits", {context: this, productId: productId}, util.removeProductWhenNbrUnitsIsZero);
			}

			nbrUnits = product.get("nbrUnits");

			nbrUnits += 1;

			if (!productInCart) {
				this.trigger("productAdded", productId);
			} else {
				this.trigger("productUpdated", productId);
			}

			product.set("nbrUnits", nbrUnits);

//			util.setCookie(productId, nbrUnits);

			return this;
		},
		removeProduct : function (productId) {
			delete this[productId];

//			util.setCookie(productId, 0);
			this.trigger("productRemoved", productId);

			return this;
		},
		getSumTotal : function (e) {
			var that = e.data.context,
				k,
				price,
				units,
				sumTotal = 0;

			for (k in that) {
				if (that.hasOwnProperty(k) && that[k].isProduct === true) {
					price = that[k].get("price") || 0;
					units = that[k].get("nbrUnits");

					sumTotal += (price * units);
				}
			}

			that.set("sumTotal", sumTotal.toFixed(2));
		}
	};
	/* -- /util -- */

	/* -- createShoppingCart -- */
	createShoppingCart = function (options) {
		var that = window.createListenerObject(options);

		/* -- eventListeners -- */
		that.addListener("productRemoved", {context: that}, util.getSumTotal);
		that.addListener("change", {context: that}, util.getSumTotal);
		that.addListener("change", {context: that}, util.updateElements);
		/* -- /eventListeners -- */

		that.set("elements", {});
		that.sumTotal = 0;

		that.addProduct = util.addProduct;
		that.removeProduct = util.removeProduct;
		that.addPropertyElement = util.addPropertyElement;

		return that;
	};
	/* -- /createShoppingCart -- */

	window.createShoppingCart = createShoppingCart;

}(window));