(function (window) {
	"use strict";

	var createShoppingCart,
		util;

	/* -- util -- */
	util = {
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
		addProduct : function (productId, productObj) {
			var product = this.get(productId),
				productInCart = product,
				options,
				nbrUnits;

			if (!productInCart) {
				options = util.getProductOptions(this, productObj);
				product = this.set(productId, options);
				product.set("elements", {});
			}

			nbrUnits = product.get("nbrUnits");

			nbrUnits += 1;

			if (!productInCart) {
				this.trigger("productAdded", productId);
			} else {
				this.trigger("productUpdated", productId);
			}

			product.set("nbrUnits", nbrUnits);

			return this;
		},
		removeProduct : function (productId) {
			delete this[productId];

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