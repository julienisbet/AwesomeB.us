describe("The stopHasMatchingLatLong function", function() {
  it("should return true if lat/long both match within (input) rounded decimal places", function() {
    x = {lat: 1.111119, lon: 2.11119};
    function yObj(innards) { this.transit = innards };
    function locObj(lat, long) { this.k = lat; this.r = long }
    locObj.prototype.lat = function(){ return this.k }
    locObj.prototype.lng = function(){ return this.r }
    l = new locObj(1.11112, 2.11119)
    y = new yObj({arrival_stop: {location: l} })
    stopHasMatchingLatLong(x,y)
    expect(stopHasMatchingLatLong(x, y)).toBe(true);
  });

  it("should return false if lat/long don't match within 5 rounded decimal places", function() {
    x = {lat: 1.11119, lon: 2.11119};
    function yObj(innards) { this.transit = innards };
    function locObj(lat, long) { this.k = lat; this.r = long }
    locObj.prototype.lat = function(){ return this.k }
    locObj.prototype.lng = function(){ return this.r }
    l = new locObj(1.11112, 2.11119)
    y = new yObj({arrival_stop: {location: l} })
    expect(stopHasMatchingLatLong(x, y)).toBe(false);
  });
});