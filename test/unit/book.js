var Book = require('../../Book.js');
var Order = require('../../Order.js');
var OrderTypes = require('../../constants/orderTypes.js');
var assert = require('chai').assert;
var pair = "USD/MYToken";

describe('Order', function() {
  it('Can instantiate Order', function() {
    var orderDate=new Date();
    var order = new Order(1,1,Order.SIDE.BID,pair,Order.STATUS.ACTIVE,orderDate);

    assert.equal(order.quantity, 1);
    assert.equal(order.side, Order.SIDE.BID);
    assert.equal(order.pair, pair);
    assert.equal(order.status, Order.STATUS.ACTIVE,);
    assert.equal(order.time, orderDate);
  });

});

describe('Book', function() {

  it('Can create a new book with name', function() {
    var bookName = "testBook";
    var test = new Book(bookName);
    assert.equal(test.name, bookName);
  });

  it('Starts with zero length bid book', function() {
    var test = new Book("testBook");
    assert.equal(test._bids.size(), 0);
  });

  it('Starts with zero length ask book', function() {
    var test = new Book("testBook");
    assert.equal(test._asks.size(), 0);
  });




  it('bid order sorting is correct (pricing)', function(done) {
    var book = new Book("testBook");

    var o1 =  {
      quantity: 1,
      price: 1,
      side: Order.SIDE.BID,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    };
    var o2 = {
      quantity: 1,
      price: 2,
      side: Order.SIDE.BID,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }

    book.addOrder(o1);
    book.addOrder(o2);
    var bids= book.bidsToArray();

    assert.equal(bids[0].price, 2);
    assert.equal(bids[1].price, 1);
    done();

  });

  it('ask order sorting is correct (pricing)', function(done) {
    var book = new Book("testBook");
    var o1 = {
      quantity: 1,
      price: 2,
      side: Order.SIDE.ASK,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }
    var o2 = {
      quantity: 1,
      price: 1,
      side: Order.SIDE.ASK,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }


    book.addOrder(o1);
    book.addOrder(o2);

    var asks= book.asksToArray();
    assert.equal(asks[0].price, 1);
    assert.equal(asks[1].price, 2);
    done();

  });


  it('Book computes spread', function(done) {
    var book = new Book("testBook");
    var o1 = {
      quantity: 1,
      price: 4,
      side: Order.SIDE.BID,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }
    var o2 = {
      quantity: 1,
      price: 6,
      side: Order.SIDE.ASK,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }


    book.addOrder(o1);
    book.addOrder(o2);
    
    assert.equal(book.getSpread(), 2);
    done();

  });


});

