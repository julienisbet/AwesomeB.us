describe("The 'googleQueryUrl' function", function() {
  it("should return the URL in a format that Google can understand given valid parameters", function() {
    var x = googleQueryUrl("2300 Webster San Francisco",
                       "717 California St San Francisco",    
                       "x")
    expect(x).toEqual("https://maps.googleapis.com/maps/api/directions/json?alternatives=true&origin=2300 Webster San Francisco&destination=717 California St San Francisco&sensor=false&departure_time=x&mode=transit");
  });
});