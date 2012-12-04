(function (window) {
	"use strict";

	var qUnit = window.QUnit,
		module = qUnit.module,
		test = qUnit.test,
		ok = qUnit.ok,
		strictEqual = qUnit.strictEqual;
//		asyncTest = qUnit.asyncTest,
//		start = qUnit.start,
//		stop = qUnit.stop;

	module("shoppingCart need jQuery 1.8 or higher");
	test("There is jQuery 1.8 or higher", function () {
		var jq = window.jQuery,
			fn = jq ? jq.fn : null,
			version = fn ? parseFloat(fn.jquery.match(/^(\d+\.\d)/)) : null;

		ok(window.jQuery, "There is some kind of jQuery");
		ok(version >= 1.8, "The jQuery version is 1.8 or higher");
	});

	module("shoppingCart: Basic tests");
	test("There is a global 'createShoppingCart' function that returns something that is not undefined or window", function () {
		var testCart = window.createShoppingCart();

		ok(testCart && testCart !== window, "The createShoppingCart function does not return window");
	});

	test("It's possible to add a product to the shoppingcart using the 'addProduct' method", function () {
		var testCart = window.createShoppingCart(),
			returnTest,
			productId = "p-0001",
			productObj = {
				name : "Bultsax",
				price : 100
			};

		ok(testCart.addProduct && typeof testCart.addProduct === "function", "There is a 'addProduct' method");

		returnTest = testCart.addProduct(productId, productObj);

		ok(testCart[productId], "testCart[" + productId + "] exists");
		strictEqual(testCart[productId].name, productObj.name, "The product object is added to the shoppingcart (test 1)");
		strictEqual(testCart[productId].price, (100).toFixed(2), "The product object is added to the shoppingcart (test 1)");

		strictEqual(returnTest, testCart, "The 'addProduct' method returns the updated cart object");
	});

	test("It's possible to remove a product to the shoppingcart using the 'removeProduct' method", function () {
		var testCart = window.createShoppingCart(),
			returnTest,
			productId1 = "p-0001",
			productObj1 = {
				name : "Bultsax",
				price : 100
			},
			productId2 = "p-0002",
			productObj2 = {
				name : "Golfklubba",
				price : 5000
			};

		ok(testCart.removeProduct && typeof testCart.removeProduct === "function", "There is a 'removeProduct' method");

		testCart.addProduct(productId1, productObj1);
		testCart.addProduct(productId2, productObj2);

		returnTest = testCart.removeProduct(productId1);

		ok(!testCart[productId1], "testCart[" + productId1 + "] has been removed");

		strictEqual(returnTest, testCart, "The 'removeProduct' method returns the updated cart object");
	});

	module("shoppingCart: Basic events");
	test("When a product is added or removed the corresponding events is triggered", function () {
		var testCart = window.createShoppingCart(),
			productIsSet = false,
			testCartIsChanged = false,
			productIsAdded = false,
			productIsRemoved = false,
			productId = "p-0001",
			productObj = {
				name : "Bultsax",
				price : 100
			};

		testCart.addListener("set", function (e) {
			if (e.property === productId && e.value.name === productObj.name && e.value.price === productObj.price) {
				productIsSet = true;
			}
		});

		testCart.addListener("change", function (e) {
			if (e.property === productId && e.value.name === productObj.name && e.value.price === productObj.price) {
				testCartIsChanged = true;
			}
		});

		testCart.addListener("productAdded", function () {
			productIsAdded = true;
		});

		testCart.addListener("productRemoved", function () {
			productIsRemoved = true;
		});

		testCart.addProduct(productId, productObj);
		testCart.removeProduct(productId);

		ok(productIsSet, "Something was set in testCart");
		ok(testCartIsChanged, "testCart is changed");
		ok(productIsAdded, "Product is added");
		ok(productIsRemoved, "Product is removed");
	});

	module("shoppingCart: Cart updated tests");
	test("When a product is added the product object gets a 'nbrUnits' property", function () {
		var testCart = window.createShoppingCart(),
			productUpdated = 0,
			nbrUnitsSet = 0,
			productId = "p-0001",
			productObj = {
				name : "Bultsax",
				price : 100
			};

		testCart.addListener("productUpdated", productId, function () {
			productUpdated += 1;
		});

		testCart.addListener("set", function (e) {
			if (e.property === "nbrUnits") {
				nbrUnitsSet += 1;
			}
		});

		testCart.addProduct(productId, productObj);
		strictEqual(testCart[productId].get("nbrUnits"), 1, "The nbrUnits property is set to 1");

		testCart.addProduct(productId, productObj);
		strictEqual(testCart[productId].get("nbrUnits"), 2, "When adding a product that is already added to the cart the 'nbrUnits' property is set to 2");

		strictEqual(productUpdated, 1, "The 'productUpdated' event should only be triggered on the product that has been updated");
		strictEqual(nbrUnitsSet, 2, "When 'nbrUnits' is set that event bubbles to the shoppingcCart object");
	});

	test("All added products gets a 'isProduct' property set to 'true'", function () {
		var testCart = window.createShoppingCart();

		testCart.addProduct("testProduct", {name: "test", price: 100});

		strictEqual(testCart.testProduct.get("isProduct"), true, "The new product has a 'isProduct' === true");
	});

	test("If a product in a cart has a 'price' property (number) a 'sumTotal' property is set and updated when adding new products", function () {
		var testCart = window.createShoppingCart(),
			productId = "p-0001",
			productObj = {
				name : "Bultsax",
				price : 100
			};

		testCart.addProduct(productId, productObj);
		strictEqual(testCart.get(productId).get("price"), (100).toFixed(2), "The price property (on a product) is set to " + (100).toFixed(2));
		strictEqual(testCart.get("sumTotal"), (100).toFixed(2), "The sumTotal property is set to " + (100).toFixed(2));
		testCart.addProduct(productId, productObj);
		strictEqual(testCart.get("sumTotal"), (200).toFixed(2), "The sumTotal property is set to " + (200).toFixed(2));

		testCart.removeProduct(productId);
		strictEqual(testCart.get("sumTotal"), (0).toFixed(2), "The sumTotal property is set to " + (0).toFixed(2) + " when the cart is empty");
	});

	test("If a product does NOT have a price property it's set to 0", function () {
		var testCart = window.createShoppingCart(),
			productId = "p-0001",
			productObj = {
				name : "Bultsax"
			};

		testCart.addProduct(productId, productObj);
		strictEqual(testCart.get("sumTotal"), (0).toFixed(2), "The sumTotal property is set to " + (0).toFixed(2));

		strictEqual(testCart.get(productId).get("price"), (0).toFixed(2), "The price property (on a product) is set to " + (0).toFixed(2) + " if it does NOT have a price");
	});

}(window));