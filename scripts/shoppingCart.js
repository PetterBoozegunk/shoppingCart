(function (window) {
	"use strict";

	var createShoppingCart,
		util;

	util = {
		addProduct : function (productId, productObj) {
			var productInCart = this.get(productId),
				product = productInCart || this.set(productId, productObj),
				nbrUnits = product.get("nbrUnits") || 0,
				price = (!productInCart && product.get("price")) ? product.get("price").toFixed(2) : (product.get("price") || (0).toFixed(2));

			nbrUnits += 1;

			if (!productInCart) {
				product.set("price", price);
				product.set("isProduct", true);
				this.trigger("productAdded", productId);
			} else {
				this.trigger("productUpdated", productId);
			}

			product.set("nbrUnits", nbrUnits);

			return this;
		},
		removeProduct : function (productId) {
			delete this[productId];

			this.trigger("productRemoved");

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