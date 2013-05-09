describe("The 'roundNumber' function", function() {
  it("should round to an integer if only one arg is passed", function() {
    var x = roundNumber('2.23');
    expect(x).toEqual(2);
  });
  it("should round to the decimal point sent if two args are passed", function() {
    var x = roundNumber('1.234', 2)
    expect(x).toEqual('1.23');
  });
})
