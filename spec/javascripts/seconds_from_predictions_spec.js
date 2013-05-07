describe("The 'getSecondsFromPredictionData' function", function() {
  it("should return an array of integers from nextbus prediction data equal in length to the array of objects", function() {
    x = getSecondsFromPredictionData([{seconds: 12},{seconds: 123},{seconds: 222}]);
    console.log(x);
    expect(x).toEqual([12,123,222])
  });
});