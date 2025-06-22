const { test, expect } = require('@playwright/test');

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
  });

  test('successful login', async ({ page }) => {
    const usernameField = page.getByPlaceholder('Username');
    const passwordField = page.getByPlaceholder('Password');
    const loginButton = page.locator('#login-button');

    await usernameField.fill('standard_user');
    await passwordField.fill('secret_sauce');
    await loginButton.click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  test('validation: username is required', async ({ page }) => {
    const passwordField = page.getByPlaceholder('Password');
    const loginButton = page.locator('#login-button');

    await passwordField.fill('secret_sauce');
    await loginButton.click();
    await expect(page.getByText('Epic sadface: Username is required')).toBeVisible();
  });

  test('validation: password is required', async ({ page }) => {
    const usernameField = page.getByPlaceholder('Username');
    const loginButton = page.locator('#login-button');

    await usernameField.fill('standard_user');
    await loginButton.click();
    await expect(page.getByText('Epic sadface: Password is required')).toBeVisible();
  });

  test('validation: username or password is incorrect', async ({ page }) => {
    const usernameField = page.getByPlaceholder('Username');
    const passwordField = page.getByPlaceholder('Password');
    const loginButton = page.locator('#login-button');

    await usernameField.fill('standard_user');
    await passwordField.fill('aa');
    await loginButton.click();
    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
  });

  test('validation for locked out user', async ({ page }) => {
    const usernameField = page.getByPlaceholder('Username');
    const passwordField = page.getByPlaceholder('Password');
    const loginButton = page.locator('#login-button');

    await usernameField.fill('locked_out_user');
    await passwordField.fill('secret_sauce');
    await loginButton.click();
    await expect(page.getByText('Epic sadface: Sorry, this user has been locked out.')).toBeVisible();
  });
});

