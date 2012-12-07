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
					if (k !== "price") {
						productOptions[k] = options[k];
					}
				}
			}
				
			productOptions.price = price;
			productOptions.parent = parent;
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
		getUnitsTotal : function (e) {
			var that = e.data.context,
				k,
				units,
				nbrUnits = 0;

			for (k in that) {
				if (that.hasOwnProperty(k) && that[k].isProduct === true) {
					units = that[k].get("nbrUnits");

					nbrUnits += units;
				}
			}

			that.set("unitsTotal", nbrUnits);
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
		},
		updateCart : function (e) {
			util.getUnitsTotal(e);
			util.getSumTotal(e);
		}
	};
	/* -- /util -- */

	/* -- createShoppingCart -- */
	createShoppingCart = function (options) {
		var shoppingCart = window.createListenerObject(options);

		/* -- eventListeners -- */
		shoppingCart.addListener("productRemoved", {context: shoppingCart}, util.updateCart);
		shoppingCart.addListener("change", {context: shoppingCart}, util.updateCart);
		/* -- /eventListeners -- */

		shoppingCart.unitsTotal = 0;
		shoppingCart.sumTotal = 0;

		shoppingCart.addProduct = util.addProduct;
		shoppingCart.removeProduct = util.removeProduct;

		return shoppingCart;
	};
	/* -- /createShoppingCart -- */

	window.createShoppingCart = createShoppingCart;

}(window));