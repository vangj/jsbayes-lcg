var should = require('chai').should()
    expect = require('chai').expect;
var jsbayeslcg = require('../jsbayes-lcg');

describe('#graph', function() {
    it('verfies inference', function() {
        var g = jsbayeslcg.newGraph([ [1], [-4.5], [8.5] ], [ [4,2,-1], [2, 5, -5], [-2, -5, 8]]);
        var n3 = g.defineNode(2, [1]);
        var n2 = g.defineNode(1, [0]);
        var n1 = g.defineNode(0);

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
