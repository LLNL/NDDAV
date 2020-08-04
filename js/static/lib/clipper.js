// rev 452
/********************************************************************************
 *                                                                              *
 * Author    :  Angus Johnson                                                   *
 * Version   :  6.1.3                                                           *
 * Date      :  19 January 2014                                                 *
 * Website   :  http://www.angusj.com                                           *
 * Copyright :  Angus Johnson 2010-2014                                         *
 *                                                                              *
 * License:                                                                     *
 * Use, modification & distribution is subject to Boost Software License Ver 1. *
 * http://www.boost.org/LICENSE_1_0.txt                                         *
 *                                                                              *
 * Attributions:                                                                *
 * The code in this library is an extension of Bala Vatti's clipping algorithm: *
 * "A generic solution to polygon clipping"                                     *
 * Communications of the ACM, Vol 35, Issue 7 (July 1992) pp 56-63.             *
 * http://portal.acm.org/citation.cfm?id=129906                                 *
 *                                                                              *
 * Computer graphics and geometric modeling: implementation and algorithms      *
 * By Max K. Agoston                                                            *
 * Springer; 1 edition (January 4, 2005)                                        *
 * http://books.google.com/books?q=vatti+clipping+agoston                       *
 *                                                                              *
 * See also:                                                                    *
 * "Polygon Offsetting by Computing Winding Numbers"                            *
 * Paper no. DETC2005-85513 pp. 565-575                                         *
 * ASME 2005 International Design Engineering Technical Conferences             *
 * and Computers and Information in Engineering Conference (IDETC/CIE2005)      *
 * September 24-28, 2005 , Long Beach, California, USA                          *
 * http://www.me.berkeley.edu/~mcmains/pubs/DAC05OffsetPolygon.pdf              *
 *                                                                              *
 *******************************************************************************/
/*******************************************************************************
 *                                                                              *
 * Author    :  Timo                                                            *
 * Version   :  6.1.3.1                                                         *
 * Date      :  21 January 2014                                                 *
 *                                                                              *
 * This is a translation of the C# Clipper library to Javascript.               *
 * Int128 struct of C# is implemented using JSBN of Tom Wu.                     *
 * Because Javascript lacks support for 64-bit integers, the space              *
 * is a little more restricted than in C# version.                              *
 *                                                                              *
 * C# version has support for coordinate space:                                 *
 * +-4611686018427387903 ( sqrt(2^127 -1)/2 )                                   *
 * while Javascript version has support for space:                              *
 * +-4503599627370495 ( sqrt(2^106 -1)/2 )                                      *
 *                                                                              *
 * Tom Wu's JSBN proved to be the fastest big integer library:                  *
 * http://jsperf.com/big-integer-library-test                                   *
 *                                                                              *
 * This class can be made simpler when (if ever) 64-bit integer support comes.  *
 *                                                                              *
 *******************************************************************************/
/*******************************************************************************
 *                                                                              *
 * Basic JavaScript BN library - subset useful for RSA encryption.              *
 * http://www-cs-students.stanford.edu/~tjw/jsbn/                               *
 * Copyright (c) 2005  Tom Wu                                                   *
 * All Rights Reserved.                                                         *
 * See "LICENSE" for details:                                                   *
 * http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE                        *
 *                                                                              *
 *******************************************************************************/
