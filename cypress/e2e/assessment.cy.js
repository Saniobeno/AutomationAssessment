const submitButton = 'a[class=\'btn-contact btn btn-primary\']'
const testForename = 'sampleForename';
const buyButton = 'p a[class=\'btn btn-success\']';
const basePrice = 'p span[class=\'product-price ng-binding\']'

let fetchstuffedFrogBasePrice;
let fetchfluffyBunnyBasePrice;
let fetchvalentineBearBasePrice;
let stuffedFrogPrice;
let fluffyBunnyPrice;
let valentineBearPrice;

function populateMandatoryFields() {
  cy.get('#forename')
  .scrollIntoView()
  .should('be.visible')
  .type(testForename);

  cy.get('#email')
  .scrollIntoView()
  .should('be.visible')
  .type('sampleEmail@yopmail.com');

  cy.get('#message')
  .scrollIntoView()
  .should('be.visible')
  .type('sample inquiry');

}

function clickProductButton(itemNum, itemCount, itemName) {

  for(let i = 0; i < itemCount; i++ ){

    cy.get('[id=\'product-' + itemNum+ '\']')
      .should('contain.text', itemName)
    
    cy.get('[id=\'product-' + itemNum+ '\'] ' + buyButton).click()

  }
 
}

function getBasePrice(itemNum, itemName) {

  cy.get('[id=\'product-' + itemNum+ '\']')
      .should('contain.text', itemName)

  return cy.get('[id=\'product-' + itemNum+ '\'] ' + basePrice).invoke('text').then($basePrice => {
    return cy.wrap($basePrice.replace('$', ''));
  });


 }
  it('test case 1', () => {    

  cy.visit('http://jupiter.cloud.planittesting.com');

  cy.get('#nav-contact', { timeout : 10000 })
    .click();

  cy.get('#header-message')
    .should('be.visible')
    .should('contain.text', 'We welcome your feedback');

  cy.get(submitButton)
    .click();

  //Validation
  cy.get('#forename-err')
    .should('be.visible')
    .should('have.text', 'Forename is required')

  cy.get('#email-err')
    .should('be.visible')
    .should('have.text', 'Email is required');  

  cy.get('#message-err')
    .should('be.visible')
    .should('have.text', 'Message is required');  
  
  //Add values on the mandatory field

  
  populateMandatoryFields();

  cy.get('#forename-err')
    .should('not.exist');
  
  cy.log('forename error message does not exists.');

  cy.get('#email-err')
    .should('not.exist');

  cy.log('email error message does not exists.');

  cy.get('#message-err')
    .should('not.exist');

  cy.log('message error message does not exists.');

  
  });
 
  it('test case 2', () => {
    cy.visit('http://jupiter.cloud.planittesting.com');

    cy.get('#nav-contact', { timeout : 10000 })
      .click();
  
    cy.get('#header-message')
      .should('be.visible')
      .should('contain.text', 'We welcome your feedback');

    populateMandatoryFields();

    cy.get(submitButton)
    .click();

  cy.get('div[class=\'popup modal hide ng-scope in\']', { timeout : 30000 })
    .should('not.exist');

  cy.get('div[class=\'alert alert-success\']', { timeout : 10000})
    .should('be.visible')
    .should('contain.text', 'Thanks ' + testForename + ', we appreciate your feedback.');
  });

  it('test case 3', () => {
    let rowItem;
    let qty;
    let subTotal;
    let totalPrice = 0.00;

    cy.visit('http://jupiter.cloud.planittesting.com');

    cy.get('#nav-shop', { timeout : 10000 })
    .click();

    fetchstuffedFrogBasePrice = getBasePrice(2, 'Stuffed Frog');
    fetchfluffyBunnyBasePrice = getBasePrice(4, 'Fluffy Bunny')
    fetchvalentineBearBasePrice = getBasePrice(7, 'Valentine Bear');


    fetchstuffedFrogBasePrice.then($price => {
    stuffedFrogPrice = $price;
    })
    
    fetchfluffyBunnyBasePrice.then($price => {
      fluffyBunnyPrice = $price;
    })

    fetchvalentineBearBasePrice.then($price => {
      valentineBearPrice = $price;
    })
   
    clickProductButton(2, 2, 'Stuffed Frog');

    clickProductButton(4, 5, 'Fluffy Bunny');

    clickProductButton(7, 3, 'Valentine Bear');

    cy.get('#nav-cart')
      .should('be.visible')
      .click();

      cy.then(() => {
        cy.get('table[class=\'table table-striped cart-items\'] tbody ').find('tr')
          .each(($row) => {
            cy.wrap($row).find('td:nth-child(1)').invoke('text').then($text => {
           
            rowItem = $text.trim();

            cy.wrap($row).find('td:nth-child(3) input').invoke('attr', 'value').then($qty => {
             qty = $qty;
            });
  
              cy.wrap($row).find('td:nth-child(2)').invoke('text').then($price => {

                subTotal = parseFloat(qty) * parseFloat($price.replace('$', ''));

                if (rowItem == 'Stuffed Frog') {
                  cy.wrap($row).find('td:nth-child(2)').should('contain.text', stuffedFrogPrice);
                  cy.log('Price matches for ' + rowItem);
  
                } else if (rowItem == 'Fluffy Bunny') {
                  cy.wrap($row).find('td:nth-child(2)').should('contain.text', fluffyBunnyPrice);
                  cy.log('Price matches for ' + rowItem);
  
                } else if (rowItem == 'Valentine Bear') {
                  cy.wrap($row).find('td:nth-child(2)').should('contain.text', valentineBearPrice);
                  cy.log('Price matches for ' + rowItem);
                } else {
                  cy.log('Item ' + rowItem + ' not found.');
                }

                cy.wrap($row).find('td:nth-child(4)').should('have.text', '$' + subTotal);
                cy.log('Subtotal price is correct');
                
                totalPrice += parseFloat(subTotal);

                
            cy.log( totalPrice + ' is the total price');

            });

            })
          })

          cy.then(() => {
            cy.get('table[class=\'table table-striped cart-items\'] tfoot ').find('[class=\'total ng-binding\']')
            .should('contain.text', totalPrice);
          })
          
      });

  });