describe('Book Matching', function() {

  it('One Limit order should not settle with any trades - ask', function(done) {
    var book = new Book("testBook");
    var o1 = {
      quantity: 1,
      price: 2,
      side: Order.SIDE.ASK,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }
    book.addOrder(o1);
    var trades = book.settleBook();
    var asks= book.asksToArray();

    assert.equal(trades.length, 0);
    assert.equal(asks[0].price, 2);
    done();


  });

  it('One Limit order should not settle with any trades - bid', function(done) {
    var book = new Book("testBook");
    var o1 = {
      quantity: 1,
      price: 2,
      side: Order.SIDE.BID,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }
    book.addOrder(o1);
    var trades = book.settleBook();
    var asks= book.asksToArray();
    var bids = book.bidsToArray();

    assert.equal(trades.length, 0);
    assert.equal(bids[0].price, 2);
    done();
  });


    it('2 limit ask order, same side and price', function(done) {
        var book = new Book("testBook");
        var o1 = {
          quantity: 1,
          price: 3,
          side: Order.SIDE.ASK,
          type: OrderTypes.LIMIT,
          pair: pair,
          status: Order.STATUS.ACTIVE,
          time: new Date()
        }

        var o2 = {
          quantity: 1,
          price: 3,
          side: Order.SIDE.ASK,
          type: OrderTypes.LIMIT,
          pair: pair,
          status: Order.STATUS.ACTIVE,
          time: new Date()
        }
        book.addOrder(o1);
        book.addOrder(o2);
        var trades = book.settleBook();

        assert.equal(trades.length, 0);
        assert.equal(book.lenAsks(), 2);
        assert.equal(book.lenBids(), 0);
        done();


      });

  it('2 limit bid order, same side and price', function(done) {
      var book = new Book("testBook");
      var o1 = {
        quantity: 1,
        price: 3,
        side: Order.SIDE.BID,
        type: OrderTypes.LIMIT,
        pair: pair,
        status: Order.STATUS.ACTIVE,
        time: new Date()
      }

      var o2 = {
        quantity: 1,
        price: 3,
        side: Order.SIDE.BID,
        type: OrderTypes.LIMIT,
        pair: pair,
        status: Order.STATUS.ACTIVE,
        time: new Date()
      }
      book.addOrder(o1);
      book.addOrder(o2);
      var trades = book.settleBook();

      assert.equal(trades.length, 0);
      assert.equal(book.lenAsks(), 0);
      assert.equal(book.lenBids(), 2);
      done();


    });


  it('Limit & Limit order, no deal', function(done) {
    var book = new Book("testBook");
    var o1 = {
      quantity: 1,
      price: 6,
      side: Order.SIDE.ASK,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }

    var o2 = {
      quantity: 3,
      price: 3,
      side: Order.SIDE.BID,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }
    book.addOrder(o1);
    book.addOrder(o2);
    var trades = book.settleBook();
    assert.equal(trades.length, 0);
    assert.equal(book.lenBids(), 1);
    assert.equal(book.lenAsks(), 1);
    done();


  });

  it('Limit & Limit order reverse, no deal', function(done) {
    var book = new Book("testBook");
    var o1 = {
      quantity: 1,
      price: 3,
      side: Order.SIDE.BID,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }

    var o2 = {
      quantity: 3,
      price: 6,
      side: Order.SIDE.ASK,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }
    book.addOrder(o1);
    book.addOrder(o2);
    var trades = book.settleBook();
    assert.equal(trades.length, 0);
    assert.equal(book.lenBids(), 1);
    assert.equal(book.lenAsks(), 1);
    done();


  });

  it('Limit & Limit order, no deal , close price', function(done) {
    var book = new Book("testBook");
    var o1 = {
      quantity: 3,
      price: 5,
      side: Order.SIDE.ASK,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }

    var o2 = {
      quantity: 3,
      price: 4.99,
      side: Order.SIDE.BID,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }
    book.addOrder(o1);
    book.addOrder(o2);
    var trades = book.settleBook();
    assert.equal(trades.length, 0);
    assert.equal(book.lenBids(), 1);
    assert.equal(book.lenAsks(), 1);
    done();


  });

  it('Limit & Limit order, no deal , close price reverse', function(done) {
    var book = new Book("testBook");
    var o1 = {
      quantity: 3,
      price: 5.01,
      side: Order.SIDE.ASK,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }

    var o2 = {
      quantity: 3,
      price: 5,
      side: Order.SIDE.BID,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }
    book.addOrder(o1);
    book.addOrder(o2);
    var trades = book.settleBook();
    assert.equal(trades.length, 0);
    assert.equal(book.lenBids(), 1);
    assert.equal(book.lenAsks(), 1);
    done();


  });
  it('Limit & Limit order, deal complete, ask first', function(done) {
    var book = new Book("testBook");
    var o1 = {
      quantity: 3,
      price: 5,
      side: Order.SIDE.ASK,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }

    var o2 = {
      quantity: 3,
      price: 5,
      side: Order.SIDE.BID,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }
    book.addOrder(o1);
    book.addOrder(o2);
    var trades = book.settleBook();
    assert.equal(trades.length, 1);
    assert.equal(trades[0].newOrders.length, 0);
    assert.equal(trades[0].childOrders.length, 2);
    assert.equal(trades[0].fillQuantity, 3);
    assert.equal(trades[0].fillPrice, 5);
    assert.equal(book.lenBids(), 0);
    assert.equal(book.lenAsks(), 0);
    done();


  });

  it('Limit & Limit order, deal complete, bid first', function(done) {
    var book = new Book("testBook");
    var o1 = {
      quantity: 3,
      price: 5,
      side: Order.SIDE.ASK,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }

    var o2 = {
      quantity: 3,
      price: 5,
      side: Order.SIDE.BID,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }
    book.addOrder(o2);
    book.addOrder(o1);
    var trades = book.settleBook();
    assert.equal(trades.length, 1);
    assert.equal(trades[0].newOrders.length, 0);
    assert.equal(trades[0].childOrders.length, 2);
    assert.equal(trades[0].fillQuantity, 3);
    assert.equal(trades[0].fillPrice, 5);
    assert.equal(book.lenBids(), 0);
    assert.equal(book.lenAsks(), 0);
    done();


  });

  it('Limit & Limit order, deal partial, more bid ', function(done) {
    var book = new Book("testBook");
    var o1 = {
      quantity: 3,
      price: 5,
      side: Order.SIDE.ASK,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }

    var o2 = {
      quantity: 10,
      price: 5,
      side: Order.SIDE.BID,
      type: OrderTypes.LIMIT,
      pair: pair,
      status: Order.STATUS.ACTIVE,
      time: new Date()
    }
    book.addOrder(o1);
    book.addOrder(o2);
    var trades = book.settleBook();
    var bids= book.bidsToArray();
    assert.equal(trades.length, 1);
    assert.equal(trades[0].newOrders.length, 1);
    assert.equal(trades[0].childOrders.length, 2);
    assert.equal(trades[0].fillQuantity, 3);
    assert.equal(trades[0].fillPrice, 5);
    assert.equal(book.lenBids(), 1);
    assert.equal(bids[0].quantity, 7);
    assert.equal(book.lenAsks(), 0);
    done();


  });

    it('Limit & Limit order, deal partial, more asked ', function(done) {
      var book = new Book("testBook");
      var o1 = {
        quantity: 10,
        price: 5,
        side: Order.SIDE.ASK,
        type: OrderTypes.LIMIT,
        pair: pair,
        status: Order.STATUS.ACTIVE,
        time: new Date()
      }

      var o2 = {
        quantity: 3,
        price: 5,
        side: Order.SIDE.BID,
        type: OrderTypes.LIMIT,
        pair: pair,
        status: Order.STATUS.ACTIVE,
        time: new Date()
      }
      book.addOrder(o1);
      book.addOrder(o2);
      var trades = book.settleBook();
      var asks= book.asksToArray();

      assert.equal(trades.length, 1);
      assert.equal(trades[0].newOrders.length, 1);
      assert.equal(trades[0].childOrders.length, 2);
      assert.equal(trades[0].fillQuantity, 3);
      assert.equal(trades[0].fillPrice, 5);

      assert.equal(book.lenAsks(), 1);
      assert.equal(asks[0].quantity, 7);
      assert.equal(book.lenBids(), 0);
      done();


    });

})