(function() {
  function m(a, b, c) {
    d.biginteger_used = 1;
    null != a && ("number" == typeof a && "undefined" == typeof b ? this.fromInt(
        a) : "number" == typeof a ? this.fromNumber(a, b, c) : null == b &&
      "string" != typeof a ? this.fromString(a, 256) : this.fromString(a, b)
    )
  }

  function p() {
    return new m(null)
  }

  function R(a, b, c, e, d, g) {
    for (; 0 <= --g;) {
      var h = b * this[a++] + c[e] + d;
      d = Math.floor(h / 67108864);
      c[e++] = h & 67108863
    }
    return d
  }

  function S(a, b, c, e, d, g) {
    var h = b & 32767;
    for (b >>= 15; 0 <= --g;) {
      var l = this[a] & 32767,
        k = this[a++] >> 15,
        m = b * l + k * h,
        l = h * l + ((m & 32767) <<
          15) + c[e] + (d & 1073741823);
      d = (l >>> 30) + (m >>> 15) + b * k + (d >>> 30);
      c[e++] = l & 1073741823
    }
    return d
  }

  function U(a, b, c, e, d, g) {
    var h = b & 16383;
    for (b >>= 14; 0 <= --g;) {
      var l = this[a] & 16383,
        k = this[a++] >> 14,
        m = b * l + k * h,
        l = h * l + ((m & 16383) << 14) + c[e] + d;
      d = (l >> 28) + (m >> 14) + b * k;
      c[e++] = l & 268435455
    }
    return d
  }

  function M(a, b) {
    var c = C[a.charCodeAt(b)];
    return null == c ? -1 : c
  }

  function y(a) {
    var b = p();
    b.fromInt(a);
    return b
  }

  function D(a) {
    var b = 1,
      c;
    0 != (c = a >>> 16) && (a = c, b += 16);
    0 != (c = a >> 8) && (a = c, b += 8);
    0 != (c = a >> 4) && (a = c, b += 4);
    0 != (c = a >> 2) && (a = c, b += 2);
    0 !=
      a >> 1 && (b += 1);
    return b
  }

  function z(a) {
    this.m = a
  }

  function w(a) {
    this.m = a;
    this.mp = a.invDigit();
    this.mpl = this.mp & 32767;
    this.mph = this.mp >> 15;
    this.um = (1 << a.DB - 15) - 1;
    this.mt2 = 2 * a.t
  }

  function V(a, b) {
    return a & b
  }

  function J(a, b) {
    return a | b
  }

  function N(a, b) {
    return a ^ b
  }

  function O(a, b) {
    return a & ~b
  }

  function B() {}

  function P(a) {
    return a
  }

  function A(a) {
    this.r2 = p();
    this.q3 = p();
    m.ONE.dlShiftTo(2 * a.t, this.r2);
    this.mu = this.r2.divide(a);
    this.m = a
  }
  var d = {},
    E = !1;
  "undefined" !== typeof module && module.exports ? (module.exports = d, E = !
      0) :
    "undefined" !== typeof document ? window.ClipperLib = d : self.ClipperLib =
    d;
  var s;
  if (E) q = "chrome", s = "Netscape";
  else {
    var q = navigator.userAgent.toString().toLowerCase();
    s = navigator.appName
  }
  var F, K, G, H, I, Q;
  F = -1 != q.indexOf("chrome") && -1 == q.indexOf("chromium") ? 1 : 0;
  E = -1 != q.indexOf("chromium") ? 1 : 0;
  K = -1 != q.indexOf("safari") && -1 == q.indexOf("chrome") && -1 == q.indexOf(
    "chromium") ? 1 : 0;
  G = -1 != q.indexOf("firefox") ? 1 : 0;
  q.indexOf("firefox/17");
  q.indexOf("firefox/15");
  q.indexOf("firefox/3");
  H = -1 != q.indexOf("opera") ? 1 : 0;
  q.indexOf("msie 10");
  q.indexOf("msie 9");
  I = -1 != q.indexOf("msie 8") ? 1 : 0;
  Q = -1 != q.indexOf("msie 7") ? 1 : 0;
  q = -1 != q.indexOf("msie ") ? 1 : 0;
  d.biginteger_used = null;
  "Microsoft Internet Explorer" == s ? (m.prototype.am = S, s = 30) :
    "Netscape" != s ? (m.prototype.am = R, s = 26) : (m.prototype.am = U, s =
      28);
  m.prototype.DB = s;
  m.prototype.DM = (1 << s) - 1;
  m.prototype.DV = 1 << s;
  m.prototype.FV = Math.pow(2, 52);
  m.prototype.F1 = 52 - s;
  m.prototype.F2 = 2 * s - 52;
  var C = [],
    u;
  s = 48;
  for (u = 0; 9 >= u; ++u) C[s++] = u;
  s = 97;
  for (u = 10; 36 > u; ++u) C[s++] = u;
  s = 65;
  for (u = 10; 36 > u; ++u) C[s++] = u;
  z.prototype.convert =
    function(a) {
      return 0 > a.s || 0 <= a.compareTo(this.m) ? a.mod(this.m) : a
    };
  z.prototype.revert = function(a) {
    return a
  };
  z.prototype.reduce = function(a) {
    a.divRemTo(this.m, null, a)
  };
  z.prototype.mulTo = function(a, b, c) {
    a.multiplyTo(b, c);
    this.reduce(c)
  };
  z.prototype.sqrTo = function(a, b) {
    a.squareTo(b);
    this.reduce(b)
  };
  w.prototype.convert = function(a) {
    var b = p();
    a.abs().dlShiftTo(this.m.t, b);
    b.divRemTo(this.m, null, b);
    0 > a.s && 0 < b.compareTo(m.ZERO) && this.m.subTo(b, b);
    return b
  };
  w.prototype.revert = function(a) {
    var b = p();
    a.copyTo(b);
    this.reduce(b);
    return b
  };
  w.prototype.reduce = function(a) {
    for (; a.t <= this.mt2;) a[a.t++] = 0;
    for (var b = 0; b < this.m.t; ++b) {
      var c = a[b] & 32767,
        e = c * this.mpl + ((c * this.mph + (a[b] >> 15) * this.mpl & this.um) <<
          15) & a.DM,
        c = b + this.m.t;
      for (a[c] += this.m.am(0, e, a, b, 0, this.m.t); a[c] >= a.DV;) a[c] -=
        a.DV, a[++c]++
    }
    a.clamp();
    a.drShiftTo(this.m.t, a);
    0 <= a.compareTo(this.m) && a.subTo(this.m, a)
  };
  w.prototype.mulTo = function(a, b, c) {
    a.multiplyTo(b, c);
    this.reduce(c)
  };
  w.prototype.sqrTo = function(a, b) {
    a.squareTo(b);
    this.reduce(b)
  };
  m.prototype.copyTo =
    function(a) {
      for (var b = this.t - 1; 0 <= b; --b) a[b] = this[b];
      a.t = this.t;
      a.s = this.s
    };
  m.prototype.fromInt = function(a) {
    this.t = 1;
    this.s = 0 > a ? -1 : 0;
    0 < a ? this[0] = a : -1 > a ? this[0] = a + this.DV : this.t = 0
  };
  m.prototype.fromString = function(a, b) {
    var c;
    if (16 == b) c = 4;
    else if (8 == b) c = 3;
    else if (256 == b) c = 8;
    else if (2 == b) c = 1;
    else if (32 == b) c = 5;
    else if (4 == b) c = 2;
    else {
      this.fromRadix(a, b);
      return
    }
    this.s = this.t = 0;
    for (var e = a.length, d = !1, g = 0; 0 <= --e;) {
      var h = 8 == c ? a[e] & 255 : M(a, e);
      0 > h ? "-" == a.charAt(e) && (d = !0) : (d = !1, 0 == g ? this[this.t++] =
        h : g + c > this.DB ?
        (this[this.t - 1] |= (h & (1 << this.DB - g) - 1) << g, this[this
          .t++] = h >> this.DB - g) : this[this.t - 1] |= h << g, g += c,
        g >= this.DB && (g -= this.DB))
    }
    8 == c && 0 != (a[0] & 128) && (this.s = -1, 0 < g && (this[this.t - 1] |=
      (1 << this.DB - g) - 1 << g));
    this.clamp();
    d && m.ZERO.subTo(this, this)
  };
  m.prototype.clamp = function() {
    for (var a = this.s & this.DM; 0 < this.t && this[this.t - 1] == a;) --
      this.t
  };
  m.prototype.dlShiftTo = function(a, b) {
    var c;
    for (c = this.t - 1; 0 <= c; --c) b[c + a] = this[c];
    for (c = a - 1; 0 <= c; --c) b[c] = 0;
    b.t = this.t + a;
    b.s = this.s
  };
  m.prototype.drShiftTo = function(a, b) {
    for (var c =
        a; c < this.t; ++c) b[c - a] = this[c];
    b.t = Math.max(this.t - a, 0);
    b.s = this.s
  };
  m.prototype.lShiftTo = function(a, b) {
    var c = a % this.DB,
      e = this.DB - c,
      d = (1 << e) - 1,
      g = Math.floor(a / this.DB),
      h = this.s << c & this.DM,
      l;
    for (l = this.t - 1; 0 <= l; --l) b[l + g + 1] = this[l] >> e | h, h =
      (this[l] & d) << c;
    for (l = g - 1; 0 <= l; --l) b[l] = 0;
    b[g] = h;
    b.t = this.t + g + 1;
    b.s = this.s;
    b.clamp()
  };
  m.prototype.rShiftTo = function(a, b) {
    b.s = this.s;
    var c = Math.floor(a / this.DB);
    if (c >= this.t) b.t = 0;
    else {
      var e = a % this.DB,
        d = this.DB - e,
        g = (1 << e) - 1;
      b[0] = this[c] >> e;
      for (var h = c + 1; h < this.t; ++h) b[h -
        c - 1] |= (this[h] & g) << d, b[h - c] = this[h] >> e;
      0 < e && (b[this.t - c - 1] |= (this.s & g) << d);
      b.t = this.t - c;
      b.clamp()
    }
  };
  m.prototype.subTo = function(a, b) {
    for (var c = 0, e = 0, d = Math.min(a.t, this.t); c < d;) e += this[c] -
      a[c], b[c++] = e & this.DM, e >>= this.DB;
    if (a.t < this.t) {
      for (e -= a.s; c < this.t;) e += this[c], b[c++] = e & this.DM, e >>=
        this.DB;
      e += this.s
    } else {
      for (e += this.s; c < a.t;) e -= a[c], b[c++] = e & this.DM, e >>=
        this.DB;
      e -= a.s
    }
    b.s = 0 > e ? -1 : 0; - 1 > e ? b[c++] = this.DV + e : 0 < e && (b[c++] =
      e);
    b.t = c;
    b.clamp()
  };
  m.prototype.multiplyTo = function(a, b) {
    var c = this.abs(),
      e =
      a.abs(),
      d = c.t;
    for (b.t = d + e.t; 0 <= --d;) b[d] = 0;
    for (d = 0; d < e.t; ++d) b[d + c.t] = c.am(0, e[d], b, d, 0, c.t);
    b.s = 0;
    b.clamp();
    this.s != a.s && m.ZERO.subTo(b, b)
  };
  m.prototype.squareTo = function(a) {
    for (var b = this.abs(), c = a.t = 2 * b.t; 0 <= --c;) a[c] = 0;
    for (c = 0; c < b.t - 1; ++c) {
      var e = b.am(c, b[c], a, 2 * c, 0, 1);
      (a[c + b.t] += b.am(c + 1, 2 * b[c], a, 2 * c + 1, e, b.t - c - 1)) >=
      b.DV && (a[c + b.t] -= b.DV, a[c + b.t + 1] = 1)
    }
    0 < a.t && (a[a.t - 1] += b.am(c, b[c], a, 2 * c, 0, 1));
    a.s = 0;
    a.clamp()
  };
  m.prototype.divRemTo = function(a, b, c) {
    var e = a.abs();
    if (!(0 >= e.t)) {
      var d = this.abs();
      if (d.t <
        e.t) null != b && b.fromInt(0), null != c && this.copyTo(c);
      else {
        null == c && (c = p());
        var g = p(),
          h = this.s;
        a = a.s;
        var l = this.DB - D(e[e.t - 1]);
        0 < l ? (e.lShiftTo(l, g), d.lShiftTo(l, c)) : (e.copyTo(g), d.copyTo(
          c));
        e = g.t;
        d = g[e - 1];
        if (0 != d) {
          var k = d * (1 << this.F1) + (1 < e ? g[e - 2] >> this.F2 : 0),
            T = this.FV / k,
            k = (1 << this.F1) / k,
            x = 1 << this.F2,
            v = c.t,
            n = v - e,
            r = null == b ? p() : b;
          g.dlShiftTo(n, r);
          0 <= c.compareTo(r) && (c[c.t++] = 1, c.subTo(r, c));
          m.ONE.dlShiftTo(e, r);
          for (r.subTo(g, g); g.t < e;) g[g.t++] = 0;
          for (; 0 <= --n;) {
            var q = c[--v] == d ? this.DM : Math.floor(c[v] * T + (c[v -
              1] + x) * k);
            if ((c[v] += g.am(0, q, c, n, 0, e)) < q)
              for (g.dlShiftTo(n, r), c.subTo(r, c); c[v] < --q;) c.subTo(r,
                c)
          }
          null != b && (c.drShiftTo(e, b), h != a && m.ZERO.subTo(b, b));
          c.t = e;
          c.clamp();
          0 < l && c.rShiftTo(l, c);
          0 > h && m.ZERO.subTo(c, c)
        }
      }
    }
  };
  m.prototype.invDigit = function() {
    if (1 > this.t) return 0;
    var a = this[0];
    if (0 == (a & 1)) return 0;
    var b = a & 3,
      b = b * (2 - (a & 15) * b) & 15,
      b = b * (2 - (a & 255) * b) & 255,
      b = b * (2 - ((a & 65535) * b & 65535)) & 65535,
      b = b * (2 - a * b % this.DV) % this.DV;
    return 0 < b ? this.DV - b : -b
  };
  m.prototype.isEven = function() {
    return 0 == (0 < this.t ? this[0] & 1 : this.s)
  };
  m.prototype.exp = function(a, b) {
    if (4294967295 < a || 1 > a) return m.ONE;
    var c = p(),
      e = p(),
      d = b.convert(this),
      g = D(a) - 1;
    for (d.copyTo(c); 0 <= --g;)
      if (b.sqrTo(c, e), 0 < (a & 1 << g)) b.mulTo(e, d, c);
      else var h = c,
        c = e,
        e = h;
    return b.revert(c)
  };
  m.prototype.toString = function(a) {
    if (0 > this.s) return "-" + this.negate().toString(a);
    if (16 == a) a = 4;
    else if (8 == a) a = 3;
    else if (2 == a) a = 1;
    else if (32 == a) a = 5;
    else if (4 == a) a = 2;
    else return this.toRadix(a);
    var b = (1 << a) - 1,
      c, e = !1,
      d = "",
      g = this.t,
      h = this.DB - g * this.DB % a;
    if (0 < g--)
      for (h < this.DB && 0 < (c = this[g] >>
          h) && (e = !0, d = "0123456789abcdefghijklmnopqrstuvwxyz".charAt(
          c)); 0 <= g;) h < a ? (c = (this[g] & (1 << h) - 1) << a - h, c |=
        this[--g] >> (h += this.DB - a)) : (c = this[g] >> (h -= a) & b,
        0 >= h && (h += this.DB, --g)), 0 < c && (e = !0), e && (d +=
        "0123456789abcdefghijklmnopqrstuvwxyz".charAt(c));
    return e ? d : "0"
  };
  m.prototype.negate = function() {
    var a = p();
    m.ZERO.subTo(this, a);
    return a
  };
  m.prototype.abs = function() {
    return 0 > this.s ? this.negate() : this
  };
  m.prototype.compareTo = function(a) {
    var b = this.s - a.s;
    if (0 != b) return b;
    var c = this.t,
      b = c - a.t;
    if (0 != b) return 0 > this.s ?
      -b : b;
    for (; 0 <= --c;)
      if (0 != (b = this[c] - a[c])) return b;
    return 0
  };
  m.prototype.bitLength = function() {
    return 0 >= this.t ? 0 : this.DB * (this.t - 1) + D(this[this.t - 1] ^
      this.s & this.DM)
  };
  m.prototype.mod = function(a) {
    var b = p();
    this.abs().divRemTo(a, null, b);
    0 > this.s && 0 < b.compareTo(m.ZERO) && a.subTo(b, b);
    return b
  };
  m.prototype.modPowInt = function(a, b) {
    var c;
    c = 256 > a || b.isEven() ? new z(b) : new w(b);
    return this.exp(a, c)
  };
  m.ZERO = y(0);
  m.ONE = y(1);
  B.prototype.convert = P;
  B.prototype.revert = P;
  B.prototype.mulTo = function(a, b, c) {
    a.multiplyTo(b,
      c)
  };
  B.prototype.sqrTo = function(a, b) {
    a.squareTo(b)
  };
  A.prototype.convert = function(a) {
    if (0 > a.s || a.t > 2 * this.m.t) return a.mod(this.m);
    if (0 > a.compareTo(this.m)) return a;
    var b = p();
    a.copyTo(b);
    this.reduce(b);
    return b
  };
  A.prototype.revert = function(a) {
    return a
  };
  A.prototype.reduce = function(a) {
    a.drShiftTo(this.m.t - 1, this.r2);
    a.t > this.m.t + 1 && (a.t = this.m.t + 1, a.clamp());
    this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
    for (this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); 0 > a.compareTo(
        this.r2);) a.dAddOffset(1,
      this.m.t + 1);
    for (a.subTo(this.r2, a); 0 <= a.compareTo(this.m);) a.subTo(this.m, a)
  };
  A.prototype.mulTo = function(a, b, c) {
    a.multiplyTo(b, c);
    this.reduce(c)
  };
  A.prototype.sqrTo = function(a, b) {
    a.squareTo(b);
    this.reduce(b)
  };
  var t = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61,
      67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139,
      149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223,
      227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293,
      307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383,
      389, 397, 401,
      409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487,
      491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587,
      593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661,
      673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761,
      769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859,
      863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967,
      971, 977, 983, 991, 997
    ],
    W = 67108864 / t[t.length - 1];
  m.prototype.chunkSize = function(a) {
    return Math.floor(Math.LN2 * this.DB / Math.log(a))
  };
  m.prototype.toRadix = function(a) {
    null ==
      a && (a = 10);
    if (0 == this.signum() || 2 > a || 36 < a) return "0";
    var b = this.chunkSize(a),
      b = Math.pow(a, b),
      c = y(b),
      e = p(),
      d = p(),
      g = "";
    for (this.divRemTo(c, e, d); 0 < e.signum();) g = (b + d.intValue()).toString(
      a).substr(1) + g, e.divRemTo(c, e, d);
    return d.intValue().toString(a) + g
  };
  m.prototype.fromRadix = function(a, b) {
    this.fromInt(0);
    null == b && (b = 10);
    for (var c = this.chunkSize(b), e = Math.pow(b, c), d = !1, g = 0, h =
        0, l = 0; l < a.length; ++l) {
      var k = M(a, l);
      0 > k ? "-" == a.charAt(l) && 0 == this.signum() && (d = !0) : (h = b *
        h + k, ++g >= c && (this.dMultiply(e), this.dAddOffset(h,
          0), h = g = 0))
    }
    0 < g && (this.dMultiply(Math.pow(b, g)), this.dAddOffset(h, 0));
    d && m.ZERO.subTo(this, this)
  };
  m.prototype.fromNumber = function(a, b, c) {
    if ("number" == typeof b)
      if (2 > a) this.fromInt(1);
      else
        for (this.fromNumber(a, c), this.testBit(a - 1) || this.bitwiseTo(m
            .ONE.shiftLeft(a - 1), J, this), this.isEven() && this.dAddOffset(
            1, 0); !this.isProbablePrime(b);) this.dAddOffset(2, 0), this.bitLength() >
          a && this.subTo(m.ONE.shiftLeft(a - 1), this);
    else {
      c = [];
      var e = a & 7;
      c.length = (a >> 3) + 1;
      b.nextBytes(c);
      c[0] = 0 < e ? c[0] & (1 << e) - 1 : 0;
      this.fromString(c,
        256)
    }
  };
  m.prototype.bitwiseTo = function(a, b, c) {
    var e, d, g = Math.min(a.t, this.t);
    for (e = 0; e < g; ++e) c[e] = b(this[e], a[e]);
    if (a.t < this.t) {
      d = a.s & this.DM;
      for (e = g; e < this.t; ++e) c[e] = b(this[e], d);
      c.t = this.t
    } else {
      d = this.s & this.DM;
      for (e = g; e < a.t; ++e) c[e] = b(d, a[e]);
      c.t = a.t
    }
    c.s = b(this.s, a.s);
    c.clamp()
  };
  m.prototype.changeBit = function(a, b) {
    var c = m.ONE.shiftLeft(a);
    this.bitwiseTo(c, b, c);
    return c
  };
  m.prototype.addTo = function(a, b) {
    for (var c = 0, e = 0, d = Math.min(a.t, this.t); c < d;) e += this[c] +
      a[c], b[c++] = e & this.DM, e >>= this.DB;
    if (a.t <
      this.t) {
      for (e += a.s; c < this.t;) e += this[c], b[c++] = e & this.DM, e >>=
        this.DB;
      e += this.s
    } else {
      for (e += this.s; c < a.t;) e += a[c], b[c++] = e & this.DM, e >>=
        this.DB;
      e += a.s
    }
    b.s = 0 > e ? -1 : 0;
    0 < e ? b[c++] = e : -1 > e && (b[c++] = this.DV + e);
    b.t = c;
    b.clamp()
  };
  m.prototype.dMultiply = function(a) {
    this[this.t] = this.am(0, a - 1, this, 0, 0, this.t);
    ++this.t;
    this.clamp()
  };
  m.prototype.dAddOffset = function(a, b) {
    if (0 != a) {
      for (; this.t <= b;) this[this.t++] = 0;
      for (this[b] += a; this[b] >= this.DV;) this[b] -= this.DV, ++b >=
        this.t && (this[this.t++] = 0), ++this[b]
    }
  };
  m.prototype.multiplyLowerTo =
    function(a, b, c) {
      var e = Math.min(this.t + a.t, b);
      c.s = 0;
      for (c.t = e; 0 < e;) c[--e] = 0;
      var d;
      for (d = c.t - this.t; e < d; ++e) c[e + this.t] = this.am(0, a[e], c,
        e, 0, this.t);
      for (d = Math.min(a.t, b); e < d; ++e) this.am(0, a[e], c, e, 0, b - e);
      c.clamp()
    };
  m.prototype.multiplyUpperTo = function(a, b, c) {
    --b;
    var e = c.t = this.t + a.t - b;
    for (c.s = 0; 0 <= --e;) c[e] = 0;
    for (e = Math.max(b - this.t, 0); e < a.t; ++e) c[this.t + e - b] =
      this.am(b - e, a[e], c, 0, 0, this.t + e - b);
    c.clamp();
    c.drShiftTo(1, c)
  };
  m.prototype.modInt = function(a) {
    if (0 >= a) return 0;
    var b = this.DV % a,
      c = 0 > this.s ? a -
      1 : 0;
    if (0 < this.t)
      if (0 == b) c = this[0] % a;
      else
        for (var e = this.t - 1; 0 <= e; --e) c = (b * c + this[e]) % a;
    return c
  };
  m.prototype.millerRabin = function(a) {
    var b = this.subtract(m.ONE),
      c = b.getLowestSetBit();
    if (0 >= c) return !1;
    var e = b.shiftRight(c);
    a = a + 1 >> 1;
    a > t.length && (a = t.length);
    for (var d = p(), g = 0; g < a; ++g) {
      d.fromInt(t[Math.floor(Math.random() * t.length)]);
      var h = d.modPow(e, this);
      if (0 != h.compareTo(m.ONE) && 0 != h.compareTo(b)) {
        for (var l = 1; l++ < c && 0 != h.compareTo(b);)
          if (h = h.modPowInt(2, this), 0 == h.compareTo(m.ONE)) return !1;
        if (0 != h.compareTo(b)) return !1
      }
    }
    return !0
  };
  m.prototype.clone = function() {
    var a = p();
    this.copyTo(a);
    return a
  };
  m.prototype.intValue = function() {
    if (0 > this.s) {
      if (1 == this.t) return this[0] - this.DV;
      if (0 == this.t) return -1
    } else {
      if (1 == this.t) return this[0];
      if (0 == this.t) return 0
    }
    return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0]
  };
  m.prototype.byteValue = function() {
    return 0 == this.t ? this.s : this[0] << 24 >> 24
  };
  m.prototype.shortValue = function() {
    return 0 == this.t ? this.s : this[0] << 16 >> 16
  };
  m.prototype.signum = function() {
    return 0 > this.s ? -1 : 0 >= this.t || 1 == this.t && 0 >= this[0] ?
      0 : 1
  };
  m.prototype.toByteArray = function() {
    var a = this.t,
      b = [];
    b[0] = this.s;
    var c = this.DB - a * this.DB % 8,
      e, d = 0;
    if (0 < a--)
      for (c < this.DB && (e = this[a] >> c) != (this.s & this.DM) >> c &&
        (b[d++] = e | this.s << this.DB - c); 0 <= a;)
        if (8 > c ? (e = (this[a] & (1 << c) - 1) << 8 - c, e |= this[--a] >>
            (c += this.DB - 8)) : (e = this[a] >> (c -= 8) & 255, 0 >= c &&
            (c += this.DB, --a)), 0 != (e & 128) && (e |= -256), 0 == d &&
          (this.s & 128) != (e & 128) && ++d, 0 < d || e != this.s) b[d++] =
          e;
    return b
  };
  m.prototype.equals = function(a) {
    return 0 == this.compareTo(a)
  };
  m.prototype.min = function(a) {
    return 0 > this.compareTo(a) ?
      this : a
  };
  m.prototype.max = function(a) {
    return 0 < this.compareTo(a) ? this : a
  };
  m.prototype.and = function(a) {
    var b = p();
    this.bitwiseTo(a, V, b);
    return b
  };
  m.prototype.or = function(a) {
    var b = p();
    this.bitwiseTo(a, J, b);
    return b
  };
  m.prototype.xor = function(a) {
    var b = p();
    this.bitwiseTo(a, N, b);
    return b
  };
  m.prototype.andNot = function(a) {
    var b = p();
    this.bitwiseTo(a, O, b);
    return b
  };
  m.prototype.not = function() {
    for (var a = p(), b = 0; b < this.t; ++b) a[b] = this.DM & ~this[b];
    a.t = this.t;
    a.s = ~this.s;
    return a
  };
  m.prototype.shiftLeft = function(a) {
    var b =
      p();
    0 > a ? this.rShiftTo(-a, b) : this.lShiftTo(a, b);
    return b
  };
  m.prototype.shiftRight = function(a) {
    var b = p();
    0 > a ? this.lShiftTo(-a, b) : this.rShiftTo(a, b);
    return b
  };
  m.prototype.getLowestSetBit = function() {
    for (var a = 0; a < this.t; ++a)
      if (0 != this[a]) {
        var b = a * this.DB;
        a = this[a];
        if (0 == a) a = -1;
        else {
          var c = 0;
          0 == (a & 65535) && (a >>= 16, c += 16);
          0 == (a & 255) && (a >>= 8, c += 8);
          0 == (a & 15) && (a >>= 4, c += 4);
          0 == (a & 3) && (a >>= 2, c += 2);
          0 == (a & 1) && ++c;
          a = c
        }
        return b + a
      }
    return 0 > this.s ? this.t * this.DB : -1
  };
  m.prototype.bitCount = function() {
    for (var a = 0, b = this.s &
        this.DM, c = 0; c < this.t; ++c) {
      for (var e = this[c] ^ b, d = 0; 0 != e;) e &= e - 1, ++d;
      a += d
    }
    return a
  };
  m.prototype.testBit = function(a) {
    var b = Math.floor(a / this.DB);
    return b >= this.t ? 0 != this.s : 0 != (this[b] & 1 << a % this.DB)
  };
  m.prototype.setBit = function(a) {
    return this.changeBit(a, J)
  };
  m.prototype.clearBit = function(a) {
    return this.changeBit(a, O)
  };
  m.prototype.flipBit = function(a) {
    return this.changeBit(a, N)
  };
  m.prototype.add = function(a) {
    var b = p();
    this.addTo(a, b);
    return b
  };
  m.prototype.subtract = function(a) {
    var b = p();
    this.subTo(a, b);
    return b
  };
  m.prototype.multiply = function(a) {
    var b = p();
    this.multiplyTo(a, b);
    return b
  };
  m.prototype.divide = function(a) {
    var b = p();
    this.divRemTo(a, b, null);
    return b
  };
  m.prototype.remainder = function(a) {
    var b = p();
    this.divRemTo(a, null, b);
    return b
  };
  m.prototype.divideAndRemainder = function(a) {
    var b = p(),
      c = p();
    this.divRemTo(a, b, c);
    return [b, c]
  };
  m.prototype.modPow = function(a, b) {
    var c = a.bitLength(),
      e, d = y(1),
      g;
    if (0 >= c) return d;
    e = 18 > c ? 1 : 48 > c ? 3 : 144 > c ? 4 : 768 > c ? 5 : 6;
    g = 8 > c ? new z(b) : b.isEven() ? new A(b) : new w(b);
    var h = [],
      l = 3,
      k = e - 1,
      m = (1 <<
        e) - 1;
    h[1] = g.convert(this);
    if (1 < e)
      for (c = p(), g.sqrTo(h[1], c); l <= m;) h[l] = p(), g.mulTo(c, h[l -
        2], h[l]), l += 2;
    for (var x = a.t - 1, v, n = !0, r = p(), c = D(a[x]) - 1; 0 <= x;) {
      c >= k ? v = a[x] >> c - k & m : (v = (a[x] & (1 << c + 1) - 1) << k -
        c, 0 < x && (v |= a[x - 1] >> this.DB + c - k));
      for (l = e; 0 == (v & 1);) v >>= 1, --l;
      0 > (c -= l) && (c += this.DB, --x);
      if (n) h[v].copyTo(d), n = !1;
      else {
        for (; 1 < l;) g.sqrTo(d, r), g.sqrTo(r, d), l -= 2;
        0 < l ? g.sqrTo(d, r) : (l = d, d = r, r = l);
        g.mulTo(r, h[v], d)
      }
      for (; 0 <= x && 0 == (a[x] & 1 << c);) g.sqrTo(d, r), l = d, d = r,
        r = l, 0 > --c && (c = this.DB - 1, --x)
    }
    return g.revert(d)
  };
  m.prototype.modInverse =
    function(a) {
      var b = a.isEven();
      if (this.isEven() && b || 0 == a.signum()) return m.ZERO;
      for (var c = a.clone(), e = this.clone(), d = y(1), g = y(0), h = y(0),
          l = y(1); 0 != c.signum();) {
        for (; c.isEven();) c.rShiftTo(1, c), b ? (d.isEven() && g.isEven() ||
            (d.addTo(this, d), g.subTo(a, g)), d.rShiftTo(1, d)) : g.isEven() ||
          g.subTo(a, g), g.rShiftTo(1, g);
        for (; e.isEven();) e.rShiftTo(1, e), b ? (h.isEven() && l.isEven() ||
            (h.addTo(this, h), l.subTo(a, l)), h.rShiftTo(1, h)) : l.isEven() ||
          l.subTo(a, l), l.rShiftTo(1, l);
        0 <= c.compareTo(e) ? (c.subTo(e, c), b && d.subTo(h, d),
          g.subTo(l, g)) : (e.subTo(c, e), b && h.subTo(d, h), l.subTo(g, l))
      }
      if (0 != e.compareTo(m.ONE)) return m.ZERO;
      if (0 <= l.compareTo(a)) return l.subtract(a);
      if (0 > l.signum()) l.addTo(a, l);
      else return l;
      return 0 > l.signum() ? l.add(a) : l
    };
  m.prototype.pow = function(a) {
    return this.exp(a, new B)
  };
  m.prototype.gcd = function(a) {
    var b = 0 > this.s ? this.negate() : this.clone();
    a = 0 > a.s ? a.negate() : a.clone();
    if (0 > b.compareTo(a)) {
      var c = b,
        b = a;
      a = c
    }
    var c = b.getLowestSetBit(),
      e = a.getLowestSetBit();
    if (0 > e) return b;
    c < e && (e = c);
    0 < e && (b.rShiftTo(e, b),
      a.rShiftTo(e, a));
    for (; 0 < b.signum();) 0 < (c = b.getLowestSetBit()) && b.rShiftTo(c,
      b), 0 < (c = a.getLowestSetBit()) && a.rShiftTo(c, a), 0 <= b.compareTo(
      a) ? (b.subTo(a, b), b.rShiftTo(1, b)) : (a.subTo(b, a), a.rShiftTo(
      1, a));
    0 < e && a.lShiftTo(e, a);
    return a
  };
  m.prototype.isProbablePrime = function(a) {
    var b, c = this.abs();
    if (1 == c.t && c[0] <= t[t.length - 1]) {
      for (b = 0; b < t.length; ++b)
        if (c[0] == t[b]) return !0;
      return !1
    }
    if (c.isEven()) return !1;
    for (b = 1; b < t.length;) {
      for (var e = t[b], d = b + 1; d < t.length && e < W;) e *= t[d++];
      for (e = c.modInt(e); b < d;)
        if (0 == e %
          t[b++]) return !1
    }
    return c.millerRabin(a)
  };
  m.prototype.square = function() {
    var a = p();
    this.squareTo(a);
    return a
  };
  var n = m;
  n.prototype.IsNegative = function() {
    return -1 == this.compareTo(n.ZERO) ? !0 : !1
  };
  n.op_Equality = function(a, b) {
    return 0 == a.compareTo(b) ? !0 : !1
  };
  n.op_Inequality = function(a, b) {
    return 0 != a.compareTo(b) ? !0 : !1
  };
  n.op_GreaterThan = function(a, b) {
    return 0 < a.compareTo(b) ? !0 : !1
  };
  n.op_LessThan = function(a, b) {
    return 0 > a.compareTo(b) ? !0 : !1
  };
  n.op_Addition = function(a, b) {
    return (new n(a)).add(new n(b))
  };
  n.op_Subtraction =
    function(a, b) {
      return (new n(a)).subtract(new n(b))
    };
  n.Int128Mul = function(a, b) {
    return (new n(a)).multiply(new n(b))
  };
  n.op_Division = function(a, b) {
    return a.divide(b)
  };
  n.prototype.ToDouble = function() {
    return parseFloat(this.toString())
  };
  if ("undefined" == typeof L) var L = function(a, b) {
    var c;
    if ("undefined" == typeof Object.getOwnPropertyNames)
      for (c in b.prototype) {
        if ("undefined" == typeof a.prototype[c] || a.prototype[c] ==
          Object.prototype[c]) a.prototype[c] = b.prototype[c]
      } else
        for (var e = Object.getOwnPropertyNames(b.prototype),
            d = 0; d < e.length; d++) "undefined" == typeof Object.getOwnPropertyDescriptor(
          a.prototype, e[d]) && Object.defineProperty(a.prototype, e[d],
          Object.getOwnPropertyDescriptor(b.prototype, e[d]));
    for (c in b) "undefined" == typeof a[c] && (a[c] = b[c]);
    a.$baseCtor = b
  };
  d.Path = function() {
    return []
  };
  d.Paths = function() {
    return []
  };
  d.DoublePoint = function() {
    var a = arguments;
    this.Y = this.X = 0;
    1 == a.length ? (this.X = a[0].X, this.Y = a[0].Y) : 2 == a.length && (
      this.X = a[0], this.Y = a[1])
  };
  d.DoublePoint0 = function() {
    this.Y = this.X = 0
  };
  d.DoublePoint1 = function(a) {
    this.X =
      a.X;
    this.Y = a.Y
  };
  d.DoublePoint2 = function(a, b) {
    this.X = a;
    this.Y = b
  };
  d.PolyNode = function() {
    this.m_Parent = null;
    this.m_polygon = new d.Path;
    this.m_endtype = this.m_jointype = this.m_Index = 0;
    this.m_Childs = [];
    this.IsOpen = !1
  };
  d.PolyNode.prototype.IsHoleNode = function() {
    for (var a = !0, b = this.m_Parent; null !== b;) a = !a, b = b.m_Parent;
    return a
  };
  d.PolyNode.prototype.ChildCount = function() {
    return this.m_Childs.length
  };
  d.PolyNode.prototype.Contour = function() {
    return this.m_polygon
  };
  d.PolyNode.prototype.AddChild = function(a) {
    var b =
      this.m_Childs.length;
    this.m_Childs.push(a);
    a.m_Parent = this;
    a.m_Index = b
  };
  d.PolyNode.prototype.GetNext = function() {
    return 0 < this.m_Childs.length ? this.m_Childs[0] : this.GetNextSiblingUp()
  };
  d.PolyNode.prototype.GetNextSiblingUp = function() {
    return null === this.m_Parent ? null : this.m_Index == this.m_Parent.m_Childs
      .length - 1 ? this.m_Parent.GetNextSiblingUp() : this.m_Parent.m_Childs[
        this.m_Index + 1]
  };
  d.PolyNode.prototype.Childs = function() {
    return this.m_Childs
  };
  d.PolyNode.prototype.Parent = function() {
    return this.m_Parent
  };
  d.PolyNode.prototype.IsHole = function() {
    return this.IsHoleNode()
  };
  d.PolyTree = function() {
    this.m_AllPolys = [];
    d.PolyNode.call(this)
  };
  d.PolyTree.prototype.Clear = function() {
    for (var a = 0, b = this.m_AllPolys.length; a < b; a++) this.m_AllPolys[
      a] = null;
    this.m_AllPolys.length = 0;
    this.m_Childs.length = 0
  };
  d.PolyTree.prototype.GetFirst = function() {
    return 0 < this.m_Childs.length ? this.m_Childs[0] : null
  };
  d.PolyTree.prototype.Total = function() {
    return this.m_AllPolys.length
  };
  L(d.PolyTree, d.PolyNode);
  d.Math_Abs_Int64 = d.Math_Abs_Int32 =
    d.Math_Abs_Double = function(a) {
      return Math.abs(a)
    };
  d.Math_Max_Int32_Int32 = function(a, b) {
    return Math.max(a, b)
  };
  d.Cast_Int32 = q || H || K ? function(a) {
    return a | 0
  } : function(a) {
    return ~~a
  };
  d.Cast_Int64 = F ? function(a) {
    return -2147483648 > a || 2147483647 < a ? 0 > a ? Math.ceil(a) : Math.floor(
      a) : ~~a
  } : G && "function" == typeof Number.toInteger ? function(a) {
    return Number.toInteger(a)
  } : Q || I ? function(a) {
    return parseInt(a, 10)
  } : q ? function(a) {
    return -2147483648 > a || 2147483647 < a ? 0 > a ? Math.ceil(a) : Math.floor(
      a) : a | 0
  } : function(a) {
    return 0 > a ? Math.ceil(a) :
      Math.floor(a)
  };
  d.Clear = function(a) {
    a.length = 0
  };
  d.PI = 3.141592653589793;
  d.PI2 = 6.283185307179586;
  d.IntPoint = function() {
    var a;
    a = arguments;
    var b = a.length;
    this.Y = this.X = 0;
    2 == b ? (this.X = a[0], this.Y = a[1]) : 1 == b ? a[0] instanceof d.DoublePoint ?
      (a = a[0], this.X = d.Clipper.Round(a.X), this.Y = d.Clipper.Round(a.Y)) :
      (a = a[0], this.X = a.X, this.Y = a.Y) : this.Y = this.X = 0
  };
  d.IntPoint.op_Equality = function(a, b) {
    return a.X == b.X && a.Y == b.Y
  };
  d.IntPoint.op_Inequality = function(a, b) {
    return a.X != b.X || a.Y != b.Y
  };
  d.IntPoint0 = function() {
    this.Y =
      this.X = 0
  };
  d.IntPoint1 = function(a) {
    this.X = a.X;
    this.Y = a.Y
  };
  d.IntPoint1dp = function(a) {
    this.X = d.Clipper.Round(a.X);
    this.Y = d.Clipper.Round(a.Y)
  };
  d.IntPoint2 = function(a, b) {
    this.X = a;
    this.Y = b
  };
  d.IntRect = function() {
    var a = arguments,
      b = a.length;
    4 == b ? (this.left = a[0], this.top = a[1], this.right = a[2], this.bottom =
        a[3]) : 1 == b ? (this.left = ir.left, this.top = ir.top, this.right =
        ir.right, this.bottom = ir.bottom) : this.bottom = this.right =
      this.top = this.left = 0
  };
  d.IntRect0 = function() {
    this.bottom = this.right = this.top = this.left = 0
  };
  d.IntRect1 =
    function(a) {
      this.left = a.left;
      this.top = a.top;
      this.right = a.right;
      this.bottom = a.bottom
    };
  d.IntRect4 = function(a, b, c, e) {
    this.left = a;
    this.top = b;
    this.right = c;
    this.bottom = e
  };
  d.ClipType = {
    ctIntersection: 0,
    ctUnion: 1,
    ctDifference: 2,
    ctXor: 3
  };
  d.PolyType = {
    ptSubject: 0,
    ptClip: 1
  };
  d.PolyFillType = {
    pftEvenOdd: 0,
    pftNonZero: 1,
    pftPositive: 2,
    pftNegative: 3
  };
  d.JoinType = {
    jtSquare: 0,
    jtRound: 1,
    jtMiter: 2
  };
  d.EndType = {
    etOpenSquare: 0,
    etOpenRound: 1,
    etOpenButt: 2,
    etClosedLine: 3,
    etClosedPolygon: 4
  };
  d.EdgeSide = {
    esLeft: 0,
    esRight: 1
  };
  d.Direction = {
    dRightToLeft: 0,
    dLeftToRight: 1
  };
  d.TEdge = function() {
    this.Bot = new d.IntPoint;
    this.Curr = new d.IntPoint;
    this.Top = new d.IntPoint;
    this.Delta = new d.IntPoint;
    this.Dx = 0;
    this.PolyTyp = d.PolyType.ptSubject;
    this.Side = d.EdgeSide.esLeft;
    this.OutIdx = this.WindCnt2 = this.WindCnt = this.WindDelta = 0;
    this.PrevInSEL = this.NextInSEL = this.PrevInAEL = this.NextInAEL =
      this.NextInLML = this.Prev = this.Next = null
  };
  d.IntersectNode = function() {
    this.Edge2 = this.Edge1 = null;
    this.Pt = new d.IntPoint
  };
  d.MyIntersectNodeSort = function() {};
  d.MyIntersectNodeSort.Compare =
    function(a, b) {
      return b.Pt.Y - a.Pt.Y
    };
  d.LocalMinima = function() {
    this.Y = 0;
    this.Next = this.RightBound = this.LeftBound = null
  };
  d.Scanbeam = function() {
    this.Y = 0;
    this.Next = null
  };
  d.OutRec = function() {
    this.Idx = 0;
    this.IsOpen = this.IsHole = !1;
    this.PolyNode = this.BottomPt = this.Pts = this.FirstLeft = null
  };
  d.OutPt = function() {
    this.Idx = 0;
    this.Pt = new d.IntPoint;
    this.Prev = this.Next = null
  };
  d.Join = function() {
    this.OutPt2 = this.OutPt1 = null;
    this.OffPt = new d.IntPoint
  };
  d.ClipperBase = function() {
    this.m_CurrentLM = this.m_MinimaList = null;
    this.m_edges = [];
    this.PreserveCollinear = this.m_HasOpenPaths = this.m_UseFullRange = !1;
    this.m_CurrentLM = this.m_MinimaList = null;
    this.m_HasOpenPaths = this.m_UseFullRange = !1
  };
  d.ClipperBase.horizontal = -9007199254740992;
  d.ClipperBase.Skip = -2;
  d.ClipperBase.Unassigned = -1;
  d.ClipperBase.tolerance = 1E-20;
  d.ClipperBase.loRange = 47453132;
  d.ClipperBase.hiRange = 0xfffffffffffff;
  d.ClipperBase.near_zero = function(a) {
    return a > -d.ClipperBase.tolerance && a < d.ClipperBase.tolerance
  };
  d.ClipperBase.IsHorizontal = function(a) {
    return 0 === a.Delta.Y
  };
  d.ClipperBase.prototype.PointIsVertex = function(a, b) {
    var c = b;
    do {
      if (d.IntPoint.op_Equality(c.Pt, a)) return !0;
      c = c.Next
    } while (c != b);
    return !1
  };
  d.ClipperBase.prototype.PointOnLineSegment = function(a, b, c, e) {
    return e ? a.X == b.X && a.Y == b.Y || a.X == c.X && a.Y == c.Y || a.X >
      b.X == a.X < c.X && a.Y > b.Y == a.Y < c.Y && n.op_Equality(n.Int128Mul(
        a.X - b.X, c.Y - b.Y), n.Int128Mul(c.X - b.X, a.Y - b.Y)) : a.X ==
      b.X && a.Y == b.Y || a.X == c.X && a.Y == c.Y || a.X > b.X == a.X < c
      .X && a.Y > b.Y == a.Y < c.Y && (a.X - b.X) * (c.Y - b.Y) == (c.X - b
        .X) * (a.Y - b.Y)
  };
  d.ClipperBase.prototype.PointOnPolygon =
    function(a, b, c) {
      for (var e = b;;) {
        if (this.PointOnLineSegment(a, e.Pt, e.Next.Pt, c)) return !0;
        e = e.Next;
        if (e == b) break
      }
      return !1
    };
  d.ClipperBase.prototype.SlopesEqual = d.ClipperBase.SlopesEqual = function() {
    var a = arguments,
      b = a.length,
      c, e, f;
    if (3 == b) return b = a[0], c = a[1], (a = a[2]) ? n.op_Equality(n.Int128Mul(
      b.Delta.Y, c.Delta.X), n.Int128Mul(b.Delta.X, c.Delta.Y)) : d.Cast_Int64(
      b.Delta.Y * c.Delta.X) == d.Cast_Int64(b.Delta.X * c.Delta.Y);
    if (4 == b) return b = a[0], c = a[1], e = a[2], (a = a[3]) ? n.op_Equality(
      n.Int128Mul(b.Y - c.Y, c.X - e.X),
      n.Int128Mul(b.X - c.X, c.Y - e.Y)) : 0 === d.Cast_Int64((b.Y - c.Y) *
      (c.X - e.X)) - d.Cast_Int64((b.X - c.X) * (c.Y - e.Y));
    b = a[0];
    c = a[1];
    e = a[2];
    f = a[3];
    return (a = a[4]) ? n.op_Equality(n.Int128Mul(b.Y - c.Y, e.X - f.X), n.Int128Mul(
        b.X - c.X, e.Y - f.Y)) : 0 === d.Cast_Int64((b.Y - c.Y) * (e.X - f.X)) -
      d.Cast_Int64((b.X - c.X) * (e.Y - f.Y))
  };
  d.ClipperBase.SlopesEqual3 = function(a, b, c) {
    return c ? n.op_Equality(n.Int128Mul(a.Delta.Y, b.Delta.X), n.Int128Mul(
      a.Delta.X, b.Delta.Y)) : d.Cast_Int64(a.Delta.Y * b.Delta.X) == d.Cast_Int64(
      a.Delta.X * b.Delta.Y)
  };
  d.ClipperBase.SlopesEqual4 =
    function(a, b, c, e) {
      return e ? n.op_Equality(n.Int128Mul(a.Y - b.Y, b.X - c.X), n.Int128Mul(
          a.X - b.X, b.Y - c.Y)) : 0 === d.Cast_Int64((a.Y - b.Y) * (b.X - c.X)) -
        d.Cast_Int64((a.X - b.X) * (b.Y - c.Y))
    };
  d.ClipperBase.SlopesEqual5 = function(a, b, c, e, f) {
    return f ? n.op_Equality(n.Int128Mul(a.Y - b.Y, c.X - e.X), n.Int128Mul(
        a.X - b.X, c.Y - e.Y)) : 0 === d.Cast_Int64((a.Y - b.Y) * (c.X - e.X)) -
      d.Cast_Int64((a.X - b.X) * (c.Y - e.Y))
  };
  d.ClipperBase.prototype.Clear = function() {
    this.DisposeLocalMinimaList();
    for (var a = 0, b = this.m_edges.length; a < b; ++a) {
      for (var c = 0,
          e = this.m_edges[a].length; c < e; ++c) this.m_edges[a][c] = null;
      d.Clear(this.m_edges[a])
    }
    d.Clear(this.m_edges);
    this.m_HasOpenPaths = this.m_UseFullRange = !1
  };
  d.ClipperBase.prototype.DisposeLocalMinimaList = function() {
    for (; null !== this.m_MinimaList;) {
      var a = this.m_MinimaList.Next;
      this.m_MinimaList = null;
      this.m_MinimaList = a
    }
    this.m_CurrentLM = null
  };
  d.ClipperBase.prototype.RangeTest = function(a, b) {
    if (b.Value)(a.X > d.ClipperBase.hiRange || a.Y > d.ClipperBase.hiRange ||
        -a.X > d.ClipperBase.hiRange || -a.Y > d.ClipperBase.hiRange) &&
      d.Error("Coordinate outside allowed range in RangeTest().");
    else if (a.X > d.ClipperBase.loRange || a.Y > d.ClipperBase.loRange ||
      -a.X > d.ClipperBase.loRange || -a.Y > d.ClipperBase.loRange) b.Value = !
      0, this.RangeTest(a, b)
  };
  d.ClipperBase.prototype.InitEdge = function(a, b, c, e) {
    a.Next = b;
    a.Prev = c;
    a.Curr.X = e.X;
    a.Curr.Y = e.Y;
    a.OutIdx = -1
  };
  d.ClipperBase.prototype.InitEdge2 = function(a, b) {
    a.Curr.Y >= a.Next.Curr.Y ? (a.Bot.X = a.Curr.X, a.Bot.Y = a.Curr.Y, a.Top
      .X = a.Next.Curr.X, a.Top.Y = a.Next.Curr.Y) : (a.Top.X = a.Curr.X,
      a.Top.Y = a.Curr.Y,
      a.Bot.X = a.Next.Curr.X, a.Bot.Y = a.Next.Curr.Y);
    this.SetDx(a);
    a.PolyTyp = b
  };
  d.ClipperBase.prototype.FindNextLocMin = function(a) {
    for (var b;;) {
      for (; d.IntPoint.op_Inequality(a.Bot, a.Prev.Bot) || d.IntPoint.op_Equality(
          a.Curr, a.Top);) a = a.Next;
      if (a.Dx != d.ClipperBase.horizontal && a.Prev.Dx != d.ClipperBase.horizontal)
        break;
      for (; a.Prev.Dx == d.ClipperBase.horizontal;) a = a.Prev;
      for (b = a; a.Dx == d.ClipperBase.horizontal;) a = a.Next;
      if (a.Top.Y != a.Prev.Bot.Y) {
        b.Prev.Bot.X < a.Bot.X && (a = b);
        break
      }
    }
    return a
  };
  d.ClipperBase.prototype.ProcessBound =
    function(a, b) {
      var c = a,
        e = a,
        f;
      a.Dx == d.ClipperBase.horizontal && (f = b ? a.Prev.Bot.X : a.Next.Bot.X,
        a.Bot.X != f && this.ReverseHorizontal(a));
      if (e.OutIdx != d.ClipperBase.Skip)
        if (b) {
          for (; e.Top.Y == e.Next.Bot.Y && e.Next.OutIdx != d.ClipperBase.Skip;)
            e = e.Next;
          if (e.Dx == d.ClipperBase.horizontal && e.Next.OutIdx != d.ClipperBase
            .Skip) {
            for (f = e; f.Prev.Dx == d.ClipperBase.horizontal;) f = f.Prev;
            f.Prev.Top.X == e.Next.Top.X ? b || (e = f.Prev) : f.Prev.Top.X >
              e.Next.Top.X && (e = f.Prev)
          }
          for (; a != e;) a.NextInLML = a.Next, a.Dx == d.ClipperBase.horizontal &&
            a != c && a.Bot.X != a.Prev.Top.X && this.ReverseHorizontal(a), a =
            a.Next;
          a.Dx == d.ClipperBase.horizontal && a != c && a.Bot.X != a.Prev.Top
            .X && this.ReverseHorizontal(a);
          e = e.Next
        } else {
          for (; e.Top.Y == e.Prev.Bot.Y && e.Prev.OutIdx != d.ClipperBase.Skip;)
            e = e.Prev;
          if (e.Dx == d.ClipperBase.horizontal && e.Prev.OutIdx != d.ClipperBase
            .Skip) {
            for (f = e; f.Next.Dx == d.ClipperBase.horizontal;) f = f.Next;
            f.Next.Top.X == e.Prev.Top.X ? b || (e = f.Next) : f.Next.Top.X >
              e.Prev.Top.X && (e = f.Next)
          }
          for (; a != e;) a.NextInLML = a.Prev, a.Dx == d.ClipperBase.horizontal &&
            a != c && a.Bot.X != a.Next.Top.X && this.ReverseHorizontal(a), a =
            a.Prev;
          a.Dx == d.ClipperBase.horizontal && a != c && a.Bot.X != a.Next.Top
            .X && this.ReverseHorizontal(a);
          e = e.Prev
        }
      if (e.OutIdx == d.ClipperBase.Skip) {
        a = e;
        if (b) {
          for (; a.Top.Y == a.Next.Bot.Y;) a = a.Next;
          for (; a != e && a.Dx == d.ClipperBase.horizontal;) a = a.Prev
        } else {
          for (; a.Top.Y == a.Prev.Bot.Y;) a = a.Prev;
          for (; a != e && a.Dx == d.ClipperBase.horizontal;) a = a.Next
        }
        a == e ? e = b ? a.Next : a.Prev : (a = b ? e.Next : e.Prev, c = new d
          .LocalMinima, c.Next = null, c.Y = a.Bot.Y, c.LeftBound = null, c
          .RightBound =
          a, c.RightBound.WindDelta = 0, e = this.ProcessBound(c.RightBound,
            b), this.InsertLocalMinima(c))
      }
      return e
    };
  d.ClipperBase.prototype.AddPath = function(a, b, c) {
    c || b != d.PolyType.ptClip || d.Error(
      "AddPath: Open paths must be subject.");
    var e = a.length - 1;
    if (c)
      for (; 0 < e && d.IntPoint.op_Equality(a[e], a[0]);) --e;
    for (; 0 < e && d.IntPoint.op_Equality(a[e], a[e - 1]);) --e;
    if (c && 2 > e || !c && 1 > e) return !1;
    for (var f = [], g = 0; g <= e; g++) f.push(new d.TEdge);
    var h = !0;
    f[1].Curr.X = a[1].X;
    f[1].Curr.Y = a[1].Y;
    (function() {
      var b = {
          Value: this.m_UseFullRange
        },
        c = this.RangeTest(a[0], b);
      this.m_UseFullRange = b.Value;
      return c
    }).call(this);
    (function() {
      var b = {
          Value: this.m_UseFullRange
        },
        c = this.RangeTest(a[e], b);
      this.m_UseFullRange = b.Value;
      return c
    }).call(this);
    this.InitEdge(f[0], f[1], f[e], a[0]);
    this.InitEdge(f[e], f[0], f[e - 1], a[e]);
    for (g = e - 1; 1 <= g; --g)(function() {
      var b = {
          Value: this.m_UseFullRange
        },
        c = this.RangeTest(a[g], b);
      this.m_UseFullRange = b.Value;
      return c
    }).call(this), this.InitEdge(f[g], f[g + 1], f[g - 1], a[g]);
    for (var l = f[0], k = l, m = l;;)
      if (d.IntPoint.op_Equality(k.Curr,
          k.Next.Curr)) {
        if (k == k.Next) break;
        k == l && (l = k.Next);
        m = k = this.RemoveEdge(k)
      } else {
        if (k.Prev == k.Next) break;
        else if (c && d.ClipperBase.SlopesEqual(k.Prev.Curr, k.Curr, k.Next
            .Curr, this.m_UseFullRange) && (!this.PreserveCollinear || !
            this.Pt2IsBetweenPt1AndPt3(k.Prev.Curr, k.Curr, k.Next.Curr))) {
          k == l && (l = k.Next);
          k = this.RemoveEdge(k);
          m = k = k.Prev;
          continue
        }
        k = k.Next;
        if (k == m) break
      }
    if (!c && k == k.Next || c && k.Prev == k.Next) return !1;
    c || (this.m_HasOpenPaths = !0, l.Prev.OutIdx = d.ClipperBase.Skip);
    k = l;
    do this.InitEdge2(k, b), k = k.Next,
      h && k.Curr.Y != l.Curr.Y && (h = !1); while (k != l);
    if (h) {
      if (c) return !1;
      k.Prev.OutIdx = d.ClipperBase.Skip;
      k.Prev.Bot.X < k.Prev.Top.X && this.ReverseHorizontal(k.Prev);
      b = new d.LocalMinima;
      b.Next = null;
      b.Y = k.Bot.Y;
      b.LeftBound = null;
      b.RightBound = k;
      b.RightBound.Side = d.EdgeSide.esRight;
      for (b.RightBound.WindDelta = 0; k.Next.OutIdx != d.ClipperBase.Skip;)
        k.NextInLML = k.Next, k.Bot.X != k.Prev.Top.X && this.ReverseHorizontal(
          k), k = k.Next;
      this.InsertLocalMinima(b);
      this.m_edges.push(f);
      return !0
    }
    this.m_edges.push(f);
    for (h = null;;) {
      k = this.FindNextLocMin(k);
      if (k == h) break;
      else null == h && (h = k);
      b = new d.LocalMinima;
      b.Next = null;
      b.Y = k.Bot.Y;
      k.Dx < k.Prev.Dx ? (b.LeftBound = k.Prev, b.RightBound = k, f = !1) :
        (b.LeftBound = k, b.RightBound = k.Prev, f = !0);
      b.LeftBound.Side = d.EdgeSide.esLeft;
      b.RightBound.Side = d.EdgeSide.esRight;
      b.LeftBound.WindDelta = c ? b.LeftBound.Next == b.RightBound ? -1 : 1 :
        0;
      b.RightBound.WindDelta = -b.LeftBound.WindDelta;
      k = this.ProcessBound(b.LeftBound, f);
      l = this.ProcessBound(b.RightBound, !f);
      b.LeftBound.OutIdx == d.ClipperBase.Skip ? b.LeftBound = null : b.RightBound
        .OutIdx ==
        d.ClipperBase.Skip && (b.RightBound = null);
      this.InsertLocalMinima(b);
      f || (k = l)
    }
    return !0
  };
  d.ClipperBase.prototype.AddPaths = function(a, b, c) {
    for (var e = !1, d = 0, g = a.length; d < g; ++d) this.AddPath(a[d], b,
      c) && (e = !0);
    return e
  };
  d.ClipperBase.prototype.Pt2IsBetweenPt1AndPt3 = function(a, b, c) {
    return d.IntPoint.op_Equality(a, c) || d.IntPoint.op_Equality(a, b) ||
      d.IntPoint.op_Equality(c, b) ? !1 : a.X != c.X ? b.X > a.X == b.X < c
      .X : b.Y > a.Y == b.Y < c.Y
  };
  d.ClipperBase.prototype.RemoveEdge = function(a) {
    a.Prev.Next = a.Next;
    a.Next.Prev = a.Prev;
    var b =
      a.Next;
    a.Prev = null;
    return b
  };
  d.ClipperBase.prototype.SetDx = function(a) {
    a.Delta.X = a.Top.X - a.Bot.X;
    a.Delta.Y = a.Top.Y - a.Bot.Y;
    a.Dx = 0 === a.Delta.Y ? d.ClipperBase.horizontal : a.Delta.X / a.Delta
      .Y
  };
  d.ClipperBase.prototype.InsertLocalMinima = function(a) {
    if (null === this.m_MinimaList) this.m_MinimaList = a;
    else if (a.Y >= this.m_MinimaList.Y) a.Next = this.m_MinimaList, this.m_MinimaList =
      a;
    else {
      for (var b = this.m_MinimaList; null !== b.Next && a.Y < b.Next.Y;) b =
        b.Next;
      a.Next = b.Next;
      b.Next = a
    }
  };
  d.ClipperBase.prototype.PopLocalMinima =
    function() {
      null !== this.m_CurrentLM && (this.m_CurrentLM = this.m_CurrentLM.Next)
    };
  d.ClipperBase.prototype.ReverseHorizontal = function(a) {
    var b = a.Top.X;
    a.Top.X = a.Bot.X;
    a.Bot.X = b
  };
  d.ClipperBase.prototype.Reset = function() {
    this.m_CurrentLM = this.m_MinimaList;
    if (null != this.m_CurrentLM)
      for (var a = this.m_MinimaList; null != a;) {
        var b = a.LeftBound;
        null != b && (b.Curr.X = b.Bot.X, b.Curr.Y = b.Bot.Y, b.Side = d.EdgeSide
          .esLeft, b.OutIdx = d.ClipperBase.Unassigned);
        b = a.RightBound;
        null != b && (b.Curr.X = b.Bot.X, b.Curr.Y = b.Bot.Y, b.Side =
          d.EdgeSide.esRight, b.OutIdx = d.ClipperBase.Unassigned);
        a = a.Next
      }
  };
  d.Clipper = function(a) {
    "undefined" == typeof a && (a = 0);
    this.m_PolyOuts = null;
    this.m_ClipType = d.ClipType.ctIntersection;
    this.m_IntersectNodeComparer = this.m_IntersectList = this.m_SortedEdges =
      this.m_ActiveEdges = this.m_Scanbeam = null;
    this.m_ExecuteLocked = !1;
    this.m_SubjFillType = this.m_ClipFillType = d.PolyFillType.pftEvenOdd;
    this.m_GhostJoins = this.m_Joins = null;
    this.StrictlySimple = this.ReverseSolution = this.m_UsingPolyTree = !1;
    d.ClipperBase.call(this);
    this.m_SortedEdges = this.m_ActiveEdges = this.m_Scanbeam = null;
    this.m_IntersectList = [];
    this.m_IntersectNodeComparer = d.MyIntersectNodeSort.Compare;
    this.m_UsingPolyTree = this.m_ExecuteLocked = !1;
    this.m_PolyOuts = [];
    this.m_Joins = [];
    this.m_GhostJoins = [];
    this.ReverseSolution = 0 !== (1 & a);
    this.StrictlySimple = 0 !== (2 & a);
    this.PreserveCollinear = 0 !== (4 & a)
  };
  d.Clipper.ioReverseSolution = 1;
  d.Clipper.ioStrictlySimple = 2;
  d.Clipper.ioPreserveCollinear = 4;
  d.Clipper.prototype.Clear = function() {
    0 !== this.m_edges.length && (this.DisposeAllPolyPts(),
      d.ClipperBase.prototype.Clear.call(this))
  };
  d.Clipper.prototype.DisposeScanbeamList = function() {
    for (; null !== this.m_Scanbeam;) {
      var a = this.m_Scanbeam.Next;
      this.m_Scanbeam = null;
      this.m_Scanbeam = a
    }
  };
  d.Clipper.prototype.Reset = function() {
    d.ClipperBase.prototype.Reset.call(this);
    this.m_SortedEdges = this.m_ActiveEdges = this.m_Scanbeam = null;
    for (var a = this.m_MinimaList; null !== a;) this.InsertScanbeam(a.Y),
      a = a.Next
  };
  d.Clipper.prototype.InsertScanbeam = function(a) {
    if (null === this.m_Scanbeam) this.m_Scanbeam = new d.Scanbeam,
      this.m_Scanbeam.Next = null, this.m_Scanbeam.Y = a;
    else if (a > this.m_Scanbeam.Y) {
      var b = new d.Scanbeam;
      b.Y = a;
      b.Next = this.m_Scanbeam;
      this.m_Scanbeam = b
    } else {
      for (var c = this.m_Scanbeam; null !== c.Next && a <= c.Next.Y;) c =
        c.Next;
      a != c.Y && (b = new d.Scanbeam, b.Y = a, b.Next = c.Next, c.Next = b)
    }
  };
  d.Clipper.prototype.Execute = function() {
    var a = arguments,
      b = a.length,
      c = a[1] instanceof d.PolyTree;
    if (4 != b || c) {
      if (4 == b && c) {
        var b = a[0],
          e = a[1],
          c = a[2],
          a = a[3];
        if (this.m_ExecuteLocked) return !1;
        this.m_ExecuteLocked = !0;
        this.m_SubjFillType = c;
        this.m_ClipFillType =
          a;
        this.m_ClipType = b;
        this.m_UsingPolyTree = !0;
        try {
          (f = this.ExecuteInternal()) && this.BuildResult2(e)
        } finally {
          this.DisposeAllPolyPts(), this.m_ExecuteLocked = !1
        }
        return f
      }
      if (2 == b && !c || 2 == b && c) return b = a[0], e = a[1], this.Execute(
        b, e, d.PolyFillType.pftEvenOdd, d.PolyFillType.pftEvenOdd)
    } else {
      b = a[0];
      e = a[1];
      c = a[2];
      a = a[3];
      if (this.m_ExecuteLocked) return !1;
      this.m_HasOpenPaths && d.Error(
        "Error: PolyTree struct is need for open path clipping.");
      this.m_ExecuteLocked = !0;
      d.Clear(e);
      this.m_SubjFillType = c;
      this.m_ClipFillType =
        a;
      this.m_ClipType = b;
      this.m_UsingPolyTree = !1;
      try {
        var f = this.ExecuteInternal();
        f && this.BuildResult(e)
      } finally {
        this.DisposeAllPolyPts(), this.m_ExecuteLocked = !1
      }
      return f
    }
  };
  d.Clipper.prototype.FixHoleLinkage = function(a) {
    if (null !== a.FirstLeft && (a.IsHole == a.FirstLeft.IsHole || null ===
        a.FirstLeft.Pts)) {
      for (var b = a.FirstLeft; null !== b && (b.IsHole == a.IsHole || null ===
          b.Pts);) b = b.FirstLeft;
      a.FirstLeft = b
    }
  };
  d.Clipper.prototype.ExecuteInternal = function() {
    try {
      this.Reset();
      if (null === this.m_CurrentLM) return !1;
      var a = this.PopScanbeam();
      do {
        this.InsertLocalMinimaIntoAEL(a);
        d.Clear(this.m_GhostJoins);
        this.ProcessHorizontals(!1);
        if (null === this.m_Scanbeam) break;
        var b = this.PopScanbeam();
        if (!this.ProcessIntersections(a, b)) return !1;
        this.ProcessEdgesAtTopOfScanbeam(b);
        a = b
      } while (null !== this.m_Scanbeam || null !== this.m_CurrentLM);
      for (var a = 0, c = this.m_PolyOuts.length; a < c; a++) {
        var e = this.m_PolyOuts[a];
        null === e.Pts || e.IsOpen || (e.IsHole ^ this.ReverseSolution) ==
          0 < this.Area(e) && this.ReversePolyPtLinks(e.Pts)
      }
      this.JoinCommonEdges();
      a = 0;
      for (c = this.m_PolyOuts.length; a <
        c; a++) e = this.m_PolyOuts[a], null === e.Pts || e.IsOpen || this.FixupOutPolygon(
        e);
      this.StrictlySimple && this.DoSimplePolygons();
      return !0
    } finally {
      d.Clear(this.m_Joins), d.Clear(this.m_GhostJoins)
    }
  };
  d.Clipper.prototype.PopScanbeam = function() {
    var a = this.m_Scanbeam.Y;
    this.m_Scanbeam = this.m_Scanbeam.Next;
    return a
  };
  d.Clipper.prototype.DisposeAllPolyPts = function() {
    for (var a = 0, b = this.m_PolyOuts.length; a < b; ++a) this.DisposeOutRec(
      a);
    d.Clear(this.m_PolyOuts)
  };
  d.Clipper.prototype.DisposeOutRec = function(a) {
    var b = this.m_PolyOuts[a];
    null !== b.Pts && this.DisposeOutPts(b.Pts);
    this.m_PolyOuts[a] = null
  };
  d.Clipper.prototype.DisposeOutPts = function(a) {
    if (null !== a)
      for (a.Prev.Next = null; null !== a;) a = a.Next
  };
  d.Clipper.prototype.AddJoin = function(a, b, c) {
    var e = new d.Join;
    e.OutPt1 = a;
    e.OutPt2 = b;
    e.OffPt.X = c.X;
    e.OffPt.Y = c.Y;
    this.m_Joins.push(e)
  };
  d.Clipper.prototype.AddGhostJoin = function(a, b) {
    var c = new d.Join;
    c.OutPt1 = a;
    c.OffPt.X = b.X;
    c.OffPt.Y = b.Y;
    this.m_GhostJoins.push(c)
  };
  d.Clipper.prototype.InsertLocalMinimaIntoAEL = function(a) {
    for (; null !== this.m_CurrentLM &&
      this.m_CurrentLM.Y == a;) {
      var b = this.m_CurrentLM.LeftBound,
        c = this.m_CurrentLM.RightBound;
      this.PopLocalMinima();
      var e = null;
      null === b ? (this.InsertEdgeIntoAEL(c, null), this.SetWindingCount(c),
        this.IsContributing(c) && (e = this.AddOutPt(c, c.Bot))) : (null ==
        c ? (this.InsertEdgeIntoAEL(b, null), this.SetWindingCount(b),
          this.IsContributing(b) && (e = this.AddOutPt(b, b.Bot))) : (
          this.InsertEdgeIntoAEL(b, null), this.InsertEdgeIntoAEL(c, b),
          this.SetWindingCount(b), c.WindCnt = b.WindCnt, c.WindCnt2 = b.WindCnt2,
          this.IsContributing(b) &&
          (e = this.AddLocalMinPoly(b, c, b.Bot))), this.InsertScanbeam(b
          .Top.Y));
      null != c && (d.ClipperBase.IsHorizontal(c) ? this.AddEdgeToSEL(c) :
        this.InsertScanbeam(c.Top.Y));
      if (null != b && null != c) {
        if (null !== e && d.ClipperBase.IsHorizontal(c) && 0 < this.m_GhostJoins
          .length && 0 !== c.WindDelta)
          for (var f = 0, g = this.m_GhostJoins.length; f < g; f++) {
            var h = this.m_GhostJoins[f];
            this.HorzSegmentsOverlap(h.OutPt1.Pt, h.OffPt, c.Bot, c.Top) &&
              this.AddJoin(h.OutPt1, e, h.OffPt)
          }
        0 <= b.OutIdx && null !== b.PrevInAEL && b.PrevInAEL.Curr.X == b.Bot
          .X && 0 <= b.PrevInAEL.OutIdx &&
          d.ClipperBase.SlopesEqual(b.PrevInAEL, b, this.m_UseFullRange) &&
          0 !== b.WindDelta && 0 !== b.PrevInAEL.WindDelta && (f = this.AddOutPt(
            b.PrevInAEL, b.Bot), this.AddJoin(e, f, b.Top));
        if (b.NextInAEL != c && (0 <= c.OutIdx && 0 <= c.PrevInAEL.OutIdx &&
            d.ClipperBase.SlopesEqual(c.PrevInAEL, c, this.m_UseFullRange) &&
            0 !== c.WindDelta && 0 !== c.PrevInAEL.WindDelta && (f = this.AddOutPt(
              c.PrevInAEL, c.Bot), this.AddJoin(e, f, c.Top)), e = b.NextInAEL,
            null !== e))
          for (; e != c;) this.IntersectEdges(c, e, b.Curr, !1), e = e.NextInAEL
      }
    }
  };
  d.Clipper.prototype.InsertEdgeIntoAEL =
    function(a, b) {
      if (null === this.m_ActiveEdges) a.PrevInAEL = null, a.NextInAEL = null,
        this.m_ActiveEdges = a;
      else if (null === b && this.E2InsertsBeforeE1(this.m_ActiveEdges, a)) a
        .PrevInAEL = null, a.NextInAEL = this.m_ActiveEdges, this.m_ActiveEdges =
        this.m_ActiveEdges.PrevInAEL = a;
      else {
        null === b && (b = this.m_ActiveEdges);
        for (; null !== b.NextInAEL && !this.E2InsertsBeforeE1(b.NextInAEL, a);)
          b = b.NextInAEL;
        a.NextInAEL = b.NextInAEL;
        null !== b.NextInAEL && (b.NextInAEL.PrevInAEL = a);
        a.PrevInAEL = b;
        b.NextInAEL = a
      }
    };
  d.Clipper.prototype.E2InsertsBeforeE1 =
    function(a, b) {
      return b.Curr.X == a.Curr.X ? b.Top.Y > a.Top.Y ? b.Top.X < d.Clipper.TopX(
          a, b.Top.Y) : a.Top.X > d.Clipper.TopX(b, a.Top.Y) : b.Curr.X < a.Curr
        .X
    };
  d.Clipper.prototype.IsEvenOddFillType = function(a) {
    return a.PolyTyp == d.PolyType.ptSubject ? this.m_SubjFillType == d.PolyFillType
      .pftEvenOdd : this.m_ClipFillType == d.PolyFillType.pftEvenOdd
  };
  d.Clipper.prototype.IsEvenOddAltFillType = function(a) {
    return a.PolyTyp == d.PolyType.ptSubject ? this.m_ClipFillType == d.PolyFillType
      .pftEvenOdd : this.m_SubjFillType == d.PolyFillType.pftEvenOdd
  };
  d.Clipper.prototype.IsContributing = function(a) {
    var b, c;
    a.PolyTyp == d.PolyType.ptSubject ? (b = this.m_SubjFillType, c = this.m_ClipFillType) :
      (b = this.m_ClipFillType, c = this.m_SubjFillType);
    switch (b) {
      case d.PolyFillType.pftEvenOdd:
        if (0 === a.WindDelta && 1 != a.WindCnt) return !1;
        break;
      case d.PolyFillType.pftNonZero:
        if (1 != Math.abs(a.WindCnt)) return !1;
        break;
      case d.PolyFillType.pftPositive:
        if (1 != a.WindCnt) return !1;
        break;
      default:
        if (-1 != a.WindCnt) return !1
    }
    switch (this.m_ClipType) {
      case d.ClipType.ctIntersection:
        switch (c) {
          case d.PolyFillType.pftEvenOdd:
          case d.PolyFillType.pftNonZero:
            return 0 !==
              a.WindCnt2;
          case d.PolyFillType.pftPositive:
            return 0 < a.WindCnt2;
          default:
            return 0 > a.WindCnt2
        }
      case d.ClipType.ctUnion:
        switch (c) {
          case d.PolyFillType.pftEvenOdd:
          case d.PolyFillType.pftNonZero:
            return 0 === a.WindCnt2;
          case d.PolyFillType.pftPositive:
            return 0 >= a.WindCnt2;
          default:
            return 0 <= a.WindCnt2
        }
      case d.ClipType.ctDifference:
        if (a.PolyTyp == d.PolyType.ptSubject) switch (c) {
          case d.PolyFillType.pftEvenOdd:
          case d.PolyFillType.pftNonZero:
            return 0 === a.WindCnt2;
          case d.PolyFillType.pftPositive:
            return 0 >= a.WindCnt2;
          default:
            return 0 <= a.WindCnt2
        } else switch (c) {
          case d.PolyFillType.pftEvenOdd:
          case d.PolyFillType.pftNonZero:
            return 0 !== a.WindCnt2;
          case d.PolyFillType.pftPositive:
            return 0 < a.WindCnt2;
          default:
            return 0 > a.WindCnt2
        }
      case d.ClipType.ctXor:
        if (0 === a.WindDelta) switch (c) {
          case d.PolyFillType.pftEvenOdd:
          case d.PolyFillType.pftNonZero:
            return 0 === a.WindCnt2;
          case d.PolyFillType.pftPositive:
            return 0 >= a.WindCnt2;
          default:
            return 0 <= a.WindCnt2
        }
    }
    return !0
  };
  d.Clipper.prototype.SetWindingCount = function(a) {
    for (var b = a.PrevInAEL; null !==
      b && (b.PolyTyp != a.PolyTyp || 0 === b.WindDelta);) b = b.PrevInAEL;
    if (null === b) a.WindCnt = 0 === a.WindDelta ? 1 : a.WindDelta, a.WindCnt2 =
      0, b = this.m_ActiveEdges;
    else {
      if (0 === a.WindDelta && this.m_ClipType != d.ClipType.ctUnion) a.WindCnt =
        1;
      else if (this.IsEvenOddFillType(a))
        if (0 === a.WindDelta) {
          for (var c = !0, e = b.PrevInAEL; null !== e;) e.PolyTyp == b.PolyTyp &&
            0 !== e.WindDelta && (c = !c), e = e.PrevInAEL;
          a.WindCnt = c ? 0 : 1
        } else a.WindCnt = a.WindDelta;
      else 0 > b.WindCnt * b.WindDelta ? 1 < Math.abs(b.WindCnt) ? a.WindCnt =
        0 > b.WindDelta * a.WindDelta ? b.WindCnt :
        b.WindCnt + a.WindDelta : a.WindCnt = 0 === a.WindDelta ? 1 : a.WindDelta :
        a.WindCnt = 0 === a.WindDelta ? 0 > b.WindCnt ? b.WindCnt - 1 : b.WindCnt +
        1 : 0 > b.WindDelta * a.WindDelta ? b.WindCnt : b.WindCnt + a.WindDelta;
      a.WindCnt2 = b.WindCnt2;
      b = b.NextInAEL
    }
    if (this.IsEvenOddAltFillType(a))
      for (; b != a;) 0 !== b.WindDelta && (a.WindCnt2 = 0 === a.WindCnt2 ?
        1 : 0), b = b.NextInAEL;
    else
      for (; b != a;) a.WindCnt2 += b.WindDelta, b = b.NextInAEL
  };
  d.Clipper.prototype.AddEdgeToSEL = function(a) {
    null === this.m_SortedEdges ? (this.m_SortedEdges = a, a.PrevInSEL =
      null, a.NextInSEL =
      null) : (a.NextInSEL = this.m_SortedEdges, a.PrevInSEL = null, this
      .m_SortedEdges = this.m_SortedEdges.PrevInSEL = a)
  };
  d.Clipper.prototype.CopyAELToSEL = function() {
    var a = this.m_ActiveEdges;
    for (this.m_SortedEdges = a; null !== a;) a.PrevInSEL = a.PrevInAEL, a =
      a.NextInSEL = a.NextInAEL
  };
  d.Clipper.prototype.SwapPositionsInAEL = function(a, b) {
    if (a.NextInAEL != a.PrevInAEL && b.NextInAEL != b.PrevInAEL) {
      if (a.NextInAEL == b) {
        var c = b.NextInAEL;
        null !== c && (c.PrevInAEL = a);
        var e = a.PrevInAEL;
        null !== e && (e.NextInAEL = b);
        b.PrevInAEL = e;
        b.NextInAEL =
          a;
        a.PrevInAEL = b;
        a.NextInAEL = c
      } else b.NextInAEL == a ? (c = a.NextInAEL, null !== c && (c.PrevInAEL =
          b), e = b.PrevInAEL, null !== e && (e.NextInAEL = a), a.PrevInAEL =
        e, a.NextInAEL = b, b.PrevInAEL = a, b.NextInAEL = c) : (c = a.NextInAEL,
        e = a.PrevInAEL, a.NextInAEL = b.NextInAEL, null !== a.NextInAEL &&
        (a.NextInAEL.PrevInAEL = a), a.PrevInAEL = b.PrevInAEL, null !==
        a.PrevInAEL && (a.PrevInAEL.NextInAEL = a), b.NextInAEL = c, null !==
        b.NextInAEL && (b.NextInAEL.PrevInAEL = b), b.PrevInAEL = e, null !==
        b.PrevInAEL && (b.PrevInAEL.NextInAEL = b));
      null === a.PrevInAEL ? this.m_ActiveEdges =
        a : null === b.PrevInAEL && (this.m_ActiveEdges = b)
    }
  };
  d.Clipper.prototype.SwapPositionsInSEL = function(a, b) {
    if (null !== a.NextInSEL || null !== a.PrevInSEL)
      if (null !== b.NextInSEL || null !== b.PrevInSEL) {
        if (a.NextInSEL == b) {
          var c = b.NextInSEL;
          null !== c && (c.PrevInSEL = a);
          var e = a.PrevInSEL;
          null !== e && (e.NextInSEL = b);
          b.PrevInSEL = e;
          b.NextInSEL = a;
          a.PrevInSEL = b;
          a.NextInSEL = c
        } else b.NextInSEL == a ? (c = a.NextInSEL, null !== c && (c.PrevInSEL =
            b), e = b.PrevInSEL, null !== e && (e.NextInSEL = a), a.PrevInSEL =
          e, a.NextInSEL = b, b.PrevInSEL = a, b.NextInSEL =
          c) : (c = a.NextInSEL, e = a.PrevInSEL, a.NextInSEL = b.NextInSEL,
          null !== a.NextInSEL && (a.NextInSEL.PrevInSEL = a), a.PrevInSEL =
          b.PrevInSEL, null !== a.PrevInSEL && (a.PrevInSEL.NextInSEL = a),
          b.NextInSEL = c, null !== b.NextInSEL && (b.NextInSEL.PrevInSEL =
            b), b.PrevInSEL = e, null !== b.PrevInSEL && (b.PrevInSEL.NextInSEL =
            b));
        null === a.PrevInSEL ? this.m_SortedEdges = a : null === b.PrevInSEL &&
          (this.m_SortedEdges = b)
      }
  };
  d.Clipper.prototype.AddLocalMaxPoly = function(a, b, c) {
    this.AddOutPt(a, c);
    0 == b.WindDelta && this.AddOutPt(b, c);
    a.OutIdx == b.OutIdx ?
      (a.OutIdx = -1, b.OutIdx = -1) : a.OutIdx < b.OutIdx ? this.AppendPolygon(
        a, b) : this.AppendPolygon(b, a)
  };
  d.Clipper.prototype.AddLocalMinPoly = function(a, b, c) {
    var e, f;
    d.ClipperBase.IsHorizontal(b) || a.Dx > b.Dx ? (e = this.AddOutPt(a, c),
        b.OutIdx = a.OutIdx, a.Side = d.EdgeSide.esLeft, b.Side = d.EdgeSide
        .esRight, f = a, a = f.PrevInAEL == b ? b.PrevInAEL : f.PrevInAEL) :
      (e = this.AddOutPt(b, c), a.OutIdx = b.OutIdx, a.Side = d.EdgeSide.esRight,
        b.Side = d.EdgeSide.esLeft, f = b, a = f.PrevInAEL == a ? a.PrevInAEL :
        f.PrevInAEL);
    null !== a && 0 <= a.OutIdx && d.Clipper.TopX(a,
      c.Y) == d.Clipper.TopX(f, c.Y) && d.ClipperBase.SlopesEqual(f, a,
      this.m_UseFullRange) && 0 !== f.WindDelta && 0 !== a.WindDelta && (
      c = this.AddOutPt(a, c), this.AddJoin(e, c, f.Top));
    return e
  };
  d.Clipper.prototype.CreateOutRec = function() {
    var a = new d.OutRec;
    a.Idx = -1;
    a.IsHole = !1;
    a.IsOpen = !1;
    a.FirstLeft = null;
    a.Pts = null;
    a.BottomPt = null;
    a.PolyNode = null;
    this.m_PolyOuts.push(a);
    a.Idx = this.m_PolyOuts.length - 1;
    return a
  };
  d.Clipper.prototype.AddOutPt = function(a, b) {
    var c = a.Side == d.EdgeSide.esLeft;
    if (0 > a.OutIdx) {
      var e = this.CreateOutRec();
      e.IsOpen = 0 === a.WindDelta;
      var f = new d.OutPt;
      e.Pts = f;
      f.Idx = e.Idx;
      f.Pt.X = b.X;
      f.Pt.Y = b.Y;
      f.Next = f;
      f.Prev = f;
      e.IsOpen || this.SetHoleState(a, e);
      a.OutIdx = e.Idx
    } else {
      var e = this.m_PolyOuts[a.OutIdx],
        g = e.Pts;
      if (c && d.IntPoint.op_Equality(b, g.Pt)) return g;
      if (!c && d.IntPoint.op_Equality(b, g.Prev.Pt)) return g.Prev;
      f = new d.OutPt;
      f.Idx = e.Idx;
      f.Pt.X = b.X;
      f.Pt.Y = b.Y;
      f.Next = g;
      f.Prev = g.Prev;
      f.Prev.Next = f;
      g.Prev = f;
      c && (e.Pts = f)
    }
    return f
  };
  d.Clipper.prototype.SwapPoints = function(a, b) {
    var c = new d.IntPoint(a.Value);
    a.Value.X =
      b.Value.X;
    a.Value.Y = b.Value.Y;
    b.Value.X = c.X;
    b.Value.Y = c.Y
  };
  d.Clipper.prototype.HorzSegmentsOverlap = function(a, b, c, e) {
    return a.X > c.X == a.X < e.X ? !0 : b.X > c.X == b.X < e.X ? !0 : c.X >
      a.X == c.X < b.X ? !0 : e.X > a.X == e.X < b.X ? !0 : a.X == c.X && b
      .X == e.X ? !0 : a.X == e.X && b.X == c.X ? !0 : !1
  };
  d.Clipper.prototype.InsertPolyPtBetween = function(a, b, c) {
    var e = new d.OutPt;
    e.Pt.X = c.X;
    e.Pt.Y = c.Y;
    b == a.Next ? (a.Next = e, b.Prev = e, e.Next = b, e.Prev = a) : (b.Next =
      e, a.Prev = e, e.Next = a, e.Prev = b);
    return e
  };
  d.Clipper.prototype.SetHoleState = function(a, b) {
    for (var c = !1, e = a.PrevInAEL; null !== e;) 0 <= e.OutIdx && 0 != e.WindDelta &&
      (c = !c, null === b.FirstLeft && (b.FirstLeft = this.m_PolyOuts[e.OutIdx])),
      e = e.PrevInAEL;
    c && (b.IsHole = !0)
  };
  d.Clipper.prototype.GetDx = function(a, b) {
    return a.Y == b.Y ? d.ClipperBase.horizontal : (b.X - a.X) / (b.Y - a.Y)
  };
  d.Clipper.prototype.FirstIsBottomPt = function(a, b) {
    for (var c = a.Prev; d.IntPoint.op_Equality(c.Pt, a.Pt) && c != a;) c =
      c.Prev;
    for (var e = Math.abs(this.GetDx(a.Pt, c.Pt)), c = a.Next; d.IntPoint.op_Equality(
        c.Pt, a.Pt) && c != a;) c = c.Next;
    for (var f = Math.abs(this.GetDx(a.Pt,
        c.Pt)), c = b.Prev; d.IntPoint.op_Equality(c.Pt, b.Pt) && c != b;) c =
      c.Prev;
    for (var g = Math.abs(this.GetDx(b.Pt, c.Pt)), c = b.Next; d.IntPoint.op_Equality(
        c.Pt, b.Pt) && c != b;) c = c.Next;
    c = Math.abs(this.GetDx(b.Pt, c.Pt));
    return e >= g && e >= c || f >= g && f >= c
  };
  d.Clipper.prototype.GetBottomPt = function(a) {
    for (var b = null, c = a.Next; c != a;) c.Pt.Y > a.Pt.Y ? (a = c, b =
      null) : c.Pt.Y == a.Pt.Y && c.Pt.X <= a.Pt.X && (c.Pt.X < a.Pt.X ?
      (b = null, a = c) : c.Next != a && c.Prev != a && (b = c)), c = c.Next;
    if (null !== b)
      for (; b != c;)
        for (this.FirstIsBottomPt(c, b) || (a = b), b = b.Next; d.IntPoint.op_Inequality(
            b.Pt,
            a.Pt);) b = b.Next;
    return a
  };
  d.Clipper.prototype.GetLowermostRec = function(a, b) {
    null === a.BottomPt && (a.BottomPt = this.GetBottomPt(a.Pts));
    null === b.BottomPt && (b.BottomPt = this.GetBottomPt(b.Pts));
    var c = a.BottomPt,
      e = b.BottomPt;
    return c.Pt.Y > e.Pt.Y ? a : c.Pt.Y < e.Pt.Y ? b : c.Pt.X < e.Pt.X ? a :
      c.Pt.X > e.Pt.X ? b : c.Next == c ? b : e.Next == e ? a : this.FirstIsBottomPt(
        c, e) ? a : b
  };
  d.Clipper.prototype.Param1RightOfParam2 = function(a, b) {
    do
      if (a = a.FirstLeft, a == b) return !0;
    while (null !== a);
    return !1
  };
  d.Clipper.prototype.GetOutRec = function(a) {
    for (a =
      this.m_PolyOuts[a]; a != this.m_PolyOuts[a.Idx];) a = this.m_PolyOuts[
      a.Idx];
    return a
  };
  d.Clipper.prototype.AppendPolygon = function(a, b) {
    var c = this.m_PolyOuts[a.OutIdx],
      e = this.m_PolyOuts[b.OutIdx],
      f;
    f = this.Param1RightOfParam2(c, e) ? e : this.Param1RightOfParam2(e, c) ?
      c : this.GetLowermostRec(c, e);
    var g = c.Pts,
      h = g.Prev,
      l = e.Pts,
      k = l.Prev;
    a.Side == d.EdgeSide.esLeft ? (b.Side == d.EdgeSide.esLeft ? (this.ReversePolyPtLinks(
          l), l.Next = g, g.Prev = l, h.Next = k, k.Prev = h, c.Pts = k) :
        (k.Next = g, g.Prev = k, l.Prev = h, h.Next = l, c.Pts = l), g = d.EdgeSide
        .esLeft) :
      (b.Side == d.EdgeSide.esRight ? (this.ReversePolyPtLinks(l), h.Next =
        k, k.Prev = h, l.Next = g, g.Prev = l) : (h.Next = l, l.Prev = h,
        g.Prev = k, k.Next = g), g = d.EdgeSide.esRight);
    c.BottomPt = null;
    f == e && (e.FirstLeft != c && (c.FirstLeft = e.FirstLeft), c.IsHole =
      e.IsHole);
    e.Pts = null;
    e.BottomPt = null;
    e.FirstLeft = c;
    f = a.OutIdx;
    h = b.OutIdx;
    a.OutIdx = -1;
    b.OutIdx = -1;
    for (l = this.m_ActiveEdges; null !== l;) {
      if (l.OutIdx == h) {
        l.OutIdx = f;
        l.Side = g;
        break
      }
      l = l.NextInAEL
    }
    e.Idx = c.Idx
  };
  d.Clipper.prototype.ReversePolyPtLinks = function(a) {
    if (null !== a) {
      var b, c;
      b = a;
      do c = b.Next, b.Next = b.Prev, b = b.Prev = c; while (b != a)
    }
  };
  d.Clipper.SwapSides = function(a, b) {
    var c = a.Side;
    a.Side = b.Side;
    b.Side = c
  };
  d.Clipper.SwapPolyIndexes = function(a, b) {
    var c = a.OutIdx;
    a.OutIdx = b.OutIdx;
    b.OutIdx = c
  };
  d.Clipper.prototype.IntersectEdges = function(a, b, c, e) {
    var f = !e && null === a.NextInLML && a.Top.X == c.X && a.Top.Y == c.Y;
    e = !e && null === b.NextInLML && b.Top.X == c.X && b.Top.Y == c.Y;
    var g = 0 <= a.OutIdx,
      h = 0 <= b.OutIdx;
    if (0 === a.WindDelta || 0 === b.WindDelta) 0 === a.WindDelta && 0 ===
      b.WindDelta ? (f || e) && g && h && this.AddLocalMaxPoly(a,
        b, c) : a.PolyTyp == b.PolyTyp && a.WindDelta != b.WindDelta &&
      this.m_ClipType == d.ClipType.ctUnion ? 0 === a.WindDelta ? h && (
        this.AddOutPt(a, c), g && (a.OutIdx = -1)) : g && (this.AddOutPt(b,
        c), h && (b.OutIdx = -1)) : a.PolyTyp != b.PolyTyp && (0 !== a.WindDelta ||
        1 != Math.abs(b.WindCnt) || this.m_ClipType == d.ClipType.ctUnion &&
        0 !== b.WindCnt2 ? 0 !== b.WindDelta || 1 != Math.abs(a.WindCnt) ||
        this.m_ClipType == d.ClipType.ctUnion && 0 !== a.WindCnt2 || (this.AddOutPt(
          b, c), h && (b.OutIdx = -1)) : (this.AddOutPt(a, c), g && (a.OutIdx = -
          1))), f && (0 > a.OutIdx ? this.DeleteFromAEL(a) :
        d.Error("Error intersecting polylines")), e && (0 > b.OutIdx ? this
        .DeleteFromAEL(b) : d.Error("Error intersecting polylines"));
    else {
      if (a.PolyTyp == b.PolyTyp)
        if (this.IsEvenOddFillType(a)) {
          var l = a.WindCnt;
          a.WindCnt = b.WindCnt;
          b.WindCnt = l
        } else a.WindCnt = 0 === a.WindCnt + b.WindDelta ? -a.WindCnt : a.WindCnt +
          b.WindDelta, b.WindCnt = 0 === b.WindCnt - a.WindDelta ? -b.WindCnt :
          b.WindCnt - a.WindDelta;
      else this.IsEvenOddFillType(b) ? a.WindCnt2 = 0 === a.WindCnt2 ? 1 :
        0 : a.WindCnt2 += b.WindDelta, this.IsEvenOddFillType(a) ? b.WindCnt2 =
        0 === b.WindCnt2 ?
        1 : 0 : b.WindCnt2 -= a.WindDelta;
      var k, m, n;
      a.PolyTyp == d.PolyType.ptSubject ? (k = this.m_SubjFillType, n =
        this.m_ClipFillType) : (k = this.m_ClipFillType, n = this.m_SubjFillType);
      b.PolyTyp == d.PolyType.ptSubject ? (m = this.m_SubjFillType, l =
        this.m_ClipFillType) : (m = this.m_ClipFillType, l = this.m_SubjFillType);
      switch (k) {
        case d.PolyFillType.pftPositive:
          k = a.WindCnt;
          break;
        case d.PolyFillType.pftNegative:
          k = -a.WindCnt;
          break;
        default:
          k = Math.abs(a.WindCnt)
      }
      switch (m) {
        case d.PolyFillType.pftPositive:
          m = b.WindCnt;
          break;
        case d.PolyFillType.pftNegative:
          m = -b.WindCnt;
          break;
        default:
          m = Math.abs(b.WindCnt)
      }
      if (g && h) f || e || 0 !== k && 1 != k || 0 !== m && 1 != m || a.PolyTyp !=
        b.PolyTyp && this.m_ClipType != d.ClipType.ctXor ? this.AddLocalMaxPoly(
          a, b, c) : (this.AddOutPt(a, c), this.AddOutPt(b, c), d.Clipper.SwapSides(
          a, b), d.Clipper.SwapPolyIndexes(a, b));
      else if (g) {
        if (0 === m || 1 == m) this.AddOutPt(a, c), d.Clipper.SwapSides(a,
          b), d.Clipper.SwapPolyIndexes(a, b)
      } else if (h) {
        if (0 === k || 1 == k) this.AddOutPt(b, c), d.Clipper.SwapSides(a,
          b), d.Clipper.SwapPolyIndexes(a, b)
      } else if (!(0 !== k && 1 != k || 0 !== m && 1 !=
          m || f || e)) {
        switch (n) {
          case d.PolyFillType.pftPositive:
            g = a.WindCnt2;
            break;
          case d.PolyFillType.pftNegative:
            g = -a.WindCnt2;
            break;
          default:
            g = Math.abs(a.WindCnt2)
        }
        switch (l) {
          case d.PolyFillType.pftPositive:
            h = b.WindCnt2;
            break;
          case d.PolyFillType.pftNegative:
            h = -b.WindCnt2;
            break;
          default:
            h = Math.abs(b.WindCnt2)
        }
        if (a.PolyTyp != b.PolyTyp) this.AddLocalMinPoly(a, b, c);
        else if (1 == k && 1 == m) switch (this.m_ClipType) {
          case d.ClipType.ctIntersection:
            0 < g && 0 < h && this.AddLocalMinPoly(a, b, c);
            break;
          case d.ClipType.ctUnion:
            0 >= g && 0 >=
              h && this.AddLocalMinPoly(a, b, c);
            break;
          case d.ClipType.ctDifference:
            (a.PolyTyp == d.PolyType.ptClip && 0 < g && 0 < h || a.PolyTyp ==
              d.PolyType.ptSubject && 0 >= g && 0 >= h) && this.AddLocalMinPoly(
              a, b, c);
            break;
          case d.ClipType.ctXor:
            this.AddLocalMinPoly(a, b, c)
        } else d.Clipper.SwapSides(a, b)
      }
      f != e && (f && 0 <= a.OutIdx || e && 0 <= b.OutIdx) && (d.Clipper.SwapSides(
        a, b), d.Clipper.SwapPolyIndexes(a, b));
      f && this.DeleteFromAEL(a);
      e && this.DeleteFromAEL(b)
    }
  };
  d.Clipper.prototype.DeleteFromAEL = function(a) {
    var b = a.PrevInAEL,
      c = a.NextInAEL;
    if (null !==
      b || null !== c || a == this.m_ActiveEdges) null !== b ? b.NextInAEL =
      c : this.m_ActiveEdges = c, null !== c && (c.PrevInAEL = b), a.NextInAEL =
      null, a.PrevInAEL = null
  };
  d.Clipper.prototype.DeleteFromSEL = function(a) {
    var b = a.PrevInSEL,
      c = a.NextInSEL;
    if (null !== b || null !== c || a == this.m_SortedEdges) null !== b ? b
      .NextInSEL = c : this.m_SortedEdges = c, null !== c && (c.PrevInSEL =
        b), a.NextInSEL = null, a.PrevInSEL = null
  };
  d.Clipper.prototype.UpdateEdgeIntoAEL = function(a) {
    null === a.Value.NextInLML && d.Error("UpdateEdgeIntoAEL: invalid call");
    var b = a.Value.PrevInAEL,
      c = a.Value.NextInAEL;
    a.Value.NextInLML.OutIdx = a.Value.OutIdx;
    null !== b ? b.NextInAEL = a.Value.NextInLML : this.m_ActiveEdges = a.Value
      .NextInLML;
    null !== c && (c.PrevInAEL = a.Value.NextInLML);
    a.Value.NextInLML.Side = a.Value.Side;
    a.Value.NextInLML.WindDelta = a.Value.WindDelta;
    a.Value.NextInLML.WindCnt = a.Value.WindCnt;
    a.Value.NextInLML.WindCnt2 = a.Value.WindCnt2;
    a.Value = a.Value.NextInLML;
    a.Value.Curr.X = a.Value.Bot.X;
    a.Value.Curr.Y = a.Value.Bot.Y;
    a.Value.PrevInAEL = b;
    a.Value.NextInAEL = c;
    d.ClipperBase.IsHorizontal(a.Value) ||
      this.InsertScanbeam(a.Value.Top.Y)
  };
  d.Clipper.prototype.ProcessHorizontals = function(a) {
    for (var b = this.m_SortedEdges; null !== b;) this.DeleteFromSEL(b),
      this.ProcessHorizontal(b, a), b = this.m_SortedEdges
  };
  d.Clipper.prototype.GetHorzDirection = function(a, b, c, e) {
    a.Bot.X < a.Top.X ? (c.Value = a.Bot.X, e.Value = a.Top.X, b.Value = d.Direction
      .dLeftToRight) : (c.Value = a.Top.X, e.Value = a.Bot.X, b.Value = d
      .Direction.dRightToLeft)
  };
  d.Clipper.prototype.PrepareHorzJoins = function(a, b) {
    var c = this.m_PolyOuts[a.OutIdx].Pts;
    a.Side != d.EdgeSide.esLeft &&
      (c = c.Prev);
    b && (d.IntPoint.op_Equality(c.Pt, a.Top) ? this.AddGhostJoin(c, a.Bot) :
      this.AddGhostJoin(c, a.Top))
  };
  d.Clipper.prototype.ProcessHorizontal = function(a, b) {
    var c, e, f;
    (function() {
      c = {
        Value: c
      };
      e = {
        Value: e
      };
      f = {
        Value: f
      };
      var b = this.GetHorzDirection(a, c, e, f);
      c = c.Value;
      e = e.Value;
      f = f.Value;
      return b
    }).call(this);
    for (var g = a, h = null; null !== g.NextInLML && d.ClipperBase.IsHorizontal(
        g.NextInLML);) g = g.NextInLML;
    for (null === g.NextInLML && (h = this.GetMaximaPair(g));;) {
      for (var l = a == g, k = this.GetNextInAEL(a, c); null !== k &&
        !(k.Curr.X == a.Top.X && null !== a.NextInLML && k.Dx < a.NextInLML
          .Dx);) {
        var m = this.GetNextInAEL(k, c);
        if (c == d.Direction.dLeftToRight && k.Curr.X <= f || c == d.Direction
          .dRightToLeft && k.Curr.X >= e) {
          0 <= a.OutIdx && 0 != a.WindDelta && this.PrepareHorzJoins(a, b);
          if (k == h && l) {
            c == d.Direction.dLeftToRight ? this.IntersectEdges(a, k, k.Top, !
              1) : this.IntersectEdges(k, a, k.Top, !1);
            0 <= h.OutIdx && d.Error("ProcessHorizontal error");
            return
          }
          if (c == d.Direction.dLeftToRight) {
            var n = new d.IntPoint(k.Curr.X, a.Curr.Y);
            this.IntersectEdges(a, k, n, !0)
          } else n =
            new d.IntPoint(k.Curr.X, a.Curr.Y), this.IntersectEdges(k, a, n, !
              0);
          this.SwapPositionsInAEL(a, k)
        } else if (c == d.Direction.dLeftToRight && k.Curr.X >= f || c == d
          .Direction.dRightToLeft && k.Curr.X <= e) break;
        k = m
      }
      0 <= a.OutIdx && 0 !== a.WindDelta && this.PrepareHorzJoins(a, b);
      if (null !== a.NextInLML && d.ClipperBase.IsHorizontal(a.NextInLML))(
          function() {
            a = {
              Value: a
            };
            var b = this.UpdateEdgeIntoAEL(a);
            a = a.Value;
            return b
          }).call(this), 0 <= a.OutIdx && this.AddOutPt(a, a.Bot),
        function() {
          c = {
            Value: c
          };
          e = {
            Value: e
          };
          f = {
            Value: f
          };
          var b = this.GetHorzDirection(a,
            c, e, f);
          c = c.Value;
          e = e.Value;
          f = f.Value;
          return b
        }.call(this);
      else break
    }
    null !== a.NextInLML ? 0 <= a.OutIdx ? (g = this.AddOutPt(a, a.Top),
      function() {
        a = {
          Value: a
        };
        var b = this.UpdateEdgeIntoAEL(a);
        a = a.Value;
        return b
      }.call(this), 0 !== a.WindDelta && (h = a.PrevInAEL, m = a.NextInAEL,
        null !== h && h.Curr.X == a.Bot.X && h.Curr.Y == a.Bot.Y && 0 !==
        h.WindDelta && 0 <= h.OutIdx && h.Curr.Y > h.Top.Y && d.ClipperBase
        .SlopesEqual(a, h, this.m_UseFullRange) ? (m = this.AddOutPt(h, a
          .Bot), this.AddJoin(g, m, a.Top)) : null !== m && m.Curr.X == a
        .Bot.X && m.Curr.Y == a.Bot.Y &&
        0 !== m.WindDelta && 0 <= m.OutIdx && m.Curr.Y > m.Top.Y && d.ClipperBase
        .SlopesEqual(a, m, this.m_UseFullRange) && (m = this.AddOutPt(m,
          a.Bot), this.AddJoin(g, m, a.Top)))) : function() {
      a = {
        Value: a
      };
      var b = this.UpdateEdgeIntoAEL(a);
      a = a.Value;
      return b
    }.call(this) : null !== h ? 0 <= h.OutIdx ? (c == d.Direction.dLeftToRight ?
      this.IntersectEdges(a, h, a.Top, !1) : this.IntersectEdges(h, a, a.Top, !
        1), 0 <= h.OutIdx && d.Error("ProcessHorizontal error")) : (this.DeleteFromAEL(
      a), this.DeleteFromAEL(h)) : (0 <= a.OutIdx && this.AddOutPt(a, a.Top),
      this.DeleteFromAEL(a))
  };
  d.Clipper.prototype.GetNextInAEL = function(a, b) {
    return b == d.Direction.dLeftToRight ? a.NextInAEL : a.PrevInAEL
  };
  d.Clipper.prototype.IsMinima = function(a) {
    return null !== a && a.Prev.NextInLML != a && a.Next.NextInLML != a
  };
  d.Clipper.prototype.IsMaxima = function(a, b) {
    return null !== a && a.Top.Y == b && null === a.NextInLML
  };
  d.Clipper.prototype.IsIntermediate = function(a, b) {
    return a.Top.Y == b && null !== a.NextInLML
  };
  d.Clipper.prototype.GetMaximaPair = function(a) {
    var b = null;
    d.IntPoint.op_Equality(a.Next.Top, a.Top) && null === a.Next.NextInLML ?
      b = a.Next : d.IntPoint.op_Equality(a.Prev.Top, a.Top) && null === a.Prev
      .NextInLML && (b = a.Prev);
    return null === b || -2 != b.OutIdx && (b.NextInAEL != b.PrevInAEL || d
      .ClipperBase.IsHorizontal(b)) ? b : null
  };
  d.Clipper.prototype.ProcessIntersections = function(a, b) {
    if (null == this.m_ActiveEdges) return !0;
    try {
      this.BuildIntersectList(a, b);
      if (0 == this.m_IntersectList.length) return !0;
      if (1 == this.m_IntersectList.length || this.FixupIntersectionOrder())
        this.ProcessIntersectList();
      else return !1
    } catch (c) {
      this.m_SortedEdges = null, this.m_IntersectList.length =
        0, d.Error("ProcessIntersections error")
    }
    this.m_SortedEdges = null;
    return !0
  };
  d.Clipper.prototype.BuildIntersectList = function(a, b) {
    if (null !== this.m_ActiveEdges) {
      var c = this.m_ActiveEdges;
      for (this.m_SortedEdges = c; null !== c;) c.PrevInSEL = c.PrevInAEL,
        c.NextInSEL = c.NextInAEL, c.Curr.X = d.Clipper.TopX(c, b), c = c.NextInAEL;
      for (var e = !0; e && null !== this.m_SortedEdges;) {
        e = !1;
        for (c = this.m_SortedEdges; null !== c.NextInSEL;) {
          var f = c.NextInSEL,
            g = new d.IntPoint;
          c.Curr.X > f.Curr.X ? (g = {
              Value: g
            }, e = this.IntersectPoint(c, f, g), g = g.Value, !e && c.Curr
            .X > f.Curr.X + 1, g.Y > a && (g.Y = a, Math.abs(c.Dx) >
              Math.abs(f.Dx) ? g.X = d.Clipper.TopX(f, a) : g.X = d.Clipper
              .TopX(c, a)), e = new d.IntersectNode, e.Edge1 = c, e.Edge2 =
            f, e.Pt.X = g.X, e.Pt.Y = g.Y, this.m_IntersectList.push(e),
            this.SwapPositionsInSEL(c, f), e = !0) : c = f
        }
        if (null !== c.PrevInSEL) c.PrevInSEL.NextInSEL = null;
        else break
      }
      this.m_SortedEdges = null
    }
  };
  d.Clipper.prototype.EdgesAdjacent = function(a) {
    return a.Edge1.NextInSEL == a.Edge2 || a.Edge1.PrevInSEL == a.Edge2
  };
  d.Clipper.IntersectNodeSort =
    function(a, b) {
      return b.Pt.Y - a.Pt.Y
    };
  d.Clipper.prototype.FixupIntersectionOrder = function() {
    this.m_IntersectList.sort(this.m_IntersectNodeComparer);
    this.CopyAELToSEL();
    for (var a = this.m_IntersectList.length, b = 0; b < a; b++) {
      if (!this.EdgesAdjacent(this.m_IntersectList[b])) {
        for (var c = b + 1; c < a && !this.EdgesAdjacent(this.m_IntersectList[
            c]);)
          c++;
        if (c == a) return !1;
        var e = this.m_IntersectList[b];
        this.m_IntersectList[b] = this.m_IntersectList[c];
        this.m_IntersectList[c] = e
      }
      this.SwapPositionsInSEL(this.m_IntersectList[b].Edge1,
        this.m_IntersectList[b].Edge2)
    }
    return !0
  };
  d.Clipper.prototype.ProcessIntersectList = function() {
    for (var a = 0, b = this.m_IntersectList.length; a < b; a++) {
      var c = this.m_IntersectList[a];
      this.IntersectEdges(c.Edge1, c.Edge2, c.Pt, !0);
      this.SwapPositionsInAEL(c.Edge1, c.Edge2)
    }
    this.m_IntersectList.length = 0
  };
  F = function(a) {
    return 0 > a ? Math.ceil(a - 0.5) : Math.round(a)
  };
  G = function(a) {
    return 0 > a ? Math.ceil(a - 0.5) : Math.floor(a + 0.5)
  };
  H = function(a) {
    return 0 > a ? -Math.round(Math.abs(a)) : Math.round(a)
  };
  I = function(a) {
    if (0 > a) return a -=
      0.5, -2147483648 > a ? Math.ceil(a) : a | 0;
    a += 0.5;
    return 2147483647 < a ? Math.floor(a) : a | 0
  };
  d.Clipper.Round = q ? F : E ? H : K ? I : G;
  d.Clipper.TopX = function(a,
    b) {
    return b == a.Top.Y ? a.Top.X : a.Bot.X + d.Clipper.Round(a.Dx * (b - a
      .Bot
      .Y))
  };
  d.Clipper.prototype.IntersectPoint = function(a, b, c) {
    c.Value = new d.IntPoint;
    var e, f;
    if (d.ClipperBase.SlopesEqual(a, b, this.m_UseFullRange) || a.Dx == b.Dx)
      return b.Bot.Y > a.Bot.Y ? (c.Value.X = b.Bot.X, c.Value.Y = b.Bot.Y) :
        (
          c.Value.X = a.Bot.X, c.Value.Y = a.Bot.Y), !1;
    if (0 === a.Delta.X) c.Value.X = a.Bot.X, d.ClipperBase.IsHorizontal(b) ?
      c.Value.Y = b.Bot.Y : (f = b.Bot.Y - b.Bot.X / b.Dx, c.Value.Y = d.Clipper
        .Round(c.Value.X / b.Dx + f));
    else if (0 === b.Delta.X) c.Value.X = b.Bot.X, d.ClipperBase.IsHorizontal(
        a) ?
      c.Value.Y = a.Bot.Y : (e = a.Bot.Y - a.Bot.X / a.Dx, c.Value.Y = d.Clipper
        .Round(c.Value.X / a.Dx + e));
    else {
      e = a.Bot.X - a.Bot.Y * a.Dx;
      f = b.Bot.X - b.Bot.Y * b.Dx;
      var g = (f - e) / (a.Dx - b.Dx);
      c.Value.Y = d.Clipper.Round(g);
      Math.abs(a.Dx) < Math.abs(b.Dx) ? c.Value.X = d.Clipper.Round(a.Dx *
        g +
        e) : c.Value.X = d.Clipper.Round(b.Dx * g + f)
    }
    if (c.Value.Y < a.Top.Y || c.Value.Y < b.Top.Y) {
      if (a.Top.Y >
        b.Top.Y) return c.Value.Y = a.Top.Y, c.Value.X = d.Clipper.TopX(b,
        a.Top
        .Y), c.Value.X < a.Top.X;
      c.Value.Y = b.Top.Y;
      Math.abs(a.Dx) < Math.abs(b.Dx) ? c.Value.X = d.Clipper.TopX(a, c.Value
          .Y) :
        c.Value.X = d.Clipper.TopX(b, c.Value.Y)
    }
    return !0
  };
  d.Clipper.prototype.ProcessEdgesAtTopOfScanbeam = function(a) {
    for (var b = this.m_ActiveEdges; null !== b;) {
      var c = this.IsMaxima(b, a);
      c && (c = this.GetMaximaPair(b), c = null === c || !d.ClipperBase.IsHorizontal(
        c));
      if (c) {
        var e = b.PrevInAEL;
        this.DoMaxima(b);
        b = null === e ? this.m_ActiveEdges : e.NextInAEL
      } else this.IsIntermediate(b,
          a) && d.ClipperBase.IsHorizontal(b.NextInLML) ? (function() {
          b = {
            Value: b
          };
          var a = this.UpdateEdgeIntoAEL(b);
          b = b.Value;
          return a
        }.call(this), 0 <= b.OutIdx && this.AddOutPt(b, b.Bot), this.AddEdgeToSEL(
          b)) : (b.Curr.X = d.Clipper.TopX(b, a), b.Curr.Y = a), this.StrictlySimple &&
        (e = b.PrevInAEL, 0 <= b.OutIdx && 0 !== b.WindDelta && null !== e &&
          0 <=
          e.OutIdx && e.Curr.X == b.Curr.X && 0 !== e.WindDelta && (c =
            this.AddOutPt(
              e, b.Curr), e = this.AddOutPt(b, b.Curr), this.AddJoin(c, e,
              b.Curr))
        ), b = b.NextInAEL
    }
    this.ProcessHorizontals(!0);
    for (b = this.m_ActiveEdges; null !==
      b;) {
      if (this.IsIntermediate(b, a)) {
        c = null;
        0 <= b.OutIdx && (c = this.AddOutPt(b, b.Top));
        (function() {
          b = {
            Value: b
          };
          var a = this.UpdateEdgeIntoAEL(b);
          b = b.Value;
          return a
        }).call(this);
        var e = b.PrevInAEL,
          f = b.NextInAEL;
        null !== e && e.Curr.X == b.Bot.X && e.Curr.Y == b.Bot.Y && null !==
          c &&
          0 <= e.OutIdx && e.Curr.Y > e.Top.Y && d.ClipperBase.SlopesEqual(
            b, e,
            this.m_UseFullRange) && 0 !== b.WindDelta && 0 !== e.WindDelta ?
          (e =
            this.AddOutPt(e, b.Bot), this.AddJoin(c, e, b.Top)) : null !==
          f &&
          f.Curr.X == b.Bot.X && f.Curr.Y == b.Bot.Y && null !== c && 0 <=
          f.OutIdx &&
          f.Curr.Y >
          f.Top.Y && d.ClipperBase.SlopesEqual(b, f, this.m_UseFullRange) &&
          0 !==
          b.WindDelta && 0 !== f.WindDelta && (e = this.AddOutPt(f, b.Bot),
            this.AddJoin(c, e, b.Top))
      }
      b = b.NextInAEL
    }
  };
  d.Clipper.prototype.DoMaxima = function(a) {
    var b = this.GetMaximaPair(a);
    if (null === b) 0 <= a.OutIdx && this.AddOutPt(a, a.Top), this.DeleteFromAEL(
      a);
    else {
      for (var c = a.NextInAEL; null !== c && c != b;) this.IntersectEdges(
        a, c,
        a.Top, !0), this.SwapPositionsInAEL(a, c), c = a.NextInAEL; - 1 ==
        a.OutIdx &&
        -1 == b.OutIdx ? (this.DeleteFromAEL(a), this.DeleteFromAEL(b)) : 0 <=
        a.OutIdx &&
        0 <= b.OutIdx ? this.IntersectEdges(a, b, a.Top, !1) : 0 === a.WindDelta ?
        (0 <= a.OutIdx && (this.AddOutPt(a, a.Top), a.OutIdx = -1), this.DeleteFromAEL(
            a), 0 <= b.OutIdx && (this.AddOutPt(b, a.Top), b.OutIdx = -1),
          this
          .DeleteFromAEL(b)) : d.Error("DoMaxima error")
    }
  };
  d.Clipper.ReversePaths = function(a) {
    for (var b = 0, c = a.length; b < c; b++) a[b].reverse()
  };
  d.Clipper.Orientation = function(a) {
    return 0 <= d.Clipper.Area(a)
  };
  d.Clipper.prototype.PointCount = function(a) {
    if (null === a) return 0;
    var b = 0,
      c = a;
    do b++, c = c.Next; while (c != a);
    return b
  };
  d.Clipper.prototype.BuildResult =
    function(a) {
      d.Clear(a);
      for (var b = 0, c = this.m_PolyOuts.length; b < c; b++) {
        var e = this.m_PolyOuts[b];
        if (null !== e.Pts) {
          var e = e.Pts.Prev,
            f = this.PointCount(e);
          if (!(2 > f)) {
            for (var g = Array(f), h = 0; h < f; h++) g[h] = e.Pt, e = e.Prev;
            a.push(g)
          }
        }
      }
    };
  d.Clipper.prototype.BuildResult2 = function(a) {
    a.Clear();
    for (var b = 0, c = this.m_PolyOuts.length; b < c; b++) {
      var e = this.m_PolyOuts[b],
        f = this.PointCount(e.Pts);
      if (!(e.IsOpen && 2 > f || !e.IsOpen && 3 > f)) {
        this.FixHoleLinkage(e);
        var g = new d.PolyNode;
        a.m_AllPolys.push(g);
        e.PolyNode = g;
        g.m_polygon.length =
          f;
        for (var e = e.Pts.Prev, h = 0; h < f; h++) g.m_polygon[h] = e.Pt,
          e =
          e.Prev
      }
    }
    b = 0;
    for (c = this.m_PolyOuts.length; b < c; b++) e = this.m_PolyOuts[b],
      null !==
      e.PolyNode && (e.IsOpen ? (e.PolyNode.IsOpen = !0, a.AddChild(e.PolyNode)) :
        null !== e.FirstLeft && null != e.FirstLeft.PolyNode ? e.FirstLeft.PolyNode
        .AddChild(e.PolyNode) : a.AddChild(e.PolyNode))
  };
  d.Clipper.prototype.FixupOutPolygon = function(a) {
    var b = null;
    a.BottomPt = null;
    for (var c = a.Pts;;) {
      if (c.Prev == c || c.Prev == c.Next) {
        this.DisposeOutPts(c);
        a.Pts = null;
        return
      }
      if (d.IntPoint.op_Equality(c.Pt,
          c.Next.Pt) || d.IntPoint.op_Equality(c.Pt, c.Prev.Pt) || d.ClipperBase
        .SlopesEqual(c.Prev.Pt, c.Pt, c.Next.Pt, this.m_UseFullRange) && (!
          this
          .PreserveCollinear || !this.Pt2IsBetweenPt1AndPt3(c.Prev.Pt, c.Pt,
            c.Next
            .Pt))) b = null, c.Prev.Next = c.Next, c = c.Next.Prev = c.Prev;
      else if (c == b) break;
      else null === b && (b = c), c = c.Next
    }
    a.Pts = c
  };
  d.Clipper.prototype.DupOutPt = function(a, b) {
    var c = new d.OutPt;
    c.Pt.X = a.Pt.X;
    c.Pt.Y = a.Pt.Y;
    c.Idx = a.Idx;
    b ? (c.Next = a.Next, c.Prev = a, a.Next.Prev = c, a.Next = c) : (c.Prev =
      a.Prev, c.Next = a, a.Prev.Next = c, a.Prev =
      c);
    return c
  };
  d.Clipper.prototype.GetOverlap = function(a, b, c, e, d, g) {
    a < b ? c < e ? (d.Value = Math.max(a, c), g.Value = Math.min(b, e)) :
      (d.Value =
        Math.max(a, e), g.Value = Math.min(b, c)) : c < e ? (d.Value = Math
        .max(
          b, c), g.Value = Math.min(a, e)) : (d.Value = Math.max(b, e), g.Value =
        Math.min(a, c));
    return d.Value < g.Value
  };
  d.Clipper.prototype.JoinHorz = function(a, b, c, e, f, g) {
    var h = a.Pt.X > b.Pt.X ? d.Direction.dRightToLeft : d.Direction.dLeftToRight;
    e = c.Pt.X > e.Pt.X ? d.Direction.dRightToLeft : d.Direction.dLeftToRight;
    if (h == e) return !1;
    if (h == d.Direction.dLeftToRight) {
      for (; a.Next.Pt.X <=
        f.X && a.Next.Pt.X >= a.Pt.X && a.Next.Pt.Y == f.Y;) a = a.Next;
      g && a.Pt.X != f.X && (a = a.Next);
      b = this.DupOutPt(a, !g);
      d.IntPoint.op_Inequality(b.Pt, f) && (a = b, a.Pt.X = f.X, a.Pt.Y = f
        .Y,
        b = this.DupOutPt(a, !g))
    } else {
      for (; a.Next.Pt.X >= f.X && a.Next.Pt.X <= a.Pt.X && a.Next.Pt.Y ==
        f.Y;)
        a = a.Next;
      g || a.Pt.X == f.X || (a = a.Next);
      b = this.DupOutPt(a, g);
      d.IntPoint.op_Inequality(b.Pt, f) && (a = b, a.Pt.X = f.X, a.Pt.Y = f
        .Y,
        b = this.DupOutPt(a, g))
    }
    if (e == d.Direction.dLeftToRight) {
      for (; c.Next.Pt.X <= f.X && c.Next.Pt.X >= c.Pt.X && c.Next.Pt.Y ==
        f.Y;)
        c = c.Next;
      g && c.Pt.X !=
        f.X && (c = c.Next);
      e = this.DupOutPt(c, !g);
      d.IntPoint.op_Inequality(e.Pt, f) && (c = e, c.Pt.X = f.X, c.Pt.Y = f
        .Y,
        e = this.DupOutPt(c, !g))
    } else {
      for (; c.Next.Pt.X >= f.X && c.Next.Pt.X <= c.Pt.X && c.Next.Pt.Y ==
        f.Y;)
        c = c.Next;
      g || c.Pt.X == f.X || (c = c.Next);
      e = this.DupOutPt(c, g);
      d.IntPoint.op_Inequality(e.Pt, f) && (c = e, c.Pt.X = f.X, c.Pt.Y = f
        .Y,
        e = this.DupOutPt(c, g))
    }
    h == d.Direction.dLeftToRight == g ? (a.Prev = c, c.Next = a, b.Next =
      e, e
      .Prev = b) : (a.Next = c, c.Prev = a, b.Prev = e, e.Next = b);
    return !0
  };
  d.Clipper.prototype.JoinPoints = function(a, b, c) {
    var e = a.OutPt1,
      f = new d.OutPt,
      g = a.OutPt2,
      h = new d.OutPt;
    if ((h = a.OutPt1.Pt.Y == a.OffPt.Y) && d.IntPoint.op_Equality(a.OffPt,
        a.OutPt1
        .Pt) && d.IntPoint.op_Equality(a.OffPt, a.OutPt2.Pt)) {
      for (f = a.OutPt1.Next; f != e && d.IntPoint.op_Equality(f.Pt, a.OffPt);)
        f = f.Next;
      f = f.Pt.Y > a.OffPt.Y;
      for (h = a.OutPt2.Next; h != g && d.IntPoint.op_Equality(h.Pt, a.OffPt);)
        h = h.Next;
      if (f == h.Pt.Y > a.OffPt.Y) return !1;
      f ? (f = this.DupOutPt(e, !1), h = this.DupOutPt(g, !0), e.Prev = g,
        g.Next =
        e, f.Next = h, h.Prev = f) : (f = this.DupOutPt(e, !0), h = this.DupOutPt(
          g, !1), e.Next = g, g.Prev =
        e, f.Prev = h, h.Next = f);
      a.OutPt1 = e;
      a.OutPt2 = f;
      return !0
    }
    if (h) {
      for (f = e; e.Prev.Pt.Y == e.Pt.Y && e.Prev != f && e.Prev != g;) e =
        e.Prev;
      for (; f.Next.Pt.Y == f.Pt.Y && f.Next != e && f.Next != g;) f = f.Next;
      if (f.Next == e || f.Next == g) return !1;
      for (h = g; g.Prev.Pt.Y == g.Pt.Y && g.Prev != h && g.Prev != f;) g =
        g.Prev;
      for (; h.Next.Pt.Y == h.Pt.Y && h.Next != g && h.Next != e;) h = h.Next;
      if (h.Next == g || h.Next == e) return !1;
      var l, k;
      l = {
        Value: l
      };
      k = {
        Value: k
      };
      b = this.GetOverlap(e.Pt.X, f.Pt.X, g.Pt.X, h.Pt.X, l, k);
      l = l.Value;
      k = k.Value;
      if (!b) return !1;
      b = new d.IntPoint;
      e.Pt.X >=
        l && e.Pt.X <= k ? (b.X = e.Pt.X, b.Y = e.Pt.Y, c = e.Pt.X > f.Pt.X) :
        g.Pt.X >= l && g.Pt.X <= k ? (b.X = g.Pt.X, b.Y = g.Pt.Y, c = g.Pt.X >
          h.Pt.X) : f.Pt.X >= l && f.Pt.X <= k ? (b.X = f.Pt.X, b.Y = f.Pt.Y,
          c =
          f.Pt.X > e.Pt.X) : (b.X = h.Pt.X, b.Y = h.Pt.Y, c = h.Pt.X > g.Pt
          .X);
      a.OutPt1 = e;
      a.OutPt2 = g;
      return this.JoinHorz(e, f, g, h, b, c)
    }
    for (f = e.Next; d.IntPoint.op_Equality(f.Pt, e.Pt) && f != e;) f = f.Next;
    if (l = f.Pt.Y > e.Pt.Y || !d.ClipperBase.SlopesEqual(e.Pt, f.Pt, a.OffPt,
        this.m_UseFullRange)) {
      for (f = e.Prev; d.IntPoint.op_Equality(f.Pt, e.Pt) && f != e;) f = f
        .Prev;
      if (f.Pt.Y > e.Pt.Y ||
        !d.ClipperBase.SlopesEqual(e.Pt, f.Pt, a.OffPt, this.m_UseFullRange)
      )
        return !1
    }
    for (h = g.Next; d.IntPoint.op_Equality(h.Pt, g.Pt) && h != g;) h = h.Next;
    if (k = h.Pt.Y > g.Pt.Y || !d.ClipperBase.SlopesEqual(g.Pt, h.Pt, a.OffPt,
        this.m_UseFullRange)) {
      for (h = g.Prev; d.IntPoint.op_Equality(h.Pt, g.Pt) && h != g;) h = h
        .Prev;
      if (h.Pt.Y > g.Pt.Y || !d.ClipperBase.SlopesEqual(g.Pt, h.Pt, a.OffPt,
          this.m_UseFullRange)) return !1
    }
    if (f == e || h == g || f == h || b == c && l == k) return !1;
    l ? (f = this.DupOutPt(e, !1), h = this.DupOutPt(g, !0), e.Prev = g, g.Next =
      e, f.Next = h, h.Prev =
      f) : (f = this.DupOutPt(e, !0), h = this.DupOutPt(g, !1), e.Next =
      g, g
      .Prev = e, f.Prev = h, h.Next = f);
    a.OutPt1 = e;
    a.OutPt2 = f;
    return !0
  };
  d.Clipper.GetBounds = function(a) {
    for (var b = 0, c = a.length; b < c && 0 == a[b].length;) b++;
    if (b == c) return new d.IntRect(0, 0, 0, 0);
    var e = new d.IntRect;
    e.left = a[b][0].X;
    e.right = e.left;
    e.top = a[b][0].Y;
    for (e.bottom = e.top; b < c; b++)
      for (var f = 0, g = a[b].length; f < g; f++) a[b][f].X < e.left ? e.left =
        a[b][f].X : a[b][f].X > e.right && (e.right = a[b][f].X), a[b][f].Y <
        e
        .top ? e.top = a[b][f].Y : a[b][f].Y > e.bottom && (e.bottom = a[b]
          [f].Y);
    return e
  };
  d.Clipper.prototype.GetBounds2 = function(a) {
    var b = a,
      c = new d.IntRect;
    c.left = a.Pt.X;
    c.right = a.Pt.X;
    c.top = a.Pt.Y;
    c.bottom = a.Pt.Y;
    for (a = a.Next; a != b;) a.Pt.X < c.left && (c.left = a.Pt.X), a.Pt.X >
      c.right &&
      (c.right = a.Pt.X), a.Pt.Y < c.top && (c.top = a.Pt.Y), a.Pt.Y > c.bottom &&
      (c.bottom = a.Pt.Y), a = a.Next;
    return c
  };
  d.Clipper.PointInPolygon = function(a, b) {
    var c = 0,
      e = b.length;
    if (3 > e) return 0;
    for (var d = b[0], g = 1; g <= e; ++g) {
      var h = g == e ? b[0] : b[g];
      if (h.Y == a.Y && (h.X == a.X || d.Y == a.Y && h.X > a.X == d.X < a.X))
        return -1;
      if (d.Y < a.Y != h.Y <
        a.Y)
        if (d.X >= a.X)
          if (h.X > a.X) c = 1 - c;
          else {
            var l = (d.X - a.X) * (h.Y - a.Y) - (h.X - a.X) * (d.Y - a.Y);
            if (0 == l) return -1;
            0 < l == h.Y > d.Y && (c = 1 - c)
          } else if (h.X > a.X) {
        l = (d.X - a.X) * (h.Y - a.Y) - (h.X - a.X) * (d.Y - a.Y);
        if (0 == l) return -1;
        0 < l == h.Y > d.Y && (c = 1 - c)
      }
      d = h
    }
    return c
  };
  d.Clipper.prototype.PointInPolygon = function(a, b) {
    for (var c = 0, e = b;;) {
      var d = b.Pt.X,
        g = b.Pt.Y,
        h = b.Next.Pt.X,
        l = b.Next.Pt.Y;
      if (l == a.Y && (h == a.X || g == a.Y && h > a.X == d < a.X)) return -
        1;
      if (g < a.Y != l < a.Y)
        if (d >= a.X)
          if (h > a.X) c = 1 - c;
          else {
            d = (d - a.X) * (l - a.Y) - (h - a.X) * (g - a.Y);
            if (0 == d) return -1;
            0 < d == l > g && (c = 1 - c)
          } else if (h > a.X) {
        d = (d - a.X) * (l - a.Y) - (h - a.X) * (g - a.Y);
        if (0 == d) return -1;
        0 < d == l > g && (c = 1 - c)
      }
      b = b.Next;
      if (e == b) break
    }
    return c
  };
  d.Clipper.prototype.Poly2ContainsPoly1 = function(a, b) {
    var c = a;
    do {
      var e = this.PointInPolygon(c.Pt, b);
      if (0 <= e) return 0 != e;
      c = c.Next
    } while (c != a);
    return !0
  };
  d.Clipper.prototype.FixupFirstLefts1 = function(a, b) {
    for (var c = 0, e = this.m_PolyOuts.length; c < e; c++) {
      var d = this.m_PolyOuts[c];
      null !== d.Pts && d.FirstLeft == a && this.Poly2ContainsPoly1(d.Pts,
          b.Pts) &&
        (d.FirstLeft = b)
    }
  };
  d.Clipper.prototype.FixupFirstLefts2 =
    function(a, b) {
      for (var c = 0, e = this.m_PolyOuts, d = e.length, g = e[c]; c < d; c++,
        g =
        e[c]) g.FirstLeft == a && (g.FirstLeft = b)
    };
  d.Clipper.ParseFirstLeft = function(a) {
    for (; null != a && null == a.Pts;) a = a.FirstLeft;
    return a
  };
  d.Clipper.prototype.JoinCommonEdges = function() {
    for (var a = 0, b = this.m_Joins.length; a < b; a++) {
      var c = this.m_Joins[a],
        e = this.GetOutRec(c.OutPt1.Idx),
        f = this.GetOutRec(c.OutPt2.Idx);
      if (null != e.Pts && null != f.Pts) {
        var g;
        g = e == f ? e : this.Param1RightOfParam2(e, f) ? f : this.Param1RightOfParam2(
          f, e) ? e : this.GetLowermostRec(e,
          f);
        if (this.JoinPoints(c, e, f))
          if (e == f) {
            e.Pts = c.OutPt1;
            e.BottomPt = null;
            f = this.CreateOutRec();
            f.Pts = c.OutPt2;
            this.UpdateOutPtIdxs(f);
            if (this.m_UsingPolyTree) {
              g = 0;
              for (var h = this.m_PolyOuts.length; g < h - 1; g++) {
                var l = this.m_PolyOuts[g];
                null != l.Pts && d.Clipper.ParseFirstLeft(l.FirstLeft) == e &&
                  l.IsHole != e.IsHole && this.Poly2ContainsPoly1(l.Pts, c.OutPt2) &&
                  (l.FirstLeft = f)
              }
            }
            this.Poly2ContainsPoly1(f.Pts, e.Pts) ? (f.IsHole = !e.IsHole,
              f.FirstLeft =
              e, this.m_UsingPolyTree && this.FixupFirstLefts2(f, e), (f.IsHole ^
                this.ReverseSolution) ==
              0 < this.Area(f) && this.ReversePolyPtLinks(f.Pts)) : this.Poly2ContainsPoly1(
              e.Pts, f.Pts) ? (f.IsHole = e.IsHole, e.IsHole = !f.IsHole,
              f.FirstLeft =
              e.FirstLeft, e.FirstLeft = f, this.m_UsingPolyTree && this.FixupFirstLefts2(
                e, f), (e.IsHole ^ this.ReverseSolution) == 0 < this.Area(
                e) &&
              this.ReversePolyPtLinks(e.Pts)) : (f.IsHole = e.IsHole, f.FirstLeft =
              e.FirstLeft, this.m_UsingPolyTree && this.FixupFirstLefts1(
                e, f)
            )
          } else f.Pts = null, f.BottomPt = null, f.Idx = e.Idx, e.IsHole =
            g.IsHole,
            g == f && (e.FirstLeft = f.FirstLeft), f.FirstLeft = e, this.m_UsingPolyTree &&
            this.FixupFirstLefts2(f, e)
      }
    }
  };
  d.Clipper.prototype.UpdateOutPtIdxs = function(a) {
    var b = a.Pts;
    do b.Idx = a.Idx, b = b.Prev; while (b != a.Pts)
  };
  d.Clipper.prototype.DoSimplePolygons = function() {
    for (var a = 0; a < this.m_PolyOuts.length;) {
      var b = this.m_PolyOuts[a++],
        c = b.Pts;
      if (null !== c) {
        do {
          for (var e = c.Next; e != b.Pts;) {
            if (d.IntPoint.op_Equality(c.Pt, e.Pt) && e.Next != c && e.Prev !=
              c) {
              var f = c.Prev,
                g = e.Prev;
              c.Prev = g;
              g.Next = c;
              e.Prev = f;
              f.Next = e;
              b.Pts = c;
              f = this.CreateOutRec();
              f.Pts = e;
              this.UpdateOutPtIdxs(f);
              this.Poly2ContainsPoly1(f.Pts,
                b.Pts) ? (f.IsHole = !b.IsHole, f.FirstLeft = b) : this.Poly2ContainsPoly1(
                b.Pts, f.Pts) ? (f.IsHole = b.IsHole, b.IsHole = !f.IsHole,
                f
                .FirstLeft = b.FirstLeft, b.FirstLeft = f) : (f.IsHole =
                b.IsHole,
                f.FirstLeft = b.FirstLeft);
              e = c
            }
            e = e.Next
          }
          c = c.Next
        } while (c != b.Pts)
      }
    }
  };
  d.Clipper.Area = function(a) {
    var b = a.length;
    if (3 > b) return 0;
    for (var c = 0, e = 0, d = b - 1; e < b; ++e) c += (a[d].X + a[e].X) *
      (a[d]
        .Y - a[e].Y), d = e;
    return 0.5 * -c
  };
  d.Clipper.prototype.Area = function(a) {
    var b = a.Pts;
    if (null == b) return 0;
    var c = 0;
    do c += (b.Prev.Pt.X + b.Pt.X) * (b.Prev.Pt.Y - b.Pt.Y),
      b = b.Next; while (b != a.Pts);
    return 0.5 * c
  };
  d.Clipper.SimplifyPolygon = function(a, b) {
    var c = [],
      e = new d.Clipper(0);
    e.StrictlySimple = !0;
    e.AddPath(a, d.PolyType.ptSubject, !0);
    e.Execute(d.ClipType.ctUnion, c, b, b);
    return c
  };
  d.Clipper.SimplifyPolygons = function(a, b) {
    "undefined" == typeof b && (b = d.PolyFillType.pftEvenOdd);
    var c = [],
      e = new d.Clipper(0);
    e.StrictlySimple = !0;
    e.AddPaths(a, d.PolyType.ptSubject, !0);
    e.Execute(d.ClipType.ctUnion, c, b, b);
    return c
  };
  d.Clipper.DistanceSqrd = function(a, b) {
    var c = a.X - b.X,
      e = a.Y - b.Y;
    return c *
      c + e * e
  };
  d.Clipper.DistanceFromLineSqrd = function(a, b, c) {
    var e = b.Y - c.Y;
    c = c.X - b.X;
    b = e * b.X + c * b.Y;
    b = e * a.X + c * a.Y - b;
    return b * b / (e * e + c * c)
  };
  d.Clipper.SlopesNearCollinear = function(a, b, c, e) {
    return d.Clipper.DistanceFromLineSqrd(b, a, c) < e
  };
  d.Clipper.PointsAreClose = function(a, b, c) {
    var e = a.X - b.X;
    a = a.Y - b.Y;
    return e * e + a * a <= c
  };
  d.Clipper.ExcludeOp = function(a) {
    var b = a.Prev;
    b.Next = a.Next;
    a.Next.Prev = b;
    b.Idx = 0;
    return b
  };
  d.Clipper.CleanPolygon = function(a, b) {
    "undefined" == typeof b && (b = 1.415);
    var c = a.length;
    if (0 == c) return [];
    for (var e = Array(c), f = 0; f < c; ++f) e[f] = new d.OutPt;
    for (f = 0; f < c; ++f) e[f].Pt = a[f], e[f].Next = e[(f + 1) % c], e[f]
      .Next
      .Prev = e[f], e[f].Idx = 0;
    f = b * b;
    for (e = e[0]; 0 == e.Idx && e.Next != e.Prev;) d.Clipper.PointsAreClose(
      e.Pt,
      e.Prev.Pt, f) ? (e = d.Clipper.ExcludeOp(e), c--) : d.Clipper.PointsAreClose(
      e.Prev.Pt, e.Next.Pt, f) ? (d.Clipper.ExcludeOp(e.Next), e = d.Clipper
      .ExcludeOp(
        e), c -= 2) : d.Clipper.SlopesNearCollinear(e.Prev.Pt, e.Pt, e.Next
      .Pt,
      f) ? (e = d.Clipper.ExcludeOp(e), c--) : (e.Idx = 1, e = e.Next);
    3 > c && (c = 0);
    for (var g = Array(c), f = 0; f < c; ++f) g[f] =
      new d.IntPoint(e.Pt), e = e.Next;
    return g
  };
  d.Clipper.CleanPolygons = function(a, b) {
    for (var c = Array(a.length), e = 0, f = a.length; e < f; e++) c[e] = d
      .Clipper
      .CleanPolygon(a[e], b);
    return c
  };
  d.Clipper.Minkowski = function(a, b, c, e) {
    var f = e ? 1 : 0,
      g = a.length,
      h = b.length;
    e = [];
    if (c)
      for (c = 0; c < h; c++) {
        for (var l = Array(g), k = 0, m = a.length, n = a[k]; k < m; k++, n =
          a[
            k]) l[k] = new d.IntPoint(b[c].X + n.X, b[c].Y + n.Y);
        e.push(l)
      } else
        for (c = 0; c < h; c++) {
          l = Array(g);
          k = 0;
          m = a.length;
          for (n = a[k]; k < m; k++, n = a[k]) l[k] = new d.IntPoint(b[c].X -
            n
            .X, b[c].Y - n.Y);
          e.push(l)
        }
    a = [];
    for (c = 0; c < h - 1 + f; c++)
      for (k = 0; k < g; k++) b = [], b.push(e[c % h][k % g]), b.push(e[(c +
          1) %
        h][k % g]), b.push(e[(c + 1) % h][(k + 1) % g]), b.push(e[c % h][
        (k +
          1) % g
      ]), d.Clipper.Orientation(b) || b.reverse(), a.push(b);
    f = new d.Clipper(0);
    f.AddPaths(a, d.PolyType.ptSubject, !0);
    f.Execute(d.ClipType.ctUnion, e, d.PolyFillType.pftNonZero, d.PolyFillType
      .pftNonZero);
    return e
  };
  d.Clipper.MinkowskiSum = function() {
    var a = arguments,
      b = a.length;
    if (3 == b) {
      var c = a[0],
        e = a[2];
      return d.Clipper.Minkowski(c, a[1], !0, e)
    }
    if (4 == b) {
      for (var c = a[0], f = a[1], b = a[2],
          e = a[3], a = new d.Clipper, g, h = 0, l = f.length; h < l; ++h) g =
        d.Clipper.Minkowski(c, f[h], !0, e), a.AddPaths(g, d.PolyType.ptSubject, !
          0);
      e && a.AddPaths(f, d.PolyType.ptClip, !0);
      c = new d.Paths;
      a.Execute(d.ClipType.ctUnion, c, b, b);
      return c
    }
  };
  d.Clipper.MinkowskiDiff = function(a, b, c) {
    return d.Clipper.Minkowski(a, b, !1, c)
  };
  d.Clipper.PolyTreeToPaths = function(a) {
    var b = [];
    d.Clipper.AddPolyNodeToPaths(a, d.Clipper.NodeType.ntAny, b);
    return b
  };
  d.Clipper.AddPolyNodeToPaths = function(a, b, c) {
    var e = !0;
    switch (b) {
      case d.Clipper.NodeType.ntOpen:
        return;
      case d.Clipper.NodeType.ntClosed:
        e = !a.IsOpen
    }
    0 < a.m_polygon.length && e && c.push(a.m_polygon);
    e = 0;
    a = a.Childs();
    for (var f = a.length, g = a[e]; e < f; e++, g = a[e]) d.Clipper.AddPolyNodeToPaths(
      g, b, c)
  };
  d.Clipper.OpenPathsFromPolyTree = function(a) {
    for (var b = new d.Paths, c = 0, e = a.ChildCount(); c < e; c++) a.Childs()[
      c].IsOpen && b.push(a.Childs()[c].m_polygon);
    return b
  };
  d.Clipper.ClosedPathsFromPolyTree = function(a) {
    var b = new d.Paths;
    d.Clipper.AddPolyNodeToPaths(a, d.Clipper.NodeType.ntClosed, b);
    return b
  };
  L(d.Clipper, d.ClipperBase);
  d.Clipper.NodeType = {
    ntAny: 0,
    ntOpen: 1,
    ntClosed: 2
  };
  d.ClipperOffset = function(a, b) {
    "undefined" == typeof a && (a = 2);
    "undefined" == typeof b && (b = d.ClipperOffset.def_arc_tolerance);
    this.m_destPolys = new d.Paths;
    this.m_srcPoly = new d.Path;
    this.m_destPoly = new d.Path;
    this.m_normals = [];
    this.m_StepsPerRad = this.m_miterLim = this.m_cos = this.m_sin = this.m_sinA =
      this.m_delta = 0;
    this.m_lowest = new d.IntPoint;
    this.m_polyNodes = new d.PolyNode;
    this.MiterLimit = a;
    this.ArcTolerance = b;
    this.m_lowest.X = -1
  };
  d.ClipperOffset.two_pi = 6.28318530717959;
  d.ClipperOffset.def_arc_tolerance =
    0.25;
  d.ClipperOffset.prototype.Clear = function() {
    d.Clear(this.m_polyNodes.Childs());
    this.m_lowest.X = -1
  };
  d.ClipperOffset.Round = d.Clipper.Round;
  d.ClipperOffset.prototype.AddPath =
    function(a, b, c) {
      var e = a.length - 1;
      if (!(0 > e)) {
        var f = new d.PolyNode;
        f.m_jointype = b;
        f.m_endtype = c;
        if (c == d.EndType.etClosedLine || c == d.EndType.etClosedPolygon)
          for (; 0 < e && d.IntPoint.op_Equality(a[0], a[e]);) e--;
        f.m_polygon.push(a[0]);
        var g = 0;
        b = 0;
        for (var h = 1; h <= e; h++) d.IntPoint.op_Inequality(f.m_polygon[g],
          a[h]) && (g++, f.m_polygon.push(a[h]), a[h].Y > f.m_polygon[b].Y ||
          a[
            h].Y == f.m_polygon[b].Y && a[h].X < f.m_polygon[b].X) && (b =
          g);
        if (!(c == d.EndType.etClosedPolygon && 2 > g || c != d.EndType.etClosedPolygon &&
            0 > g) && (this.m_polyNodes.AddChild(f), c == d.EndType.etClosedPolygon))
          if (0 > this.m_lowest.X) this.m_lowest = new d.IntPoint(0, b);
          else if (a = this.m_polyNodes.Childs()[this.m_lowest.X].m_polygon[
            this.m_lowest
            .Y], f.m_polygon[b].Y > a.Y || f.m_polygon[b].Y == a.Y && f.m_polygon[
            b].X < a.X) this.m_lowest = new d.IntPoint(this.m_polyNodes.ChildCount() -
          1, b)
      }
    };
  d.ClipperOffset.prototype.AddPaths = function(a, b, c) {
    for (var e = 0, d = a.length; e < d; e++) this.AddPath(a[e], b, c)
  };
  d.ClipperOffset.prototype.FixOrientations = function() {
    if (0 <= this.m_lowest.X && !d.Clipper.Orientation(this.m_polyNodes.Childs()[
        this.m_lowest.X].m_polygon))
      for (var a = 0; a < this.m_polyNodes.ChildCount(); a++) {
        var b = this.m_polyNodes.Childs()[a];
        (b.m_endtype == d.EndType.etClosedPolygon || b.m_endtype == d.EndType
          .etClosedLine &&
          d.Clipper.Orientation(b.m_polygon)) && b.m_polygon.reverse()
      } else
        for (a = 0; a <
          this.m_polyNodes.ChildCount(); a++) b = this.m_polyNodes.Childs()[
            a],
          b.m_endtype != d.EndType.etClosedLine || d.Clipper.Orientation(b.m_polygon) ||
          b.m_polygon.reverse()
  };
  d.ClipperOffset.GetUnitNormal = function(a, b) {
    var c = b.X - a.X,
      e = b.Y - a.Y;
    if (0 == c && 0 == e) return new d.DoublePoint(0, 0);
    var f = 1 / Math.sqrt(c * c + e * e);
    return new d.DoublePoint(e * f, -(c * f))
  };
  d.ClipperOffset.prototype.DoOffset = function(a) {
    this.m_destPolys = [];
    this.m_delta = a;
    if (d.ClipperBase.near_zero(a))
      for (var b = 0; b < this.m_polyNodes.ChildCount(); b++) {
        var c =
          this.m_polyNodes.Childs()[b];
        c.m_endtype == d.EndType.etClosedPolygon && this.m_destPolys.push(c
          .m_polygon)
      } else {
        this.m_miterLim = 2 < this.MiterLimit ? 2 / (this.MiterLimit * this
            .MiterLimit) :
          0.5;
        var b = 0 >= this.ArcTolerance ? d.ClipperOffset.def_arc_tolerance :
          this.ArcTolerance > Math.abs(a) * d.ClipperOffset.def_arc_tolerance ?
          Math.abs(a) * d.ClipperOffset.def_arc_tolerance : this.ArcTolerance,
          e = 3.14159265358979 / Math.acos(1 - b / Math.abs(a));
        this.m_sin = Math.sin(d.ClipperOffset.two_pi / e);
        this.m_cos = Math.cos(d.ClipperOffset.two_pi /
          e);
        this.m_StepsPerRad = e / d.ClipperOffset.two_pi;
        0 > a && (this.m_sin = -this.m_sin);
        for (b = 0; b < this.m_polyNodes.ChildCount(); b++) {
          c = this.m_polyNodes.Childs()[b];
          this.m_srcPoly = c.m_polygon;
          var f = this.m_srcPoly.length;
          if (!(0 == f || 0 >= a && (3 > f || c.m_endtype != d.EndType.etClosedPolygon))) {
            this.m_destPoly = [];
            if (1 == f)
              if (c.m_jointype == d.JoinType.jtRound)
                for (var c = 1, f = 0, g = 1; g <= e; g++) {
                  this.m_destPoly.push(new d.IntPoint(d.ClipperOffset.Round(
                    this.m_srcPoly[0].X + c * a), d.ClipperOffset.Round(
                    this.m_srcPoly[0].Y + f * a)));
                  var h =
                    c,
                    c = c * this.m_cos - this.m_sin * f,
                    f = h * this.m_sin + f * this.m_cos
                } else
                  for (f = c = -1, g = 0; 4 > g; ++g) this.m_destPoly.push(
                    new d
                    .IntPoint(d.ClipperOffset.Round(this.m_srcPoly[0].X +
                      c *
                      a), d.ClipperOffset.Round(this.m_srcPoly[0].Y + f *
                      a))
                  ), 0 > c ? c = 1 : 0 > f ? f = 1 : c = -1;
              else {
                for (g = this.m_normals.length = 0; g < f - 1; g++) this.m_normals
                  .push(d.ClipperOffset.GetUnitNormal(this.m_srcPoly[g],
                    this.m_srcPoly[
                      g + 1]));
                c.m_endtype == d.EndType.etClosedLine || c.m_endtype == d.EndType
                  .etClosedPolygon ? this.m_normals.push(d.ClipperOffset.GetUnitNormal(
                    this.m_srcPoly[f -
                      1], this.m_srcPoly[0])) : this.m_normals.push(new d.DoublePoint(
                    this.m_normals[f - 2]));
                if (c.m_endtype == d.EndType.etClosedPolygon)
                  for (h = f - 1, g = 0; g < f; g++) h = this.OffsetPoint(g,
                    h,
                    c.m_jointype);
                else if (c.m_endtype == d.EndType.etClosedLine) {
                  h = f - 1;
                  for (g = 0; g < f; g++) h = this.OffsetPoint(g, h, c.m_jointype);
                  this.m_destPolys.push(this.m_destPoly);
                  this.m_destPoly = [];
                  h = this.m_normals[f - 1];
                  for (g = f - 1; 0 < g; g--) this.m_normals[g] = new d.DoublePoint(-
                    this.m_normals[g - 1].X, -this.m_normals[g - 1].Y);
                  this.m_normals[0] = new d.DoublePoint(-h.X, -h.Y);
                  h = 0;
                  for (g = f - 1; 0 <= g; g--) h = this.OffsetPoint(g, h, c
                    .m_jointype)
                } else {
                  h = 0;
                  for (g = 1; g < f - 1; ++g) h = this.OffsetPoint(g, h, c.m_jointype);
                  c.m_endtype == d.EndType.etOpenButt ? (g = f - 1, h = new d
                      .IntPoint(
                        d.ClipperOffset.Round(this.m_srcPoly[g].X + this.m_normals[
                          g].X * a), d.ClipperOffset.Round(this.m_srcPoly[g]
                          .Y +
                          this.m_normals[g].Y * a)), this.m_destPoly.push(h),
                      h =
                      new d.IntPoint(d.ClipperOffset.Round(this.m_srcPoly[g]
                        .X -
                        this.m_normals[g].X * a), d.ClipperOffset.Round(
                        this.m_srcPoly[
                          g].Y - this.m_normals[g].Y * a)), this.m_destPoly
                      .push(
                        h)) :
                    (g = f - 1, h = f - 2, this.m_sinA = 0, this.m_normals[
                        g] =
                      new d.DoublePoint(-this.m_normals[g].X, -this.m_normals[
                          g]
                        .Y), c.m_endtype == d.EndType.etOpenSquare ? this.DoSquare(
                        g, h) : this.DoRound(g, h));
                  for (g = f - 1; 0 < g; g--) this.m_normals[g] = new d.DoublePoint(-
                    this.m_normals[g - 1].X, -this.m_normals[g - 1].Y);
                  this.m_normals[0] = new d.DoublePoint(-this.m_normals[1].X, -
                    this.m_normals[1].Y);
                  h = f - 1;
                  for (g = h - 1; 0 < g; --g) h = this.OffsetPoint(g, h, c.m_jointype);
                  c.m_endtype == d.EndType.etOpenButt ? (h = new d.IntPoint(
                      d.ClipperOffset
                      .Round(this.m_srcPoly[0].X -
                        this.m_normals[0].X * a), d.ClipperOffset.Round(
                        this.m_srcPoly[
                          0].Y - this.m_normals[0].Y * a)), this.m_destPoly
                    .push(
                      h), h = new d.IntPoint(d.ClipperOffset.Round(this.m_srcPoly[
                      0].X + this.m_normals[0].X * a), d.ClipperOffset.Round(
                      this.m_srcPoly[0].Y + this.m_normals[0].Y * a)),
                    this.m_destPoly
                    .push(h)) : (this.m_sinA = 0, c.m_endtype == d.EndType
                    .etOpenSquare ?
                    this.DoSquare(0, 1) : this.DoRound(0, 1))
                }
              }
            this.m_destPolys.push(this.m_destPoly)
          }
        }
      }
  };
  d.ClipperOffset.prototype.Execute = function() {
    var a = arguments;
    if (a[0] instanceof d.PolyTree)
      if (b =
        a[0], c = a[1], b.Clear(), this.FixOrientations(), this.DoOffset(c),
        a =
        new d.Clipper(0), a.AddPaths(this.m_destPolys, d.PolyType.ptSubject, !
          0),
        0 < c) a.Execute(d.ClipType.ctUnion, b, d.PolyFillType.pftPositive,
        d.PolyFillType
        .pftPositive);
      else if (c = d.Clipper.GetBounds(this.m_destPolys), e = new d.Path, e
      .push(
        new d.IntPoint(c.left - 10, c.bottom + 10)), e.push(new d.IntPoint(
        c.right +
        10, c.bottom + 10)), e.push(new d.IntPoint(c.right + 10, c.top - 10)),
      e.push(new d.IntPoint(c.left - 10, c.top - 10)), a.AddPath(e, d.PolyType
        .ptSubject, !
        0),
      a.ReverseSolution = !0, a.Execute(d.ClipType.ctUnion, b, d.PolyFillType
        .pftNegative,
        d.PolyFillType.pftNegative), 1 == b.ChildCount() && 0 < b.Childs()[
        0].ChildCount()
    )
      for (a = b.Childs()[0], b.Childs()[0] = a.Childs()[0], c = 1; c < a.ChildCount(); c++)
        b.AddChild(a.Childs()[c]);
    else b.Clear();
    else {
      var b = a[0],
        c = a[1];
      d.Clear(b);
      this.FixOrientations();
      this.DoOffset(c);
      a = new d.Clipper(0);
      a.AddPaths(this.m_destPolys, d.PolyType.ptSubject, !0);
      if (0 < c) a.Execute(d.ClipType.ctUnion, b, d.PolyFillType.pftPositive,
        d
        .PolyFillType.pftPositive);
      else {
        var c = d.Clipper.GetBounds(this.m_destPolys),
          e = new d.Path;
        e.push(new d.IntPoint(c.left - 10, c.bottom + 10));
        e.push(new d.IntPoint(c.right + 10, c.bottom + 10));
        e.push(new d.IntPoint(c.right + 10, c.top - 10));
        e.push(new d.IntPoint(c.left - 10, c.top - 10));
        a.AddPath(e, d.PolyType.ptSubject, !0);
        a.ReverseSolution = !0;
        a.Execute(d.ClipType.ctUnion, b, d.PolyFillType.pftNegative, d.PolyFillType
          .pftNegative);
        0 < b.length && b.splice(0, 1)
      }
    }
  };
  d.ClipperOffset.prototype.OffsetPoint = function(a, b, c) {
    this.m_sinA = this.m_normals[b].X *
      this.m_normals[a].Y - this.m_normals[a].X * this.m_normals[b].Y;
    if (5E-5 > this.m_sinA && -5E-5 < this.m_sinA) return b;
    1 < this.m_sinA ? this.m_sinA = 1 : -1 > this.m_sinA && (this.m_sinA = -
      1);
    if (0 > this.m_sinA * this.m_delta) this.m_destPoly.push(new d.IntPoint(
        d.ClipperOffset
        .Round(this.m_srcPoly[a].X + this.m_normals[b].X * this.m_delta),
        d.ClipperOffset
        .Round(this.m_srcPoly[a].Y + this.m_normals[b].Y * this.m_delta))),
      this.m_destPoly.push(new d.IntPoint(this.m_srcPoly[a])), this.m_destPoly
      .push(
        new d.IntPoint(d.ClipperOffset.Round(this.m_srcPoly[a].X +
          this.m_normals[a].X * this.m_delta), d.ClipperOffset.Round(this
          .m_srcPoly[
            a].Y + this.m_normals[a].Y * this.m_delta)));
    else switch (c) {
      case d.JoinType.jtMiter:
        c = 1 + (this.m_normals[a].X * this.m_normals[b].X + this.m_normals[
            a]
          .Y * this.m_normals[b].Y);
        c >= this.m_miterLim ? this.DoMiter(a, b, c) : this.DoSquare(a, b);
        break;
      case d.JoinType.jtSquare:
        this.DoSquare(a, b);
        break;
      case d.JoinType.jtRound:
        this.DoRound(a, b)
    }
    return a
  };
  d.ClipperOffset.prototype.DoSquare = function(a, b) {
    var c = Math.tan(Math.atan2(this.m_sinA, this.m_normals[b].X *
        this.m_normals[a].X + this.m_normals[b].Y * this.m_normals[a].Y) /
      4);
    this.m_destPoly.push(new d.IntPoint(d.ClipperOffset.Round(this.m_srcPoly[
        a]
      .X + this.m_delta * (this.m_normals[b].X - this.m_normals[b].Y *
        c)
    ), d.ClipperOffset.Round(this.m_srcPoly[a].Y + this.m_delta * (
      this.m_normals[
        b].Y + this.m_normals[b].X * c))));
    this.m_destPoly.push(new d.IntPoint(d.ClipperOffset.Round(this.m_srcPoly[
        a]
      .X + this.m_delta * (this.m_normals[a].X + this.m_normals[a].Y *
        c)
    ), d.ClipperOffset.Round(this.m_srcPoly[a].Y + this.m_delta * (
      this.m_normals[
        a].Y -
      this.m_normals[a].X * c))))
  };
  d.ClipperOffset.prototype.DoMiter = function(a, b, c) {
    c = this.m_delta / c;
    this.m_destPoly.push(new d.IntPoint(d.ClipperOffset.Round(this.m_srcPoly[
          a]
        .X + (this.m_normals[b].X + this.m_normals[a].X) * c), d.ClipperOffset
      .Round(this.m_srcPoly[a].Y + (this.m_normals[b].Y + this.m_normals[
          a]
        .Y) * c)))
  };
  d.ClipperOffset.prototype.DoRound = function(a, b) {
    for (var c = Math.atan2(this.m_sinA, this.m_normals[b].X * this.m_normals[
            a]
          .X + this.m_normals[b].Y * this.m_normals[a].Y), c = d.Cast_Int32(
          d.ClipperOffset
          .Round(this.m_StepsPerRad *
            Math.abs(c))), e = this.m_normals[b].X, f = this.m_normals[b].Y,
        g,
        h = 0; h < c; ++h) this.m_destPoly.push(new d.IntPoint(d.ClipperOffset
        .Round(
          this.m_srcPoly[a].X + e * this.m_delta), d.ClipperOffset.Round(
          this
          .m_srcPoly[a].Y + f * this.m_delta))), g = e, e = e * this.m_cos -
      this
      .m_sin * f, f = g * this.m_sin + f * this.m_cos;
    this.m_destPoly.push(new d.IntPoint(d.ClipperOffset.Round(this.m_srcPoly[
        a]
      .X + this.m_normals[a].X * this.m_delta), d.ClipperOffset.Round(
      this.m_srcPoly[a].Y + this.m_normals[a].Y * this.m_delta)))
  };
  d.Error = function(a) {
    try {
      throw Error(a);
    } catch (b) {
      alert(b.message)
    }
  };
  d.JS = {};
  d.JS.AreaOfPolygon = function(a, b) {
    b || (b = 1);
    return d.Clipper.Area(a) / (b * b)
  };
  d.JS.AreaOfPolygons = function(a, b) {
    b || (b = 1);
    for (var c = 0, e = 0; e < a.length; e++) c += d.Clipper.Area(a[e]);
    return c / (b * b)
  };
  d.JS.BoundsOfPath = function(a, b) {
    return d.JS.BoundsOfPaths([a], b)
  };
  d.JS.BoundsOfPaths = function(a, b) {
    b || (b = 1);
    var c = d.Clipper.GetBounds(a);
    c.left /= b;
    c.bottom /= b;
    c.right /= b;
    c.top /= b;
    return c
  };
  d.JS.Clean = function(a, b) {
    if (!(a instanceof Array)) return [];
    var c = a[0] instanceof Array;
    a =
      d.JS.Clone(a);
    if ("number" != typeof b || null === b) return d.Error(
      "Delta is not a number in Clean()."), a;
    if (0 === a.length || 1 == a.length && 0 === a[0].length || 0 > b)
      return a;
    c || (a = [a]);
    for (var e = a.length, f, g, h, l, k, m, n, p = [], q = 0; q < e; q++)
      if (g = a[q], f = g.length, 0 !== f)
        if (3 > f) h = g, p.push(h);
        else {
          h = g;
          l = b * b;
          k = g[0];
          for (n = m = 1; n < f; n++)(g[n].X - k.X) * (g[n].X - k.X) + (g[n]
            .Y -
            k.Y) * (g[n].Y - k.Y) <= l || (h[m] = g[n], k = g[n], m++);
          k = g[m - 1];
          (g[0].X - k.X) * (g[0].X - k.X) + (g[0].Y - k.Y) * (g[0].Y - k.Y) <=
          l && m--;
          m < f && h.splice(m, f - m);
          h.length && p.push(h)
        }!c &&
      p.length ? p = p[0] : c || 0 !== p.length ? c && 0 === p.length && (p = [
        []
      ]) : p = [];
    return p
  };
  d.JS.Clone = function(a) {
    if (!(a instanceof Array) || 0 === a.length) return [];
    if (1 == a.length && 0 === a[0].length) return [
      []
    ];
    var b = a[0] instanceof Array;
    b || (a = [a]);
    var c = a.length,
      e, d, g, h, l = Array(c);
    for (d = 0; d < c; d++) {
      e = a[d].length;
      h = Array(e);
      for (g = 0; g < e; g++) h[g] = {
        X: a[d][g].X,
        Y: a[d][g].Y
      };
      l[d] = h
    }
    b || (l = l[0]);
    return l
  };
  d.JS.Lighten = function(a, b) {
    if (!(a instanceof Array)) return [];
    if ("number" != typeof b || null === b) return d.Error(
        "Tolerance is not a number in Lighten()."),
      d.JS.Clone(a);
    if (0 === a.length || 1 == a.length && 0 === a[0].length || 0 > b)
      return d
        .JS.Clone(a);
    a[0] instanceof Array || (a = [a]);
    var c, e, f, g, h, l, k, m, n, p, q, r, s, t, u, y = a.length,
      z = b * b,
      w = [];
    for (c = 0; c < y; c++)
      if (f = a[c], l = f.length, 0 != l) {
        for (g = 0; 1E6 > g; g++) {
          h = [];
          l = f.length;
          f[l - 1].X != f[0].X || f[l - 1].Y != f[0].Y ? (q = 1, f.push({
            X: f[0].X,
            Y: f[0].Y
          }), l = f.length) : q = 0;
          p = [];
          for (e = 0; e < l - 2; e++) {
            k = f[e];
            n = f[e + 1];
            m = f[e + 2];
            t = k.X;
            u = k.Y;
            k = m.X - t;
            r = m.Y - u;
            if (0 !== k || 0 !== r) s = ((n.X - t) * k + (n.Y - u) * r) / (
              k *
              k + r * r), 1 < s ? (t = m.X, u = m.Y) : 0 < s && (t += k *
              s,
              u += r * s);
            k =
              n.X - t;
            r = n.Y - u;
            m = k * k + r * r;
            m <= z && (p[e + 1] = 1, e++)
          }
          h.push({
            X: f[0].X,
            Y: f[0].Y
          });
          for (e = 1; e < l - 1; e++) p[e] || h.push({
            X: f[e].X,
            Y: f[e].Y
          });
          h.push({
            X: f[l - 1].X,
            Y: f[l - 1].Y
          });
          q && f.pop();
          if (p.length) f = h;
          else break
        }
        l = h.length;
        h[l - 1].X == h[0].X && h[l - 1].Y == h[0].Y && h.pop();
        2 < h.length && w.push(h)
      }!a[0] instanceof Array && (w = w[0]);
    "undefined" == typeof w && (w = [
      []
    ]);
    return w
  };
  d.JS.PerimeterOfPath = function(a, b, c) {
    if ("undefined" == typeof a) return 0;
    var d = Math.sqrt,
      f = 0,
      g, h, l = 0,
      k = g = 0;
    h = 0;
    var m = a.length;
    if (2 > m) return 0;
    b && (a[m] = a[0], m++);
    for (; --m;) g = a[m], l = g.X, g = g.Y, h = a[m - 1], k = h.X, h = h.Y,
      f +=
      d((l - k) * (l - k) + (g - h) * (g - h));
    b && a.pop();
    return f / c
  };
  d.JS.PerimeterOfPaths = function(a, b, c) {
    c || (c = 1);
    for (var e = 0, f = 0; f < a.length; f++) e += d.JS.PerimeterOfPath(a[f],
      b,
      c);
    return e
  };
  d.JS.ScaleDownPath = function(a, b) {
    var c, d;
    b || (b = 1);
    for (c = a.length; c--;) d = a[c], d.X /= b, d.Y /= b
  };
  d.JS.ScaleDownPaths = function(a, b) {
    var c, d, f;
    b || (b = 1);
    for (c = a.length; c--;)
      for (d = a[c].length; d--;) f = a[c][d], f.X /= b, f.Y /= b
  };
  d.JS.ScaleUpPath = function(a, b) {
    var c, d, f = Math.round;
    b || (b = 1);
    for (c =
      a.length; c--;) d = a[c], d.X = f(d.X * b), d.Y = f(d.Y * b)
  };
  d.JS.ScaleUpPaths = function(a, b) {
    var c, d, f, g = Math.round;
    b || (b = 1);
    for (c = a.length; c--;)
      for (d = a[c].length; d--;) f = a[c][d], f.X = g(f.X * b), f.Y = g(f.Y *
        b)
  };
  d.ExPolygons = function() {
    return []
  };
  d.ExPolygon = function() {
    this.holes = this.outer = null
  };
  d.JS.AddOuterPolyNodeToExPolygons = function(a, b) {
    var c = new d.ExPolygon;
    c.outer = a.Contour();
    var e = a.Childs(),
      f = e.length;
    c.holes = Array(f);
    var g, h, l, k, m;
    for (h = 0; h < f; h++)
      for (g = e[h], c.holes[h] = g.Contour(), l = 0, k = g.Childs(), m = k
        .length; l <
        m; l++) g = k[l], d.JS.AddOuterPolyNodeToExPolygons(g, b);
    b.push(c)
  };
  d.JS.ExPolygonsToPaths = function(a) {
    var b, c, e, f, g = new d.Paths;
    b = 0;
    for (e = a.length; b < e; b++)
      for (g.push(a[b].outer), c = 0, f = a[b].holes.length; c < f; c++) g.push(
        a[b].holes[c]);
    return g
  };
  d.JS.PolyTreeToExPolygons = function(a) {
    var b = new d.ExPolygons,
      c, e, f;
    c = 0;
    e = a.Childs();
    for (f = e.length; c < f; c++) a = e[c], d.JS.AddOuterPolyNodeToExPolygons(
      a, b);
    return b
  }
})();