test.describe('Inside the app functionalities', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    const usernameField = page.getByPlaceholder('Username');
    const passwordField = page.getByPlaceholder('Password');
    const loginButton = page.locator('#login-button');

    await usernameField.fill('standard_user');
    await passwordField.fill('secret_sauce');
    await loginButton.click();
  });

  test('all items should have names', async ({ page }) => {
    const backpack = page.getByText('Sauce Labs Backpack');
    const bike_light = page.getByText('Sauce Labs Bike Light');
    const bolt_t_shirt = page.locator('#item_1_title_link');
    const jacket = page.getByText('Sauce Labs Fleece Jacket');
    const onesie = page.getByText('Sauce Labs Onesie');
    const red_t_shirt = page.getByText('Test.allTheThings() T-Shirt (Red)');

    await expect(backpack).toBeVisible();
    await expect(bike_light).toBeVisible();
    await expect(bolt_t_shirt).toBeVisible();
    await expect(jacket).toBeVisible();
    await expect(onesie).toBeVisible();
    await expect(red_t_shirt).toBeVisible();
  });

  test('all items should be displayed with images', async ({ page }) => {
    const items = await page.locator('.inventory_item').all();

    for (const item of items) {
      const image = item.locator('img');
      await expect(image).toBeVisible();
      const src = await image.getAttribute('src'); // Ensure the image has a valid 'src' attribute
      expect(src).toBeTruthy(); // Check that the src is not null or empty
    }
  });

  test('each item should have a description', async ({ page }) => {
    const descriptions = await page.locator('.inventory_item_desc').all();

    for (const itemDescription of descriptions) {
      await expect(itemDescription).toBeVisible();
    }
  });

  test('each item should have a price', async ({ page }) => {
    const items = await page.locator('.inventory_item').all();

    for (const item of items) {
      const price = item.locator('.inventory_item_price');
      await expect(price).toBeVisible();
    }
  });

  test('"Add to cart" button should be dispayed on all items', async ({ page }) => {
    const items = await page.locator('.inventory_item').all();

    for (const item of items) {
      const addButton = item.getByRole('button', { name: 'Add to cart' });
      await expect(addButton).toBeVisible();
    }
  });

  test('sorting the items from A to Z order', async ({ page }) => {
    const items = page.locator('.inventory_item_name ');
    const expectedOrder = [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Test.allTheThings() T-Shirt (Red)'
    ];

    // by default the selected sorting is alphabetically (ascending order)
    const itemTexts = await items.allTextContents(); // Retrieve their text content
    for (let i = 0; i < expectedOrder.length; i++) {
      expect(itemTexts[i]).toBe(expectedOrder[i]);
    }
  });

  test('sorting the items from Z to A order', async ({ page }) => {
    const items = page.locator('.inventory_item_name ');
    const expectedOrder = [
      'Test.allTheThings() T-Shirt (Red)',
      'Sauce Labs Onesie',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Bike Light',
      'Sauce Labs Backpack'
    ];

    await page.locator('.product_sort_container').click();
    await page.locator('.product_sort_container').selectOption('Name (Z to A)');
    const itemTexts = await items.allTextContents();

    for (let i = 0; i < expectedOrder.length; i++) {
      expect(itemTexts[i]).toBe(expectedOrder[i]);
    }
  });

  test('sorting the items from lowest price to highest', async ({ page }) => {
    const items = page.locator('.inventory_item_name ');
    const expectedOrder = [
      'Sauce Labs Onesie',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Test.allTheThings() T-Shirt (Red)',
      'Sauce Labs Backpack',
      'Sauce Labs Fleece Jacket'
    ];

    await page.locator('.product_sort_container').click();
    await page.locator('.product_sort_container').selectOption('Price (low to high)');
    const itemTexts = await items.allTextContents();
    for (let i = 0; i < expectedOrder.length; i++) {
      expect(itemTexts[i]).toBe(expectedOrder[i]);
    }
  });

  test('sorting the items from highest price to lowest', async ({ page }) => {
    const items = page.locator('.inventory_item_name ');
    const expectedOrder = [
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Backpack',
      'Sauce Labs Bolt T-Shirt',
      'Test.allTheThings() T-Shirt (Red)',
      'Sauce Labs Bike Light',
      'Sauce Labs Onesie'
    ];

    await page.locator('.product_sort_container').click();
    await page.locator('.product_sort_container').selectOption('Price (high to low)');
    const itemTexts = await items.allTextContents();
    for (let i = 0; i < expectedOrder.length; i++) {
      expect(itemTexts[i]).toBe(expectedOrder[i]);
    }
  });

  test('twitter icon link should work', async ({ page }) => {
    const twitterIcon = page.locator('.social_twitter');
    const popupPromise = page.waitForEvent('popup');
    await twitterIcon.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL('https://x.com/saucelabs');
  });

  test('facebook icon link should work', async ({ page }) => {
    const facebookIcon = page.locator('.social_facebook');
    const popupPromise = page.waitForEvent('popup');
    await facebookIcon.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL('https://www.facebook.com/saucelabs');
  });

  test('linkedin icon link should work', async ({ page }) => {
    const linkedinIcon = page.locator('.social_linkedin');
    const popupPromise = page.waitForEvent('popup');
    await linkedinIcon.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL('https://www.linkedin.com/company/sauce-labs/');
  });

  test('"Add to cart" button changes to "Remove" button after an item is added to cart', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add to cart' });
    const removeButton = page.locator('#remove-sauce-labs-backpack');
    await addButton.first().click();
    await expect(removeButton).toBeVisible();
  });

  test('"Remove" button changes to "Add to cart" button after an item is removed from cart', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add to cart' }).first();
    const removeButton = page.getByRole('button', { name: 'Remove' });
    await addButton.click();
    await removeButton.click();
    await expect(addButton).toBeVisible();
  });

  test('the cart badge displays "1" after an item is added to cart', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add to cart' });
    const cartBadge = page.locator('.shopping_cart_badge');
    await addButton.first().click();
    await expect(cartBadge).toHaveText('1');
  });

  test('the cart badge displays "3" after 3 items are added to cart', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add to cart' });
    const cartBadge = page.locator('.shopping_cart_badge');
    await addButton.first().click();
    await addButton.nth(1).click();
    await addButton.nth(2).click();
    await expect(cartBadge).toHaveText('3');
  });

  test('no cart badge is displayed after all items are removed from cart', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add to cart' });
    const cartBadge = page.locator('.shopping_cart_badge');

    await addButton.first().click();
    await addButton.nth(1).click();
    await expect(cartBadge).toHaveText('2');

    const removeButtonLocator = page.getByRole('button', { name: 'Remove' });
    while ((await removeButtonLocator.count()) >= 1) {
      const firstButton = removeButtonLocator.first();
      await firstButton.click();
    }

    await expect(cartBadge).not.toBeVisible();
  });

  test('you should be able to add an item to the cart', async ({ page }) => {
    const backpackAddButton = page.locator('#add-to-cart-sauce-labs-backpack');
    await backpackAddButton.click();
    const cartLink = page.locator('.shopping_cart_link');
    await cartLink.click();
    const cartItem = page.locator('.cart_item');
    await expect(cartItem).toContainText('Sauce Labs Backpack');
  });

  test('you should be able to add 3 items to the cart', async ({ page }) => {
    const backpackAddButton = page.locator('#add-to-cart-sauce-labs-backpack');
    const tshirtAddButton = page.locator('#add-to-cart-sauce-labs-bolt-t-shirt');
    const onesieAddButton = page.locator('#add-to-cart-sauce-labs-onesie');
    await backpackAddButton.click();
    await tshirtAddButton.click();
    await onesieAddButton.click();
    const cartLink = page.locator('.shopping_cart_link');
    await cartLink.click();
    const cartItem = page.locator('.cart_item');
    await expect(cartItem.nth(0)).toContainText('Sauce Labs Backpack');
    await expect(cartItem.nth(1)).toContainText('Sauce Labs Bolt T-Shirt');
    await expect(cartItem.nth(2)).toContainText('Sauce Labs Onesie');
  });

  test('you should be able to remove an item from the cart', async ({ page }) => {
    const backpackAddButton = page.locator('#add-to-cart-sauce-labs-backpack');
    const tshirtAddButton = page.locator('#add-to-cart-sauce-labs-bolt-t-shirt');
    const cartLink = page.locator('.shopping_cart_link');
    const removeButton = page.locator('#remove-sauce-labs-backpack');
    const cartBadge = page.locator('.shopping_cart_badge');
    const continueShopping = page.getByRole('button', { name: 'Continue Shopping' });

    await backpackAddButton.click();
    await tshirtAddButton.click();
    await cartLink.click();
    await removeButton.click();
    await expect(page.getByText('Sauce Labs Backpack')).not.toBeVisible();
    await expect(cartBadge).toHaveText('1');
    await continueShopping.click();
    await expect(removeButton).not.toBeVisible();
  });

  test('you should be able to remove all items from the cart', async ({ page }) => {
    const backpackAddButton = page.locator('#add-to-cart-sauce-labs-backpack');
    const tshirtAddButton = page.locator('#add-to-cart-sauce-labs-bolt-t-shirt');
    const cartLink = page.locator('.shopping_cart_link');
    const removeButtons = page.getByRole('button', { name: 'Remove' });
    const cartBadge = page.locator('.shopping_cart_badge');
    const continueShopping = page.getByRole('button', { name: 'Continue Shopping' });
    const cartItem = page.locator('.cart_item');

    await backpackAddButton.click();
    await tshirtAddButton.click();
    await cartLink.click();
    while ((await removeButtons.count()) >= 1) {
      const firstRemoveButton = removeButtons.first();
      await firstRemoveButton.click();
    }
    await expect(cartItem).not.toBeVisible();
    await expect(cartBadge).not.toBeVisible();
    await continueShopping.click();
    await expect(removeButtons).not.toBeVisible();
  });

  test('the name of an item of the listing should match with the one in details page', async ({ page }) => {
    const itemName1 = page.locator('.inventory_item_name');
    const firstItem = await itemName1.first().textContent();
    console.log('Saved Text:', firstItem);
    await itemName1.first().click();
    const itemName2 = page.locator('.inventory_details_name');
    await expect(itemName2).toHaveText(firstItem);
  });

  test('the price of an item of the listing should match with the one in details page', async ({ page }) => {
    const itemPrice1 = page.locator('.inventory_item_price');
    const firstItemPrice = await itemPrice1.first().textContent();
    console.log('Saved Text:', firstItemPrice);
    const itemName1 = page.locator('.inventory_item_name');
    const firstItem = await itemName1.first().textContent();
    await itemName1.first().click();

    const itemPrice2 = page.locator('.inventory_details_price');
    await expect(itemPrice2).toHaveText(firstItemPrice);
  });

  test('you should be able to add an item to the cart from the details page', async ({ page }) => {
    const itemName = page.locator('.inventory_item_name');
    const addButton = page.getByRole('button', { name: 'Add to cart' });
    const cartbadge = page.locator('.shopping_cart_badge');
    const firstItem = await itemName.first().textContent();
    console.log('Saved Text:', firstItem);
    const cartLink = page.locator('.shopping_cart_link');
    const continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });

    await itemName.first().click();
    await addButton.click();
    await expect(cartbadge).toHaveText('1');
    await cartLink.click();
    await expect(itemName).toHaveText(firstItem);
    await continueShoppingButton.click();
    await expect(page.locator('.inventory_item').first().getByRole('button', { name: 'Remove' })).toBeVisible();
  });

  test('you should be able to remove an item to the cart from the details page', async ({ page }) => {
    const itemName = page.locator('.inventory_item_name');
    const addButton = page.getByRole('button', { name: 'Add to cart' });
    const cartbadge = page.locator('.shopping_cart_badge');
    const cartLink = page.locator('.shopping_cart_link');
    const continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
    const removeButton = page.getByRole('button', { name: 'Remove' });

    await itemName.first().click();
    await addButton.click();
    await removeButton.click();
    await expect(cartbadge).not.toBeVisible();
    await cartLink.click();
    await expect(itemName).not.toBeVisible();
    await continueShoppingButton.click();
    await expect(page.locator('.inventory_item').first().getByRole('button', { name: 'Add to cart' })).toBeVisible();
  });

  test('first name is required to be filled in the checkout page', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add to cart' });
    const cartLink = page.locator('.shopping_cart_link');
    const checkoutButton = page.getByRole('button', { name: 'Checkout' });
    const lastName = page.getByPlaceholder('Last Name');
    const postalCode = page.getByPlaceholder('Zip/Postal Code');
    const continueButton = page.getByRole('button', { name: 'Continue' });

    await addButton.first().click();
    await cartLink.click();
    await checkoutButton.click();
    await lastName.fill('Doe');
    await postalCode.fill('1000');
    await continueButton.click();
    await expect(page.locator('.error-message-container')).toHaveText('Error: First Name is required');
  });

  test('last name is required to be filled in the checkout page', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add to cart' });
    const cartLink = page.locator('.shopping_cart_link');
    const checkoutButton = page.getByRole('button', { name: 'Checkout' });
    const firstName = page.getByPlaceholder('First Name');
    const postalCode = page.getByPlaceholder('Zip/Postal Code');
    const continueButton = page.getByRole('button', { name: 'Continue' });

    await addButton.first().click();
    await cartLink.click();
    await checkoutButton.click();
    await firstName.fill('John');
    await postalCode.fill('1000');
    await continueButton.click();
    await expect(page.locator('.error-message-container')).toHaveText('Error: Last Name is required');
  });

  test('postal code is required to be filled in the checkout page', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add to cart' });
    const cartLink = page.locator('.shopping_cart_link');
    const checkoutButton = page.getByRole('button', { name: 'Checkout' });
    const firstName = page.getByPlaceholder('First Name');
    const lastName = page.getByPlaceholder('Last Name');
    const continueButton = page.getByRole('button', { name: 'Continue' });

    await addButton.first().click();
    await cartLink.click();
    await checkoutButton.click();
    await firstName.fill('John');
    await lastName.fill('Doe');
    await continueButton.click();
    await expect(page.locator('.error-message-container')).toHaveText('Error: Postal Code is required');
  });
});
