!(function (t) {
  var n = {}
  function e(r) {
    if (n[r]) return n[r].exports
    var i = (n[r] = { i: r, l: !1, exports: {} })
    return t[r].call(i.exports, i, i.exports, e), (i.l = !0), i.exports
  }
  ;(e.m = t),
    (e.c = n),
    (e.d = function (t, n, r) {
      e.o(t, n) || Object.defineProperty(t, n, { enumerable: !0, get: r })
    }),
    (e.r = function (t) {
      'undefined' != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(t, '__esModule', { value: !0 })
    }),
    (e.t = function (t, n) {
      if ((1 & n && (t = e(t)), 8 & n)) return t
      if (4 & n && 'object' == typeof t && t && t.__esModule) return t
      var r = Object.create(null)
      if (
        (e.r(r),
        Object.defineProperty(r, 'default', { enumerable: !0, value: t }),
        2 & n && 'string' != typeof t)
      )
        for (var i in t)
          e.d(
            r,
            i,
            function (n) {
              return t[n]
            }.bind(null, i)
          )
      return r
    }),
    (e.n = function (t) {
      var n =
        t && t.__esModule
          ? function () {
              return t.default
            }
          : function () {
              return t
            }
      return e.d(n, 'a', n), n
    }),
    (e.o = function (t, n) {
      return Object.prototype.hasOwnProperty.call(t, n)
    }),
    (e.p = ''),
    e((e.s = 8))
})({
  8: function (t, n, e) {
    'use strict'
    function r() {}
    e.r(n)
    var i = function (t) {
      return null == t
        ? r
        : function () {
            return this.querySelector(t)
          }
    }
    function o() {
      return []
    }
    var u = function (t) {
      return new Array(t.length)
    }
    function a(t, n) {
      ;(this.ownerDocument = t.ownerDocument),
        (this.namespaceURI = t.namespaceURI),
        (this._next = null),
        (this._parent = t),
        (this.__data__ = n)
    }
    a.prototype = {
      constructor: a,
      appendChild: function (t) {
        return this._parent.insertBefore(t, this._next)
      },
      insertBefore: function (t, n) {
        return this._parent.insertBefore(t, n)
      },
      querySelector: function (t) {
        return this._parent.querySelector(t)
      },
      querySelectorAll: function (t) {
        return this._parent.querySelectorAll(t)
      }
    }
    function c(t, n, e, r, i, o) {
      for (var u, c = 0, s = n.length, l = o.length; c < l; ++c)
        (u = n[c]) ? ((u.__data__ = o[c]), (r[c] = u)) : (e[c] = new a(t, o[c]))
      for (; c < s; ++c) (u = n[c]) && (i[c] = u)
    }
    function s(t, n, e, r, i, o, u) {
      var c,
        s,
        l,
        f = {},
        h = n.length,
        g = o.length,
        p = new Array(h)
      for (c = 0; c < h; ++c)
        (s = n[c]) &&
          ((p[c] = l = '$' + u.call(s, s.__data__, c, n)),
          l in f ? (i[c] = s) : (f[l] = s))
      for (c = 0; c < g; ++c)
        (s = f[(l = '$' + u.call(t, o[c], c, o))])
          ? ((r[c] = s), (s.__data__ = o[c]), (f[l] = null))
          : (e[c] = new a(t, o[c]))
      for (c = 0; c < h; ++c) (s = n[c]) && f[p[c]] === s && (i[c] = s)
    }
    function l(t, n) {
      return t < n ? -1 : t > n ? 1 : t >= n ? 0 : NaN
    }
    var f = 'http://www.w3.org/1999/xhtml',
      h = {
        svg: 'http://www.w3.org/2000/svg',
        xhtml: f,
        xlink: 'http://www.w3.org/1999/xlink',
        xml: 'http://www.w3.org/XML/1998/namespace',
        xmlns: 'http://www.w3.org/2000/xmlns/'
      },
      g = function (t) {
        var n = (t += ''),
          e = n.indexOf(':')
        return (
          e >= 0 && 'xmlns' !== (n = t.slice(0, e)) && (t = t.slice(e + 1)),
          h.hasOwnProperty(n) ? { space: h[n], local: t } : t
        )
      }
    function p(t) {
      return function () {
        this.removeAttribute(t)
      }
    }
    function d(t) {
      return function () {
        this.removeAttributeNS(t.space, t.local)
      }
    }
    function y(t, n) {
      return function () {
        this.setAttribute(t, n)
      }
    }
    function v(t, n) {
      return function () {
        this.setAttributeNS(t.space, t.local, n)
      }
    }
    function m(t, n) {
      return function () {
        var e = n.apply(this, arguments)
        null == e ? this.removeAttribute(t) : this.setAttribute(t, e)
      }
    }
    function _(t, n) {
      return function () {
        var e = n.apply(this, arguments)
        null == e
          ? this.removeAttributeNS(t.space, t.local)
          : this.setAttributeNS(t.space, t.local, e)
      }
    }
    var w = function (t) {
      return (
        (t.ownerDocument && t.ownerDocument.defaultView) ||
        (t.document && t) ||
        t.defaultView
      )
    }
    function x(t) {
      return function () {
        this.style.removeProperty(t)
      }
    }
    function M(t, n, e) {
      return function () {
        this.style.setProperty(t, n, e)
      }
    }
    function b(t, n, e) {
      return function () {
        var r = n.apply(this, arguments)
        null == r
          ? this.style.removeProperty(t)
          : this.style.setProperty(t, r, e)
      }
    }
    function k(t, n) {
      return (
        t.style.getPropertyValue(n) ||
        w(t).getComputedStyle(t, null).getPropertyValue(n)
      )
    }
    function T(t) {
      return function () {
        delete this[t]
      }
    }
    function A(t, n) {
      return function () {
        this[t] = n
      }
    }
    function C(t, n) {
      return function () {
        var e = n.apply(this, arguments)
        null == e ? delete this[t] : (this[t] = e)
      }
    }
    function N(t) {
      return t.trim().split(/^|\s+/)
    }
    function D(t) {
      return t.classList || new S(t)
    }
    function S(t) {
      ;(this._node = t), (this._names = N(t.getAttribute('class') || ''))
    }
    function E(t, n) {
      for (var e = D(t), r = -1, i = n.length; ++r < i; ) e.add(n[r])
    }
    function U(t, n) {
      for (var e = D(t), r = -1, i = n.length; ++r < i; ) e.remove(n[r])
    }
    function F(t) {
      return function () {
        E(this, t)
      }
    }
    function H(t) {
      return function () {
        U(this, t)
      }
    }
    function Y(t, n) {
      return function () {
        ;(n.apply(this, arguments) ? E : U)(this, t)
      }
    }
    S.prototype = {
      add: function (t) {
        this._names.indexOf(t) < 0 &&
          (this._names.push(t),
          this._node.setAttribute('class', this._names.join(' ')))
      },
      remove: function (t) {
        var n = this._names.indexOf(t)
        n >= 0 &&
          (this._names.splice(n, 1),
          this._node.setAttribute('class', this._names.join(' ')))
      },
      contains: function (t) {
        return this._names.indexOf(t) >= 0
      }
    }
    function L() {
      this.textContent = ''
    }
    function j(t) {
      return function () {
        this.textContent = t
      }
    }
    function z(t) {
      return function () {
        var n = t.apply(this, arguments)
        this.textContent = null == n ? '' : n
      }
    }
    function P() {
      this.innerHTML = ''
    }
    function O(t) {
      return function () {
        this.innerHTML = t
      }
    }
    function q(t) {
      return function () {
        var n = t.apply(this, arguments)
        this.innerHTML = null == n ? '' : n
      }
    }
    function $() {
      this.nextSibling && this.parentNode.appendChild(this)
    }
    function B() {
      this.previousSibling &&
        this.parentNode.insertBefore(this, this.parentNode.firstChild)
    }
    function R(t) {
      return function () {
        var n = this.ownerDocument,
          e = this.namespaceURI
        return e === f && n.documentElement.namespaceURI === f
          ? n.createElement(t)
          : n.createElementNS(e, t)
      }
    }
    function V(t) {
      return function () {
        return this.ownerDocument.createElementNS(t.space, t.local)
      }
    }
    var I = function (t) {
      var n = g(t)
      return (n.local ? V : R)(n)
    }
    function W() {
      return null
    }
    function G() {
      var t = this.parentNode
      t && t.removeChild(this)
    }
    function Z() {
      var t = this.cloneNode(!1),
        n = this.parentNode
      return n ? n.insertBefore(t, this.nextSibling) : t
    }
    function X() {
      var t = this.cloneNode(!0),
        n = this.parentNode
      return n ? n.insertBefore(t, this.nextSibling) : t
    }
    var Q = {},
      J = null
    'undefined' != typeof document &&
      ('onmouseenter' in document.documentElement ||
        (Q = { mouseenter: 'mouseover', mouseleave: 'mouseout' }))
    function K(t, n, e) {
      return (
        (t = tt(t, n, e)),
        function (n) {
          var e = n.relatedTarget
          ;(e && (e === this || 8 & e.compareDocumentPosition(this))) ||
            t.call(this, n)
        }
      )
    }
    function tt(t, n, e) {
      return function (r) {
        var i = J
        J = r
        try {
          t.call(this, this.__data__, n, e)
        } finally {
          J = i
        }
      }
    }
    function nt(t) {
      return t
        .trim()
        .split(/^|\s+/)
        .map(function (t) {
          var n = '',
            e = t.indexOf('.')
          return (
            e >= 0 && ((n = t.slice(e + 1)), (t = t.slice(0, e))),
            { type: t, name: n }
          )
        })
    }
    function et(t) {
      return function () {
        var n = this.__on
        if (n) {
          for (var e, r = 0, i = -1, o = n.length; r < o; ++r)
            (e = n[r]),
              (t.type && e.type !== t.type) || e.name !== t.name
                ? (n[++i] = e)
                : this.removeEventListener(e.type, e.listener, e.capture)
          ++i ? (n.length = i) : delete this.__on
        }
      }
    }
    function rt(t, n, e) {
      var r = Q.hasOwnProperty(t.type) ? K : tt
      return function (i, o, u) {
        var a,
          c = this.__on,
          s = r(n, o, u)
        if (c)
          for (var l = 0, f = c.length; l < f; ++l)
            if ((a = c[l]).type === t.type && a.name === t.name)
              return (
                this.removeEventListener(a.type, a.listener, a.capture),
                this.addEventListener(
                  a.type,
                  (a.listener = s),
                  (a.capture = e)
                ),
                void (a.value = n)
              )
        this.addEventListener(t.type, s, e),
          (a = {
            type: t.type,
            name: t.name,
            value: n,
            listener: s,
            capture: e
          }),
          c ? c.push(a) : (this.__on = [a])
      }
    }
    function it(t, n, e) {
      var r = w(t),
        i = r.CustomEvent
      'function' == typeof i
        ? (i = new i(n, e))
        : ((i = r.document.createEvent('Event')),
          e
            ? (i.initEvent(n, e.bubbles, e.cancelable), (i.detail = e.detail))
            : i.initEvent(n, !1, !1)),
        t.dispatchEvent(i)
    }
    function ot(t, n) {
      return function () {
        return it(this, t, n)
      }
    }
    function ut(t, n) {
      return function () {
        return it(this, t, n.apply(this, arguments))
      }
    }
    var at = [null]
    function ct(t, n) {
      ;(this._groups = t), (this._parents = n)
    }
    function st() {
      return new ct([[document.documentElement]], at)
    }
    ct.prototype = st.prototype = {
      constructor: ct,
      select: function (t) {
        'function' != typeof t && (t = i(t))
        for (
          var n = this._groups, e = n.length, r = new Array(e), o = 0;
          o < e;
          ++o
        )
          for (
            var u, a, c = n[o], s = c.length, l = (r[o] = new Array(s)), f = 0;
            f < s;
            ++f
          )
            (u = c[f]) &&
              (a = t.call(u, u.__data__, f, c)) &&
              ('__data__' in u && (a.__data__ = u.__data__), (l[f] = a))
        return new ct(r, this._parents)
      },
      selectAll: function (t) {
        var n
        'function' != typeof t &&
          (t =
            null == (n = t)
              ? o
              : function () {
                  return this.querySelectorAll(n)
                })
        for (
          var e = this._groups, r = e.length, i = [], u = [], a = 0;
          a < r;
          ++a
        )
          for (var c, s = e[a], l = s.length, f = 0; f < l; ++f)
            (c = s[f]) && (i.push(t.call(c, c.__data__, f, s)), u.push(c))
        return new ct(i, u)
      },
      filter: function (t) {
        var n
        'function' != typeof t &&
          ((n = t),
          (t = function () {
            return this.matches(n)
          }))
        for (
          var e = this._groups, r = e.length, i = new Array(r), o = 0;
          o < r;
          ++o
        )
          for (
            var u, a = e[o], c = a.length, s = (i[o] = []), l = 0;
            l < c;
            ++l
          )
            (u = a[l]) && t.call(u, u.__data__, l, a) && s.push(u)
        return new ct(i, this._parents)
      },
      data: function (t, n) {
        if (!t)
          return (
            (y = new Array(this.size())),
            (h = -1),
            this.each(function (t) {
              y[++h] = t
            }),
            y
          )
        var e,
          r = n ? s : c,
          i = this._parents,
          o = this._groups
        'function' != typeof t &&
          ((e = t),
          (t = function () {
            return e
          }))
        for (
          var u = o.length,
            a = new Array(u),
            l = new Array(u),
            f = new Array(u),
            h = 0;
          h < u;
          ++h
        ) {
          var g = i[h],
            p = o[h],
            d = p.length,
            y = t.call(g, g && g.__data__, h, i),
            v = y.length,
            m = (l[h] = new Array(v)),
            _ = (a[h] = new Array(v))
          r(g, p, m, _, (f[h] = new Array(d)), y, n)
          for (var w, x, M = 0, b = 0; M < v; ++M)
            if ((w = m[M])) {
              for (M >= b && (b = M + 1); !(x = _[b]) && ++b < v; );
              w._next = x || null
            }
        }
        return ((a = new ct(a, i))._enter = l), (a._exit = f), a
      },
      enter: function () {
        return new ct(this._enter || this._groups.map(u), this._parents)
      },
      exit: function () {
        return new ct(this._exit || this._groups.map(u), this._parents)
      },
      join: function (t, n, e) {
        var r = this.enter(),
          i = this,
          o = this.exit()
        return (
          (r = 'function' == typeof t ? t(r) : r.append(t + '')),
          null != n && (i = n(i)),
          null == e ? o.remove() : e(o),
          r && i ? r.merge(i).order() : i
        )
      },
      merge: function (t) {
        for (
          var n = this._groups,
            e = t._groups,
            r = n.length,
            i = e.length,
            o = Math.min(r, i),
            u = new Array(r),
            a = 0;
          a < o;
          ++a
        )
          for (
            var c,
              s = n[a],
              l = e[a],
              f = s.length,
              h = (u[a] = new Array(f)),
              g = 0;
            g < f;
            ++g
          )
            (c = s[g] || l[g]) && (h[g] = c)
        for (; a < r; ++a) u[a] = n[a]
        return new ct(u, this._parents)
      },
      order: function () {
        for (var t = this._groups, n = -1, e = t.length; ++n < e; )
          for (var r, i = t[n], o = i.length - 1, u = i[o]; --o >= 0; )
            (r = i[o]) &&
              (u &&
                4 ^ r.compareDocumentPosition(u) &&
                u.parentNode.insertBefore(r, u),
              (u = r))
        return this
      },
      sort: function (t) {
        function n(n, e) {
          return n && e ? t(n.__data__, e.__data__) : !n - !e
        }
        t || (t = l)
        for (
          var e = this._groups, r = e.length, i = new Array(r), o = 0;
          o < r;
          ++o
        ) {
          for (
            var u, a = e[o], c = a.length, s = (i[o] = new Array(c)), f = 0;
            f < c;
            ++f
          )
            (u = a[f]) && (s[f] = u)
          s.sort(n)
        }
        return new ct(i, this._parents).order()
      },
      call: function () {
        var t = arguments[0]
        return (arguments[0] = this), t.apply(null, arguments), this
      },
      nodes: function () {
        var t = new Array(this.size()),
          n = -1
        return (
          this.each(function () {
            t[++n] = this
          }),
          t
        )
      },
      node: function () {
        for (var t = this._groups, n = 0, e = t.length; n < e; ++n)
          for (var r = t[n], i = 0, o = r.length; i < o; ++i) {
            var u = r[i]
            if (u) return u
          }
        return null
      },
      size: function () {
        var t = 0
        return (
          this.each(function () {
            ++t
          }),
          t
        )
      },
      empty: function () {
        return !this.node()
      },
      each: function (t) {
        for (var n = this._groups, e = 0, r = n.length; e < r; ++e)
          for (var i, o = n[e], u = 0, a = o.length; u < a; ++u)
            (i = o[u]) && t.call(i, i.__data__, u, o)
        return this
      },
      attr: function (t, n) {
        var e = g(t)
        if (arguments.length < 2) {
          var r = this.node()
          return e.local
            ? r.getAttributeNS(e.space, e.local)
            : r.getAttribute(e)
        }
        return this.each(
          (null == n
            ? e.local
              ? d
              : p
            : 'function' == typeof n
            ? e.local
              ? _
              : m
            : e.local
            ? v
            : y)(e, n)
        )
      },
      style: function (t, n, e) {
        return arguments.length > 1
          ? this.each(
              (null == n ? x : 'function' == typeof n ? b : M)(
                t,
                n,
                null == e ? '' : e
              )
            )
          : k(this.node(), t)
      },
      property: function (t, n) {
        return arguments.length > 1
          ? this.each((null == n ? T : 'function' == typeof n ? C : A)(t, n))
          : this.node()[t]
      },
      classed: function (t, n) {
        var e = N(t + '')
        if (arguments.length < 2) {
          for (var r = D(this.node()), i = -1, o = e.length; ++i < o; )
            if (!r.contains(e[i])) return !1
          return !0
        }
        return this.each(('function' == typeof n ? Y : n ? F : H)(e, n))
      },
      text: function (t) {
        return arguments.length
          ? this.each(null == t ? L : ('function' == typeof t ? z : j)(t))
          : this.node().textContent
      },
      html: function (t) {
        return arguments.length
          ? this.each(null == t ? P : ('function' == typeof t ? q : O)(t))
          : this.node().innerHTML
      },
      raise: function () {
        return this.each($)
      },
      lower: function () {
        return this.each(B)
      },
      append: function (t) {
        var n = 'function' == typeof t ? t : I(t)
        return this.select(function () {
          return this.appendChild(n.apply(this, arguments))
        })
      },
      insert: function (t, n) {
        var e = 'function' == typeof t ? t : I(t),
          r = null == n ? W : 'function' == typeof n ? n : i(n)
        return this.select(function () {
          return this.insertBefore(
            e.apply(this, arguments),
            r.apply(this, arguments) || null
          )
        })
      },
      remove: function () {
        return this.each(G)
      },
      clone: function (t) {
        return this.select(t ? X : Z)
      },
      datum: function (t) {
        return arguments.length
          ? this.property('__data__', t)
          : this.node().__data__
      },
      on: function (t, n, e) {
        var r,
          i,
          o = nt(t + ''),
          u = o.length
        if (!(arguments.length < 2)) {
          for (a = n ? rt : et, null == e && (e = !1), r = 0; r < u; ++r)
            this.each(a(o[r], n, e))
          return this
        }
        var a = this.node().__on
        if (a)
          for (var c, s = 0, l = a.length; s < l; ++s)
            for (r = 0, c = a[s]; r < u; ++r)
              if ((i = o[r]).type === c.type && i.name === c.name)
                return c.value
      },
      dispatch: function (t, n) {
        return this.each(('function' == typeof n ? ut : ot)(t, n))
      }
    }
    var lt = function (t) {
        return 'string' == typeof t
          ? new ct([[document.querySelector(t)]], [document.documentElement])
          : new ct([[t]], at)
      },
      ft = function (t, n) {
        return t < n ? -1 : t > n ? 1 : t >= n ? 0 : NaN
      },
      ht = function (t) {
        var n
        return (
          1 === t.length &&
            ((n = t),
            (t = function (t, e) {
              return ft(n(t), e)
            })),
          {
            left: function (n, e, r, i) {
              for (null == r && (r = 0), null == i && (i = n.length); r < i; ) {
                var o = (r + i) >>> 1
                t(n[o], e) < 0 ? (r = o + 1) : (i = o)
              }
              return r
            },
            right: function (n, e, r, i) {
              for (null == r && (r = 0), null == i && (i = n.length); r < i; ) {
                var o = (r + i) >>> 1
                t(n[o], e) > 0 ? (i = o) : (r = o + 1)
              }
              return r
            }
          }
        )
      }
    var gt = Math.sqrt(50),
      pt = Math.sqrt(10),
      dt = Math.sqrt(2)
    function yt(t, n, e) {
      var r = (n - t) / Math.max(0, e),
        i = Math.floor(Math.log(r) / Math.LN10),
        o = r / Math.pow(10, i)
      return i >= 0
        ? (o >= gt ? 10 : o >= pt ? 5 : o >= dt ? 2 : 1) * Math.pow(10, i)
        : -Math.pow(10, -i) / (o >= gt ? 10 : o >= pt ? 5 : o >= dt ? 2 : 1)
    }
    function vt(t, n, e) {
      var r = Math.abs(n - t) / Math.max(0, e),
        i = Math.pow(10, Math.floor(Math.log(r) / Math.LN10)),
        o = r / i
      return (
        o >= gt ? (i *= 10) : o >= pt ? (i *= 5) : o >= dt && (i *= 2),
        n < t ? -i : i
      )
    }
    var mt = new Date(),
      _t = new Date()
    function wt(t, n, e, r) {
      function i(n) {
        return t((n = 0 === arguments.length ? new Date() : new Date(+n))), n
      }
      return (
        (i.floor = function (n) {
          return t((n = new Date(+n))), n
        }),
        (i.ceil = function (e) {
          return t((e = new Date(e - 1))), n(e, 1), t(e), e
        }),
        (i.round = function (t) {
          var n = i(t),
            e = i.ceil(t)
          return t - n < e - t ? n : e
        }),
        (i.offset = function (t, e) {
          return n((t = new Date(+t)), null == e ? 1 : Math.floor(e)), t
        }),
        (i.range = function (e, r, o) {
          var u,
            a = []
          if (
            ((e = i.ceil(e)),
            (o = null == o ? 1 : Math.floor(o)),
            !(e < r && o > 0))
          )
            return a
          do {
            a.push((u = new Date(+e))), n(e, o), t(e)
          } while (u < e && e < r)
          return a
        }),
        (i.filter = function (e) {
          return wt(
            function (n) {
              if (n >= n) for (; t(n), !e(n); ) n.setTime(n - 1)
            },
            function (t, r) {
              if (t >= t)
                if (r < 0) for (; ++r <= 0; ) for (; n(t, -1), !e(t); );
                else for (; --r >= 0; ) for (; n(t, 1), !e(t); );
            }
          )
        }),
        e &&
          ((i.count = function (n, r) {
            return (
              mt.setTime(+n),
              _t.setTime(+r),
              t(mt),
              t(_t),
              Math.floor(e(mt, _t))
            )
          }),
          (i.every = function (t) {
            return (
              (t = Math.floor(t)),
              isFinite(t) && t > 0
                ? t > 1
                  ? i.filter(
                      r
                        ? function (n) {
                            return r(n) % t == 0
                          }
                        : function (n) {
                            return i.count(0, n) % t == 0
                          }
                    )
                  : i
                : null
            )
          })),
        i
      )
    }
    var xt = wt(
      function (t) {
        t.setMonth(0, 1), t.setHours(0, 0, 0, 0)
      },
      function (t, n) {
        t.setFullYear(t.getFullYear() + n)
      },
      function (t, n) {
        return n.getFullYear() - t.getFullYear()
      },
      function (t) {
        return t.getFullYear()
      }
    )
    xt.every = function (t) {
      return isFinite((t = Math.floor(t))) && t > 0
        ? wt(
            function (n) {
              n.setFullYear(Math.floor(n.getFullYear() / t) * t),
                n.setMonth(0, 1),
                n.setHours(0, 0, 0, 0)
            },
            function (n, e) {
              n.setFullYear(n.getFullYear() + e * t)
            }
          )
        : null
    }
    var Mt = xt,
      bt =
        (xt.range,
        wt(
          function (t) {
            t.setDate(1), t.setHours(0, 0, 0, 0)
          },
          function (t, n) {
            t.setMonth(t.getMonth() + n)
          },
          function (t, n) {
            return (
              n.getMonth() -
              t.getMonth() +
              12 * (n.getFullYear() - t.getFullYear())
            )
          },
          function (t) {
            return t.getMonth()
          }
        )),
      kt = bt
    bt.range
    function Tt(t) {
      return wt(
        function (n) {
          n.setDate(n.getDate() - ((n.getDay() + 7 - t) % 7)),
            n.setHours(0, 0, 0, 0)
        },
        function (t, n) {
          t.setDate(t.getDate() + 7 * n)
        },
        function (t, n) {
          return (
            (n - t - 6e4 * (n.getTimezoneOffset() - t.getTimezoneOffset())) /
            6048e5
          )
        }
      )
    }
    var At = Tt(0),
      Ct = Tt(1),
      Nt = Tt(2),
      Dt = Tt(3),
      St = Tt(4),
      Et = Tt(5),
      Ut = Tt(6),
      Ft =
        (At.range,
        Ct.range,
        Nt.range,
        Dt.range,
        St.range,
        Et.range,
        Ut.range,
        wt(
          function (t) {
            t.setHours(0, 0, 0, 0)
          },
          function (t, n) {
            t.setDate(t.getDate() + n)
          },
          function (t, n) {
            return (
              (n - t - 6e4 * (n.getTimezoneOffset() - t.getTimezoneOffset())) /
              864e5
            )
          },
          function (t) {
            return t.getDate() - 1
          }
        )),
      Ht = Ft,
      Yt =
        (Ft.range,
        wt(
          function (t) {
            t.setTime(
              t -
                t.getMilliseconds() -
                1e3 * t.getSeconds() -
                6e4 * t.getMinutes()
            )
          },
          function (t, n) {
            t.setTime(+t + 36e5 * n)
          },
          function (t, n) {
            return (n - t) / 36e5
          },
          function (t) {
            return t.getHours()
          }
        )),
      Lt = Yt,
      jt =
        (Yt.range,
        wt(
          function (t) {
            t.setTime(t - t.getMilliseconds() - 1e3 * t.getSeconds())
          },
          function (t, n) {
            t.setTime(+t + 6e4 * n)
          },
          function (t, n) {
            return (n - t) / 6e4
          },
          function (t) {
            return t.getMinutes()
          }
        )),
      zt = jt,
      Pt =
        (jt.range,
        wt(
          function (t) {
            t.setTime(t - t.getMilliseconds())
          },
          function (t, n) {
            t.setTime(+t + 1e3 * n)
          },
          function (t, n) {
            return (n - t) / 1e3
          },
          function (t) {
            return t.getUTCSeconds()
          }
        )),
      Ot = Pt,
      qt =
        (Pt.range,
        wt(
          function () {},
          function (t, n) {
            t.setTime(+t + n)
          },
          function (t, n) {
            return n - t
          }
        ))
    qt.every = function (t) {
      return (
        (t = Math.floor(t)),
        isFinite(t) && t > 0
          ? t > 1
            ? wt(
                function (n) {
                  n.setTime(Math.floor(n / t) * t)
                },
                function (n, e) {
                  n.setTime(+n + e * t)
                },
                function (n, e) {
                  return (e - n) / t
                }
              )
            : qt
          : null
      )
    }
    var $t = qt
    qt.range
    function Bt(t) {
      return wt(
        function (n) {
          n.setUTCDate(n.getUTCDate() - ((n.getUTCDay() + 7 - t) % 7)),
            n.setUTCHours(0, 0, 0, 0)
        },
        function (t, n) {
          t.setUTCDate(t.getUTCDate() + 7 * n)
        },
        function (t, n) {
          return (n - t) / 6048e5
        }
      )
    }
    var Rt = Bt(0),
      Vt = Bt(1),
      It = Bt(2),
      Wt = Bt(3),
      Gt = Bt(4),
      Zt = Bt(5),
      Xt = Bt(6),
      Qt =
        (Rt.range,
        Vt.range,
        It.range,
        Wt.range,
        Gt.range,
        Zt.range,
        Xt.range,
        wt(
          function (t) {
            t.setUTCHours(0, 0, 0, 0)
          },
          function (t, n) {
            t.setUTCDate(t.getUTCDate() + n)
          },
          function (t, n) {
            return (n - t) / 864e5
          },
          function (t) {
            return t.getUTCDate() - 1
          }
        )),
      Jt = Qt,
      Kt =
        (Qt.range,
        wt(
          function (t) {
            t.setUTCMonth(0, 1), t.setUTCHours(0, 0, 0, 0)
          },
          function (t, n) {
            t.setUTCFullYear(t.getUTCFullYear() + n)
          },
          function (t, n) {
            return n.getUTCFullYear() - t.getUTCFullYear()
          },
          function (t) {
            return t.getUTCFullYear()
          }
        ))
    Kt.every = function (t) {
      return isFinite((t = Math.floor(t))) && t > 0
        ? wt(
            function (n) {
              n.setUTCFullYear(Math.floor(n.getUTCFullYear() / t) * t),
                n.setUTCMonth(0, 1),
                n.setUTCHours(0, 0, 0, 0)
            },
            function (n, e) {
              n.setUTCFullYear(n.getUTCFullYear() + e * t)
            }
          )
        : null
    }
    var tn = Kt
    Kt.range
    function nn(t) {
      if (0 <= t.y && t.y < 100) {
        var n = new Date(-1, t.m, t.d, t.H, t.M, t.S, t.L)
        return n.setFullYear(t.y), n
      }
      return new Date(t.y, t.m, t.d, t.H, t.M, t.S, t.L)
    }
    function en(t) {
      if (0 <= t.y && t.y < 100) {
        var n = new Date(Date.UTC(-1, t.m, t.d, t.H, t.M, t.S, t.L))
        return n.setUTCFullYear(t.y), n
      }
      return new Date(Date.UTC(t.y, t.m, t.d, t.H, t.M, t.S, t.L))
    }
    function rn(t, n, e) {
      return { y: t, m: n, d: e, H: 0, M: 0, S: 0, L: 0 }
    }
    var on,
      un,
      an,
      cn = { '-': '', _: ' ', 0: '0' },
      sn = /^\s*\d+/,
      ln = /^%/,
      fn = /[\\^$*+?|[\]().{}]/g
    function hn(t, n, e) {
      var r = t < 0 ? '-' : '',
        i = (r ? -t : t) + '',
        o = i.length
      return r + (o < e ? new Array(e - o + 1).join(n) + i : i)
    }
    function gn(t) {
      return t.replace(fn, '\\$&')
    }
    function pn(t) {
      return new RegExp('^(?:' + t.map(gn).join('|') + ')', 'i')
    }
    function dn(t) {
      for (var n = {}, e = -1, r = t.length; ++e < r; )
        n[t[e].toLowerCase()] = e
      return n
    }
    function yn(t, n, e) {
      var r = sn.exec(n.slice(e, e + 1))
      return r ? ((t.w = +r[0]), e + r[0].length) : -1
    }
    function vn(t, n, e) {
      var r = sn.exec(n.slice(e, e + 1))
      return r ? ((t.u = +r[0]), e + r[0].length) : -1
    }
    function mn(t, n, e) {
      var r = sn.exec(n.slice(e, e + 2))
      return r ? ((t.U = +r[0]), e + r[0].length) : -1
    }
    function _n(t, n, e) {
      var r = sn.exec(n.slice(e, e + 2))
      return r ? ((t.V = +r[0]), e + r[0].length) : -1
    }
    function wn(t, n, e) {
      var r = sn.exec(n.slice(e, e + 2))
      return r ? ((t.W = +r[0]), e + r[0].length) : -1
    }
    function xn(t, n, e) {
      var r = sn.exec(n.slice(e, e + 4))
      return r ? ((t.y = +r[0]), e + r[0].length) : -1
    }
    function Mn(t, n, e) {
      var r = sn.exec(n.slice(e, e + 2))
      return r
        ? ((t.y = +r[0] + (+r[0] > 68 ? 1900 : 2e3)), e + r[0].length)
        : -1
    }
    function bn(t, n, e) {
      var r = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(n.slice(e, e + 6))
      return r
        ? ((t.Z = r[1] ? 0 : -(r[2] + (r[3] || '00'))), e + r[0].length)
        : -1
    }
    function kn(t, n, e) {
      var r = sn.exec(n.slice(e, e + 1))
      return r ? ((t.q = 3 * r[0] - 3), e + r[0].length) : -1
    }
    function Tn(t, n, e) {
      var r = sn.exec(n.slice(e, e + 2))
      return r ? ((t.m = r[0] - 1), e + r[0].length) : -1
    }
    function An(t, n, e) {
      var r = sn.exec(n.slice(e, e + 2))
      return r ? ((t.d = +r[0]), e + r[0].length) : -1
    }
    function Cn(t, n, e) {
      var r = sn.exec(n.slice(e, e + 3))
      return r ? ((t.m = 0), (t.d = +r[0]), e + r[0].length) : -1
    }
    function Nn(t, n, e) {
      var r = sn.exec(n.slice(e, e + 2))
      return r ? ((t.H = +r[0]), e + r[0].length) : -1
    }
    function Dn(t, n, e) {
      var r = sn.exec(n.slice(e, e + 2))
      return r ? ((t.M = +r[0]), e + r[0].length) : -1
    }
    function Sn(t, n, e) {
      var r = sn.exec(n.slice(e, e + 2))
      return r ? ((t.S = +r[0]), e + r[0].length) : -1
    }
    function En(t, n, e) {
      var r = sn.exec(n.slice(e, e + 3))
      return r ? ((t.L = +r[0]), e + r[0].length) : -1
    }
    function Un(t, n, e) {
      var r = sn.exec(n.slice(e, e + 6))
      return r ? ((t.L = Math.floor(r[0] / 1e3)), e + r[0].length) : -1
    }
    function Fn(t, n, e) {
      var r = ln.exec(n.slice(e, e + 1))
      return r ? e + r[0].length : -1
    }
    function Hn(t, n, e) {
      var r = sn.exec(n.slice(e))
      return r ? ((t.Q = +r[0]), e + r[0].length) : -1
    }
    function Yn(t, n, e) {
      var r = sn.exec(n.slice(e))
      return r ? ((t.s = +r[0]), e + r[0].length) : -1
    }
    function Ln(t, n) {
      return hn(t.getDate(), n, 2)
    }
    function jn(t, n) {
      return hn(t.getHours(), n, 2)
    }
    function zn(t, n) {
      return hn(t.getHours() % 12 || 12, n, 2)
    }
    function Pn(t, n) {
      return hn(1 + Ht.count(Mt(t), t), n, 3)
    }
    function On(t, n) {
      return hn(t.getMilliseconds(), n, 3)
    }
    function qn(t, n) {
      return On(t, n) + '000'
    }
    function $n(t, n) {
      return hn(t.getMonth() + 1, n, 2)
    }
    function Bn(t, n) {
      return hn(t.getMinutes(), n, 2)
    }
    function Rn(t, n) {
      return hn(t.getSeconds(), n, 2)
    }
    function Vn(t) {
      var n = t.getDay()
      return 0 === n ? 7 : n
    }
    function In(t, n) {
      return hn(At.count(Mt(t) - 1, t), n, 2)
    }
    function Wn(t, n) {
      var e = t.getDay()
      return (
        (t = e >= 4 || 0 === e ? St(t) : St.ceil(t)),
        hn(St.count(Mt(t), t) + (4 === Mt(t).getDay()), n, 2)
      )
    }
    function Gn(t) {
      return t.getDay()
    }
    function Zn(t, n) {
      return hn(Ct.count(Mt(t) - 1, t), n, 2)
    }
    function Xn(t, n) {
      return hn(t.getFullYear() % 100, n, 2)
    }
    function Qn(t, n) {
      return hn(t.getFullYear() % 1e4, n, 4)
    }
    function Jn(t) {
      var n = t.getTimezoneOffset()
      return (
        (n > 0 ? '-' : ((n *= -1), '+')) +
        hn((n / 60) | 0, '0', 2) +
        hn(n % 60, '0', 2)
      )
    }
    function Kn(t, n) {
      return hn(t.getUTCDate(), n, 2)
    }
    function te(t, n) {
      return hn(t.getUTCHours(), n, 2)
    }
    function ne(t, n) {
      return hn(t.getUTCHours() % 12 || 12, n, 2)
    }
    function ee(t, n) {
      return hn(1 + Jt.count(tn(t), t), n, 3)
    }
    function re(t, n) {
      return hn(t.getUTCMilliseconds(), n, 3)
    }
    function ie(t, n) {
      return re(t, n) + '000'
    }
    function oe(t, n) {
      return hn(t.getUTCMonth() + 1, n, 2)
    }
    function ue(t, n) {
      return hn(t.getUTCMinutes(), n, 2)
    }
    function ae(t, n) {
      return hn(t.getUTCSeconds(), n, 2)
    }
    function ce(t) {
      var n = t.getUTCDay()
      return 0 === n ? 7 : n
    }
    function se(t, n) {
      return hn(Rt.count(tn(t) - 1, t), n, 2)
    }
    function le(t, n) {
      var e = t.getUTCDay()
      return (
        (t = e >= 4 || 0 === e ? Gt(t) : Gt.ceil(t)),
        hn(Gt.count(tn(t), t) + (4 === tn(t).getUTCDay()), n, 2)
      )
    }
    function fe(t) {
      return t.getUTCDay()
    }
    function he(t, n) {
      return hn(Vt.count(tn(t) - 1, t), n, 2)
    }
    function ge(t, n) {
      return hn(t.getUTCFullYear() % 100, n, 2)
    }
    function pe(t, n) {
      return hn(t.getUTCFullYear() % 1e4, n, 4)
    }
    function de() {
      return '+0000'
    }
    function ye() {
      return '%'
    }
    function ve(t) {
      return +t
    }
    function me(t) {
      return Math.floor(+t / 1e3)
    }
    ;(on = (function (t) {
      var n = t.dateTime,
        e = t.date,
        r = t.time,
        i = t.periods,
        o = t.days,
        u = t.shortDays,
        a = t.months,
        c = t.shortMonths,
        s = pn(i),
        l = dn(i),
        f = pn(o),
        h = dn(o),
        g = pn(u),
        p = dn(u),
        d = pn(a),
        y = dn(a),
        v = pn(c),
        m = dn(c),
        _ = {
          a: function (t) {
            return u[t.getDay()]
          },
          A: function (t) {
            return o[t.getDay()]
          },
          b: function (t) {
            return c[t.getMonth()]
          },
          B: function (t) {
            return a[t.getMonth()]
          },
          c: null,
          d: Ln,
          e: Ln,
          f: qn,
          H: jn,
          I: zn,
          j: Pn,
          L: On,
          m: $n,
          M: Bn,
          p: function (t) {
            return i[+(t.getHours() >= 12)]
          },
          q: function (t) {
            return 1 + ~~(t.getMonth() / 3)
          },
          Q: ve,
          s: me,
          S: Rn,
          u: Vn,
          U: In,
          V: Wn,
          w: Gn,
          W: Zn,
          x: null,
          X: null,
          y: Xn,
          Y: Qn,
          Z: Jn,
          '%': ye
        },
        w = {
          a: function (t) {
            return u[t.getUTCDay()]
          },
          A: function (t) {
            return o[t.getUTCDay()]
          },
          b: function (t) {
            return c[t.getUTCMonth()]
          },
          B: function (t) {
            return a[t.getUTCMonth()]
          },
          c: null,
          d: Kn,
          e: Kn,
          f: ie,
          H: te,
          I: ne,
          j: ee,
          L: re,
          m: oe,
          M: ue,
          p: function (t) {
            return i[+(t.getUTCHours() >= 12)]
          },
          q: function (t) {
            return 1 + ~~(t.getUTCMonth() / 3)
          },
          Q: ve,
          s: me,
          S: ae,
          u: ce,
          U: se,
          V: le,
          w: fe,
          W: he,
          x: null,
          X: null,
          y: ge,
          Y: pe,
          Z: de,
          '%': ye
        },
        x = {
          a: function (t, n, e) {
            var r = g.exec(n.slice(e))
            return r ? ((t.w = p[r[0].toLowerCase()]), e + r[0].length) : -1
          },
          A: function (t, n, e) {
            var r = f.exec(n.slice(e))
            return r ? ((t.w = h[r[0].toLowerCase()]), e + r[0].length) : -1
          },
          b: function (t, n, e) {
            var r = v.exec(n.slice(e))
            return r ? ((t.m = m[r[0].toLowerCase()]), e + r[0].length) : -1
          },
          B: function (t, n, e) {
            var r = d.exec(n.slice(e))
            return r ? ((t.m = y[r[0].toLowerCase()]), e + r[0].length) : -1
          },
          c: function (t, e, r) {
            return k(t, n, e, r)
          },
          d: An,
          e: An,
          f: Un,
          H: Nn,
          I: Nn,
          j: Cn,
          L: En,
          m: Tn,
          M: Dn,
          p: function (t, n, e) {
            var r = s.exec(n.slice(e))
            return r ? ((t.p = l[r[0].toLowerCase()]), e + r[0].length) : -1
          },
          q: kn,
          Q: Hn,
          s: Yn,
          S: Sn,
          u: vn,
          U: mn,
          V: _n,
          w: yn,
          W: wn,
          x: function (t, n, r) {
            return k(t, e, n, r)
          },
          X: function (t, n, e) {
            return k(t, r, n, e)
          },
          y: Mn,
          Y: xn,
          Z: bn,
          '%': Fn
        }
      function M(t, n) {
        return function (e) {
          var r,
            i,
            o,
            u = [],
            a = -1,
            c = 0,
            s = t.length
          for (e instanceof Date || (e = new Date(+e)); ++a < s; )
            37 === t.charCodeAt(a) &&
              (u.push(t.slice(c, a)),
              null != (i = cn[(r = t.charAt(++a))])
                ? (r = t.charAt(++a))
                : (i = 'e' === r ? ' ' : '0'),
              (o = n[r]) && (r = o(e, i)),
              u.push(r),
              (c = a + 1))
          return u.push(t.slice(c, a)), u.join('')
        }
      }
      function b(t, n) {
        return function (e) {
          var r,
            i,
            o = rn(1900, void 0, 1)
          if (k(o, t, (e += ''), 0) != e.length) return null
          if ('Q' in o) return new Date(o.Q)
          if ('s' in o) return new Date(1e3 * o.s + ('L' in o ? o.L : 0))
          if (
            (n && !('Z' in o) && (o.Z = 0),
            'p' in o && (o.H = (o.H % 12) + 12 * o.p),
            void 0 === o.m && (o.m = 'q' in o ? o.q : 0),
            'V' in o)
          ) {
            if (o.V < 1 || o.V > 53) return null
            'w' in o || (o.w = 1),
              'Z' in o
                ? ((i = (r = en(rn(o.y, 0, 1))).getUTCDay()),
                  (r = i > 4 || 0 === i ? Vt.ceil(r) : Vt(r)),
                  (r = Jt.offset(r, 7 * (o.V - 1))),
                  (o.y = r.getUTCFullYear()),
                  (o.m = r.getUTCMonth()),
                  (o.d = r.getUTCDate() + ((o.w + 6) % 7)))
                : ((i = (r = nn(rn(o.y, 0, 1))).getDay()),
                  (r = i > 4 || 0 === i ? Ct.ceil(r) : Ct(r)),
                  (r = Ht.offset(r, 7 * (o.V - 1))),
                  (o.y = r.getFullYear()),
                  (o.m = r.getMonth()),
                  (o.d = r.getDate() + ((o.w + 6) % 7)))
          } else
            ('W' in o || 'U' in o) &&
              ('w' in o || (o.w = 'u' in o ? o.u % 7 : 'W' in o ? 1 : 0),
              (i =
                'Z' in o
                  ? en(rn(o.y, 0, 1)).getUTCDay()
                  : nn(rn(o.y, 0, 1)).getDay()),
              (o.m = 0),
              (o.d =
                'W' in o
                  ? ((o.w + 6) % 7) + 7 * o.W - ((i + 5) % 7)
                  : o.w + 7 * o.U - ((i + 6) % 7)))
          return 'Z' in o
            ? ((o.H += (o.Z / 100) | 0), (o.M += o.Z % 100), en(o))
            : nn(o)
        }
      }
      function k(t, n, e, r) {
        for (var i, o, u = 0, a = n.length, c = e.length; u < a; ) {
          if (r >= c) return -1
          if (37 === (i = n.charCodeAt(u++))) {
            if (
              ((i = n.charAt(u++)),
              !(o = x[i in cn ? n.charAt(u++) : i]) || (r = o(t, e, r)) < 0)
            )
              return -1
          } else if (i != e.charCodeAt(r++)) return -1
        }
        return r
      }
      return (
        (_.x = M(e, _)),
        (_.X = M(r, _)),
        (_.c = M(n, _)),
        (w.x = M(e, w)),
        (w.X = M(r, w)),
        (w.c = M(n, w)),
        {
          format: function (t) {
            var n = M((t += ''), _)
            return (
              (n.toString = function () {
                return t
              }),
              n
            )
          },
          parse: function (t) {
            var n = b((t += ''), !1)
            return (
              (n.toString = function () {
                return t
              }),
              n
            )
          },
          utcFormat: function (t) {
            var n = M((t += ''), w)
            return (
              (n.toString = function () {
                return t
              }),
              n
            )
          },
          utcParse: function (t) {
            var n = b((t += ''), !0)
            return (
              (n.toString = function () {
                return t
              }),
              n
            )
          }
        }
      )
    })({
      dateTime: '%x, %X',
      date: '%-m/%-d/%Y',
      time: '%-I:%M:%S %p',
      periods: ['AM', 'PM'],
      days: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      shortMonths: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ]
    })),
      (un = on.format),
      (an = on.parse),
      on.utcFormat,
      on.utcParse
    var _e = ht(ft),
      we = _e.right,
      xe = (_e.left, we),
      Me = function (t, n, e) {
        ;(t.prototype = n.prototype = e), (e.constructor = t)
      }
    function be(t, n) {
      var e = Object.create(t.prototype)
      for (var r in n) e[r] = n[r]
      return e
    }
    function ke() {}
    var Te = '\\s*([+-]?\\d+)\\s*',
      Ae = '\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*',
      Ce = '\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*',
      Ne = /^#([0-9a-f]{3,8})$/,
      De = new RegExp('^rgb\\(' + [Te, Te, Te] + '\\)$'),
      Se = new RegExp('^rgb\\(' + [Ce, Ce, Ce] + '\\)$'),
      Ee = new RegExp('^rgba\\(' + [Te, Te, Te, Ae] + '\\)$'),
      Ue = new RegExp('^rgba\\(' + [Ce, Ce, Ce, Ae] + '\\)$'),
      Fe = new RegExp('^hsl\\(' + [Ae, Ce, Ce] + '\\)$'),
      He = new RegExp('^hsla\\(' + [Ae, Ce, Ce, Ae] + '\\)$'),
      Ye = {
        aliceblue: 15792383,
        antiquewhite: 16444375,
        aqua: 65535,
        aquamarine: 8388564,
        azure: 15794175,
        beige: 16119260,
        bisque: 16770244,
        black: 0,
        blanchedalmond: 16772045,
        blue: 255,
        blueviolet: 9055202,
        brown: 10824234,
        burlywood: 14596231,
        cadetblue: 6266528,
        chartreuse: 8388352,
        chocolate: 13789470,
        coral: 16744272,
        cornflowerblue: 6591981,
        cornsilk: 16775388,
        crimson: 14423100,
        cyan: 65535,
        darkblue: 139,
        darkcyan: 35723,
        darkgoldenrod: 12092939,
        darkgray: 11119017,
        darkgreen: 25600,
        darkgrey: 11119017,
        darkkhaki: 12433259,
        darkmagenta: 9109643,
        darkolivegreen: 5597999,
        darkorange: 16747520,
        darkorchid: 10040012,
        darkred: 9109504,
        darksalmon: 15308410,
        darkseagreen: 9419919,
        darkslateblue: 4734347,
        darkslategray: 3100495,
        darkslategrey: 3100495,
        darkturquoise: 52945,
        darkviolet: 9699539,
        deeppink: 16716947,
        deepskyblue: 49151,
        dimgray: 6908265,
        dimgrey: 6908265,
        dodgerblue: 2003199,
        firebrick: 11674146,
        floralwhite: 16775920,
        forestgreen: 2263842,
        fuchsia: 16711935,
        gainsboro: 14474460,
        ghostwhite: 16316671,
        gold: 16766720,
        goldenrod: 14329120,
        gray: 8421504,
        green: 32768,
        greenyellow: 11403055,
        grey: 8421504,
        honeydew: 15794160,
        hotpink: 16738740,
        indianred: 13458524,
        indigo: 4915330,
        ivory: 16777200,
        khaki: 15787660,
        lavender: 15132410,
        lavenderblush: 16773365,
        lawngreen: 8190976,
        lemonchiffon: 16775885,
        lightblue: 11393254,
        lightcoral: 15761536,
        lightcyan: 14745599,
        lightgoldenrodyellow: 16448210,
        lightgray: 13882323,
        lightgreen: 9498256,
        lightgrey: 13882323,
        lightpink: 16758465,
        lightsalmon: 16752762,
        lightseagreen: 2142890,
        lightskyblue: 8900346,
        lightslategray: 7833753,
        lightslategrey: 7833753,
        lightsteelblue: 11584734,
        lightyellow: 16777184,
        lime: 65280,
        limegreen: 3329330,
        linen: 16445670,
        magenta: 16711935,
        maroon: 8388608,
        mediumaquamarine: 6737322,
        mediumblue: 205,
        mediumorchid: 12211667,
        mediumpurple: 9662683,
        mediumseagreen: 3978097,
        mediumslateblue: 8087790,
        mediumspringgreen: 64154,
        mediumturquoise: 4772300,
        mediumvioletred: 13047173,
        midnightblue: 1644912,
        mintcream: 16121850,
        mistyrose: 16770273,
        moccasin: 16770229,
        navajowhite: 16768685,
        navy: 128,
        oldlace: 16643558,
        olive: 8421376,
        olivedrab: 7048739,
        orange: 16753920,
        orangered: 16729344,
        orchid: 14315734,
        palegoldenrod: 15657130,
        palegreen: 10025880,
        paleturquoise: 11529966,
        palevioletred: 14381203,
        papayawhip: 16773077,
        peachpuff: 16767673,
        peru: 13468991,
        pink: 16761035,
        plum: 14524637,
        powderblue: 11591910,
        purple: 8388736,
        rebeccapurple: 6697881,
        red: 16711680,
        rosybrown: 12357519,
        royalblue: 4286945,
        saddlebrown: 9127187,
        salmon: 16416882,
        sandybrown: 16032864,
        seagreen: 3050327,
        seashell: 16774638,
        sienna: 10506797,
        silver: 12632256,
        skyblue: 8900331,
        slateblue: 6970061,
        slategray: 7372944,
        slategrey: 7372944,
        snow: 16775930,
        springgreen: 65407,
        steelblue: 4620980,
        tan: 13808780,
        teal: 32896,
        thistle: 14204888,
        tomato: 16737095,
        turquoise: 4251856,
        violet: 15631086,
        wheat: 16113331,
        white: 16777215,
        whitesmoke: 16119285,
        yellow: 16776960,
        yellowgreen: 10145074
      }
    function Le() {
      return this.rgb().formatHex()
    }
    function je() {
      return this.rgb().formatRgb()
    }
    function ze(t) {
      var n, e
      return (
        (t = (t + '').trim().toLowerCase()),
        (n = Ne.exec(t))
          ? ((e = n[1].length),
            (n = parseInt(n[1], 16)),
            6 === e
              ? Pe(n)
              : 3 === e
              ? new Be(
                  ((n >> 8) & 15) | ((n >> 4) & 240),
                  ((n >> 4) & 15) | (240 & n),
                  ((15 & n) << 4) | (15 & n),
                  1
                )
              : 8 === e
              ? Oe(
                  (n >> 24) & 255,
                  (n >> 16) & 255,
                  (n >> 8) & 255,
                  (255 & n) / 255
                )
              : 4 === e
              ? Oe(
                  ((n >> 12) & 15) | ((n >> 8) & 240),
                  ((n >> 8) & 15) | ((n >> 4) & 240),
                  ((n >> 4) & 15) | (240 & n),
                  (((15 & n) << 4) | (15 & n)) / 255
                )
              : null)
          : (n = De.exec(t))
          ? new Be(n[1], n[2], n[3], 1)
          : (n = Se.exec(t))
          ? new Be(
              (255 * n[1]) / 100,
              (255 * n[2]) / 100,
              (255 * n[3]) / 100,
              1
            )
          : (n = Ee.exec(t))
          ? Oe(n[1], n[2], n[3], n[4])
          : (n = Ue.exec(t))
          ? Oe((255 * n[1]) / 100, (255 * n[2]) / 100, (255 * n[3]) / 100, n[4])
          : (n = Fe.exec(t))
          ? We(n[1], n[2] / 100, n[3] / 100, 1)
          : (n = He.exec(t))
          ? We(n[1], n[2] / 100, n[3] / 100, n[4])
          : Ye.hasOwnProperty(t)
          ? Pe(Ye[t])
          : 'transparent' === t
          ? new Be(NaN, NaN, NaN, 0)
          : null
      )
    }
    function Pe(t) {
      return new Be((t >> 16) & 255, (t >> 8) & 255, 255 & t, 1)
    }
    function Oe(t, n, e, r) {
      return r <= 0 && (t = n = e = NaN), new Be(t, n, e, r)
    }
    function qe(t) {
      return (
        t instanceof ke || (t = ze(t)),
        t ? new Be((t = t.rgb()).r, t.g, t.b, t.opacity) : new Be()
      )
    }
    function $e(t, n, e, r) {
      return 1 === arguments.length ? qe(t) : new Be(t, n, e, null == r ? 1 : r)
    }
    function Be(t, n, e, r) {
      ;(this.r = +t), (this.g = +n), (this.b = +e), (this.opacity = +r)
    }
    function Re() {
      return '#' + Ie(this.r) + Ie(this.g) + Ie(this.b)
    }
    function Ve() {
      var t = this.opacity
      return (
        (1 === (t = isNaN(t) ? 1 : Math.max(0, Math.min(1, t)))
          ? 'rgb('
          : 'rgba(') +
        Math.max(0, Math.min(255, Math.round(this.r) || 0)) +
        ', ' +
        Math.max(0, Math.min(255, Math.round(this.g) || 0)) +
        ', ' +
        Math.max(0, Math.min(255, Math.round(this.b) || 0)) +
        (1 === t ? ')' : ', ' + t + ')')
      )
    }
    function Ie(t) {
      return (
        ((t = Math.max(0, Math.min(255, Math.round(t) || 0))) < 16 ? '0' : '') +
        t.toString(16)
      )
    }
    function We(t, n, e, r) {
      return (
        r <= 0
          ? (t = n = e = NaN)
          : e <= 0 || e >= 1
          ? (t = n = NaN)
          : n <= 0 && (t = NaN),
        new Ze(t, n, e, r)
      )
    }
    function Ge(t) {
      if (t instanceof Ze) return new Ze(t.h, t.s, t.l, t.opacity)
      if ((t instanceof ke || (t = ze(t)), !t)) return new Ze()
      if (t instanceof Ze) return t
      var n = (t = t.rgb()).r / 255,
        e = t.g / 255,
        r = t.b / 255,
        i = Math.min(n, e, r),
        o = Math.max(n, e, r),
        u = NaN,
        a = o - i,
        c = (o + i) / 2
      return (
        a
          ? ((u =
              n === o
                ? (e - r) / a + 6 * (e < r)
                : e === o
                ? (r - n) / a + 2
                : (n - e) / a + 4),
            (a /= c < 0.5 ? o + i : 2 - o - i),
            (u *= 60))
          : (a = c > 0 && c < 1 ? 0 : u),
        new Ze(u, a, c, t.opacity)
      )
    }
    function Ze(t, n, e, r) {
      ;(this.h = +t), (this.s = +n), (this.l = +e), (this.opacity = +r)
    }
    function Xe(t, n, e) {
      return (
        255 *
        (t < 60
          ? n + ((e - n) * t) / 60
          : t < 180
          ? e
          : t < 240
          ? n + ((e - n) * (240 - t)) / 60
          : n)
      )
    }
    function Qe(t, n, e, r, i) {
      var o = t * t,
        u = o * t
      return (
        ((1 - 3 * t + 3 * o - u) * n +
          (4 - 6 * o + 3 * u) * e +
          (1 + 3 * t + 3 * o - 3 * u) * r +
          u * i) /
        6
      )
    }
    Me(ke, ze, {
      copy: function (t) {
        return Object.assign(new this.constructor(), this, t)
      },
      displayable: function () {
        return this.rgb().displayable()
      },
      hex: Le,
      formatHex: Le,
      formatHsl: function () {
        return Ge(this).formatHsl()
      },
      formatRgb: je,
      toString: je
    }),
      Me(
        Be,
        $e,
        be(ke, {
          brighter: function (t) {
            return (
              (t = null == t ? 1 / 0.7 : Math.pow(1 / 0.7, t)),
              new Be(this.r * t, this.g * t, this.b * t, this.opacity)
            )
          },
          darker: function (t) {
            return (
              (t = null == t ? 0.7 : Math.pow(0.7, t)),
              new Be(this.r * t, this.g * t, this.b * t, this.opacity)
            )
          },
          rgb: function () {
            return this
          },
          displayable: function () {
            return (
              -0.5 <= this.r &&
              this.r < 255.5 &&
              -0.5 <= this.g &&
              this.g < 255.5 &&
              -0.5 <= this.b &&
              this.b < 255.5 &&
              0 <= this.opacity &&
              this.opacity <= 1
            )
          },
          hex: Re,
          formatHex: Re,
          formatRgb: Ve,
          toString: Ve
        })
      ),
      Me(
        Ze,
        function (t, n, e, r) {
          return 1 === arguments.length
            ? Ge(t)
            : new Ze(t, n, e, null == r ? 1 : r)
        },
        be(ke, {
          brighter: function (t) {
            return (
              (t = null == t ? 1 / 0.7 : Math.pow(1 / 0.7, t)),
              new Ze(this.h, this.s, this.l * t, this.opacity)
            )
          },
          darker: function (t) {
            return (
              (t = null == t ? 0.7 : Math.pow(0.7, t)),
              new Ze(this.h, this.s, this.l * t, this.opacity)
            )
          },
          rgb: function () {
            var t = (this.h % 360) + 360 * (this.h < 0),
              n = isNaN(t) || isNaN(this.s) ? 0 : this.s,
              e = this.l,
              r = e + (e < 0.5 ? e : 1 - e) * n,
              i = 2 * e - r
            return new Be(
              Xe(t >= 240 ? t - 240 : t + 120, i, r),
              Xe(t, i, r),
              Xe(t < 120 ? t + 240 : t - 120, i, r),
              this.opacity
            )
          },
          displayable: function () {
            return (
              ((0 <= this.s && this.s <= 1) || isNaN(this.s)) &&
              0 <= this.l &&
              this.l <= 1 &&
              0 <= this.opacity &&
              this.opacity <= 1
            )
          },
          formatHsl: function () {
            var t = this.opacity
            return (
              (1 === (t = isNaN(t) ? 1 : Math.max(0, Math.min(1, t)))
                ? 'hsl('
                : 'hsla(') +
              (this.h || 0) +
              ', ' +
              100 * (this.s || 0) +
              '%, ' +
              100 * (this.l || 0) +
              '%' +
              (1 === t ? ')' : ', ' + t + ')')
            )
          }
        })
      )
    var Je = function (t) {
      return function () {
        return t
      }
    }
    function Ke(t, n) {
      return function (e) {
        return t + e * n
      }
    }
    function tr(t) {
      return 1 == (t = +t)
        ? nr
        : function (n, e) {
            return e - n
              ? (function (t, n, e) {
                  return (
                    (t = Math.pow(t, e)),
                    (n = Math.pow(n, e) - t),
                    (e = 1 / e),
                    function (r) {
                      return Math.pow(t + r * n, e)
                    }
                  )
                })(n, e, t)
              : Je(isNaN(n) ? e : n)
          }
    }
    function nr(t, n) {
      var e = n - t
      return e ? Ke(t, e) : Je(isNaN(t) ? n : t)
    }
    var er = (function t(n) {
      var e = tr(n)
      function r(t, n) {
        var r = e((t = $e(t)).r, (n = $e(n)).r),
          i = e(t.g, n.g),
          o = e(t.b, n.b),
          u = nr(t.opacity, n.opacity)
        return function (n) {
          return (
            (t.r = r(n)), (t.g = i(n)), (t.b = o(n)), (t.opacity = u(n)), t + ''
          )
        }
      }
      return (r.gamma = t), r
    })(1)
    function rr(t) {
      return function (n) {
        var e,
          r,
          i = n.length,
          o = new Array(i),
          u = new Array(i),
          a = new Array(i)
        for (e = 0; e < i; ++e)
          (r = $e(n[e])),
            (o[e] = r.r || 0),
            (u[e] = r.g || 0),
            (a[e] = r.b || 0)
        return (
          (o = t(o)),
          (u = t(u)),
          (a = t(a)),
          (r.opacity = 1),
          function (t) {
            return (r.r = o(t)), (r.g = u(t)), (r.b = a(t)), r + ''
          }
        )
      }
    }
    rr(function (t) {
      var n = t.length - 1
      return function (e) {
        var r =
            e <= 0 ? (e = 0) : e >= 1 ? ((e = 1), n - 1) : Math.floor(e * n),
          i = t[r],
          o = t[r + 1],
          u = r > 0 ? t[r - 1] : 2 * i - o,
          a = r < n - 1 ? t[r + 2] : 2 * o - i
        return Qe((e - r / n) * n, u, i, o, a)
      }
    }),
      rr(function (t) {
        var n = t.length
        return function (e) {
          var r = Math.floor(((e %= 1) < 0 ? ++e : e) * n),
            i = t[(r + n - 1) % n],
            o = t[r % n],
            u = t[(r + 1) % n],
            a = t[(r + 2) % n]
          return Qe((e - r / n) * n, i, o, u, a)
        }
      })
    var ir = function (t, n) {
      n || (n = [])
      var e,
        r = t ? Math.min(n.length, t.length) : 0,
        i = n.slice()
      return function (o) {
        for (e = 0; e < r; ++e) i[e] = t[e] * (1 - o) + n[e] * o
        return i
      }
    }
    function or(t) {
      return ArrayBuffer.isView(t) && !(t instanceof DataView)
    }
    function ur(t, n) {
      var e,
        r = n ? n.length : 0,
        i = t ? Math.min(r, t.length) : 0,
        o = new Array(i),
        u = new Array(r)
      for (e = 0; e < i; ++e) o[e] = gr(t[e], n[e])
      for (; e < r; ++e) u[e] = n[e]
      return function (t) {
        for (e = 0; e < i; ++e) u[e] = o[e](t)
        return u
      }
    }
    var ar = function (t, n) {
        var e = new Date()
        return (
          (t = +t),
          (n = +n),
          function (r) {
            return e.setTime(t * (1 - r) + n * r), e
          }
        )
      },
      cr = function (t, n) {
        return (
          (t = +t),
          (n = +n),
          function (e) {
            return t * (1 - e) + n * e
          }
        )
      },
      sr = function (t, n) {
        var e,
          r = {},
          i = {}
        for (e in ((null !== t && 'object' == typeof t) || (t = {}),
        (null !== n && 'object' == typeof n) || (n = {}),
        n))
          e in t ? (r[e] = gr(t[e], n[e])) : (i[e] = n[e])
        return function (t) {
          for (e in r) i[e] = r[e](t)
          return i
        }
      },
      lr = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      fr = new RegExp(lr.source, 'g')
    var hr = function (t, n) {
        var e,
          r,
          i,
          o = (lr.lastIndex = fr.lastIndex = 0),
          u = -1,
          a = [],
          c = []
        for (t += '', n += ''; (e = lr.exec(t)) && (r = fr.exec(n)); )
          (i = r.index) > o &&
            ((i = n.slice(o, i)), a[u] ? (a[u] += i) : (a[++u] = i)),
            (e = e[0]) === (r = r[0])
              ? a[u]
                ? (a[u] += r)
                : (a[++u] = r)
              : ((a[++u] = null), c.push({ i: u, x: cr(e, r) })),
            (o = fr.lastIndex)
        return (
          o < n.length && ((i = n.slice(o)), a[u] ? (a[u] += i) : (a[++u] = i)),
          a.length < 2
            ? c[0]
              ? (function (t) {
                  return function (n) {
                    return t(n) + ''
                  }
                })(c[0].x)
              : (function (t) {
                  return function () {
                    return t
                  }
                })(n)
            : ((n = c.length),
              function (t) {
                for (var e, r = 0; r < n; ++r) a[(e = c[r]).i] = e.x(t)
                return a.join('')
              })
        )
      },
      gr = function (t, n) {
        var e,
          r = typeof n
        return null == n || 'boolean' === r
          ? Je(n)
          : ('number' === r
              ? cr
              : 'string' === r
              ? (e = ze(n))
                ? ((n = e), er)
                : hr
              : n instanceof ze
              ? er
              : n instanceof Date
              ? ar
              : or(n)
              ? ir
              : Array.isArray(n)
              ? ur
              : ('function' != typeof n.valueOf &&
                  'function' != typeof n.toString) ||
                isNaN(n)
              ? sr
              : cr)(t, n)
      },
      pr = function (t, n) {
        return (
          (t = +t),
          (n = +n),
          function (e) {
            return Math.round(t * (1 - e) + n * e)
          }
        )
      },
      dr = function (t) {
        return +t
      },
      yr = [0, 1]
    function vr(t) {
      return t
    }
    function mr(t, n) {
      return (n -= t = +t)
        ? function (e) {
            return (e - t) / n
          }
        : ((e = isNaN(n) ? NaN : 0.5),
          function () {
            return e
          })
      var e
    }
    function _r(t, n, e) {
      var r = t[0],
        i = t[1],
        o = n[0],
        u = n[1]
      return (
        i < r
          ? ((r = mr(i, r)), (o = e(u, o)))
          : ((r = mr(r, i)), (o = e(o, u))),
        function (t) {
          return o(r(t))
        }
      )
    }
    function wr(t, n, e) {
      var r = Math.min(t.length, n.length) - 1,
        i = new Array(r),
        o = new Array(r),
        u = -1
      for (
        t[r] < t[0] && ((t = t.slice().reverse()), (n = n.slice().reverse()));
        ++u < r;

      )
        (i[u] = mr(t[u], t[u + 1])), (o[u] = e(n[u], n[u + 1]))
      return function (n) {
        var e = xe(t, n, 1, r) - 1
        return o[e](i[e](n))
      }
    }
    function xr(t, n) {
      return n
        .domain(t.domain())
        .range(t.range())
        .interpolate(t.interpolate())
        .clamp(t.clamp())
        .unknown(t.unknown())
    }
    function Mr() {
      var t,
        n,
        e,
        r,
        i,
        o,
        u = yr,
        a = yr,
        c = gr,
        s = vr
      function l() {
        var t,
          n,
          e,
          c = Math.min(u.length, a.length)
        return (
          s !== vr &&
            ((t = u[0]),
            (n = u[c - 1]),
            t > n && ((e = t), (t = n), (n = e)),
            (s = function (e) {
              return Math.max(t, Math.min(n, e))
            })),
          (r = c > 2 ? wr : _r),
          (i = o = null),
          f
        )
      }
      function f(n) {
        return isNaN((n = +n)) ? e : (i || (i = r(u.map(t), a, c)))(t(s(n)))
      }
      return (
        (f.invert = function (e) {
          return s(n((o || (o = r(a, u.map(t), cr)))(e)))
        }),
        (f.domain = function (t) {
          return arguments.length ? ((u = Array.from(t, dr)), l()) : u.slice()
        }),
        (f.range = function (t) {
          return arguments.length ? ((a = Array.from(t)), l()) : a.slice()
        }),
        (f.rangeRound = function (t) {
          return (a = Array.from(t)), (c = pr), l()
        }),
        (f.clamp = function (t) {
          return arguments.length ? ((s = !!t || vr), l()) : s !== vr
        }),
        (f.interpolate = function (t) {
          return arguments.length ? ((c = t), l()) : c
        }),
        (f.unknown = function (t) {
          return arguments.length ? ((e = t), f) : e
        }),
        function (e, r) {
          return (t = e), (n = r), l()
        }
      )
    }
    function br() {
      return Mr()(vr, vr)
    }
    function kr(t, n) {
      switch (arguments.length) {
        case 0:
          break
        case 1:
          this.range(t)
          break
        default:
          this.range(n).domain(t)
      }
      return this
    }
    function Tr(t) {
      return new Date(t)
    }
    function Ar(t) {
      return t instanceof Date ? +t : +new Date(+t)
    }
    function Cr(t, n, e, r, i, o, u, a, c) {
      var s = br(),
        l = s.invert,
        f = s.domain,
        h = c('.%L'),
        g = c(':%S'),
        p = c('%I:%M'),
        d = c('%I %p'),
        y = c('%a %d'),
        v = c('%b %d'),
        m = c('%B'),
        _ = c('%Y'),
        w = [
          [u, 1, 1e3],
          [u, 5, 5e3],
          [u, 15, 15e3],
          [u, 30, 3e4],
          [o, 1, 6e4],
          [o, 5, 3e5],
          [o, 15, 9e5],
          [o, 30, 18e5],
          [i, 1, 36e5],
          [i, 3, 108e5],
          [i, 6, 216e5],
          [i, 12, 432e5],
          [r, 1, 864e5],
          [r, 2, 1728e5],
          [e, 1, 6048e5],
          [n, 1, 2592e6],
          [n, 3, 7776e6],
          [t, 1, 31536e6]
        ]
      function x(a) {
        return (
          u(a) < a
            ? h
            : o(a) < a
            ? g
            : i(a) < a
            ? p
            : r(a) < a
            ? d
            : n(a) < a
            ? e(a) < a
              ? y
              : v
            : t(a) < a
            ? m
            : _
        )(a)
      }
      function M(n, e, r) {
        if ((null == n && (n = 10), 'number' == typeof n)) {
          var i,
            o = Math.abs(r - e) / n,
            u = ht(function (t) {
              return t[2]
            }).right(w, o)
          return (
            u === w.length
              ? ((i = vt(e / 31536e6, r / 31536e6, n)), (n = t))
              : u
              ? ((i = (u = w[o / w[u - 1][2] < w[u][2] / o ? u - 1 : u])[1]),
                (n = u[0]))
              : ((i = Math.max(vt(e, r, n), 1)), (n = a)),
            n.every(i)
          )
        }
        return n
      }
      return (
        (s.invert = function (t) {
          return new Date(l(t))
        }),
        (s.domain = function (t) {
          return arguments.length ? f(Array.from(t, Ar)) : f().map(Tr)
        }),
        (s.ticks = function (t) {
          var n,
            e = f(),
            r = e[0],
            i = e[e.length - 1],
            o = i < r
          return (
            o && ((n = r), (r = i), (i = n)),
            (n = (n = M(t, r, i)) ? n.range(r, i + 1) : []),
            o ? n.reverse() : n
          )
        }),
        (s.tickFormat = function (t, n) {
          return null == n ? x : c(n)
        }),
        (s.nice = function (t) {
          var n = f()
          return (t = M(t, n[0], n[n.length - 1]))
            ? f(
                (function (t, n) {
                  var e,
                    r = 0,
                    i = (t = t.slice()).length - 1,
                    o = t[r],
                    u = t[i]
                  return (
                    u < o &&
                      ((e = r), (r = i), (i = e), (e = o), (o = u), (u = e)),
                    (t[r] = n.floor(o)),
                    (t[i] = n.ceil(u)),
                    t
                  )
                })(n, t)
              )
            : s
        }),
        (s.copy = function () {
          return xr(s, Cr(t, n, e, r, i, o, u, a, c))
        }),
        s
      )
    }
    var Nr =
      /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i
    function Dr(t) {
      if (!(n = Nr.exec(t))) throw new Error('invalid format: ' + t)
      var n
      return new Sr({
        fill: n[1],
        align: n[2],
        sign: n[3],
        symbol: n[4],
        zero: n[5],
        width: n[6],
        comma: n[7],
        precision: n[8] && n[8].slice(1),
        trim: n[9],
        type: n[10]
      })
    }
    function Sr(t) {
      ;(this.fill = void 0 === t.fill ? ' ' : t.fill + ''),
        (this.align = void 0 === t.align ? '>' : t.align + ''),
        (this.sign = void 0 === t.sign ? '-' : t.sign + ''),
        (this.symbol = void 0 === t.symbol ? '' : t.symbol + ''),
        (this.zero = !!t.zero),
        (this.width = void 0 === t.width ? void 0 : +t.width),
        (this.comma = !!t.comma),
        (this.precision = void 0 === t.precision ? void 0 : +t.precision),
        (this.trim = !!t.trim),
        (this.type = void 0 === t.type ? '' : t.type + '')
    }
    ;(Dr.prototype = Sr.prototype),
      (Sr.prototype.toString = function () {
        return (
          this.fill +
          this.align +
          this.sign +
          this.symbol +
          (this.zero ? '0' : '') +
          (void 0 === this.width ? '' : Math.max(1, 0 | this.width)) +
          (this.comma ? ',' : '') +
          (void 0 === this.precision
            ? ''
            : '.' + Math.max(0, 0 | this.precision)) +
          (this.trim ? '~' : '') +
          this.type
        )
      })
    var Er,
      Ur,
      Fr,
      Hr,
      Yr = function (t, n) {
        if (
          (e = (t = n ? t.toExponential(n - 1) : t.toExponential()).indexOf(
            'e'
          )) < 0
        )
          return null
        var e,
          r = t.slice(0, e)
        return [r.length > 1 ? r[0] + r.slice(2) : r, +t.slice(e + 1)]
      },
      Lr = function (t) {
        return (t = Yr(Math.abs(t))) ? t[1] : NaN
      },
      jr = function (t, n) {
        var e = Yr(t, n)
        if (!e) return t + ''
        var r = e[0],
          i = e[1]
        return i < 0
          ? '0.' + new Array(-i).join('0') + r
          : r.length > i + 1
          ? r.slice(0, i + 1) + '.' + r.slice(i + 1)
          : r + new Array(i - r.length + 2).join('0')
      },
      zr = {
        '%': function (t, n) {
          return (100 * t).toFixed(n)
        },
        b: function (t) {
          return Math.round(t).toString(2)
        },
        c: function (t) {
          return t + ''
        },
        d: function (t) {
          return Math.round(t).toString(10)
        },
        e: function (t, n) {
          return t.toExponential(n)
        },
        f: function (t, n) {
          return t.toFixed(n)
        },
        g: function (t, n) {
          return t.toPrecision(n)
        },
        o: function (t) {
          return Math.round(t).toString(8)
        },
        p: function (t, n) {
          return jr(100 * t, n)
        },
        r: jr,
        s: function (t, n) {
          var e = Yr(t, n)
          if (!e) return t + ''
          var r = e[0],
            i = e[1],
            o = i - (Er = 3 * Math.max(-8, Math.min(8, Math.floor(i / 3)))) + 1,
            u = r.length
          return o === u
            ? r
            : o > u
            ? r + new Array(o - u + 1).join('0')
            : o > 0
            ? r.slice(0, o) + '.' + r.slice(o)
            : '0.' +
              new Array(1 - o).join('0') +
              Yr(t, Math.max(0, n + o - 1))[0]
        },
        X: function (t) {
          return Math.round(t).toString(16).toUpperCase()
        },
        x: function (t) {
          return Math.round(t).toString(16)
        }
      },
      Pr = function (t) {
        return t
      },
      Or = Array.prototype.map,
      qr = [
        'y',
        'z',
        'a',
        'f',
        'p',
        'n',
        'µ',
        'm',
        '',
        'k',
        'M',
        'G',
        'T',
        'P',
        'E',
        'Z',
        'Y'
      ],
      $r = function (t) {
        var n,
          e,
          r =
            void 0 === t.grouping || void 0 === t.thousands
              ? Pr
              : ((n = Or.call(t.grouping, Number)),
                (e = t.thousands + ''),
                function (t, r) {
                  for (
                    var i = t.length, o = [], u = 0, a = n[0], c = 0;
                    i > 0 &&
                    a > 0 &&
                    (c + a + 1 > r && (a = Math.max(1, r - c)),
                    o.push(t.substring((i -= a), i + a)),
                    !((c += a + 1) > r));

                  )
                    a = n[(u = (u + 1) % n.length)]
                  return o.reverse().join(e)
                }),
          i = void 0 === t.currency ? '' : t.currency[0] + '',
          o = void 0 === t.currency ? '' : t.currency[1] + '',
          u = void 0 === t.decimal ? '.' : t.decimal + '',
          a =
            void 0 === t.numerals
              ? Pr
              : (function (t) {
                  return function (n) {
                    return n.replace(/[0-9]/g, function (n) {
                      return t[+n]
                    })
                  }
                })(Or.call(t.numerals, String)),
          c = void 0 === t.percent ? '%' : t.percent + '',
          s = void 0 === t.minus ? '-' : t.minus + '',
          l = void 0 === t.nan ? 'NaN' : t.nan + ''
        function f(t) {
          var n = (t = Dr(t)).fill,
            e = t.align,
            f = t.sign,
            h = t.symbol,
            g = t.zero,
            p = t.width,
            d = t.comma,
            y = t.precision,
            v = t.trim,
            m = t.type
          'n' === m
            ? ((d = !0), (m = 'g'))
            : zr[m] || (void 0 === y && (y = 12), (v = !0), (m = 'g')),
            (g || ('0' === n && '=' === e)) && ((g = !0), (n = '0'), (e = '='))
          var _ =
              '$' === h
                ? i
                : '#' === h && /[boxX]/.test(m)
                ? '0' + m.toLowerCase()
                : '',
            w = '$' === h ? o : /[%p]/.test(m) ? c : '',
            x = zr[m],
            M = /[defgprs%]/.test(m)
          function b(t) {
            var i,
              o,
              c,
              h = _,
              b = w
            if ('c' === m) (b = x(t) + b), (t = '')
            else {
              var k = (t = +t) < 0 || 1 / t < 0
              if (
                ((t = isNaN(t) ? l : x(Math.abs(t), y)),
                v &&
                  (t = (function (t) {
                    t: for (var n, e = t.length, r = 1, i = -1; r < e; ++r)
                      switch (t[r]) {
                        case '.':
                          i = n = r
                          break
                        case '0':
                          0 === i && (i = r), (n = r)
                          break
                        default:
                          if (!+t[r]) break t
                          i > 0 && (i = 0)
                      }
                    return i > 0 ? t.slice(0, i) + t.slice(n + 1) : t
                  })(t)),
                k && 0 == +t && '+' !== f && (k = !1),
                (h =
                  (k ? ('(' === f ? f : s) : '-' === f || '(' === f ? '' : f) +
                  h),
                (b =
                  ('s' === m ? qr[8 + Er / 3] : '') +
                  b +
                  (k && '(' === f ? ')' : '')),
                M)
              )
                for (i = -1, o = t.length; ++i < o; )
                  if (48 > (c = t.charCodeAt(i)) || c > 57) {
                    ;(b = (46 === c ? u + t.slice(i + 1) : t.slice(i)) + b),
                      (t = t.slice(0, i))
                    break
                  }
            }
            d && !g && (t = r(t, 1 / 0))
            var T = h.length + t.length + b.length,
              A = T < p ? new Array(p - T + 1).join(n) : ''
            switch (
              (d &&
                g &&
                ((t = r(A + t, A.length ? p - b.length : 1 / 0)), (A = '')),
              e)
            ) {
              case '<':
                t = h + t + b + A
                break
              case '=':
                t = h + A + t + b
                break
              case '^':
                t = A.slice(0, (T = A.length >> 1)) + h + t + b + A.slice(T)
                break
              default:
                t = A + h + t + b
            }
            return a(t)
          }
          return (
            (y =
              void 0 === y
                ? 6
                : /[gprs]/.test(m)
                ? Math.max(1, Math.min(21, y))
                : Math.max(0, Math.min(20, y))),
            (b.toString = function () {
              return t + ''
            }),
            b
          )
        }
        return {
          format: f,
          formatPrefix: function (t, n) {
            var e = f((((t = Dr(t)).type = 'f'), t)),
              r = 3 * Math.max(-8, Math.min(8, Math.floor(Lr(n) / 3))),
              i = Math.pow(10, -r),
              o = qr[8 + r / 3]
            return function (t) {
              return e(i * t) + o
            }
          }
        }
      }
    !(function (t) {
      ;(Ur = $r(t)), (Fr = Ur.format), (Hr = Ur.formatPrefix)
    })({
      decimal: '.',
      thousands: ',',
      grouping: [3],
      currency: ['$', ''],
      minus: '-'
    })
    var Br = function (t, n, e, r) {
      var i,
        o = vt(t, n, e)
      switch ((r = Dr(null == r ? ',f' : r)).type) {
        case 's':
          var u = Math.max(Math.abs(t), Math.abs(n))
          return (
            null != r.precision ||
              isNaN(
                (i = (function (t, n) {
                  return Math.max(
                    0,
                    3 * Math.max(-8, Math.min(8, Math.floor(Lr(n) / 3))) -
                      Lr(Math.abs(t))
                  )
                })(o, u))
              ) ||
              (r.precision = i),
            Hr(r, u)
          )
        case '':
        case 'e':
        case 'g':
        case 'p':
        case 'r':
          null != r.precision ||
            isNaN(
              (i = (function (t, n) {
                return (
                  (t = Math.abs(t)),
                  (n = Math.abs(n) - t),
                  Math.max(0, Lr(n) - Lr(t)) + 1
                )
              })(o, Math.max(Math.abs(t), Math.abs(n))))
            ) ||
            (r.precision = i - ('e' === r.type))
          break
        case 'f':
        case '%':
          null != r.precision ||
            isNaN(
              (i = (function (t) {
                return Math.max(0, -Lr(Math.abs(t)))
              })(o))
            ) ||
            (r.precision = i - 2 * ('%' === r.type))
      }
      return Fr(r)
    }
    function Rr(t) {
      var n = t.domain
      return (
        (t.ticks = function (t) {
          var e = n()
          return (function (t, n, e) {
            var r,
              i,
              o,
              u,
              a = -1
            if (((e = +e), (t = +t) === (n = +n) && e > 0)) return [t]
            if (
              ((r = n < t) && ((i = t), (t = n), (n = i)),
              0 === (u = yt(t, n, e)) || !isFinite(u))
            )
              return []
            if (u > 0)
              for (
                t = Math.ceil(t / u),
                  n = Math.floor(n / u),
                  o = new Array((i = Math.ceil(n - t + 1)));
                ++a < i;

              )
                o[a] = (t + a) * u
            else
              for (
                t = Math.floor(t * u),
                  n = Math.ceil(n * u),
                  o = new Array((i = Math.ceil(t - n + 1)));
                ++a < i;

              )
                o[a] = (t - a) / u
            return r && o.reverse(), o
          })(e[0], e[e.length - 1], null == t ? 10 : t)
        }),
        (t.tickFormat = function (t, e) {
          var r = n()
          return Br(r[0], r[r.length - 1], null == t ? 10 : t, e)
        }),
        (t.nice = function (e) {
          null == e && (e = 10)
          var r,
            i = n(),
            o = 0,
            u = i.length - 1,
            a = i[o],
            c = i[u]
          return (
            c < a && ((r = a), (a = c), (c = r), (r = o), (o = u), (u = r)),
            (r = yt(a, c, e)) > 0
              ? (r = yt(
                  (a = Math.floor(a / r) * r),
                  (c = Math.ceil(c / r) * r),
                  e
                ))
              : r < 0 &&
                (r = yt(
                  (a = Math.ceil(a * r) / r),
                  (c = Math.floor(c * r) / r),
                  e
                )),
            r > 0
              ? ((i[o] = Math.floor(a / r) * r),
                (i[u] = Math.ceil(c / r) * r),
                n(i))
              : r < 0 &&
                ((i[o] = Math.ceil(a * r) / r),
                (i[u] = Math.floor(c * r) / r),
                n(i)),
            t
          )
        }),
        t
      )
    }
    var Vr = Array.prototype.slice,
      Ir = function (t) {
        return function () {
          return t
        }
      },
      Wr = function (t, n) {
        if ((i = t.length) > 1)
          for (var e, r, i, o = 1, u = t[n[0]], a = u.length; o < i; ++o)
            for (r = u, u = t[n[o]], e = 0; e < a; ++e)
              u[e][1] += u[e][0] = isNaN(r[e][1]) ? r[e][0] : r[e][1]
      },
      Gr = function (t) {
        for (var n = t.length, e = new Array(n); --n >= 0; ) e[n] = n
        return e
      }
    function Zr(t, n) {
      return t[n]
    }
    var Xr = Math.PI,
      Qr = 2 * Xr,
      Jr = Qr - 1e-6
    function Kr() {
      ;(this._x0 = this._y0 = this._x1 = this._y1 = null), (this._ = '')
    }
    function ti() {
      return new Kr()
    }
    Kr.prototype = ti.prototype = {
      constructor: Kr,
      moveTo: function (t, n) {
        this._ +=
          'M' + (this._x0 = this._x1 = +t) + ',' + (this._y0 = this._y1 = +n)
      },
      closePath: function () {
        null !== this._x1 &&
          ((this._x1 = this._x0), (this._y1 = this._y0), (this._ += 'Z'))
      },
      lineTo: function (t, n) {
        this._ += 'L' + (this._x1 = +t) + ',' + (this._y1 = +n)
      },
      quadraticCurveTo: function (t, n, e, r) {
        this._ +=
          'Q' + +t + ',' + +n + ',' + (this._x1 = +e) + ',' + (this._y1 = +r)
      },
      bezierCurveTo: function (t, n, e, r, i, o) {
        this._ +=
          'C' +
          +t +
          ',' +
          +n +
          ',' +
          +e +
          ',' +
          +r +
          ',' +
          (this._x1 = +i) +
          ',' +
          (this._y1 = +o)
      },
      arcTo: function (t, n, e, r, i) {
        ;(t = +t), (n = +n), (e = +e), (r = +r), (i = +i)
        var o = this._x1,
          u = this._y1,
          a = e - t,
          c = r - n,
          s = o - t,
          l = u - n,
          f = s * s + l * l
        if (i < 0) throw new Error('negative radius: ' + i)
        if (null === this._x1)
          this._ += 'M' + (this._x1 = t) + ',' + (this._y1 = n)
        else if (f > 1e-6)
          if (Math.abs(l * a - c * s) > 1e-6 && i) {
            var h = e - o,
              g = r - u,
              p = a * a + c * c,
              d = h * h + g * g,
              y = Math.sqrt(p),
              v = Math.sqrt(f),
              m = i * Math.tan((Xr - Math.acos((p + f - d) / (2 * y * v))) / 2),
              _ = m / v,
              w = m / y
            Math.abs(_ - 1) > 1e-6 &&
              (this._ += 'L' + (t + _ * s) + ',' + (n + _ * l)),
              (this._ +=
                'A' +
                i +
                ',' +
                i +
                ',0,0,' +
                +(l * h > s * g) +
                ',' +
                (this._x1 = t + w * a) +
                ',' +
                (this._y1 = n + w * c))
          } else this._ += 'L' + (this._x1 = t) + ',' + (this._y1 = n)
        else;
      },
      arc: function (t, n, e, r, i, o) {
        ;(t = +t), (n = +n), (o = !!o)
        var u = (e = +e) * Math.cos(r),
          a = e * Math.sin(r),
          c = t + u,
          s = n + a,
          l = 1 ^ o,
          f = o ? r - i : i - r
        if (e < 0) throw new Error('negative radius: ' + e)
        null === this._x1
          ? (this._ += 'M' + c + ',' + s)
          : (Math.abs(this._x1 - c) > 1e-6 || Math.abs(this._y1 - s) > 1e-6) &&
            (this._ += 'L' + c + ',' + s),
          e &&
            (f < 0 && (f = (f % Qr) + Qr),
            f > Jr
              ? (this._ +=
                  'A' +
                  e +
                  ',' +
                  e +
                  ',0,1,' +
                  l +
                  ',' +
                  (t - u) +
                  ',' +
                  (n - a) +
                  'A' +
                  e +
                  ',' +
                  e +
                  ',0,1,' +
                  l +
                  ',' +
                  (this._x1 = c) +
                  ',' +
                  (this._y1 = s))
              : f > 1e-6 &&
                (this._ +=
                  'A' +
                  e +
                  ',' +
                  e +
                  ',0,' +
                  +(f >= Xr) +
                  ',' +
                  l +
                  ',' +
                  (this._x1 = t + e * Math.cos(i)) +
                  ',' +
                  (this._y1 = n + e * Math.sin(i))))
      },
      rect: function (t, n, e, r) {
        this._ +=
          'M' +
          (this._x0 = this._x1 = +t) +
          ',' +
          (this._y0 = this._y1 = +n) +
          'h' +
          +e +
          'v' +
          +r +
          'h' +
          -e +
          'Z'
      },
      toString: function () {
        return this._
      }
    }
    var ni = ti
    function ei(t) {
      this._context = t
    }
    ei.prototype = {
      areaStart: function () {
        this._line = 0
      },
      areaEnd: function () {
        this._line = NaN
      },
      lineStart: function () {
        this._point = 0
      },
      lineEnd: function () {
        ;(this._line || (0 !== this._line && 1 === this._point)) &&
          this._context.closePath(),
          (this._line = 1 - this._line)
      },
      point: function (t, n) {
        switch (((t = +t), (n = +n), this._point)) {
          case 0:
            ;(this._point = 1),
              this._line
                ? this._context.lineTo(t, n)
                : this._context.moveTo(t, n)
            break
          case 1:
            this._point = 2
          default:
            this._context.lineTo(t, n)
        }
      }
    }
    var ri = function (t) {
      return new ei(t)
    }
    function ii(t) {
      return t[0]
    }
    function oi(t) {
      return t[1]
    }
    var ui = function () {
      var t = ii,
        n = null,
        e = Ir(0),
        r = oi,
        i = Ir(!0),
        o = null,
        u = ri,
        a = null
      function c(c) {
        var s,
          l,
          f,
          h,
          g,
          p = c.length,
          d = !1,
          y = new Array(p),
          v = new Array(p)
        for (null == o && (a = u((g = ni()))), s = 0; s <= p; ++s) {
          if (!(s < p && i((h = c[s]), s, c)) === d)
            if ((d = !d)) (l = s), a.areaStart(), a.lineStart()
            else {
              for (a.lineEnd(), a.lineStart(), f = s - 1; f >= l; --f)
                a.point(y[f], v[f])
              a.lineEnd(), a.areaEnd()
            }
          d &&
            ((y[s] = +t(h, s, c)),
            (v[s] = +e(h, s, c)),
            a.point(n ? +n(h, s, c) : y[s], r ? +r(h, s, c) : v[s]))
        }
        if (g) return (a = null), g + '' || null
      }
      function s() {
        return (function () {
          var t = ii,
            n = oi,
            e = Ir(!0),
            r = null,
            i = ri,
            o = null
          function u(u) {
            var a,
              c,
              s,
              l = u.length,
              f = !1
            for (null == r && (o = i((s = ni()))), a = 0; a <= l; ++a)
              !(a < l && e((c = u[a]), a, u)) === f &&
                ((f = !f) ? o.lineStart() : o.lineEnd()),
                f && o.point(+t(c, a, u), +n(c, a, u))
            if (s) return (o = null), s + '' || null
          }
          return (
            (u.x = function (n) {
              return arguments.length
                ? ((t = 'function' == typeof n ? n : Ir(+n)), u)
                : t
            }),
            (u.y = function (t) {
              return arguments.length
                ? ((n = 'function' == typeof t ? t : Ir(+t)), u)
                : n
            }),
            (u.defined = function (t) {
              return arguments.length
                ? ((e = 'function' == typeof t ? t : Ir(!!t)), u)
                : e
            }),
            (u.curve = function (t) {
              return arguments.length
                ? ((i = t), null != r && (o = i(r)), u)
                : i
            }),
            (u.context = function (t) {
              return arguments.length
                ? (null == t ? (r = o = null) : (o = i((r = t))), u)
                : r
            }),
            u
          )
        })()
          .defined(i)
          .curve(u)
          .context(o)
      }
      return (
        (c.x = function (e) {
          return arguments.length
            ? ((t = 'function' == typeof e ? e : Ir(+e)), (n = null), c)
            : t
        }),
        (c.x0 = function (n) {
          return arguments.length
            ? ((t = 'function' == typeof n ? n : Ir(+n)), c)
            : t
        }),
        (c.x1 = function (t) {
          return arguments.length
            ? ((n = null == t ? null : 'function' == typeof t ? t : Ir(+t)), c)
            : n
        }),
        (c.y = function (t) {
          return arguments.length
            ? ((e = 'function' == typeof t ? t : Ir(+t)), (r = null), c)
            : e
        }),
        (c.y0 = function (t) {
          return arguments.length
            ? ((e = 'function' == typeof t ? t : Ir(+t)), c)
            : e
        }),
        (c.y1 = function (t) {
          return arguments.length
            ? ((r = null == t ? null : 'function' == typeof t ? t : Ir(+t)), c)
            : r
        }),
        (c.lineX0 = c.lineY0 =
          function () {
            return s().x(t).y(e)
          }),
        (c.lineY1 = function () {
          return s().x(t).y(r)
        }),
        (c.lineX1 = function () {
          return s().x(n).y(e)
        }),
        (c.defined = function (t) {
          return arguments.length
            ? ((i = 'function' == typeof t ? t : Ir(!!t)), c)
            : i
        }),
        (c.curve = function (t) {
          return arguments.length ? ((u = t), null != o && (a = u(o)), c) : u
        }),
        (c.context = function (t) {
          return arguments.length
            ? (null == t ? (o = a = null) : (a = u((o = t))), c)
            : o
        }),
        c
      )
    }
    function ai(t) {
      return t < 0 ? -1 : 1
    }
    function ci(t, n, e) {
      var r = t._x1 - t._x0,
        i = n - t._x1,
        o = (t._y1 - t._y0) / (r || (i < 0 && -0)),
        u = (e - t._y1) / (i || (r < 0 && -0)),
        a = (o * i + u * r) / (r + i)
      return (
        (ai(o) + ai(u)) *
          Math.min(Math.abs(o), Math.abs(u), 0.5 * Math.abs(a)) || 0
      )
    }
    function si(t, n) {
      var e = t._x1 - t._x0
      return e ? ((3 * (t._y1 - t._y0)) / e - n) / 2 : n
    }
    function li(t, n, e) {
      var r = t._x0,
        i = t._y0,
        o = t._x1,
        u = t._y1,
        a = (o - r) / 3
      t._context.bezierCurveTo(r + a, i + a * n, o - a, u - a * e, o, u)
    }
    function fi(t) {
      this._context = t
    }
    function hi(t) {
      this._context = new gi(t)
    }
    function gi(t) {
      this._context = t
    }
    function pi(t) {
      return new fi(t)
    }
    ;(fi.prototype = {
      areaStart: function () {
        this._line = 0
      },
      areaEnd: function () {
        this._line = NaN
      },
      lineStart: function () {
        ;(this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN),
          (this._point = 0)
      },
      lineEnd: function () {
        switch (this._point) {
          case 2:
            this._context.lineTo(this._x1, this._y1)
            break
          case 3:
            li(this, this._t0, si(this, this._t0))
        }
        ;(this._line || (0 !== this._line && 1 === this._point)) &&
          this._context.closePath(),
          (this._line = 1 - this._line)
      },
      point: function (t, n) {
        var e = NaN
        if (((n = +n), (t = +t) !== this._x1 || n !== this._y1)) {
          switch (this._point) {
            case 0:
              ;(this._point = 1),
                this._line
                  ? this._context.lineTo(t, n)
                  : this._context.moveTo(t, n)
              break
            case 1:
              this._point = 2
              break
            case 2:
              ;(this._point = 3), li(this, si(this, (e = ci(this, t, n))), e)
              break
            default:
              li(this, this._t0, (e = ci(this, t, n)))
          }
          ;(this._x0 = this._x1),
            (this._x1 = t),
            (this._y0 = this._y1),
            (this._y1 = n),
            (this._t0 = e)
        }
      }
    }),
      ((hi.prototype = Object.create(fi.prototype)).point = function (t, n) {
        fi.prototype.point.call(this, n, t)
      }),
      (gi.prototype = {
        moveTo: function (t, n) {
          this._context.moveTo(n, t)
        },
        closePath: function () {
          this._context.closePath()
        },
        lineTo: function (t, n) {
          this._context.lineTo(n, t)
        },
        bezierCurveTo: function (t, n, e, r, i, o) {
          this._context.bezierCurveTo(n, t, r, e, o, i)
        }
      })
    var di = function (t) {
        return 'string' == typeof t
          ? new ct([document.querySelectorAll(t)], [document.documentElement])
          : new ct([null == t ? [] : t], at)
      },
      yi = function (t) {
        var n = (function () {
          for (var t, n = J; (t = n.sourceEvent); ) n = t
          return n
        })()
        return (
          n.changedTouches && (n = n.changedTouches[0]),
          (function (t, n) {
            var e = t.ownerSVGElement || t
            if (e.createSVGPoint) {
              var r = e.createSVGPoint()
              return (
                (r.x = n.clientX),
                (r.y = n.clientY),
                [(r = r.matrixTransform(t.getScreenCTM().inverse())).x, r.y]
              )
            }
            var i = t.getBoundingClientRect()
            return [
              n.clientX - i.left - t.clientLeft,
              n.clientY - i.top - t.clientTop
            ]
          })(t, n)
        )
      },
      vi = Array.prototype.slice,
      mi = function (t) {
        return t
      }
    function _i(t) {
      return 'translate(' + (t + 0.5) + ',0)'
    }
    function wi(t) {
      return 'translate(0,' + (t + 0.5) + ')'
    }
    function xi(t) {
      return function (n) {
        return +t(n)
      }
    }
    function Mi(t) {
      var n = Math.max(0, t.bandwidth() - 1) / 2
      return (
        t.round() && (n = Math.round(n)),
        function (e) {
          return +t(e) + n
        }
      )
    }
    function bi() {
      return !this.__axis
    }
    function ki(t, n) {
      var e = [],
        r = null,
        i = null,
        o = 6,
        u = 6,
        a = 3,
        c = 1 === t || 4 === t ? -1 : 1,
        s = 4 === t || 2 === t ? 'x' : 'y',
        l = 1 === t || 3 === t ? _i : wi
      function f(f) {
        var h = null == r ? (n.ticks ? n.ticks.apply(n, e) : n.domain()) : r,
          g = null == i ? (n.tickFormat ? n.tickFormat.apply(n, e) : mi) : i,
          p = Math.max(o, 0) + a,
          d = n.range(),
          y = +d[0] + 0.5,
          v = +d[d.length - 1] + 0.5,
          m = (n.bandwidth ? Mi : xi)(n.copy()),
          _ = f.selection ? f.selection() : f,
          w = _.selectAll('.domain').data([null]),
          x = _.selectAll('.tick').data(h, n).order(),
          M = x.exit(),
          b = x.enter().append('g').attr('class', 'tick'),
          k = x.select('line'),
          T = x.select('text')
        ;(w = w.merge(
          w
            .enter()
            .insert('path', '.tick')
            .attr('class', 'domain')
            .attr('stroke', 'currentColor')
        )),
          (x = x.merge(b)),
          (k = k.merge(
            b
              .append('line')
              .attr('stroke', 'currentColor')
              .attr(s + '2', c * o)
          )),
          (T = T.merge(
            b
              .append('text')
              .attr('fill', 'currentColor')
              .attr(s, c * p)
              .attr('dy', 1 === t ? '0em' : 3 === t ? '0.71em' : '0.32em')
          )),
          f !== _ &&
            ((w = w.transition(f)),
            (x = x.transition(f)),
            (k = k.transition(f)),
            (T = T.transition(f)),
            (M = M.transition(f)
              .attr('opacity', 1e-6)
              .attr('transform', function (t) {
                return isFinite((t = m(t)))
                  ? l(t)
                  : this.getAttribute('transform')
              })),
            b.attr('opacity', 1e-6).attr('transform', function (t) {
              var n = this.parentNode.__axis
              return l(n && isFinite((n = n(t))) ? n : m(t))
            })),
          M.remove(),
          w.attr(
            'd',
            4 === t || 2 == t
              ? u
                ? 'M' + c * u + ',' + y + 'H0.5V' + v + 'H' + c * u
                : 'M0.5,' + y + 'V' + v
              : u
              ? 'M' + y + ',' + c * u + 'V0.5H' + v + 'V' + c * u
              : 'M' + y + ',0.5H' + v
          ),
          x.attr('opacity', 1).attr('transform', function (t) {
            return l(m(t))
          }),
          k.attr(s + '2', c * o),
          T.attr(s, c * p).text(g),
          _.filter(bi)
            .attr('fill', 'none')
            .attr('font-size', 10)
            .attr('font-family', 'sans-serif')
            .attr(
              'text-anchor',
              2 === t ? 'start' : 4 === t ? 'end' : 'middle'
            ),
          _.each(function () {
            this.__axis = m
          })
      }
      return (
        (f.scale = function (t) {
          return arguments.length ? ((n = t), f) : n
        }),
        (f.ticks = function () {
          return (e = vi.call(arguments)), f
        }),
        (f.tickArguments = function (t) {
          return arguments.length
            ? ((e = null == t ? [] : vi.call(t)), f)
            : e.slice()
        }),
        (f.tickValues = function (t) {
          return arguments.length
            ? ((r = null == t ? null : vi.call(t)), f)
            : r && r.slice()
        }),
        (f.tickFormat = function (t) {
          return arguments.length ? ((i = t), f) : i
        }),
        (f.tickSize = function (t) {
          return arguments.length ? ((o = u = +t), f) : o
        }),
        (f.tickSizeInner = function (t) {
          return arguments.length ? ((o = +t), f) : o
        }),
        (f.tickSizeOuter = function (t) {
          return arguments.length ? ((u = +t), f) : u
        }),
        (f.tickPadding = function (t) {
          return arguments.length ? ((a = +t), f) : a
        }),
        f
      )
    }
    function Ti(t) {
      return ki(3, t)
    }
    const Ai = {
        rooftop_solar: 'au.nem.fuel_tech.solar_rooftop.power',
        solar: 'au.nem.fuel_tech.solar_utility.power',
        wind: 'au.nem.fuel_tech.wind.power',
        hydro: 'au.nem.fuel_tech.hydro.power',
        battery_discharging: 'au.nem.fuel_tech.battery_discharging.power',
        gas_wcmg: 'au.nem.fuel_tech.gas_wcmg.power',
        gas_recip: 'au.nem.fuel_tech.gas_recip.power',
        gas_ocgt: 'au.nem.fuel_tech.gas_ocgt.power',
        gas_ccgt: 'au.nem.fuel_tech.gas_ccgt.power',
        gas_steam: 'au.nem.fuel_tech.gas_steam.power',
        distillate: 'au.nem.fuel_tech.distillate.power',
        bioenergy_biomass: 'au.nem.fuel_tech.bioenergy_biomass.power',
        black_coal: 'au.nem.fuel_tech.coal_black.power',
        brown_coal: 'au.nem.fuel_tech.coal_brown.power'
      },
      Ci = {
        bioenergy_biomass: 'Bioenergy (Biomass)',
        black_coal: 'Black Coal',
        brown_coal: 'Brown Coal',
        distillate: 'Distillate',
        gas_ccgt: 'Gas (CCGT)',
        gas_ocgt: 'Gas (OCGT)',
        gas_recip: 'Gas (Reciprocating)',
        gas_steam: 'Gas (Steam)',
        gas_wcmg: 'Gas (Waste Coal Mine)',
        hydro: 'Hydro',
        rooftop_solar: 'Solar (Rooftop)',
        solar: 'Solar (Utility)',
        wind: 'Wind',
        battery_discharging: 'Battery (Discharging)'
      },
      Ni = {
        bioenergy_biomass: '#1D7A7A',
        black_coal: '#121212',
        brown_coal: '#8B572A',
        distillate: '#F35020',
        gas_ccgt: '#FDB462',
        gas_ocgt: '#FFCD96',
        gas_recip: '#F9DCBC',
        gas_steam: '#F48E1B',
        gas_wcmg: '#B46813',
        hydro: '#4582B4',
        rooftop_solar: '#F8E71C',
        solar: '#DFCF00',
        wind: '#417505',
        battery_discharging: '#00A2FA'
      },
      Di = {
        bioenergy_biomass: !0,
        black_coal: !1,
        brown_coal: !1,
        distillate: !1,
        gas_ccgt: !1,
        gas_ocgt: !1,
        gas_recip: !1,
        gas_steam: !1,
        gas_wcmg: !1,
        hydro: !0,
        rooftop_solar: !0,
        solar: !0,
        wind: !0,
        battery_discharging: !1
      },
      Si = Object.keys(Ai),
      Ei = Si.map((t) => Ai[t]).reverse(),
      Ui = (function () {
        const t = {}
        return (
          Si.forEach((n) => {
            t[Ai[n]] = Ni[n]
          }),
          t
        )
      })()
    const Fi = un('%_d %b, %I:%M %p'),
      Hi = (t) => (t >= 0.999 ? Fr(',.0f')(t) : Fr(',.2f')(t)),
      Yi = Fr(',.2f')
    function Li(t) {
      t.forEach(function (t) {
        let n = 0,
          e = 0
        Ei.forEach(function (r) {
          ;(n += t.value[r]),
            (function (t) {
              let n = !1
              return (
                Si.forEach((e) => {
                  Ai[e] === t && (n = Di[e])
                }),
                n
              )
            })(r) && (e += t.value[r])
        }),
          (t._totalConsumption = n),
          (t._totalRenewable = e)
      })
    }
    function ji(t, n) {
      let e = 0
      return (
        t.forEach(function (t) {
          e += t[n]
        }),
        e
      )
    }
    function zi(t, n) {
      const e = ji(n, '_totalConsumption'),
        r = ji(n, '_totalRenewable'),
        i = Hi(e / n.length),
        o = Yi((r / e) * 100)
      t.g
        .append('text')
        .attr('class', 'title')
        .attr('x', 7)
        .attr('y', 14)
        .style('fill', '#333')
        .append('tspan')
        .text('GW')
        .style('font-size', 8)
        .style('font-weight', 'bold'),
        t.g
          .append('text')
          .attr('class', 'stats')
          .attr('x', t.width - 6)
          .attr('y', 14)
          .style('font-size', 10)
          .style('text-anchor', 'end')
          .append('tspan')
          .attr('class', 'stat-title')
          .text('Av.: ')
          .append('tspan')
          .attr('class', 'stat-value')
          .text(i + ' GW      ')
          .append('tspan')
          .attr('class', 'stat-title')
          .text('Renewables: ')
          .append('tspan')
          .attr('class', 'stat-value')
          .text(o + '%')
    }
    function Pi(t) {
      const n = t.g
        .append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + t.height + ')')
        .style('pointer-events', 'none')
        .call(
          Ti(t.x)
            .ticks(3)
            .tickSize(20 - t.height)
        )
      n.selectAll('text').remove(), n.selectAll('line').attr('y1', 0)
    }
    function Oi(t) {
      const n = t.g
        .append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + t.height + ')')
        .style('pointer-events', 'none')
        .call(
          Ti(t.x)
            .ticks(3)
            .tickSize(-t.height)
            .tickFormat(function (t) {
              var n = t.getHours(),
                e = t.getMinutes(),
                r = un('%_d %b'),
                i = un('%H:%M')(t)
              return 0 === n && 0 === e && (i = r(t)), i
            })
        )
      n
        .selectAll('text')
        .attr('y', 5)
        .attr('x', 1)
        .style('text-anchor', 'start'),
        n.selectAll('line').remove()
    }
    function qi(t) {
      var n
      t.g
        .append('g')
        .attr('class', 'axis axis--y')
        .style('pointer-events', 'none')
        .call(((n = t.y), ki(4, n)).ticks(4, '~s').tickSize(-t.width))
        .selectAll('text')
        .attr('y', -7)
        .attr('x', 7)
        .style('pointer-events', 'none')
        .style('text-anchor', 'start')
    }
    function $i(t, n) {
      const e = t.width - 115,
        r = function (n) {
          return n <= 115 ? 1 : n >= e ? t.width - 230 - 1 : n - 115
        },
        i = t.width - 50,
        o = function (n) {
          return n <= 50 ? 1 : n >= i ? t.width - 100 - 1 : n - 50
        },
        u = t.g
          .append('g')
          .attr('class', 'stacked-area')
          .selectAll('path')
          .data(t.stack(n))
          .enter()
          .append('path')
          .attr('class', 'area')
          .style('fill', function (t) {
            return Ui[t.key]
          })
          .attr('d', t.area),
        a = t.g
          .append('g')
          .attr('class', 'hover-group')
          .style('opacity', '0')
          .style('pointer-events', 'none')
      a
        .append('line')
        .attr('class', 'hover-line')
        .style('stroke', '#c74523')
        .style('pointer-events', 'none'),
        a
          .append('rect')
          .attr('class', 'hover-top-rect')
          .attr('width', 230)
          .attr('height', 18)
          .attr('y', 1)
          .attr('rx', 6),
        a
          .append('rect')
          .attr('class', 'hover-bottom-rect')
          .attr('width', 100)
          .attr('height', 15)
          .attr('rx', 6),
        a
          .append('text')
          .attr('class', 'hover-text hover-date')
          .attr('y', t.height + 11),
        a.append('text').attr('class', 'hover-text hover-value').attr('y', 14),
        a.append('text').attr('class', 'hover-text hover-total').attr('y', 14),
        a
          .append('rect')
          .attr('class', 'hover-ft-rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('rx', 1)
          .attr('y', 4),
        u.on('mouseover', function () {
          lt('.hover-group').style('opacity', '1')
        }),
        u.on('mouseout', function () {
          lt('.hover-group').style('opacity', '0')
        }),
        u.on('touchmove mousemove', function (e) {
          const i = yi(this),
            u = t.x.invert(i[0]),
            a = e.key,
            c = (0,
            ht(function (t) {
              return t.key
            }).left)(n, u.getTime(), 1),
            s = new Date(parseInt(n[c].key)),
            l = n[c].value,
            f = n[c]._totalConsumption
          lt('.hover-line')
            .attr('y1', 20)
            .attr('y2', t.height)
            .attr('x1', i[0])
            .attr('x2', i[0]),
            lt('.hover-top-rect').attr('x', function () {
              return r(i[0])
            }),
            lt('.hover-ft-rect')
              .attr('x', function () {
                return r(i[0]) + 7
              })
              .style(
                'fill',
                (function (t) {
                  let n = ''
                  return (
                    Si.forEach((e) => {
                      Ai[e] === t && (n = Ni[e])
                    }),
                    n
                  )
                })(a)
              ),
            lt('.hover-value')
              .attr('x', function () {
                return r(i[0]) + 22
              })
              .text(
                (function (t) {
                  let n = ''
                  return (
                    Si.forEach((e) => {
                      Ai[e] === t && (n = Ci[e])
                    }),
                    n
                  )
                })(a) +
                  ': ' +
                  Hi(l[a]) +
                  ' GW'
              ),
            lt('.hover-total')
              .attr('x', function () {
                return r(i[0]) + 230 - 7
              })
              .text('Total: ' + Hi(f) + ' GW'),
            lt('.hover-bottom-rect')
              .attr('x', function () {
                return o(i[0])
              })
              .attr('y', t.height),
            lt('.hover-date')
              .attr('x', function () {
                return o(i[0]) + 50
              })
              .text(Fi(s))
        })
    }
    var Bi = function (t, n) {
        !(function (t, n) {
          Li(n),
            t.x.domain(
              (function (t, n) {
                let e, r
                if (void 0 === n)
                  for (const n of t)
                    null != n &&
                      (void 0 === e
                        ? n >= n && (e = r = n)
                        : (e > n && (e = n), r < n && (r = n)))
                else {
                  let i = -1
                  for (let o of t)
                    null != (o = n(o, ++i, t)) &&
                      (void 0 === e
                        ? o >= o && (e = r = o)
                        : (e > o && (e = o), r < o && (r = o)))
                }
                return [e, r]
              })(n, function (t) {
                return t.key
              })
            ),
            t.y.domain([0, 33]),
            t.stack.keys(Ei).value(function (t, n) {
              return t.value[n]
            })
        })(t, n),
          zi(t, n),
          Oi(t),
          $i(t, n),
          Pi(t),
          qi(t),
          window.addEventListener('resize', () => {
            !(function (t, n) {
              const e = document.getElementById(t.chartId).offsetWidth,
                r = e < 280 ? 280 : e
              ;(t.width = r - t.margin.left - t.margin.right),
                t.svg.attr('width', t.width + t.margin.left + t.margin.right),
                t.x.rangeRound([0, t.width])
              const i = '#' + t.chartId
              di(i + ' .axis--x').remove(),
                di(i + ' .axis--y').remove(),
                lt(i + ' .stacked-area').remove(),
                lt(i + ' .hover-group').remove(),
                lt(i + ' .title').remove(),
                lt(i + ' .stats').remove(),
                zi(t, n),
                Oi(t),
                $i(t, n),
                Pi(t),
                qi(t)
            })(t, n)
          })
      },
      Ri = function (t) {
        const n = {}
        return (
          (n.date = new Date(t)),
          (n.time = t),
          Ei.forEach((t) => {
            n[t] = 0
          }),
          n
        )
      }
    var Vi = function (t) {
      if (t.length > 0) {
        const n = 2017
        let e = []
        const r = (function (t) {
            let n = t.find((t) => t.id === Ai.black_coal)
            return n || (n = t[0]), n
          })(t),
          i = r.history.start.substring(0, 16),
          o = an('%Y-%m-%dT%H:%M')(i),
          u = r.history.last.substring(0, 16),
          a = an('%Y-%m-%dT%H:%M')(u).getTime()
        let c = o.getTime()
        for (let t = 0; t < n; t++) e.push(Ri(c)), (c += 3e5)
        if (
          (t.forEach(function (t) {
            if (
              (function (t) {
                let n = !1
                return (
                  Si.forEach((e) => {
                    Ai[e] === t && (n = !0)
                  }),
                  n
                )
              })(t.id)
            )
              if (t.id === Ai.rooftop_solar) {
                var r = t.history.data,
                  i = 0
                t.forecast && r.push.apply(r, t.forecast.data)
                for (let o = 0; o < n; o++)
                  (e[o][t.id] = void 0 === r[i] ? 0 : r[i] / 1e3),
                    0 !== o && o % 6 == 0 && (i += 1)
              } else
                for (let r = 0; r < n; r++) {
                  const n = t.history.data[r] ? t.history.data[r] / 1e3 : 0
                  e[r][t.id] = n
                }
          }),
          e && e.length > 0)
        ) {
          const t = a - 2592e5
          e = e.filter(function (n) {
            return n.time >= t
          })
        }
        return e
      }
      return []
    }
    function Ii() {}
    function Wi(t, n) {
      var e = new Ii()
      if (t instanceof Ii)
        t.each(function (t, n) {
          e.set(n, t)
        })
      else if (Array.isArray(t)) {
        var r,
          i = -1,
          o = t.length
        if (null == n) for (; ++i < o; ) e.set(i, t[i])
        else for (; ++i < o; ) e.set(n((r = t[i]), i, t), r)
      } else if (t) for (var u in t) e.set(u, t[u])
      return e
    }
    Ii.prototype = Wi.prototype = {
      constructor: Ii,
      has: function (t) {
        return '$' + t in this
      },
      get: function (t) {
        return this['$' + t]
      },
      set: function (t, n) {
        return (this['$' + t] = n), this
      },
      remove: function (t) {
        var n = '$' + t
        return n in this && delete this[n]
      },
      clear: function () {
        for (var t in this) '$' === t[0] && delete this[t]
      },
      keys: function () {
        var t = []
        for (var n in this) '$' === n[0] && t.push(n.slice(1))
        return t
      },
      values: function () {
        var t = []
        for (var n in this) '$' === n[0] && t.push(this[n])
        return t
      },
      entries: function () {
        var t = []
        for (var n in this)
          '$' === n[0] && t.push({ key: n.slice(1), value: this[n] })
        return t
      },
      size: function () {
        var t = 0
        for (var n in this) '$' === n[0] && ++t
        return t
      },
      empty: function () {
        for (var t in this) if ('$' === t[0]) return !1
        return !0
      },
      each: function (t) {
        for (var n in this) '$' === n[0] && t(this[n], n.slice(1), this)
      }
    }
    var Gi = Wi,
      Zi = function () {
        var t,
          n,
          e,
          r = [],
          i = []
        function o(e, i, u, a) {
          if (i >= r.length) return null != t && e.sort(t), null != n ? n(e) : e
          for (
            var c, s, l, f = -1, h = e.length, g = r[i++], p = Gi(), d = u();
            ++f < h;

          )
            (l = p.get((c = g((s = e[f])) + ''))) ? l.push(s) : p.set(c, [s])
          return (
            p.each(function (t, n) {
              a(d, n, o(t, i, u, a))
            }),
            d
          )
        }
        return (e = {
          object: function (t) {
            return o(t, 0, Xi, Qi)
          },
          map: function (t) {
            return o(t, 0, Ji, Ki)
          },
          entries: function (t) {
            return (function t(e, o) {
              if (++o > r.length) return e
              var u,
                a = i[o - 1]
              return (
                null != n && o >= r.length
                  ? (u = e.entries())
                  : ((u = []),
                    e.each(function (n, e) {
                      u.push({ key: e, values: t(n, o) })
                    })),
                null != a
                  ? u.sort(function (t, n) {
                      return a(t.key, n.key)
                    })
                  : u
              )
            })(o(t, 0, Ji, Ki), 0)
          },
          key: function (t) {
            return r.push(t), e
          },
          sortKeys: function (t) {
            return (i[r.length - 1] = t), e
          },
          sortValues: function (n) {
            return (t = n), e
          },
          rollup: function (t) {
            return (n = t), e
          }
        })
      }
    function Xi() {
      return {}
    }
    function Qi(t, n, e) {
      t[n] = e
    }
    function Ji() {
      return Gi()
    }
    function Ki(t, n, e) {
      t.set(n, e)
    }
    function to() {}
    var no = Gi.prototype
    function eo(t, n) {
      var e = new to()
      if (t instanceof to)
        t.each(function (t) {
          e.add(t)
        })
      else if (t) {
        var r = -1,
          i = t.length
        if (null == n) for (; ++r < i; ) e.add(t[r])
        else for (; ++r < i; ) e.add(n(t[r], r, t))
      }
      return e
    }
    to.prototype = eo.prototype = {
      constructor: to,
      has: no.has,
      add: function (t) {
        return (this['$' + (t += '')] = t), this
      },
      remove: no.remove,
      clear: no.clear,
      values: no.keys,
      size: no.size,
      empty: no.empty,
      each: no.each
    }
    const ro = (function (t) {
      const n = lt('#' + t)
          .style('height', '230px')
          .append('svg'),
        e = document.getElementById(t).offsetWidth,
        r = { top: 0, right: 0, bottom: 15, left: 0 },
        i = (e < 280 ? 280 : e) - r.left - r.right,
        o = 230 - r.top - r.bottom
      n.attr('width', i + r.left + r.right).attr('height', o + r.top + r.bottom)
      const u = n
          .append('g')
          .attr('transform', 'translate(' + r.left + ',' + r.top + ')'),
        a = (function () {
          return kr.apply(
            Cr(Mt, kt, At, Ht, Lt, zt, Ot, $t, un).domain([
              new Date(2e3, 0, 1),
              new Date(2e3, 0, 2)
            ]),
            arguments
          )
        })().rangeRound([0, i]),
        c = (function t() {
          var n = br()
          return (
            (n.copy = function () {
              return xr(n, t())
            }),
            kr.apply(n, arguments),
            Rr(n)
          )
        })().rangeRound([o, 0]),
        s = (function () {
          var t = Ir([]),
            n = Gr,
            e = Wr,
            r = Zr
          function i(i) {
            var o,
              u,
              a = t.apply(this, arguments),
              c = i.length,
              s = a.length,
              l = new Array(s)
            for (o = 0; o < s; ++o) {
              for (
                var f, h = a[o], g = (l[o] = new Array(c)), p = 0;
                p < c;
                ++p
              )
                (g[p] = f = [0, +r(i[p], h, p, i)]), (f.data = i[p])
              g.key = h
            }
            for (o = 0, u = n(l); o < s; ++o) l[u[o]].index = o
            return e(l, u), l
          }
          return (
            (i.keys = function (n) {
              return arguments.length
                ? ((t = 'function' == typeof n ? n : Ir(Vr.call(n))), i)
                : t
            }),
            (i.value = function (t) {
              return arguments.length
                ? ((r = 'function' == typeof t ? t : Ir(+t)), i)
                : r
            }),
            (i.order = function (t) {
              return arguments.length
                ? ((n =
                    null == t
                      ? Gr
                      : 'function' == typeof t
                      ? t
                      : Ir(Vr.call(t))),
                  i)
                : n
            }),
            (i.offset = function (t) {
              return arguments.length ? ((e = null == t ? Wr : t), i) : e
            }),
            i
          )
        })(),
        l = ui()
          .curve(pi)
          .x(function (t) {
            return a(t.data.key)
          })
          .y0(function (t) {
            return c(t[0])
          })
          .y1(function (t) {
            return c(t[1])
          })
      return {
        chartId: t,
        margin: r,
        width: i,
        height: o,
        svg: n,
        g: u,
        x: a,
        y: c,
        stack: s,
        area: l
      }
    })('opennem-widget-chart')
    fetch('https://data.opennem.org.au/v3/stats/au/NEM/power/7d.json')
      .then(function (t) {
        return t.json()
      })
      .then(function (t) {
        const n = t.data ? t.data : t,
          e = Vi(n)
        e.length > 0
          ? Bi(
              ro,
              (function (t) {
                return Zi()
                  .key(function (t) {
                    return 18e5 * Math.round(t.time / 18e5)
                  })
                  .rollup(function (t) {
                    var n = {}
                    return (
                      Ei.forEach(function (e) {
                        n[e] = (function (t, n) {
                          let e = 0,
                            r = 0
                          if (void 0 === n)
                            for (let n of t)
                              null != n && (n = +n) >= n && (++e, (r += n))
                          else {
                            let i = -1
                            for (let o of t)
                              null != (o = n(o, ++i, t)) &&
                                (o = +o) >= o &&
                                (++e, (r += o))
                          }
                          if (e) return r / e
                        })(t, function (t) {
                          return t[e]
                        })
                      }),
                      n
                    )
                  })
                  .entries(t)
              })(e)
            )
          : console.log('There is no NEM data.')
      })
  }
})
