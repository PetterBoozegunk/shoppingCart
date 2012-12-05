(function (window) {
	"use strict";

	var $ = window.jQuery,
		util,
		qUnit = window.QUnit,
		module = qUnit.module,
		test = qUnit.test,
		ok = qUnit.ok,
		strictEqual = qUnit.strictEqual;
//		asyncTest = qUnit.asyncTest,
//		start = qUnit.start,
//		stop = qUnit.stop;

	util = {
		productList : {
			"p-0001" : {
				name : "Golfbil",
				description : "En fin golfbil",
				price : 12345.68
			},
			"p-0002" : {
				name : "Gräsklippare",
				description : "En fin gräsklippare",
				price : 5689.50
			},
			"p-0003" : {
				name : "Betongblock",
				description : "Ett fint betongblock",
				price : 287
			},
			"p-0004" : {
				name : "Kaffekokare",
				description : "En fin kaffekokare",
				price : 99
			},
			"p-0005" : {
				name : "Bit",
				description : "En fin bit",
				price : 8
			}
		},
		getTds : function (id, item) {
			var tds = "<td class=\"id\">" + id + "</td>",
				k;

			for (k in item) {
				if (item.hasOwnProperty(k)) {
					if (k === "price") {
						tds += "<td class=\"" + k + "\">" + parseFloat(item[k]).toFixed(2) + " kr</td>";
					} else {
						tds += "<td class=\"" + k + "\">" + item[k] + "</td>";
					}
				}
			}

			return tds;
		},
		getTrs : function () {
			var pl = util.productList,
				tds,
				k,
				trs = "";

			for (k in pl) {
				if (pl.hasOwnProperty(k)) {
					tds = util.getTds(k, pl[k]);
					trs += "<tr class=\"id-" + k + "\">" + tds + "</tr>";
				}
			}

			return trs;
		},
		getTBody : function () {
			var trs = util.getTrs(),
				tbody = "<tbody>" + trs + "</tbody>";

			return tbody;
		},
		getThs : function () {
			var ths = "<th>Id</th>",
				header = util.productList["p-0001"],
				k;

			for (k in header) {
				if (header.hasOwnProperty(k)) {
					ths += "<th class=\"" + k + "\">" + k + "</th>";
				}
			}

			return ths;
		},
		getTHead : function () {
			var ths = util.getThs(),
				thead = "<thead><tr>" + ths + "</tr></thead>";

			return thead;
		},
		createProductTable : function (id) {
			var thead = util.getTHead(),
				tbody = util.getTBody(),
				table = $("<table id=\"" + (id || "test") + "\">" + thead + tbody + "</table>");

			return table;
		}
	};

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
			if (e.property === productId && e.value.name === productObj.name && e.value.price === productObj.price.toFixed(2)) {
				productIsSet = true;
			}
		});

		testCart.addListener("change", function (e) {
			if (e.property === productId && e.value.name === productObj.name && e.value.price === productObj.price.toFixed(2)) {
				testCartIsChanged = true;
			}
		});

		testCart.addListener("productAdded", function (e) {
			if (e.property === productId) {
				productIsAdded = true;
			}
		});

		testCart.addListener("productRemoved", function (e) {
			if (e.property === productId) {
				productIsRemoved = true;
			}
		});

		testCart.addProduct(productId, productObj);
		testCart.removeProduct(productId);

		ok(productIsSet, "Something was set in testCart");
		ok(testCartIsChanged, "testCart is changed");
		ok(productIsAdded, "Product is added and the 'property' property on the event object is set to '" + productId + "'");
		ok(productIsRemoved, "Product is removed and the 'property' property on the event object is set to '" + productId + "'");
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

	module("shoppingCart: Add and update element (value || innreHTML) tests");
	test("It's possible to add an HTMLelement reference to a product that has been added to the cart (test 1)", function () {
		var testCart = window.createShoppingCart(),
			span1,
			span2,
			input,
			textarea,
			productId = "p-0001",
			productObj = {
				name : "Bultsax",
				price : 1.35
			},
			product = testCart.addProduct(productId, productObj).get(productId);

		ok(product.addPropertyElement && typeof product.addPropertyElement === "function", "a product object has a 'addElementReference' method");
		ok(testCart.addPropertyElement && typeof testCart.addPropertyElement === "function", "a shoppingCart object has a 'addElementReference' method");

		span1 = document.createElement("span");
		span1.className = "nbrUnits";
		product.addPropertyElement("nbrUnits", span1);

		span2 = document.createElement("span");
		span2.className = "sumTotal";
		testCart.addPropertyElement("sumTotal", span2);

		ok(product.get("elements").get("nbrUnits") instanceof Array, "The reference object is an Array");

		strictEqual(product.get("elements").get("nbrUnits")[0], span1, "If an added element has a cssClass corresponding to a property on the productObject that element is added to that element[cssClass] array");

		strictEqual(product.get("elements").get("nbrUnits")[0].innerHTML, "1", "The span.nbrUnits gets the value of the product.nbrUnits");

		testCart.addProduct(productId);
		strictEqual(product.get("elements").get("nbrUnits")[0].innerHTML, product.get("nbrUnits").toString(), "When another product with the same id gets added the span.nbrUnits innerHTML is updated to '" + product.get("nbrUnits") + "'");
		strictEqual(testCart.get("elements").get("sumTotal")[0].innerHTML, testCart.get("sumTotal"), "When another product with the same id gets added the span.sumTotal innerHTML is updated to '" + testCart.get("sumTotal") + "'");

		input = document.createElement("input");
		input.type = "text";
		input.className = "nbrUnits";
		product.addPropertyElement("nbrUnits", input);

		testCart.addProduct(productId);

		strictEqual(product.get("elements").get("nbrUnits")[1].value, product.get("nbrUnits").toString(), "When another product with the same id gets added the input.nbrUnits[value] is updated to '" + product.get("nbrUnits") + "'");

		textarea = document.createElement("textarea");
		textarea.className = "nbrUnits";
		product.addPropertyElement("nbrUnits", textarea);

		testCart.addProduct(productId);

		strictEqual(product.get("elements").get("nbrUnits")[2].value, product.get("nbrUnits").toString(), "When another product with the same id gets added the textarea.nbrUnits[value] is updated to '" + product.get("nbrUnits") + "'");
	});

	test("It's possible to add more products with the same productId as one already in the cart by increasing the nbrUnits property on a product", function () {
		var testCart = window.createShoppingCart(),
			productId = "someId-0001",
			productObj = {
				name : "Snöskottare",
				price : 1000
			},
			product,
			nbrUnitsSpan,
			sumTotalSpan;

		testCart.addProduct(productId, productObj);

		product = testCart.get(productId);

		nbrUnitsSpan = document.createElement("span");
		sumTotalSpan = document.createElement("span");

		product.addPropertyElement("nbrUnits", nbrUnitsSpan);
		testCart.addPropertyElement("sumTotal", sumTotalSpan);

		product.set("nbrUnits", 2);

		strictEqual(product.get("nbrUnits"), 2, "The product nbrUnits property is set to 2");
		strictEqual(nbrUnitsSpan.innerHTML, "2", "The nbrUnitsSpan innerHTML is set to 2");

		strictEqual(testCart.get("sumTotal"), (2000).toFixed(2), "The product nbrUnits property is set to " + (2000).toFixed(2));
		strictEqual(sumTotalSpan.innerHTML, (2000).toFixed(2), "The sumTotalSpan innerHTML is set to " + (2000).toFixed(2));

		product.set("nbrUnits", 1);

		strictEqual(product.get("nbrUnits"), 1, "The product nbrUnits property is set to 1");
		strictEqual(nbrUnitsSpan.innerHTML, "1", "The nbrUnitsSpan innerHTML is set to 1");

		strictEqual(testCart.get("sumTotal"), (1000).toFixed(2), "The product nbrUnits property is set to " + (1000).toFixed(2));
		strictEqual(sumTotalSpan.innerHTML, (1000).toFixed(2), "The sumTotalSpan innerHTML is set to " + (1000).toFixed(2));

		product.set("nbrUnits", 0);

		ok(!testCart.get(productId), "When nbrUnits on a product is set to 0 the product is removed from the cart");
		strictEqual(testCart.get("sumTotal"), (0).toFixed(2), "The 'sumTotal' property is set to " + (0).toFixed(2) + " when there is no products in the cart");
		strictEqual(sumTotalSpan.innerHTML, (0).toFixed(2), "The sumTotalSpan innerHTML is set to " + (0).toFixed(2) + " when there is no products in the cart");
	});

}(window));