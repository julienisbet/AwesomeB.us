describe("Next Bus Predictions URL", function() {
  it("should return a URL in a format NextBus can understand", function() {
    x = nextBusPredictions('22','stoptagname');
    expect(x).toEqual("http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&r=22&s=stoptagname");
  });
});