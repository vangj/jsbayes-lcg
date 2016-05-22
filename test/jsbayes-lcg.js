var should = require('chai').should()
    expect = require('chai').expect;
var jsbayeslcg = require('../jsbayes-lcg');

describe('#graph', function() {
    it('verfies inference', function() {
        var g = jsbayeslcg.newGraph([ [1], [-4.5], [8.5] ], [ [4,2,-1], [2, 5, -5], [-2, -5, 8]]);
        var n3 = g.defineNode('n2', 2, [1]);
        var n2 = g.defineNode('n1', 1, [0]);
        var n1 = g.defineNode('n1', 0);

        var T = 10000;
        g.sample(T);

        var avg1 = n1.avg;
        var avg2 = n2.avg;
        var avg3 = n3.avg;

        expect(avg1).to.be.within(0.90, 1.05);
        expect(Math.abs(avg2)).to.be.within(4.4, 4.9);
        expect(avg3).to.be.within(8.4, 8.8);

        n1.observe(2.5);
        g.sample(T);

        avg1 = n1.avg;
        avg2 = n2.avg;
        avg3 = n3.avg;

        expect(avg1).to.be.within(2.4, 2.6);
        expect(Math.abs(avg2)).to.be.within(3.5, 3.8);
        expect(avg3).to.be.within(7.5, 7.9);

        n1.unobserve();
        g.sample(T);

        avg1 = n1.avg;
        avg2 = n2.avg;
        avg3 = n3.avg;

        expect(avg1).to.be.within(0.90, 1.05);
        expect(Math.abs(avg2)).to.be.within(4.4, 4.9);
        expect(avg3).to.be.within(8.4, 8.8);
    });
});

describe('#covariance', function() {
  it('verifies covariance', function() {
    function getBoxMullerSample() {
      var x1, x2, w;
      do {
        x1 = 2.0 * Math.random() - 1.0;
        x2 = 2.0 * Math.random() - 1.0;
        w = x1 * x1 + x2 * x2;
      } while (w >= 1.0);

      w = Math.sqrt( (-2.0 * Math.log(w)) / w);
      var y = x1 * w;
      return y;
    }
    function getSample(mean, stdev) {
      var s = stdev * getBoxMullerSample() + mean;
      return s;
    }
    var data = [];
    for(var s=0; s < 100000; s++) {
      var x1 = getSample(0, 1),
          x2 = getSample(0, 1),
          x3 = getSample(0, 1),
          x4 = 1 + 1.2*x1 + 2.5*x2 - 4.0*x3;
      var d = [ x1, x2, x3, x4 ];
      data.push(d);
    }

    var sigma = jsbayeslcg.getCovMatrix(data);

    expect(sigma.length).to.equals(4);
    expect(sigma[0].length).to.equals(4);
    for(var r=0; r < sigma.length; r++) {
      for(var c=0; c < sigma[0].length; c++) {
        if(r === c) {
          continue;
        }
        expect(sigma[r][c]).to.equals(sigma[c][r]);
      }
    }
    expect(sigma[0][0]).to.be.within(0.9, 1.1);
    expect(sigma[1][1]).to.be.within(0.9, 1.1);
    expect(sigma[2][2]).to.be.within(0.9, 1.1);
    expect(sigma[3][3]).to.be.within(23.0, 23.8);
  });
});

describe('#means', function() {
  it('verifies means', function() {
    function getBoxMullerSample() {
      var x1, x2, w;
      do {
        x1 = 2.0 * Math.random() - 1.0;
        x2 = 2.0 * Math.random() - 1.0;
        w = x1 * x1 + x2 * x2;
      } while (w >= 1.0);

      w = Math.sqrt( (-2.0 * Math.log(w)) / w);
      var y = x1 * w;
      return y;
    }
    function getSample(mean, stdev) {
      var s = stdev * getBoxMullerSample() + mean;
      return s;
    }
    var data = [];
    for(var s=0; s < 100000; s++) {
      var x1 = getSample(0, 1),
          x2 = getSample(0, 1),
          x3 = getSample(0, 1),
          x4 = 1 + 1.2*x1 + 2.5*x2 - 4.0*x3;
      var d = [ x1, x2, x3, x4 ];
      data.push(d);
    }

    var means = jsbayeslcg.getMeans(data);

    expect(means.length).to.equals(4);
    expect(means[0].length).to.equals(1);
    expect(Math.abs(means[0][0])).to.be.within(0.0, 0.01);
    expect(Math.abs(means[1][0])).to.be.within(0.0, 0.01);
    expect(Math.abs(means[2][0])).to.be.within(0.0, 0.01);
    expect(Math.abs(means[3][0])).to.be.within(0.9, 1.05);
  });
});
