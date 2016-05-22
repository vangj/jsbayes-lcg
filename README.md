jsbayes-lcg
===========

This JavaScript library is a Bayesian Belief Network (BBN) inference tool using Gibbs sampling. The form of the BBN is assumed to be Linear Gaussian (LG). A LG BBN is one where the joint distribution is defined by a multivariate normal Gaussian distribution and each local probability models is defined by a linear combination of its parents. In this library, all variables in a LG BBN are continuous (as opposed to discrete). If you are working with discrete variables, please take a look at [jsbayes](https://github.com/vangj/jsbayes).

#How do I get the library?

Download the file `jsbayes-lcg.js` and make a reference to the JavaScript file.

`<script type="text/javascript" src="jsbayes-lcg.js"></script>`

Or use Bower.

`bower install jsbayes-lcg --save`

Or use NPM.

`npm install jsbayes-lcg --save`

For NPM, import the library with `var jsbayeslcg = require('jsbayes-lcg');`

#How do I use jsbayes-lcg?

As a quickstart, here's how you create a LCG BBN. Assume we have 3 continuous variables, then the LCG BBN may be defined with the means and covariance matrix as follows.

```
//means is a column vector of means
var means = [
    [ 1 ],
    [ -4.5 ],
    [ 8.5 ]
];
//sigma is a covariance matrix
var sigma = [
    [4,2,-1],
    [2, 5, -5],
    [-2, -5, 8]
];
var g = jsbayeslcg.newGraph(means, sigma);
//define the structure (or parent-child relationships)
var n3 = g.defineNode('n2', 2, [1]); //node 1 is a parent of node 2
var n2 = g.defineNode('n1', 1, [0]); //node 0 is a parent of node 1
var n1 = g.defineNode('n0', 0); //node 0 has no parents
```

You can then perform inference.

```
var T = 10000; //max iterations in gibbs sampling, here it's 10,000
g.sample(T); //actually performm the sampling

//the averages are the averages for each variable after sampling
var avg1 = n1.avg;
var avg2 = n2.avg;
var avg3 = n3.avg;
```

You may also observe a variable.

```
n1.observe(2.5);
g.sample(T);
```

You may also unobserve a variable.

```
n1.unobserve();
g.sample(T);
```

#Computing the means and covariance matrix
There are util methods for you to compute the means and covariance matrix. Assume you have a matrix of data as follows.

```
var data = [
 [0, 1, 9],
 [1, 2, 8],
 [2, 3, 7],
 [3, 4, 6],
 [4, 5, 5],
 [5, 6, 4],
 [6, 7, 3],
 [7, 8, 2],
 [8, 9, 1],
 [9, 10, 0]
];
```

Then you can compute the means (column vector of 3 rows by 1 column) and covariance matrix (3 rows by 3 columns).

```
var means = jsbayeslcg.getMeans(data);
var sigma = jsbayeslcg.getCovMatrix(data);
```

You may then feed the means and covariance matrix directly back into jsbayes-lcg to partly specify the BBN.

```
var g = jsbayeslcg.newGraph(means, sigma);
```
