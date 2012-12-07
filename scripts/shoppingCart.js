(function (window) {
	"use strict";

	var createShoppingCart,
		util;

	/* -- util -- */
	util = {
		getProductOptions : function (parent, options) {
			var productOptions = {},
				k,
				price = options.price ? options.price.toFixed(2) : (0).toFixed(2);

			for (k in options) {
				if (options.hasOwnProperty(k)) {
					if (price && k === "price") {
						productOptions[k] = price;
					} else {
						productOptions[k] = options[k];
					}
				}
			}

			productOptions.parent = parent;

			if (!productOptions.price) {
				productOptions.price = (0).toFixed(2);
			}

			productOptions.isProduct = true;
			productOptions.nbrUnits = 0;

			return productOptions;
		},
		removeProductWhenNbrUnitsIsZero : function (e) {
			if (e.value === 0) {
				var data = e.data,
					that = data.context,
					productId = data.productId;

				that.removeProduct(productId);
			}
		},
		addProduct : function (productId, productObj) {
			var product = this.get(productId),
				productInCart = product,
				options,
				nbrUnits;

			if (!productInCart) {
				options = util.getProductOptions(this, productObj);
				product = this.set(productId, options);
				product.set("productId", productId);

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
		var shoppingCart = window.createListenerObject(options);

		/* -- eventListeners -- */
		shoppingCart.addListener("productRemoved", {context: shoppingCart}, util.getSumTotal);
		shoppingCart.addListener("change", {context: shoppingCart}, util.getSumTotal);
		/* -- /eventListeners -- */

		shoppingCart.sumTotal = 0;

		shoppingCart.addProduct = util.addProduct;
		shoppingCart.removeProduct = util.removeProduct;

		return shoppingCart;
	};
	/* -- /createShoppingCart -- */

	window.createShoppingCart = createShoppingCart;

}(window));