(function(window) {
  'use strict';
  function multiply(a, b) {
    var aNumRows = a.length, aNumCols = a[0].length,
        bNumRows = b.length, bNumCols = b[0].length,
        m = new Array(aNumRows);  // initialize array of rows
    for (var r = 0; r < aNumRows; ++r) {
      m[r] = new Array(bNumCols); // initialize the current row
      for (var c = 0; c < bNumCols; ++c) {
        m[r][c] = 0;             // initialize the current cell
        for (var i = 0; i < aNumCols; ++i) {
          m[r][c] += a[r][i] * b[i][c];
        }
      }
    }
    return m;
  }
  function subtract(a, b) {
    var rows = a.length, cols = a[0].length;
    var matrix = newMatrix(rows, cols);
    for(var r=0; r < rows; r++) {
      for(var c=0; c < cols; c++) {
        matrix[r][c] = a[r][c] - b[r][c];
      }
    }
    return matrix;
  }
  function transpose(x) {
    var rows = x.length, cols = x[0].length;
    var m = [];
    for(var c=0; c < cols; c++) {
      var entries = [];
      for(var r=0; r < rows; r++) {
        entries.push(x[r][c]);
      }
      m.push(entries);
    }
    return m;
  }
  function inverse(a) {
    var n = a.length;
    var x = newMatrix(n, n);
    var b = newMatrix(n, n);
    var index = new Array(n);

    for(var i=0; i < n; ++i) {
      b[i][i] = 1.0;
    }

    gaussian(a, index);

    for(var i=0; i < n-1; ++i) {
      for(var j=i+1; j < n; ++j) {
        for(var k=0; k < n; ++k) {
          b[index[j]][k] -= a[index[j]][i] * b[index[i]][k];
        }
      }
    }

    for(var i=0; i < n; ++i) {
      x[n-1][i] = b[index[n-1]][i] / a[index[n-1]][n-1];
      for(var j=n-2; j >= 0; --j) {
        x[j][i] = b[index[j]][i];
        for(var k=j+1; k < n; ++k) {
          x[j][i] -= a[index[j]][k] * x[k][i];
        }
        x[j][i] /= a[index[j]][j];
      }
    }

    return x;
  }
  function gaussian(a, index) {
    var n = index.length;
    var c = new Array(n);

    for(var i=0; i < n; ++i) {
      index[i] = i;
    }

    for(var i=0; i < n; ++i) {
      var c1 = 0;
      for(var j=0; j < n; ++j) {
        var c0 = Math.abs(a[i][j]);
        if(c0 > c1) {
          c1 = c0;
        }
      }
      c[i] = c1;
    }

    var k = 0;
    for(var j=0; j < n-1; ++j) {
      var pi1 = 0;
      for(var i=j; i < n; ++i) {
        var pi0 = Math.abs(a[index[i]][j]);
        pi0 /= c[index[i]];
        if(pi0 > pi1) {
          pi1 = pi0;
          k = i;
        }
      }

      var itmp = index[j];
      index[j] = index[k];
      index[k] = itmp;

      for(var i=j+1; i < n; ++i) {
        var pj = a[index[i]][j] / a[index[j]][j];
        a[index[i]][j] = pj;

        for(var l=j+1; l < n; ++l) {
          a[index[i]][l] -= pj*a[index[j]][l];
        }
      }
    }
  }
  function newMatrix(rows, cols) {
    var m = [];
    for(var r=0; r < rows; r++) {
      var entries = [];
      for(var c=0; c < cols; c++) {
        entries.push(0.0);
      }
      m.push(entries);
    }
    return m;
  }
  function Eyx(y, parents, sigma) {
    var E_yx = [];
    for(var x=0; x < parents.length; x++) {
      E_yx.push([sigma[y][parents[x]]]);
    }
    return E_yx;
  }
  function Exx(parents, sigma) {
    var E_xx = [];
    var rows = parents.length,
        cols = parents.length;
    for(var r=0; r < rows; r++) {
      var entry = [];
      for(var c=0; c < cols; c++) {
        entry.push(sigma[parents[r]][parents[c]]);
      }
      E_xx.push(entry);
    }
    return E_xx;
  }
  function Exy(y, parents, sigma) {
    var E_xy = [];
    var rows = parents.length;
    for(var r=0; r < rows; r++) {
      E_xy.push([sigma[parents[r]][y]]);
    }
    return E_xy;
  }
  function Eyy(y, sigma) {
    return [ [sigma[y][y]] ];
  }
  function mx(parents, means) {
    var m_x = [];
    var rows = parents.length;
    for(var r=0; r < rows; r++) {
      m_x.push(means[parents[r]]);
    }
    return m_x;
  }
  function getNode(name, i, parents, mean, variance, b0, b) {
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
    return {
      name: name,
      id: i,
      parents: parents,
      mean: mean,
      variance: variance,
      stdev: Math.sqrt(variance),
      b0: b0,
      b: b,
      isSampled: false,
      sum: 0.0,
      avg: 0.0,
      reset: function() {
        this.sum = 0.0;
        this.avg = 0.0;
      },
      observe: function(val) {
        this.observed = true;
        this.value = val;
      },
      unobserve: function() {
        this.observed = false;
        this.value = undefined;
      },
      containsParent: function(i) {
        if(!parents || parents.length === 0 || i === this.id) {
          return false;
        }
        return (this.parents.indexOf(i) >= 0);
      },
      sample: function(x) {
        if(this.mean) {
          return getSample(this.mean, this.stdev);
        } else {
          var m = this.b0;
          for(var i=0; i < b.length; i++) {
            m += (b[i] * x[i]);
          }
          return getSample(m, this.stdev);
        }
      }
    };
  }
  function copyArray(arr) {
    var copy = [];
    for(var i=0; i < arr.length; i++) {
      copy.push(arr[i]);
    }
    return copy;
  }
  function sortNodes(nodes) {
    var arr = copyArray(nodes);
    arr.sort(function(a, b) {
      if(a.containsParent(b.id)) {
        return 1;
      } else if(b.containsParent(a.id)) {
        return -1;
      } else {
        return a.parents.length - b.parents.length;
      }
    });
    return arr;
  }
  function getParentSamples(node, samples) {
    var x = [];
    for(var i=0; i < node.parents.length; i++) {
      var id = node.parents[i];
      x.push(samples[id]);
    }
    return x;
  }
  function getCov(i, j, x) {
    var XY = 0.0, X = 0.0, Y = 0.0, N = 0.0;
    for(var r=0; r < x.length; r++) {
      XY += (x[r][i] * x[r][j]);
      X += x[r][i];
      Y += x[r][j];
      N += 1.0;
    }
    var cov = (XY - ((X * Y) / N)) / (N - 1.0);
    return cov;
  }
  function defineLib() {
    var lib = {};
    lib.getCovMatrix = function(data) {
      var rows = data.length;
      var cols = data[0].length;
      var cov = newMatrix(cols, cols);

      for(var i=0; i < cols; i++) {
        for(var j=i; j < cols; j++) {
          var c = getCov(i, j, data);
          cov[i][j] = cov[j][i] = c;
        }
      }

      return cov;
    }
    lib.getMeans = function(x) {
      var means = [];
      var rows = x.length, cols = x[0].length;
      for(var r=0; r < rows; r++) {
        for(var c=0; c < cols; c++) {
          if(!means[c]) {
            means.push([0.0]);
          }
          means[c][0] += x[r][c];
        }
      }
      for(var i=0; i < means.length; i++) {
        means[i][0] = (means[i][0] / rows);
      }
      return means;
    }
    lib.newGraph = function(means, sigma) {
      return {
        means: means,
        sigma: sigma,
        saveSamples: false,
        samples: [],
        nodes: [],
        samplesAsCsv: function(options) {
          var opts = options || {};
          var D_ROW = opts.rowDelimiter || '\n';
          var D_FIELD = opts.fieldDelimiter || ',';

          var csv = '';
          var row = '';

          for(var i=0; i < this.nodes.length; i++) {
            row += this.nodes[i].id;
            if(i < this.nodes.length-1) {
              row += D_FIELD;
            }
          }
          csv += row + D_ROW;

          for(var i=0; i < this.samples.length; i++) {
            var sample = this.samples[i];
            row = '';
            for(var j=0; j < this.nodes.length; j++) {
              row += sample[this.nodes[j].id];
              if(j < this.nodes.length-1) {
                row += D_FIELD;
              }
            }
            csv += row;
            if(i < this.samples.length-1) {
              csv += D_ROW;
            }
          }

          return csv;
        },
        node: function(index) {
          if(!this._nodes) {
            this._nodes = {};
            for(var i=0; i < this.nodes.length; i++) {
              var node = this.nodes[i];
              this._nodes[node.id] = this.nodes[i];
            }
          }
          return this._nodes[index];
        },
        defineNode: function(name, i, parents) {
          var mean, variance, b_0, b;

          if(parents && parents.length > 0) {
            var m_y = means[i];
            var m_x = mx(parents, this.means);
            var E_yx = Eyx(i, parents, this.sigma);
            var E_xx = Exx(parents, this.sigma);
            var E_xy = Exy(i, parents, this.sigma);
            var E_yy = Eyy(i, this.sigma);

            b_0 = m_y - multiply(multiply(transpose(E_yx), inverse(E_xx)), m_x);
            b = multiply(transpose(E_yx), inverse(E_xx));
            variance = subtract(E_yy, multiply(multiply(transpose(E_yx), inverse(E_xx)), E_xy))[0][0];
          } else {
            mean = means[i][0];
            variance = sigma[i][i];
          }

          parents = parents || [];
          var node = getNode(name, i, parents, mean, variance, b_0, b);
          this.nodes.push(node);
          return node;
        },
        sample: function(T) {
          this.samples.length = 0;

          for(var i=0; i < this.nodes.length; i++) {
            this.nodes[i].reset();
          }

          var nodes = sortNodes(this.nodes);
          for(var t=0; t < T; t++) {
            var currSample = {};
            for(var i=0; i < nodes.length; i++) {
              var node = nodes[i];
              var s;
              if(node.observed) {
                s = node.value;
              } else {
                var x = getParentSamples(node, currSample);
                s = node.sample(x);
              }
              currSample[node.id] = s;
              node.sum += s;
            }

            if(this.saveSamples) {
              this.samples.push(currSample);
            }
          }

          for(var i=0; i < this.nodes.length; i++) {
            this.nodes[i].avg = this.nodes[i].sum / T;
          }
        }
      }
    }
    return lib;
  }
  if(typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = defineLib();
  } else {
    if(typeof(jsbayeslcg) === 'undefined') {
      window.jsbayeslcg = defineLib();
    }

    if(typeof define === 'function' && define.amd) {
      define('jsbayeslcg', [], defineLib());
    }
  }
})(this);
