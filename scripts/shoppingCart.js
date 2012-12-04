(function (window) {
	"use strict";

	var createShoppingCart,
		util;

	/* -- util -- */
	util = {
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
		that.addListener("change", "nbrUnits", {context: that}, util.getSumTotal);
		that.addListener("productRemoved", {context: that}, util.getSumTotal);
		/* -- /eventListeners -- */

		that.sumTotal = 0;

		that.addProduct = function (productId, productObj) {
			return util.addProduct.apply(that, [productId, productObj]);
		};

		that.removeProduct = function (productId) {
			return util.removeProduct.apply(that, [productId]);
		};

		return that;
	};
	/* -- /createShoppingCart -- */

	window.createShoppingCart = createShoppingCart;

}(window));